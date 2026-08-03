const {
    openai
} = require("../server/app");


//==================================================
// PARSER SERVICE
//==================================================

async function parseMenuText(text) {

    console.log("PARSER SERVICE");

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

        messages: [

            {
                role: "system",

                content: `
You are a restaurant menu parser.

Return ONLY JSON.

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