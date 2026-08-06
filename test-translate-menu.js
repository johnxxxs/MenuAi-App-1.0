const axios = require("axios");

async function test() {

    try {

        console.log("================================");
        console.log("TEST MENUAI - TRADUCCION MENU");
        console.log("================================");

        const respuesta = await axios.post(

            // CAMBIAR POR LA URL REAL DE TU API
            "https://menuaiapp.com/api/v1/menu",

            {
                client: "menudiario",

                language: "en",

                text: `
PRIMEROS

Ensalada Mixta
Lechuga, tomate, cebolla, atún y huevo

Croquetas de jamón
Croquetas caseras de jamón ibérico


SEGUNDOS

Merluza a la romana
Merluza fresca rebozada

Entrecot a la plancha
Entrecot de ternera a la plancha


POSTRES

Tarta de queso
Tarta de queso casera

Flan casero
Flan tradicional
`
            },

            {
                headers: {

                    "Content-Type":
                        "application/json",

                    // CAMBIA ESTO según apiAuth.js
                    "x-api-key":
                        "TU_API_KEY"

                }
            }

        );


        console.log(
            JSON.stringify(
                respuesta.data,
                null,
                2
            )
        );


    }
    catch (error) {

        console.log("ERROR");


        if (error.response) {

            console.log(
                "HTTP:",
                error.response.status
            );

            console.log(
                JSON.stringify(
                    error.response.data,
                    null,
                    2
                )
            );

        }
        else {

            console.log(
                error.message
            );

        }

    }

}


test();