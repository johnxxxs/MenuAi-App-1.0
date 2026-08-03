const express = require("express");
const router = express.Router();

const {
    openai
} = require("../app");

const {
    getTranslatePrompt
} = require("../../prompts/promptManager");

//==================================================
// BLOQUE 09 - TRANSLATE MENU
//==================================================

router.post("/translate", async (req, res) => {

    try {

        const language =
            req.body.language || "es";

        const menu =
            req.body.menu;

        const menuJson =
            JSON.stringify(menu, null, 2);

        console.log("==============");
        console.log("TRANSLATE");
        console.log("CLIENT:", req.client.id);
        console.log("LANGUAGE:", language);

        const completion =
            await openai.chat.completions.create({

                model: "gpt-4.1-mini",

                messages: [

                    {

                        role: "system",

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
- Never translate prices.
- Return ONLY valid JSON.

`

                    },

                    {

                        role: "user",

                        content: `

Menu:

${menuJson}

`

                    }

                ]

            });

        const translatedMenu =
            completion.choices[0].message.content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return res.json({

            success: true,

            menu:
                JSON.parse(translatedMenu)

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