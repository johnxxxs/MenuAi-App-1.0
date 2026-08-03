const express = require("express");
const router = express.Router();

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const pdf = require("pdf-parse").default;
const mime = require("mime-types");

const {
    openai,
    upload
} = require("../app");

//==================================================
// BLOQUE 01 - CONFIGURACION
//==================================================

const {
    app,
    openai,
    upload
} = require("./server/app");

const homeRoutes =
require("./server/routes/home");

const processRoutes =
require("./server/routes/process");

const dishInfoRoutes =
require("./server/routes/dishInfo");

const translateRoutes =
require("./server/routes/translate");

app.use("/", homeRoutes);
app.use("/", processRoutes);
app.use("/", dishInfoRoutes);
app.use("/", translateRoutes);


//==================================================
// BLOQUE 02 - HOME
//==================================================

/*
app.get("/", (req, res) => {

res.sendFile(
path.join(__dirname, "public", "index.html")
);

}) */


//==================================================
// BLOQUE 3.1 - PROCESS
//==================================================

/*
app.post(

"/process",

upload.fields([
{ name: "pdfFile", maxCount: 1 },
{ name: "imageFile", maxCount: 1 }
]),

async (req, res) => {

try {

const url =
req.body.url;

const language =
req.body.language || "es";

console.log(
"Idioma solicitado:",
language
);

const pdfFile =
req.files?.pdfFile?.[0];

const imageFile =
req.files?.imageFile?.[0];

console.log(imageFile);

let text = "";



//==================================================
// BLOQUE 3.2 - URL MODE
//==================================================

if (url) {

console.log("URL RECEIVED");

const response =
await axios.get(url);

const html =
response.data;

const $ =
cheerio.load(html);

text =
$("body").text();

}

//==================================================
// BLOQUE 3.3 - IMAGE MODE
//==================================================

else if (imageFile) {

  console.log("IMAGE RECEIVED");

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

- Detect the original language.
- If the target language is different, translate:
  - category
  - name
  - description
- Keep prices exactly as they appear.
- Do not invent dishes.
- Do not invent prices.
- Return ONLY valid JSON.
- Do not use Markdown.
- Do not write \`\`\`json.

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

              text: `Extract this restaurant menu.

Target language: ${language}

If the menu is not already in that language, translate:

- category
- name
- description

Return ONLY valid JSON.
Do not use Markdown.
Do not write \`\`\`json.`

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

  return res.json({

    success: true,

    parsedMenu: parsedMenu

  });

}



 
//==================================================
// BLOQUE 3.4 - PDF MODE
//==================================================

else if (pdfFile) {

console.log("PDF RECEIVED");

const pdfBuffer =
fs.readFileSync(pdfFile.path);

const pdfData =
await pdf(pdfBuffer);

text =
pdfData.text;

}



else {

return res.json({

success: false,

error: "No URL, image or PDF received"

});

}



//==================================================
// BLOQUE 3.5 TEXT TO OPENAI
//==================================================

const menuText =
text.substring(0, 40000);

const completion =
await openai.chat.completions.create({

model: "gpt-4.1-mini",

messages: [

{
role: "system",

content: `
You are a restaurant menu parser.

Extract restaurant menu items into JSON.

Return ONLY JSON.

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

return res.json({

success: true,

parsedMenu: parsedMenu

});

} catch (error) {

console.log(error);

return res.json({

success: false,

error: error.message

});

}

}

); */

//==================================================
// BLOQUE 08 - DISH INFO
//==================================================

/*
app.post("/dish-info", async (...) => {
   ...
});

try {

const dishName =
req.body.dishName;

const restaurant =
req.body.restaurant;

const category =
req.body.category;

const language =
req.body.language || "es";

const completion =
await openai.chat.completions.create({

model: "gpt-4.1-mini",

messages: [

{
role: "system",

content: `
Eres un asistente gastronómico experto.

Responde SIEMPRE en el idioma indicado.

Idioma:
${language}

Explica los platos de manera cercana, profesional y cultural.

Incluye:

- descripción
- ingredientes
- historia

Máximo 500 caracteres
La respuesta debe ser agradable de leer.
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

info: info

});

} catch (error) {

console.log(error);

return res.json({

success: false,

error: error.message

});

}


});

*/


// ================================
// BLOQUE 09 TRANSLATE MENU
// ================================

/*
app.post("/translate", async (req, res) => {

try {

const language =
req.body.language;

const menu =
req.body.menu;

const menuJson =
JSON.stringify(menu, null, 2);

console.log("==============");
console.log("TRANSLATE");
console.log(language);

const completion =
await openai.chat.completions.create({

model: "gpt-4.1-mini",

messages: [

{

role: "system",

content: `
You are a professional restaurant menu translator.

Translate the following menu into the requested language.

IMPORTANT:

- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT write \`\`\`json.
- Keep exactly the same JSON structure.
- Do NOT modify prices.
- Translate:
 - category
 - name
 - description

`

},

{

role: "user",

content:

`Target language:

${language}

Menu:

${menuJson}`

}

]

});

const translatedMenu =
completion.choices[0].message.content
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();

return res.json({

success: true,

menu: JSON.parse(translatedMenu)

});

} catch (error) {

return res.json({

success: false,

error: error.message

});

}

});

*/

//==================================================
// BLOQUE 10 - SERVER
//==================================================

app.listen(3000, "0.0.0.0", () => {

    console.log("MenuAi App running");

});

