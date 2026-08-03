const fs = require("fs");
const mime = require("mime-types");

const {
    openai
} = require("../server/app");


//==================================================
// IMAGE SERVICE
//==================================================

async function processMenuImage(imageFile, language = "es") {

    console.log("IMAGE SERVICE");

    const imageBuffer =
        fs.readFileSync(imageFile.path);

    const base64Image =
        imageBuffer.toString("base64");

    const mimeType =
        mime.lookup(imageFile.originalname)
        || "image/jpeg";


    const completion =
        await openai.chat.completions.create({

        model: "gpt-4.1-mini",

        messages: [

            {
                role: "system",

                content: `
You are an expert restaurant menu parser.

Analyse the restaurant menu image.

Target language:
${language}

Rules:

- Detect original language.
- Translate category.
- Translate name.
- Translate description.
- Keep prices.
- Return ONLY JSON.

Structure:

{
 "items":[
   {
     "category":"",
     "name":"",
     "description":"",
     "price":""
   }
 ]
}
`
            },

            {
                role: "user",

                content: [

                    {
                        type: "text",

                        text: `
Extract this restaurant menu.

Target language:
${language}

Return ONLY JSON.
`
                    },

                    {
                        type: "image_url",

                        image_url: {

                            url:
                            `data:${mimeType};base64,${base64Image}`

                        }
                    }

                ]
            }

        ]

    });


    const parsedMenu =
        completion.choices[0].message.content;


    return parsedMenu;

}


module.exports = {
    processMenuImage
};