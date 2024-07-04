const { parse, isWithinInterval, addMinutes, format } = require("date-fns");
const { ru } = require("date-fns/locale");
const cron = require("node-cron");
const dotenv = require("dotenv");
const {
  getGoogleSheet,
  googleSheetTransformer,
} = require("./googleSHeetsOperations");

dotenv.config();
const { GOOGLE_SHEET_ID } = process.env;

const googleSheetCronEventCheck = async () => {
  const result = [];
  try {
    
    const data = await getGoogleSheet(GOOGLE_SHEET_ID);

    if (data && data.values && data.values.length > 0) {
      const tasks = googleSheetTransformer(data.values);

      const now = new Date();
      const dayOfWeek = format(now, "EEEE", { locale: ru }).toLowerCase();
      

      const daysOfWeekMap = {
        понедельник: "Mon",
        вторник: "Tue",
        среда: "Wed",
        четверг: "Thu",
        пятница: "Fri",
        суббота: "Sat",
        воскресенье: "Sun",
      };

      for (const task of tasks) {
        let taskDateTime;
        if (task.date.trim() === "*") {
          const todayDateStr = format(now, "dd.MM.yyyy");
          taskDateTime = parse(
            `${todayDateStr} ${task.time}`,
            "dd.MM.yyyy HH:mm",
            new Date()
          );
        } else if (
          Object.keys(daysOfWeekMap).some(day =>
            task.date.toLowerCase().includes(day)
          )
        ) {
          const taskDay = task.date.toLowerCase();
          if (taskDay.includes(dayOfWeek)) {
            const todayDateStr = format(now, "dd.MM.yyyy");
            taskDateTime = parse(
              `${todayDateStr} ${task.time}`,
              "dd.MM.yyyy HH:mm",
              new Date()
            );
          } else {
            continue;
          }
        } else {
          taskDateTime = parse(
            `${task.date} ${task.time}`,
            "dd.MM.yyyy HH:mm",
            new Date()
          );
        }

        if (!isNaN(taskDateTime)) {
          const intervalStart = addMinutes(taskDateTime, -15);
          const intervalEnd = addMinutes(taskDateTime, 15);

          if (
            isWithinInterval(now, { start: intervalStart, end: intervalEnd })
          ) {
            result.push(task);
          }
        }
      }
    }
    console.log(result);
    return result;
  } catch (error) {
    console.log(`Error in googleSheetCronEventCheck: ${error}`);
    return result;
  }
};

module.exports = { googleSheetCronEventCheck };

googleSheetCronEventCheck();
