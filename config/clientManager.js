const clients =
require("./clients");

function getClient(clientId){

    return (

        clients[clientId]

        ||

        clients.menuai

    );

}

module.exports = {

    getClient

};