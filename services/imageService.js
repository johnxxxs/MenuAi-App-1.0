const fs = require("fs");
const mime = require("mime-types");

const {
    openai
} = require("../server/app");


//==================================================
// IMAGE SERVICE
//==================================================

async function processMenuImage(
    imageFiles,
    language = "es"
) {

    console.log(
        "IMAGE SERVICE"
    );

    console.log(
        "Número de imágenes:",
        imageFiles.length
    );


    /*
    |--------------------------------------------------------------------------
    | VALIDACIÓN
    |--------------------------------------------------------------------------
    */

    if (
        !Array.isArray(imageFiles) ||
        imageFiles.length === 0
    ) {

        throw new Error(
            "No se recibieron imágenes."
        );

    }


    /*
    |--------------------------------------------------------------------------
    | INSTRUCCIÓN PARA MÚLTIPLES IMÁGENES
    |--------------------------------------------------------------------------
    |
    | Solo añadimos esta instrucción cuando realmente
    | existen varias imágenes.
    |
    |--------------------------------------------------------------------------
    */

    let multiImageInstruction = '';


    if (
        imageFiles.length > 1
    ) {

        multiImageInstruction = `

Estas imágenes corresponden a distintas páginas de una misma carta.
Combínalas en una única carta.
Mantén el orden de las páginas.
No dupliques platos cuando aparezcan repetidos por tratarse de la misma entrada.

`;

    }


    /*
    |--------------------------------------------------------------------------
    | PREPARAR IMÁGENES
    |--------------------------------------------------------------------------
    */

    const imageContents = [];


    for (
        let i = 0;
        i < imageFiles.length;
        i++
    ) {

        const imageFile =
            imageFiles[i];


        const imageBuffer =
            fs.readFileSync(
                imageFile.path
            );


        const base64Image =
            imageBuffer.toString(
                "base64"
            );


        const mimeType =
            mime.lookup(
                imageFile.originalname
            ) ||
            "image/jpeg";


        /*
        |--------------------------------------------------------------------------
        | ETIQUETA DE PÁGINA
        |--------------------------------------------------------------------------
        */

        imageContents.push({

            type: "text",

            text:
                `Página ${i + 1} de ${imageFiles.length}`

        });


        /*
        |--------------------------------------------------------------------------
        | IMAGEN
        |--------------------------------------------------------------------------
        */

        imageContents.push({

            type: "image_url",

            image_url: {

                url:
                    `data:${mimeType};base64,${base64Image}`

            }

        });

    }


    /*
    |--------------------------------------------------------------------------
    | OPENAI
    |--------------------------------------------------------------------------
    */

    const completion =
        await openai.chat.completions.create({

        model: "gpt-4.1-mini",

        messages: [

            {
                role: "system",

                content: `

You are an expert restaurant menu parser.

Analyse the restaurant menu image or images.

Target language:
${language}

${multiImageInstruction}

Rules:

- Detect original language.
- Translate category.
- Translate name.
- Translate description.
- Keep prices exactly.
- Preserve the information found in the menu.
- Do not invent dishes.
- Do not invent prices.
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

${

    imageFiles.length > 1

        ? `
The following images belong to the same menu.
Treat them as consecutive pages of one single menu.
Combine all detected items into one result.
`

        : ''
}

Return ONLY JSON.

`

                    },

                    ...imageContents

                ]

            }

        ]

    });


    /*
    |--------------------------------------------------------------------------
    | RESULTADO
    |--------------------------------------------------------------------------
    */

    const parsedMenu =
        completion
            .choices[0]
            .message
            .content;


    return parsedMenu;

}


module.exports = {
    processMenuImage
};