const express = require("express");

const router = express.Router();

const {
    openai
} = require("../app");

const {
    getDishInfoPrompt
} = require("../../prompts/promptManager");

//==================================================
// BLOQUE 08 - DISH INFO
//==================================================

router.post("/dish-info", async (req, res) => {

    try {

        const dishName =
            req.body.dishName;

        const restaurant =
            req.body.restaurant;

        const category =
            req.body.category;

        const language =
            req.body.language || "es";

        console.log("==============");
        console.log("DISH INFO");
        console.log("CLIENT:", req.client.id);
        console.log("LANGUAGE:", language);

        const completion =
            await openai.chat.completions.create({

                model: "gpt-4.1-mini",

                messages: [

                    {

                        role: "system",

                        content: `

${getDishInfoPrompt(req.client.id)}

IDIOMA DE RESPUESTA

${language}

IMPORTANTE:

- Responde SIEMPRE en ese idioma.
- No cambies de idioma.
- La respuesta debe ser natural y fácil de entender.

`

                    },

                    {

                        role: "user",

                        content: `

Categoría:
${category}

Plato:
${dishName}

Restaurante:
${restaurant}

`

                    }

                ]

            });

        const info =
            completion.choices[0].message.content;

        return res.json({

            success: true,

            info

        });

    }

    catch (error) {

        console.log(error);

        return res.json({

            success: false,

            error: error.message

        });

    }

});

module.exports = router;