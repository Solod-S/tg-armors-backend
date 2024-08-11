const { scheduleCronJobs } = require("./cronJobs");
const { setBotCommands } = require("./botCommands");
const { firebaseSchedyleEventCheck } = require("./utils/cronOperations");

scheduleCronJobs();
setBotCommands();

// async function someFunction() {
//   const result = await firebaseSchedyleEventCheck();
//   console.log("Результат внутри someFunction:", result);
// }

// someFunction();
