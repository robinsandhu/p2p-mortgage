require('dotenv').config();
const pinataSDK = require("@pinata/sdk");

module.exports = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);