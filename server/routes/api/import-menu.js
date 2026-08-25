const express = require("express");

const router =
    express.Router();


/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

const apiAuth =
    require("../../middleware/apiAuth");


/*
|--------------------------------------------------------------------------
| APP
|--------------------------------------------------------------------------
*/

const {
    upload
} = require("../../app");


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
| imageFiles
| imageFiles[]
| imageFiles[0]
| imageFiles[1]
| ...
|
| o:
|
| pdfFile
|
| Máximo:
|
| - 20 imágenes
| - 1 PDF
|
|--------------------------------------------------------------------------
*/


router.post(

    "/import-menu",

    apiAuth,

    /*
    |--------------------------------------------------------------------------
    | MULTER
    |--------------------------------------------------------------------------
    |
    | Utilizamos any() porque PHP/cURL puede serializar los nombres
    | de los archivos como:
    |
    | imageFiles
    | imageFiles[]
    | imageFiles[0]
    |
    | Después filtramos manualmente los campos permitidos.
    |
    |--------------------------------------------------------------------------
    */

    upload.any(),

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
            | ARCHIVOS RECIBIDOS
            |--------------------------------------------------------------------------
            */

            const receivedFiles =
                Array.isArray(req.files)
                    ? req.files
                    : [];


            console.log(
                "FILES RECEIVED:",
                receivedFiles.length
            );


            receivedFiles.forEach(
                function (
                    file,
                    index
                ) {

                    console.log(
                        "FILE",
                        index,
                        "FIELD:",
                        file.fieldname,
                        "NAME:",
                        file.originalname,
                        "TYPE:",
                        file.mimetype
                    );

                }
            );


            /*
            |--------------------------------------------------------------------------
            | SEPARAR PDF E IMÁGENES
            |--------------------------------------------------------------------------
            */

            let pdfFile =
                null;


            const imageFiles =
                [];


            for (
                const file
                of receivedFiles
            ) {


                /*
                |--------------------------------------------------------------------------
                | PDF
                |--------------------------------------------------------------------------
                */

                if (
                    file.fieldname ===
                    "pdfFile"
                ) {

                    pdfFile =
                        file;

                    continue;

                }


                /*
                |--------------------------------------------------------------------------
                | IMÁGENES
                |--------------------------------------------------------------------------
                |
                | Aceptamos:
                |
                | imageFiles
                | imageFiles[]
                | imageFiles[0]
                | imageFiles[1]
                |
                |--------------------------------------------------------------------------
                */

                if (
                    /^imageFiles(?:\[\])?$/.test(
                        file.fieldname
                    )
                    ||
                    /^imageFiles\[\d+\]$/.test(
                        file.fieldname
                    )
                ) {

                    imageFiles.push(
                        file
                    );

                    continue;

                }


                /*
                |--------------------------------------------------------------------------
                | CAMPO NO PERMITIDO
                |--------------------------------------------------------------------------
                */

                console.log(
                    "IGNORING UNKNOWN FILE FIELD:",
                    file.fieldname
                );

            }


            /*
            |--------------------------------------------------------------------------
            | LOG RESUMEN
            |--------------------------------------------------------------------------
            */

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
            | LÍMITES
            |--------------------------------------------------------------------------
            */

            if (
                imageFiles.length > 20
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Maximum 20 images allowed"

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
            | LANGUAGE
            |--------------------------------------------------------------------------
            */

            const language =
                req.body &&
                req.body.language
                    ? req.body.language
                    : "es";


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
                | IMAGE SERVICE
                |--------------------------------------------------------------------------
                |
                | Reutilizamos exactamente el servicio existente.
                |
                |--------------------------------------------------------------------------
                */

                const parsedMenuText =
                    await processMenuImage(

                        imageFiles,

                        language

                    );


                /*
                |--------------------------------------------------------------------------
                | LIMPIAR JSON
                |--------------------------------------------------------------------------
                */

                const cleanJson =
                    String(
                        parsedMenuText || ""
                    )
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
                | PARSEAR JSON
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
                        "================================"
                    );

                    console.log(
                        "INVALID IMAGE MENU JSON"
                    );

                    console.log(
                        jsonError.message
                    );

                    console.log(
                        "RAW:"
                    );

                    console.log(
                        parsedMenuText
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

                console.log(
                    "IMAGE MENU PARSED SUCCESSFULLY"
                );


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
                | PDF SERVICE
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
                |
                | Conservamos exactamente el mismo flujo que /process.
                |
                |--------------------------------------------------------------------------
                */

                const parsedMenuText =
                    await parseMenuText(
                        text
                    );


                /*
                |--------------------------------------------------------------------------
                | LIMPIAR JSON
                |--------------------------------------------------------------------------
                */

                const cleanJson =
                    String(
                        parsedMenuText || ""
                    )
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
                        "================================"
                    );

                    console.log(
                        "INVALID PDF MENU JSON"
                    );

                    console.log(
                        jsonError.message
                    );

                    console.log(
                        "RAW:"
                    );

                    console.log(
                        parsedMenuText
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

                console.log(
                    "PDF MENU PARSED SUCCESSFULLY"
                );


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


            /*
            |--------------------------------------------------------------------------
            | FALLBACK
            |--------------------------------------------------------------------------
            */

            return res
                .status(400)
                .json({

                    success:
                        false,

                    error:
                        "Unsupported import request"

                });


        }


        catch (
            error
        ) {


            /*
            |--------------------------------------------------------------------------
            | ERROR GLOBAL
            |--------------------------------------------------------------------------
            */

            console.log("");

            console.log(
                "================================"
            );

            console.log(
                "MENUAI IMPORT MENU ERROR"
            );

            console.log(
                "MESSAGE:",
                error.message
            );

            console.log(
                "STACK:"
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


module.exports =
    router;
