const moment = require("moment");

const checkCurrentDateIsAfterLastPost = async date => {
  const lastPublicationDate = moment(date);
  const currentDate = moment();
  if (currentDate.isAfter(lastPublicationDate, "day")) {
    return true;
  }
  return false;
};

const checkTimeToGenerateArticle = async inputTime => {
  // Split the time string into hours and minutes
  const [hours, minutes] = inputTime.split(":").map(Number);

  // Get the current time
  const currentTime = new Date();
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  if (
    currentHours > hours ||
    (currentHours === hours && currentMinutes >= minutes)
  ) {
    return true;
  } else {
    return false;
  }
};

const checkStartDateToGenerateArticle = async inputDate => {
  const startDateIsOk = moment().isSameOrAfter(moment(inputDate), "day");

  if (startDateIsOk) {
    return true;
  } else {
    return false;
  }
};

function checkEndTypeToGenerateArticle(
  repeatEndType,
  repeatEndValue,
  currentContentLenght
) {
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
}

module.exports = {
  checkCurrentDateIsAfterLastPost,
  checkTimeToGenerateArticle,
  checkStartDateToGenerateArticle,
  checkEndTypeToGenerateArticle,
};
