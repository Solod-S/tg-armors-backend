const admin = require("firebase-admin");
const serviceAccount = require("../firebase-admin-sdk.json");

const fbAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// module.exports = db;
module.exports = {
  admin: fbAdmin,
  db: db,
};
