const functions = require("firebase-functions");
exports.app = functions.https.onRequest(require("./app"));