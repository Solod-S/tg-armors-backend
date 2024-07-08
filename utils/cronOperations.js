const {
  parse,
  isWithinInterval,
  addMinutes,
  format,
  differenceInMinutes,
  parseISO,
  isValid,
} = require("date-fns");
const { ru } = require("date-fns/locale");
const fbaseUserDataServices = require("../fbase/fbaseUserDataServices");
const {
  refreshGoogleCalendarAccessToken,
  getGoogleCalendarEvents,
  getGoogleTasks,
} = require("../utils/googleCalendarOperations");
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

const googleCalendarCronEventCheck = async () => {
  const result = [];
  try {
    const userData = await fbaseUserDataServices.getUsersData();

    if (userData.length <= 0) return result;

    for (const user of userData) {
      // console.log(`user`, user);
      for (const project of user.projectsData) {
        const { chatId } = user.tgGroupsData.find(
          chatData => chatData.id === project.tgGroup
        );

        const googleCalendarIntegration = project.integrations.find(
          integration => integration.name === "Google Calendar"
        );

        if (
          !googleCalendarIntegration ||
          !googleCalendarIntegration.refresh_token ||
          !googleCalendarIntegration.tgSelectors === 0
        )
          continue;

        const refreshToken = googleCalendarIntegration.refresh_token;

        const updatedRefreshToken = await refreshGoogleCalendarAccessToken(
          refreshToken
        );

        if (!updatedRefreshToken) continue;

        const events = await getGoogleCalendarEvents(updatedRefreshToken);

        for (const event of events) {
          if (
            !event.start ||
            !event.start.dateTime ||
            !event.description ||
            !event.summary
          )
            continue;

          const startDateTime = parseISO(event.start.dateTime);
          const description = event.description;

          if (!isValid(startDateTime)) continue;

          const now = new Date();
          const timeDifference = differenceInMinutes(startDateTime, now); // разница во времени в минутах

          const containsSelector = title => {
            return googleCalendarIntegration.tgSelectors.some(selector =>
              title.includes(selector)
            );
          };

          if (
            Math.abs(timeDifference) <= 10 &&
            containsSelector(event.summary)
          ) {
            result.push({ text: description, chatId });
          }
        }
      }
    }

    console.log(`result`, result);
    return result;
  } catch (error) {
    return result;
  }
};

// const googleCalendarCronEventCheck = async () => {
//   const result = [];
//   try {
//     const userData = await fbaseUserDataServices.getUsersData();

//     if (userData.length <= 0) return result;

//     for (const user of userData) {
//       for (const project of user.projectsData) {
//         const googleCalendarIntegration = project.integrations.find(
//           integration => integration.name === "Google Calendar"
//         );
//         if (
//           !googleCalendarIntegration ||
//           !googleCalendarIntegration.refresh_token
//         )
//           continue;

//         const refreshToken = googleCalendarIntegration.refresh_token;

//         const updatedRefreshToken = await refreshGoogleCalendarAccessToken(
//           refreshToken
//         );

//         if (!updatedRefreshToken) continue;

//         const events = await getGoogleCalendarEvents(
//           updatedRefreshToken.access_token
//         );

//         for (const event of events) {
//           if (!event.start || !event.start.dateTime || !event.description)
//             continue;

//           const startDateTime = parseISO(event.start.dateTime);
//           const description = event.description;

//           if (!isValid(startDateTime)) continue;

//           console.log(`startTime`, startDateTime);
//           const now = new Date();
//           console.log(`now`, now);
//           const timeDifference = differenceInMinutes(startDateTime, now); // разница во времени в минутах
//           console.log(`timeDifference`, timeDifference);
//           if (Math.abs(timeDifference) <= 10) {
//             result.push({ text: description });
//           }
//         }
//       }
//     }
//     console.log(`result`, result);
//     return result;
//   } catch (error) {
//     console.error("Error:", error);
//     return result;
//   }
// };

module.exports = { googleSheetCronEventCheck, googleCalendarCronEventCheck };

googleSheetCronEventCheck();
