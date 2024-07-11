const dotenv = require("dotenv");
const bot = require("./app");

const { googleCalendarCronEventCheck } = require("./utils/cronOperations");
const {
  getRandomGreeting,
  getRandomFarewell,
  finalFormatText,
  formatText,
} = require("./utils/helpers");

const fbaseUserDataServices = require("./fbase/fbaseUserDataServices");
const {
  refreshGoogleCalendarAccessToken,
  getGoogleCalendarEvents,
  getGoogleTasks,
} = require("./utils/googleCalendarOperations");

dotenv.config();

const test = async () => {
  try {
    const tasks = await googleCalendarCronEventCheck();
    console.log(`current google calendar tasks:`, tasks);

    if (tasks.length > 0) {
      for (const task of tasks) {
        const fullSet =
          task.chatId &&
          task.text &&
          task.chatId.trim() !== "" &&
          task.text.trim() !== "";
        if (fullSet) {
          const chatId = task.chatId.trim();
          const text = task.text.trim();
          const formattedText = formatText(text); // Форматирование текста
          const escapedText = finalFormatText(formattedText);

          console.log(`Sending message to ${chatId}: ${escapedText}`);

          try {
            await bot.sendMessage(chatId, escapedText, {
              parse_mode: "MarkdownV2",
            });
          } catch (sendError) {
            console.log(`Error sending message to ${chatId}: ${sendError}`);
          }
        }
      }
    }
  } catch (error) {
    console.log(`Error in google sheet cron: ${error}`);
  }
};

test();
