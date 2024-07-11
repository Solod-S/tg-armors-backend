const { scheduleCronJobs } = require("./cronJobs");
const { setBotCommands } = require("./botCommands");

scheduleCronJobs();
setBotCommands();
