//==================================================
// MENUAI API AUTH
//==================================================

const {
    getClient
} = require("../../config/clientManager");


function apiAuth(req, res, next) {

    //==================================================
    // DEBUG - AUTH REQUEST
    //==================================================

    console.log("");
    console.log("================================");
    console.log("MENUAI API AUTH DEBUG");
    console.log("================================");

    console.log(
        "REQUEST:",
        req.method,
        req.originalUrl
    );

    console.log(
        "AUTHORIZATION HEADER:",
        req.headers.authorization
            ? "PRESENT"
            : "MISSING"
    );

    console.log(
        "ONLINEFOODIES ENV:",
        !!process.env.MENUAI_KEY_ONLINEFOODIES
    );

    console.log(
        "MENUDIARIO ENV:",
        !!process.env.MENUAI_KEY_MENUDIARIO
    );

    console.log(
        "MENUAI ENV:",
        !!process.env.MENUAI_KEY_MENUAI
    );

    console.log("================================");


    //==================================================
    // AUTHORIZATION HEADER
    //==================================================

    const authorization =
        req.headers.authorization;


    if (!authorization) {

        console.log(
            "AUTH ERROR: API key required"
        );

        return res.status(401).json({

            success: false,

            error: "API key required"

        });

    }


    //==================================================
    // AUTHORIZATION FORMAT
    //==================================================

    const parts =
        authorization.split(" ");


    if (

        parts.length !== 2 ||

        parts[0] !== "Bearer"

    ) {

        console.log(
            "AUTH ERROR: Invalid authorization format"
        );

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


    console.log(
        "CLIENT ID DETECTED:",
        clientId || "NONE"
    );


    //==================================================
    // INVALID API KEY
    //==================================================

    if (!clientId) {

        console.log(
            "AUTH ERROR: Invalid API key"
        );

        return res.status(401).json({

            success: false,

            error: "Invalid API key"

        });

    }


    //==================================================
    // LOAD CLIENT PROFILE
    //==================================================

    console.log(
        "LOADING CLIENT PROFILE:",
        clientId
    );


    try {

        req.client =
            getClient(clientId);


        console.log(
            "CLIENT PROFILE:",
            req.client
                ? req.client.id
                : "NULL"
        );


        console.log(
            "CLIENT NAME:",
            req.client
                ? req.client.name
                : "NULL"
        );


    } catch (error) {

        console.log(
            "CLIENT PROFILE ERROR:"
        );

        console.log(
            error.message
        );

        console.log(
            error.stack
        );

        return res.status(500).json({

            success: false,

            error: "Client profile loading failed"

        });

    }


    //==================================================
    // CLIENT PROFILE VALIDATION
    //==================================================

    if (!req.client) {

        console.log(
            "AUTH ERROR: Client profile not found"
        );

        return res.status(500).json({

            success: false,

            error: "Client profile not found"

        });

    }


    //==================================================
    // SUCCESS
    //==================================================

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