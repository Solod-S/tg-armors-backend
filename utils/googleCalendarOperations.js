const { google } = require("googleapis");
const dotenv = require("dotenv");
dotenv.config();
const CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
const REDIRECT_URI = "YOUR_REDIRECT_URI";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET
  // REDIRECT_URI
);

const calendar = google.calendar({ version: "v3", auth: oauth2Client });
const tasks = google.tasks({ version: "v1", auth: oauth2Client });

const refreshGoogleCalendarAccessToken = async refreshToken => {
  console.log(`refreshToken`, refreshToken);
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    return credentials.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
};

const getGoogleCalendarEvents = async accessToken => {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: tomorrow.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items;
  } catch (error) {
    console.error("Error retrieving events:", error);
    throw error;
  }
};

const getGoogleTasks = async accessToken => {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });

    const response = await tasks.tasks.list({
      tasklist: "@default",
      maxResults: 100,
      showCompleted: false,
    });

    return response.data.items;
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    throw error;
  }
};

module.exports = {
  refreshGoogleCalendarAccessToken,
  getGoogleCalendarEvents,
  getGoogleTasks,
};
