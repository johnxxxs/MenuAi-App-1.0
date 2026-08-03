const express = require("express");
const router = express.Router();
const apiAuth =
    require("../../middleware/apiAuth");

const {
    parseMenuText
} = require("../../../services/parserService");


//==================================================
// MENUAI API
// API VERSION 1
//==================================================


//==================================================
// BLOQUE API 01 - TEST
//==================================================

router.get("/menu", (req, res) => {

    return res.json({

        success: true,
        service: "MenuAI API",
        version: "1.0",
        status: "online"

    });

});


//==================================================
// BLOQUE API 02 - PROCESS MENU
//==================================================

router.post("/menu", apiAuth, async (req, res) => {

    try {

        console.log("================================");
        console.log("MENUAI API REQUEST");
        console.log("================================");

        const client =
            req.body.client || "external";

        const language =
            req.body.language || "es";

        const text =
            req.body.text;


        console.log("Client:", client);
        console.log("Language:", language);


        //==================================================
        // VALIDATION
        //==================================================

        if (!text) {

            return res.status(400).json({

                success: false,

                error:
                    "No menu text received"

            });

        }


        //==================================================
        // MENU PARSER
        //==================================================

        const parsedMenu =
            await parseMenuText(text);


        //==================================================
        // CLEAN OPENAI RESPONSE
        //==================================================

        const cleanJson =
            parsedMenu
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();


        let menu;

        try {

            menu =
                JSON.parse(cleanJson);

        }

        catch (jsonError) {

            console.log(
                "Invalid JSON returned by parser"
            );

            return res.status(500).json({

                success: false,

                error:
                    "MenuAI parser returned invalid JSON",

                raw:
                    cleanJson

            });

        }


        //==================================================
        // API RESPONSE
        //==================================================

        return res.json({

            success: true,

            service:
                "MenuAI API",

            version:
                "1.0",

            client:
                client,

            language:
                language,

            data:
                menu

        });


    }

    catch (error) {

        console.log("================================");
        console.log("MENUAI API ERROR");
        console.log("Mensaje:", error.message);
        console.log(error.stack);
        console.log("================================");

        return res.status(500).json({

            success: false,

            error:
                error.message

        });

    }

});


module.exports = router;







