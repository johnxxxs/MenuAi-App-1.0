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
// MENUAI API
// TRANSLATE MENU + CACHE
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


            //==================================================
            // VALIDATION
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
            console.log("CLIENT:", req.client.id);
            console.log("LANGUAGE:", language);
            console.log("HASH:", hash);
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


            console.log(
                "TRANSLATION CACHE MISS"
            );


            //==================================================
            // OPENAI
            //==================================================

            const menuJson =
                JSON.stringify(
                    menu,
                    null,
                    2
                );


            const completion =
                await openai.chat.completions.create({

                    model:
                        "gpt-4.1-mini",

                    messages: [

                        {

                            role:
                                "system",

                            content: `

${getTranslatePrompt(req.client.id)}

DESTINATION LANGUAGE

${language}

IMPORTANT:

- ALL translated text MUST be in this language.

- Translate ONLY:
    - category
    - name
    - description
    - extra

- "extra" may exist:
    - at menu level
    - inside categories
    - inside other menu structures

- Always preserve the original JSON structure exactly.
- Never remove fields.
- Never add fields that do not exist in the original JSON.
- Never translate prices.
- Never translate IDs, keys, URLs, image paths or technical values.
- Return ONLY valid JSON.

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
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
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