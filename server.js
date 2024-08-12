const { scheduleCronJobs } = require("./cronJobs");
const { setBotCommands } = require("./botCommands");
const { firebaseSchedyleEventCheck } = require("./utils/cronOperations");
const fbaseUserDataServices = require("./fbase/fbaseUserDataServices");

scheduleCronJobs();
setBotCommands();

// async function someFunction() {
//   const result = await firebaseSchedyleEventCheck();
//   console.log("Результат внутри someFunction:", result.length);

//   if (result.length > 0) await fbaseUserDataServices.addSchedulePost(result[0]);
// }

// someFunction();
