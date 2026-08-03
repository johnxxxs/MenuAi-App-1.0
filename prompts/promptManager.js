const {
    getClient
} = require("../config/clientManager");

function getTranslatePrompt(clientId) {

    const client =
        getClient(clientId);

    return client.prompt.translateMenu;

}

function getDishInfoPrompt(clientId) {

    const client =
        getClient(clientId);

    return client.prompt.dishInfo;

}

module.exports = {

    getTranslatePrompt,
    getDishInfoPrompt

};