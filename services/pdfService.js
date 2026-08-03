const fs = require("fs");
const { PDFParse } = require("pdf-parse");


//==================================================
// PDF SERVICE
//==================================================

async function extractFromPdf(pdfFile) {

    console.log("PDF SERVICE");

    if (!pdfFile) {

        throw new Error(
            "No PDF file received"
        );

    }

    const pdfBuffer =
        fs.readFileSync(pdfFile.path);

    const parser =
        new PDFParse({
            data: pdfBuffer
        });

    try {

        const result =
            await parser.getText();

        console.log(
            "PDF procesado correctamente"
        );

        console.log(
            "Páginas:",
            result.total
        );

        return result.text;

    }

    finally {

        await parser.destroy();

    }

}


module.exports = {
    extractFromPdf
};