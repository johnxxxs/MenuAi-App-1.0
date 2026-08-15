const express = require("express");

const router = express.Router();

const apiAuth =
    require("../../middleware/apiAuth");

const {
    openai
} = require("../../app");

const {
    getTranslatePrompt
} = require("../../../prompts/promptManager");

const {
    createMenuHash,
    getCachedTranslation,
    saveTranslation
} = require("../../../services/translationCache");


//==================================================
// COMPROBAR SHORT INFO COMPLETO
//==================================================

function hasCompleteShortInfo(menu) {

    if (
        !menu ||
        !Array.isArray(menu.categories)
    ) {
        return false;
    }


    for (
        const category
        of menu.categories
    ) {

        const items =
            Array.isArray(category.items)
                ? category.items
                : [];


        for (
            const item
            of items
        ) {

            if (
                !item ||
                typeof item.short_info !== "string" ||
                item.short_info.trim() === ""
            ) {

                return false;

            }

        }

    }


    return true;

}


//==================================================
// MENUAI API
// TRANSLATE MENU + CACHE + SHORT INFO
//==================================================

router.post(
    "/translate",
    apiAuth,
    async (req, res) => {

        try {

            const language =
                req.body.language || "es";


            const menu =
                req.body.menu;


            const options =
                req.body.options || {};


            /*
            |--------------------------------------------------------------------------
            | SHORT INFO
            |--------------------------------------------------------------------------
            |
            | Por ahora solamente OnlineFoodies utiliza
            | esta función.
            |
            */

            const generateShortInfo =
                req.client.id === "onlinefoodies" &&
                options.generate_short_info === true;


            //==================================================
            // VALIDACIÓN
            //==================================================

            if (!menu) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        error:
                            "No menu received"

                    });

            }


            //==================================================
            // MENU HASH
            //==================================================

            const hash =
                createMenuHash(menu);


            console.log("");
            console.log("================================");
            console.log("MENUAI TRANSLATE API");
            console.log(
                "CLIENT:",
                req.client.id
            );
            console.log(
                "LANGUAGE:",
                language
            );
            console.log(
                "HASH:",
                hash
            );
            console.log(
                "SHORT INFO:",
                generateShortInfo
                    ? "ENABLED"
                    : "DISABLED"
            );
            console.log("================================");


            //==================================================
            // CACHE
            //==================================================

            const cached =
                getCachedTranslation(
                    req.client.id,
                    hash,
                    language
                );


            if (cached) {

                console.log(
                    "TRANSLATION CACHE HIT"
                );


                /*
                |--------------------------------------------------------------------------
                | CACHE COMPLETO
                |--------------------------------------------------------------------------
                |
                | Si no necesitamos short_info,
                | devolvemos directamente la caché.
                |
                | Si la necesitamos y ya existe,
                | también devolvemos directamente.
                |
                */

                if (
                    !generateShortInfo ||
                    hasCompleteShortInfo(
                        cached.menu
                    )
                ) {

                    return res.json({

                        success: true,

                        cached: true,

                        hash:
                            hash,

                        language:
                            language,

                        menu:
                            cached.menu

                    });

                }


                /*
                |--------------------------------------------------------------------------
                | CACHE ANTIGUO
                |--------------------------------------------------------------------------
                |
                | Existe una traducción almacenada,
                | pero todavía no contiene short_info.
                |
                | Para no crear una segunda caché
                | ni otro endpoint, regeneramos esta
                | respuesta una sola vez con short_info.
                |
                */

                console.log(
                    "CACHE HIT WITHOUT COMPLETE SHORT INFO"
                );

                console.log(
                    "GENERATING SHORT INFO FOR EXISTING CACHE"
                );

            } else {

                console.log(
                    "TRANSLATION CACHE MISS"
                );

            }


            //==================================================
            // OPENAI
            //==================================================

            const menuJson =
                JSON.stringify(
                    menu,
                    null,
                    2
                );


            //==================================================
            // INSTRUCCIONES SHORT INFO
            //==================================================

            let shortInfoInstructions = "";


            if (generateShortInfo) {

                shortInfoInstructions = `

==================================================
ONLINEFOODIES - SHORT INFO
==================================================

Además de traducir la carta, genera una pequeña
explicación gastronómica para CADA plato dentro de
cada "items" del menú.

Añade únicamente un nuevo campo llamado:

"short_info"

dentro de cada objeto de plato.

REGLAS DE SHORT_INFO:

- Debe estar SIEMPRE en el idioma de destino.
- Debe ser breve y natural.
- Máximo aproximado: 220 caracteres.
- Explica de forma sencilla qué es el plato.
- Utiliza únicamente información razonablemente
  deducible del nombre y la descripción original.
- NO inventes ingredientes.
- NO inventes historia.
- NO inventes un origen concreto si no aparece o no
  es razonablemente conocido.
- NO inventes información específica del restaurante.
- No incluyas precios.
- No incluyas alérgenos.
- No incluyas recomendaciones comerciales.

FORMATO:

La estructura original del menú debe mantenerse.

La única excepción permitida es añadir:

"short_info"

como campo adicional dentro de cada objeto
de plato cuando esta función esté habilitada.

La respuesta debe seguir siendo JSON válido.

`;

            }


            //==================================================
            // PETICIÓN OPENAI
            //==================================================

            const completion =
                await openai.chat.completions.create({

                    model:
                        "gpt-4.1-mini",

                    messages: [

                        {

                            role:
                                "system",

                            content: `

${getTranslatePrompt(
    req.client.id
)}

DESTINATION LANGUAGE

${language}

IMPORTANT:

- ALL translated text MUST be in this language.

- Translate ONLY:
    - category
    - name
    - description
    - extra
    - short_description when it exists

- "extra" may exist:
    - at menu level
    - inside categories
    - inside other menu structures

- Always preserve the original JSON structure exactly.

- Never remove fields.

- Never add fields that do not exist in the original JSON,
  except the explicitly requested "short_info" field
  when SHORT INFO generation is enabled.

- Never translate prices.

- Never translate IDs, keys, URLs, image paths
  or technical values.

- Return ONLY valid JSON.

${shortInfoInstructions}

`

                        },

                        {

                            role:
                                "user",

                            content: `

Menu:

${menuJson}

`

                        }

                    ]

                });


            //==================================================
            // CLEAN RESPONSE
            //==================================================

            const translatedText =
                completion
                    .choices[0]
                    .message
                    .content
                    .replace(
                        /```json/g,
                        ""
                    )
                    .replace(
                        /```/g,
                        ""
                    )
                    .trim();


            let translatedMenu;


            try {

                translatedMenu =
                    JSON.parse(
                        translatedText
                    );

            }

            catch (jsonError) {

                console.log(
                    "INVALID TRANSLATION JSON"
                );

                return res
                    .status(500)
                    .json({

                        success: false,

                        error:
                            "OpenAI returned invalid JSON",

                        raw:
                            translatedText

                    });

            }


            //==================================================
            // VALIDAR SHORT INFO
            //==================================================

            if (
                generateShortInfo &&
                !hasCompleteShortInfo(
                    translatedMenu
                )
            ) {

                console.log(
                    "SHORT INFO VALIDATION FAILED"
                );

                return res
                    .status(500)
                    .json({

                        success: false,

                        error:
                            "OpenAI did not return complete short_info data"

                    });

            }


            //==================================================
            // SAVE CACHE
            //==================================================

            saveTranslation(
                req.client.id,
                hash,
                language,
                translatedMenu
            );


            console.log(
                "TRANSLATION SAVED IN CACHE"
            );


            //==================================================
            // RESPONSE
            //==================================================

            return res.json({

                success: true,

                cached: false,

                hash:
                    hash,

                language:
                    language,

                menu:
                    translatedMenu

            });


        }

        catch (error) {

            console.log("");
            console.log(
                "MENUAI TRANSLATE API ERROR"
            );

            console.log(
                error.message
            );

            console.log(
                error.stack
            );


            return res
                .status(500)
                .json({

                    success: false,

                    error:
                        error.message

                });

        }

    }
);


module.exports = router;