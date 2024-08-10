const { scheduleCronJobs } = require("./cronJobs");
const { setBotCommands } = require("./botCommands");
const fbaseUserDataServices = require("./fbase/fbaseUserDataServices");

scheduleCronJobs();
setBotCommands();

async function someFunction() {
  const result = await fbaseUserDataServices.getFireBaseScheduling();
  console.log("Результат внутри someFunction:", result);
}

someFunction();
