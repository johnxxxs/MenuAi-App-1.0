const axios = require("axios");
const cheerio = require("cheerio");


//==================================================
// URL SERVICE
//==================================================

async function extractFromUrl(url) {

    console.log("URL SERVICE");

    const response =
        await axios.get(url);

    const html =
        response.data;

    const $ =
        cheerio.load(html);

    const text =
        $("body").text();

    return text;

}


module.exports = {
    extractFromUrl
};