const cron = require("node-cron");
const { endOfMonth, isWeekend, subDays, isSameDay } = require("date-fns");
const bot = require("./app");
const {
  googleSheetCronEventCheck,
  googleCalendarCronEventCheck,
  firebaseSchedyleEventCheck,
} = require("./utils/cronOperations");
const {
  escapeMarkdown,
  getRandomGreeting,
  finalFormatText,
  formatText,
} = require("./utils/helpers");
const { cron1cMessageText } = require("./constant/messages");
const { chatId, cronStickerUrl } = require("./config");

const scheduleCronJobs = () => {
  // Расписание каждый 30 мин ходить в гугл календарь
  // cron.schedule("*/30 * * * *", async () => {
  //   try {
  //     const tasks = await googleCalendarCronEventCheck();
  //     console.log(`current google calendar tasks:`, tasks);

  //     if (tasks.length > 0) {
  //       for (const task of tasks) {
  //         const fullSet =
  //           task.chatId &&
  //           task.text &&
  //           task.chatId.trim() !== "" &&
  //           task.text.trim() !== "";
  //         if (fullSet) {
  //           const chatId = task.chatId.trim();
  //           const text = task.text.trim();
  //           const escapedText = escapeMarkdown(text);

  //           console.log(`Sending message to ${chatId}: ${escapedText}`);

  //           try {
  //             await bot.sendMessage(chatId, escapedText, {
  //               parse_mode: "MarkdownV2",
  //             });
  //           } catch (sendError) {
  //             console.log(`Error sending message to ${chatId}: ${sendError}`);
  //           }
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.log(`Error in google sheet cron: ${error}`);
  //   }
  // });

  // Расписание каждый 30 мин ходить в гугл календарь
  cron.schedule("*/30 * * * *", async () => {
    try {
      const tasks = await googleCalendarCronEventCheck();
      console.log(`current google calendar tasks:`, tasks);

      if (tasks.length > 0) {
        for (const task of tasks) {
          const fullSet = task.chatId && task.text;
          if (fullSet) {
            const chatId = task.chatId;
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
  });

  // Расписание каждый час ходить в фаер бейс
  cron.schedule("0 * * * *", async () => {
    try {
      const tasks = await firebaseSchedyleEventCheck();
      console.log(`current fireBase tasks:`, tasks);
      if (tasks.length > 0) {
        for (const task of tasks) {
          const fullSet = task.chatId && task.text;
          if (fullSet) {
            const chatId = task.chatId;
            const text = task.text.trim();
            const escapedText = escapeMarkdown(text);
            console.log(`Sending message to ${chatId}: ${escapedText}`);
            try {
              if (task.img && task.img.length > 0) {
                await bot.sendPhoto(chatId, task.img, {
                  caption: escapedText,
                  parse_mode: "MarkdownV2",
                });
              } else {
                await bot.sendMessage(chatId, escapedText, {
                  parse_mode: "MarkdownV2",
                });
              }
            } catch (sendError) {
              console.log(`Error sending message to ${chatId}: ${sendError}`);
            }
          }
        }
      }
    } catch (error) {
      console.log(`Error in google sheet cron: ${error}`);
    }
  });

  // Расписание каждый час ходить в гугл таблицу
  cron.schedule("0 * * * *", async () => {
    try {
      const tasks = await googleSheetCronEventCheck();
      console.log(`current google sheet's tasks:`, tasks);

      if (tasks.length > 0) {
        for (const task of tasks) {
          const fullSet = task.chatId && task.text;
          if (fullSet) {
            const chatId = task.chatId;
            const text = task.text.trim();
            const escapedText = escapeMarkdown(text);

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
  });

  // Расписание для отправки напоминания выйти из 1с в конце месяца
  cron.schedule("0 19 * * *", () => {
    const currentDate = new Date();
    const lastDayOfMonth = endOfMonth(currentDate);

    if (isSameDay(currentDate, lastDayOfMonth)) {
      bot.sendAnimation(chatId, cronStickerUrl, {
        caption: cron1cMessageText,
        parse_mode: "Markdown",
      });
    }
  });

  // Расписание для отправки напоминания выйти из 1с в последний рабочий день месяц
  cron.schedule("0 18 * * *", () => {
    const currentDate = new Date();
    let lastWorkDayOfMonth = endOfMonth(currentDate);
    // Идем от последнего дня месяца назад до тех пор, пока не найдем рабочий день
    while (isWeekend(lastWorkDayOfMonth)) {
      lastWorkDayOfMonth = subDays(lastWorkDayOfMonth, 1);
    }
    // Проверяем, совпадает ли последний рабочий день месяца с сегодняшним днем
    if (isSameDay(currentDate, lastWorkDayOfMonth)) {
      bot.sendAnimation(chatId, cronStickerUrl, {
        caption: cron1cMessageText,
        parse_mode: "Markdown",
      });
    }
  });

  // Расписание для отправки приветствий в будние дни в 9:00 утра (понедельник-пятница)
  cron.schedule("0 9 * * 1-5", () => {
    bot.sendMessage(chatId, getRandomGreeting(), { parse_mode: "Markdown" });
  });
};

module.exports = {
  scheduleCronJobs,
};
