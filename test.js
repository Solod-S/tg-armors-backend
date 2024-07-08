const dotenv = require("dotenv");

const { googleCalendarCronEventCheck } = require("./utils/cronOperations");
const {
  escapeMarkdown,
  getRandomGreeting,
  getRandomFarewell,
} = require("./utils/helpers");

const fbaseUserDataServices = require("./fbase/fbaseUserDataServices");
const {
  refreshGoogleCalendarAccessToken,
  getGoogleCalendarEvents,
  getGoogleTasks,
} = require("./utils/googleCalendarOperations");

dotenv.config();

googleCalendarCronEventCheck();
