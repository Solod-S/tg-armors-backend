const { GoogleSpreadsheet } = require("google-spreadsheet");

// File handling package
const fs = require("fs");

// spreadsheet key is the long id in the sheets URL
const RESPONSES_SHEET_ID = "1qBvrpEJugsnto-LT5VaazXCzKfVHPubrDbLO4baVaV8";

// Create a new document
const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID);

// Credentials for the service account
const CREDENTIALS = JSON.parse(
  fs.readFileSync("googleSheetsApiCredentials.json")
);

const getRows = async (sheetIndex) => {
  // use service account creds
  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  });

  // load the documents info
  await doc.loadInfo();

  // Index of the sheet
  let sheet = doc.sheetsByIndex[sheetIndex];

  // Get all the rows
  return await sheet.getRows();
};

const getRow = async (email) => {
  // use service account creds
  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  });

  // load the documents info
  await doc.loadInfo();

  // Index of the sheet
  let sheet = doc.sheetsByIndex[1];

  // Get all the rows
  let rows = await sheet.getRows();

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    if (row.email == email) {
      console.log(row.user_name);
      console.log(row.password);
    }
  }
};
// getRow('email@gmail.com');

const addRow = async (rows) => {
  try {
    // use service account creds
    await doc.useServiceAccountAuth({
      client_email: CREDENTIALS.client_email,
      private_key: CREDENTIALS.private_key,
    });
    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

    // for (let index = 0; index < rows.length; index++) {
    //   const row = rows[index];
    //   console.log(row);
    //   await sheet.addRow(row);
    // }
    await sheet.addRow(rows);
  } catch (error) {
    console.log(error.message);
  }
};

// let rows = [
//   {
//     email: "email@email.com",
//     user_name: "ramesh",
//     password: "abcd@1234",
//   },
//   {
//     email: "email@gmail.com",
//     user_name: "dilip",
//     password: "abcd@1234",
//   },
// ];

// addRow(rows);

const updateRow = async (keyValue, oldValue, newValue) => {
  // use service account creds
  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  });

  await doc.loadInfo();

  // Index of the sheet
  let sheet = doc.sheetsByIndex[0];

  let rows = await sheet.getRows();

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    if (row[keyValue] === oldValue) {
      rows[index][keyValue] = newValue;
      await rows[index].save();
      break;
    }
  }
};

// updateRow('email', 'email@gmail.com', 'ramesh@ramesh.com')

const deleteRow = async (keyValue, thisValue) => {
  // use service account creds
  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  });

  await doc.loadInfo();

  // Index of the sheet
  let sheet = doc.sheetsByIndex[0];

  let rows = await sheet.getRows();

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    if (row[keyValue] === thisValue) {
      await rows[index].delete();
      break;
    }
  }
};

deleteRow("email", "ramesh@ramesh.com");

module.exports = { addRow, getRows };
