//==================================================
// MENUAI API AUTH
//==================================================

const {
    getClient
} = require("../../config/clientManager");


function apiAuth(req, res, next) {

    const authorization =
        req.headers.authorization;

    if (!authorization) {

        return res.status(401).json({

            success: false,

            error: "API key required"

        });

    }


    const parts =
        authorization.split(" ");


    if (

        parts.length !== 2 ||

        parts[0] !== "Bearer"

    ) {

        return res.status(401).json({

            success: false,

            error: "Invalid authorization format"

        });

    }


    const apiKey =
        parts[1];


    //==================================================
    // REGISTERED API KEYS
    //==================================================

    const apiKeys = {

        menudiario:
            process.env.MENUAI_KEY_MENUDIARIO,

        menuai:
            process.env.MENUAI_KEY_MENUAI,

        onlinefoodies:
            process.env.MENUAI_KEY_ONLINEFOODIES

    };


    //==================================================
    // FIND CLIENT
    //==================================================

    const clientId =

        Object.keys(apiKeys).find(

            key => apiKeys[key] === apiKey

        );


    if (!clientId) {

        return res.status(401).json({

            success: false,

            error: "Invalid API key"

        });

    }


    //==================================================
    // LOAD CLIENT PROFILE
    //==================================================

    req.client =

        getClient(clientId);


    console.log("");

    console.log("================================");

    console.log("CLIENT CONNECTED");

    console.log("ID:", req.client.id);

    console.log("NAME:", req.client.name);

    console.log("================================");

    console.log("");


    next();

}


module.exports = apiAuth;