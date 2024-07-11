const { greetings, farewells } = require("../constant/messages");

function escapeMarkdown(text) {
  return text.replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");
}

function getRandomGreeting() {
  return greetings[Math.floor(Math.random() * greetings.length)];
}

function getRandomFarewell() {
  return farewells[Math.floor(Math.random() * farewells.length)];
}

function finalFormatText(text) {
  return text
    .replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1") // Экранирование специальных символов для Markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\\&lt;/g, "")
    .replace(/u\\&gt;/g, "")
    .replace(/\\&lt;/g, "")
    .replace(/\\&lt;/g, "");
}

function formatText(text) {
  // Убираем лишние пробелы и заменяем спецсимволы HTML
  return text
    .replace(/<br>\s*/g, "\n") // Замена <br> на символ новой строки, учитывая возможные пробелы
    .replace(/&nbsp;/g, " ") // Замена неразрывного пробела на обычный пробел
    .replace(/&gt;/g, ">") // Замена &gt; на >
    .replace(/&lt;/g, "<") // Замена &lt; на <
    .replace(/<\/?a[^>]*>/g, "") // Удаление тегов <a> и </a> полностью
    .trim(); // Удаление лишних пробелов в начале и конце строки
}

module.exports = {
  escapeMarkdown,
  getRandomGreeting,
  getRandomFarewell,
  finalFormatText,
  formatText,
};
