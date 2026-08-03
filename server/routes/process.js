const express = require("express");
const router = express.Router();

const {
    upload
} = require("../app");


//==================================================
// SERVICES
//==================================================

const {
    extractFromUrl
} = require("../urlService");

const {
    extractFromPdf
} = require("../../services/pdfService");

const {
    processMenuImage
} = require("../../services/imageService");

const {
    parseMenuText
} = require("../../services/parserService");


//==================================================
// BLOQUE 3.1 - PROCESS
//==================================================

router.post(

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

    const pdfFile =
        req.files?.pdfFile?.[0];

    const imageFile =
        req.files?.imageFile?.[0];

    console.log("==============================");
    console.log("PROCESS");
    console.log("Idioma solicitado:", language);

    let text = "";


    //==================================================
    // BLOQUE 3.2 - URL MODE
    //==================================================

    if (url) {

        console.log("URL RECEIVED");

        text =
            await extractFromUrl(url);

    }


    //==================================================
    // BLOQUE 3.3 - IMAGE MODE
    //==================================================

    else if (imageFile) {

        console.log("IMAGE RECEIVED");

        const parsedMenu =
            await processMenuImage(
                imageFile,
                language
            );

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

        text =
            await extractFromPdf(pdfFile);

    }


    //==================================================
    // NO INPUT
    //==================================================

    else {

        return res.json({

            success: false,

            error: "No URL, image or PDF received"

        });

    }


    //==================================================
    // BLOQUE 3.5 - PARSER SERVICE
    //==================================================

    const parsedMenu =
        await parseMenuText(text);


    return res.json({

        success: true,

        parsedMenu: parsedMenu

    });


}

catch (error) {

    console.log("================================");
    console.log("ERROR EN /process");
    console.log("Mensaje:", error.message);
    console.log("STACK COMPLETO:");
    console.log(error.stack);
    console.log("================================");

    return res.json({

        success: false,

        error: error.message

    });

}

}

);


module.exports = router;