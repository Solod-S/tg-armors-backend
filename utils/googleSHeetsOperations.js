const { google } = require("googleapis");

const googleSheetTransformer = data => {
  const keys = data[0];
  const result = [];
  // console.log(data[0]);
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    for (let j = 0; j < keys.length; j++) {
      obj[keys[j]] = data[i][j];
    }
    result.push(obj);
  }

  return result;
};

const createAuthorizedClient = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "googleSheetsApiCredentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const client = await auth.getClient();

    // Instance of Google Sheets API
    const googleSheets = google.sheets({ version: "v4", auth: client });

    return { googleSheets, client, auth };
  } catch (error) {
    throw error;
  }
};

const getGoogleSheet = async (
  spreadsheetId
  // sheetIndex = "2",
  // columnRange = "A1:Z1000"
) => {
  try {
    const { googleSheets } = await createAuthorizedClient();

    const result = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      // range: `'${sheetname}'!${columnRange}`,
      range: "A1:Z1000",
    });
    return result.data;
  } catch (error) {
    throw error;
  }
};

const addGoogleSheet = async (spreadsheetId, range, data) => {
  try {
    const { googleSheets, auth } = await createAuthorizedClient();

    const result = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[...data]],
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { getGoogleSheet, addGoogleSheet, googleSheetTransformer };
