//==================================================
// BLOQUE 01 - CONFIGURACION
//==================================================

require("dotenv").config();
const fs = require("fs");
const pdf = require("pdf-parse").default;
const express = require("express");
const path = require("path"); 
const multer = require("multer");
const axios = require("axios");
const cheerio = require("cheerio");
const OpenAI = require("openai");
const mime = require("mime-types");

const app = express();

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());

app.use(express.static("public"));

const upload = multer({
dest: "uploads/"
});

module.exports = {
    app,
    openai,
    upload
};