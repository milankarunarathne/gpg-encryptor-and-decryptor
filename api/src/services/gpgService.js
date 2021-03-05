const fs = require("fs");
const _ = require("lodash");
const openpgp = require("openpgp");
const path = require("path");
const constants = require("../constants");

class gpgService {
    constructor() {}

    async encrypt(reqBody) {
        let reqBodyEnc = null;

        const publicKeyArmored = fs.readFileSync(path.join(__dirname, "../../../keys/senders-publicKey.asc"));
        const privateKeyArmored = fs.readFileSync(path.join(__dirname, "../../../keys/recievers-privateKey.asc"));
        
        const {
            keys: [privateKey],
        } = await openpgp.key.readArmored(privateKeyArmored);
        reqBody = JSON.stringify(reqBody);
        try {
            reqBodyEnc = await openpgp.encrypt({
                message: await openpgp.message.fromText(reqBody), // parse armored message
                publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys, // for encryption
                privateKeys: [privateKey], // for signing  (optional)
                compression: openpgp.enums.compression.zip, // compress the data with zip
            });
        } catch (error) {
            console.error("Error: ", error.message);
            if (error.message === "Misformed armored text") {
                return {
                    status: constants.HTTP_STATUS_CODES.BAD_REQUEST,
                    body: "Please send encrypted request body",
                };
            }
            return {
                status: constants.HTTP_STATUS_CODES.BAD_REQUEST,
                body: "Bad Request",
            };
        }
        if (_.isEmpty(reqBodyEnc)) {
            return {
                status: constants.HTTP_STATUS_CODES.BAD_REQUEST,
                body: "Data missed on request body",
            };
        }
        return {
            status: constants.HTTP_STATUS_CODES.OK,
            body: reqBodyEnc.data,
        };
    }

    async decrypt(encReqBody) {
        let reqBodyStr = null;

        const publicKeyArmored = fs.readFileSync(path.join(__dirname, "../../../keys/senders-publicKey.asc"));
        const privateKeyArmored = fs.readFileSync(path.join(__dirname, "../../../keys/recievers-privateKey.asc"));
        const passphrase = ``;
        const {
            keys: [privateKey],
        } = await openpgp.key.readArmored(privateKeyArmored);

        try {
            reqBodyStr = await openpgp.decrypt({
                message: await openpgp.message.readArmored(encReqBody), // parse armored message
                publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys, // for verification (optional)
                privateKeys: [privateKey], // for decryption
            });
        } catch (error) {
            console.error("Error: ", error.message);
            if (error.message === "Misformed armored text") {
                return {
                    status: constants.HTTP_STATUS_CODES.BAD_REQUEST,
                    body: "Please send encrypted request body",
                };
            }
            return {
                status: constants.HTTP_STATUS_CODES.BAD_REQUEST,
                body: "Bad Request",
            };
        }
        const reqBody = JSON.parse(reqBodyStr.data);
        if (_.isEmpty(reqBody)) {
            return {
                status: constants.HTTP_STATUS_CODES.BAD_REQUEST,
                body: "Data missed on request body",
            };
        }
        return {
            status: constants.HTTP_STATUS_CODES.OK,
            body: reqBody,
        };
    }
}

module.exports = gpgService;
