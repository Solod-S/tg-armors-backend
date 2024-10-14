const moment = require("moment");
const { format, addHours } = require("date-fns");

const checkCurrentDateIsAfterLastPost = date => {
  // const lastPublicationDate = moment.utc(date).startOf("day"); // Привести дату к началу дня в UTC
  // const currentDate = moment().startOf("day"); // Привести текущую дату к началу дня в локальной временной зоне
  // return currentDate.isAfter(lastPublicationDate);
  return moment(date).isBefore(moment(), "day");
};

const checkTimeToGenerateArticle = inputTime => {
  // Get the current time
  const currentTime = new Date();
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  // Split the time string into hours and minutes
  const [hours, minutes] = inputTime.split(":").map(Number);

  if (
    currentHours > hours ||
    (currentHours === hours && currentMinutes >= minutes)
  ) {
    console.log(`сейчас время`, currentHours);
    console.log(`в базе время`, hours);
    console.log(
      `оно посчитало что сейчас больше или равно времени 1`,
      currentHours > hours
    );
    console.log(
      `оно посчитало что сейчас больше или равно времени 2`,
      currentHours === hours && currentMinutes >= minutes
    );
    return true;
  } else {
    return false;
  }
};

// checkTimeToGenerateArticle("07:00")

const checkStartDateToGenerateArticle = inputDate => {
  const startDateIsOk = moment().isSameOrAfter(moment(inputDate), "day");

  if (startDateIsOk) {
    return true;
  } else {
    return false;
  }
};

const checkEndTypeToGenerateArticle = (
  repeatEndType,
  repeatEndValue,
  currentContentLenght
) => {
  switch (true) {
    case repeatEndType === "date":
      const endDateHasPassed = moment().isAfter(moment(repeatEndValue), "day");

      if (endDateHasPassed) {
        return false;
      } else {
        return true;
      }

    // case repeatEndType === "attempts":
    //   if (repeatEndValue > currentContentLenght) {
    //     return true;
    //   } else {
    //     return false;
    //   }

    default:
      return true;
  }
};

const checkMonthlyPublicationDateHasArrived = (
  startDate,
  monthlyIntervalLastDay
) => {
  const today = moment();
  const currentDayOfMonth = today.date();
  const lastDayOfMonth = today.endOf("month").date();
  const lastSundayOfMonth = today.endOf("month").day("Sunday").date();
  const dayOfMonthToGenerate = moment(startDate).date();

  if (
    monthlyIntervalLastDay === "lastDay" &&
    lastDayOfMonth === currentDayOfMonth
  ) {
    return true;
  }

  if (
    monthlyIntervalLastDay === "lastSunday" &&
    lastSundayOfMonth === currentDayOfMonth
    // && moment(startDate).isSame(lastSundayOfMonth, "day") // Check if the specified date is the last Sunday of the month
  ) {
    return true;
  }

  if (
    monthlyIntervalLastDay === "disable" &&
    dayOfMonthToGenerate === currentDayOfMonth
  ) {
    return true;
  }

  return false;
};

module.exports = {
  checkCurrentDateIsAfterLastPost,
  checkTimeToGenerateArticle,
  checkStartDateToGenerateArticle,
  checkEndTypeToGenerateArticle,
  checkMonthlyPublicationDateHasArrived,
};
