const { parse, isWithinInterval, addMinutes } = require("date-fns");
const cron = require("node-cron");
const dotenv = require("dotenv");
const {
  getGoogleSheet,
  googleSheetTransformer,
} = require("./googleSHeetsOperations");

dotenv.config();

const { GOOGLE_SHEET_ID } = process.env;

const googleSheetCronEventCheck = async () => {
  try {
    const result = [];
    const data = await getGoogleSheet(GOOGLE_SHEET_ID);
    

    if (data && data.values && data.values.length > 0) {
      const tasks = googleSheetTransformer(data.values);
      const now = new Date();

      for (const task of tasks) {
        const taskDateTime = parse(
          `${task.date} ${task.time}`,
          "dd.MM.yyyy HH:mm",
          new Date()
        );

        const intervalStart = addMinutes(taskDateTime, -5);
        const intervalEnd = addMinutes(taskDateTime, 5);

        if (isWithinInterval(now, { start: intervalStart, end: intervalEnd })) {
          result.push(task);
          //         {
          //   chatId: '-1002086154595',
          //   date: '27.05.2024',
          //   time: '12:00',
          //   text: 'Сообщение 27.05.2024 в в 12-00'
          // }
        }
      }
    }
    return result;
  } catch (error) {
    console.log(`Error in googleSheetCronEventCheck: ${error}`);
    return result;
  }
};

module.exports = { googleSheetCronEventCheck };
