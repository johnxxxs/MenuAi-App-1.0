const {
    openai
} = require("../server/app");


//==================================================
// PARSER SERVICE
//==================================================

async function parseMenuText(text, language = "es") {

    console.log("PARSER SERVICE");
    console.log("Target language:", language);

    if (!text) {

        throw new Error(
            "No text received for menu parsing"
        );

    }


    const menuText =
        text.substring(0, 40000);


    const completion =
        await openai.chat.completions.create({

        model: "gpt-4.1-mini",

        response_format: {
            type: "json_object"
        },

        messages: [

            {
                role: "system",

                content: `
You are an AI specialized in restaurant menus.

Your task is to analyze a complete restaurant menu.

The target language is:

${language}

For every dish:

1. Identify the category.
2. Identify the dish name.
3. Translate the dish name naturally into the target language.
4. Generate a short, useful restaurant-style description in the target language.
5. Do not invent ingredients that cannot reasonably be inferred from the original text.
6. Preserve prices when they exist.
7. Preserve the original order of dishes.
8. Do not omit dishes.

IMPORTANT:

The description must be short and suitable for displaying directly underneath the dish name on a restaurant menu.

Return ONLY valid JSON.

Structure:

{
    "items": [
        {
            "category": "",
            "name": "",
            "description": "",
            "price": ""
        }
    ]
}
`
            },

            {
                role: "user",

                content: menuText
            }

        ]

    });


    const parsedMenu =
        completion.choices[0].message.content;


    return parsedMenu;

}


module.exports = {
    parseMenuText
};