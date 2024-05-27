const {
    greetings,
    farewells,
  } = require("../constant/messages");

function escapeMarkdown(text) {
    return text.replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1');
  }

  function getRandomGreeting() {
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  function getRandomFarewell() {
    return farewells[Math.floor(Math.random() * farewells.length)];
  }

module.exports = { escapeMarkdown, getRandomGreeting, getRandomFarewell  };
