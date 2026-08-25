const express = require("express");

const router =
    express.Router();


/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

const apiAuth =
    require("../../../server/middleware/apiAuth");


/*
|--------------------------------------------------------------------------
| APP
|--------------------------------------------------------------------------
*/

const {
    upload
} = require("../../../server/app");


/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
*/

const {
    extractFromPdf
} = require("../../../services/pdfService");


const {
    processMenuImage
} = require("../../../services/imageService");


const {
    parseMenuText
} = require("../../../services/parserService");


/*
|--------------------------------------------------------------------------
| API
| IMPORT MENU
|--------------------------------------------------------------------------
|
| POST /api/v1/import-menu
|
| Recibe:
|
| imageFiles[] → hasta 20 imágenes
| pdfFile      → máximo 1 PDF
|
| Devuelve:
|
| {
|   success: true,
|   menu: {
|       items: [...]
|   }
| }
|
|--------------------------------------------------------------------------
*/


router.post(

    "/import-menu",

    apiAuth,

    upload.fields([

        {
            name:
                "pdfFile",

            maxCount:
                1
        },

        {
            name:
                "imageFiles",

            maxCount:
                20
        }

    ]),

    async (
        req,
        res
    ) => {

        try {


            /*
            |--------------------------------------------------------------------------
            | LOG
            |--------------------------------------------------------------------------
            */

            console.log("");
            console.log(
                "================================"
            );

            console.log(
                "MENUAI IMPORT MENU API"
            );

            console.log(
                "CLIENT:",
                req.client
                    ? req.client.id
                    : "UNKNOWN"
            );

            console.log(
                "================================"
            );


            /*
            |--------------------------------------------------------------------------
            | ARCHIVOS
            |--------------------------------------------------------------------------
            */

            const pdfFile =
                req.files?.pdfFile?.[0];


            const imageFiles =
                req.files?.imageFiles || [];


            console.log(
                "IMAGES:",
                imageFiles.length
            );


            console.log(
                "PDF:",
                pdfFile
                    ? "YES"
                    : "NO"
            );


            /*
            |--------------------------------------------------------------------------
            | NO INPUT
            |--------------------------------------------------------------------------
            */

            if (
                !pdfFile &&
                imageFiles.length === 0
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "No image or PDF received"

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | PDF + IMÁGENES
            |--------------------------------------------------------------------------
            */

            if (
                pdfFile &&
                imageFiles.length > 0
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Send either images or a PDF, not both"

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | LANGUAGE
            |--------------------------------------------------------------------------
            |
            | Para la importación inicial utilizamos español.
            |
            | Más adelante podremos recibir:
            |
            | language=es
            |
            | desde OnlineFoodies.
            |
            |--------------------------------------------------------------------------
            */

            const language =
                req.body.language || "es";


            /*
            |--------------------------------------------------------------------------
            | IMAGE MODE
            |--------------------------------------------------------------------------
            */

            if (
                imageFiles.length > 0
            ) {


                console.log(
                    "IMPORT MODE: IMAGES"
                );


                console.log(
                    "IMAGE COUNT:",
                    imageFiles.length
                );


                /*
                |--------------------------------------------------------------------------
                | REUTILIZAR IMAGE SERVICE
                |--------------------------------------------------------------------------
                */

                const parsedMenuText =
                    await processMenuImage(

                        imageFiles,

                        language

                    );


                /*
                |--------------------------------------------------------------------------
                | LIMPIAR JSON MARKDOWN
                |--------------------------------------------------------------------------
                */

                const cleanJson =
                    parsedMenuText
                        .replace(
                            /```json/g,
                            ""
                        )
                        .replace(
                            /```/g,
                            ""
                        )
                        .trim();


                /*
                |--------------------------------------------------------------------------
                | PARSEAR
                |--------------------------------------------------------------------------
                */

                let menu;


                try {

                    menu =
                        JSON.parse(
                            cleanJson
                        );

                }
                catch (
                    jsonError
                ) {

                    console.log(
                        "INVALID IMAGE MENU JSON"
                    );

                    console.log(
                        jsonError.message
                    );


                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            error:
                                "MenuAI image parser returned invalid JSON",

                            raw:
                                parsedMenuText

                        });

                }


                /*
                |--------------------------------------------------------------------------
                | RESPUESTA
                |--------------------------------------------------------------------------
                */

                return res.json({

                    success:
                        true,

                    cached:
                        false,

                    source:
                        "images",

                    language:
                        language,

                    menu:
                        menu

                });

            }


            /*
            |--------------------------------------------------------------------------
            | PDF MODE
            |--------------------------------------------------------------------------
            */

            if (
                pdfFile
            ) {


                console.log(
                    "IMPORT MODE: PDF"
                );


                /*
                |--------------------------------------------------------------------------
                | EXTRAER TEXTO DEL PDF
                |--------------------------------------------------------------------------
                */

                const text =
                    await extractFromPdf(
                        pdfFile
                    );


                /*
                |--------------------------------------------------------------------------
                | PARSER SERVICE
                |--------------------------------------------------------------------------
                */

                const parsedMenuText =
                    await parseMenuText(

                        text,

                        language

                    );


                /*
                |--------------------------------------------------------------------------
                | LIMPIAR JSON
                |--------------------------------------------------------------------------
                */

                const cleanJson =
                    parsedMenuText
                        .replace(
                            /```json/g,
                            ""
                        )
                        .replace(
                            /```/g,
                            ""
                        )
                        .trim();


                /*
                |--------------------------------------------------------------------------
                | PARSEAR
                |--------------------------------------------------------------------------
                */

                let menu;


                try {

                    menu =
                        JSON.parse(
                            cleanJson
                        );

                }
                catch (
                    jsonError
                ) {

                    console.log(
                        "INVALID PDF MENU JSON"
                    );

                    console.log(
                        jsonError.message
                    );


                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            error:
                                "MenuAI PDF parser returned invalid JSON",

                            raw:
                                parsedMenuText

                        });

                }


                /*
                |--------------------------------------------------------------------------
                | RESPUESTA
                |--------------------------------------------------------------------------
                */

                return res.json({

                    success:
                        true,

                    cached:
                        false,

                    source:
                        "pdf",

                    language:
                        language,

                    menu:
                        menu

                });

            }


        }

        catch (
            error
        ) {


            console.log("");
            console.log(
                "================================"
            );

            console.log(
                "MENUAI IMPORT MENU ERROR"
            );

            console.log(
                error.message
            );

            console.log(
                error.stack
            );

            console.log(
                "================================"
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        error.message

                });

        }

    }

);


module.exports = router;
