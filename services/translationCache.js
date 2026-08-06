const fs = require("fs");
const path = require("path");
const crypto = require("crypto");


//==================================================
// TRANSLATION CACHE
//==================================================

const CACHE_DIR = path.join(
    __dirname,
    "../cache/translations"
);


//==================================================
// CREATE CACHE DIRECTORY
//==================================================

function ensureCacheDirectory() {

    if (!fs.existsSync(CACHE_DIR)) {

        fs.mkdirSync(
            CACHE_DIR,
            {
                recursive: true
            }
        );

    }

}


//==================================================
// CREATE MENU HASH
//==================================================

function createMenuHash(menu) {

    /*
     * JSON estable del menú recibido.
     *
     * Si cambia cualquier plato/categoría/descripción,
     * cambiará el hash.
     */

    const menuJson =
        JSON.stringify(menu);

    return crypto
        .createHash("sha256")
        .update(menuJson, "utf8")
        .digest("hex");

}


//==================================================
// CACHE FILE
//==================================================

function getCacheFile(
    clientId,
    hash,
    language
) {

    ensureCacheDirectory();

    /*
     * Limpiamos idioma para evitar caracteres
     * extraños en nombres de archivo.
     */

    const safeLanguage =
        String(language)
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "");

    const safeClient =
        String(clientId)
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "");

    return path.join(
        CACHE_DIR,
        `${safeClient}_${hash}_${safeLanguage}.json`
    );

}


//==================================================
// READ CACHE
//==================================================

function getCachedTranslation(
    clientId,
    hash,
    language
) {

    const file =
        getCacheFile(
            clientId,
            hash,
            language
        );

    if (!fs.existsSync(file)) {

        return null;

    }

    try {

        const content =
            fs.readFileSync(
                file,
                "utf8"
            );

        return JSON.parse(content);

    }

    catch (error) {

        console.log(
            "CACHE READ ERROR:",
            error.message
        );

        return null;

    }

}


//==================================================
// SAVE CACHE
//==================================================

function saveTranslation(
    clientId,
    hash,
    language,
    menu
) {

    const file =
        getCacheFile(
            clientId,
            hash,
            language
        );

    const data = {

        client:
            clientId,

        hash:
            hash,

        language:
            language,

        createdAt:
            new Date().toISOString(),

        menu:
            menu

    };


    fs.writeFileSync(
        file,
        JSON.stringify(
            data,
            null,
            2
        ),
        "utf8"
    );


    return data;

}


//==================================================
// EXPORTS
//==================================================

module.exports = {

    createMenuHash,
    getCachedTranslation,
    saveTranslation

};