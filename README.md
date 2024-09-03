![Version](https://img.shields.io/badge/Version-1.0-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![runs with nodedotjs](https://img.shields.io/badge/Runs%20with%20NodeJs-000.svg?style=flat-square&logo=nodedotjs&labelColor=f3f3f3&logoColor=#339933)](https://nodejs.org/ru)
[![runs with pm2](https://img.shields.io/badge/Runs%20with%20PM2-000.svg?style=flat-square&logo=pm2&labelColor=f3f3f3&logoColor=2B037A)](https://www.npmjs.com/package/pm2)
[![runs with node-telegram-bot-api](https://img.shields.io/badge/Runs%20with%20Node_Telegram_Bot_Api-000.svg?style=flat-square&logo=telegram&labelColor=f3f3f3&logoColor=#26A5E4)](https://www.npmjs.com/package/node-telegram-bot-api)
[![runs with google-spreadsheet](https://img.shields.io/badge/Runs%20with%20Google_Spreadsheet-000.svg?style=flat-square&logo=googlesheets&labelColor=f3f3f3&logoColor=#34A853)](https://www.npmjs.com/package/google-spreadsheet)
[![runs with google-calendar](https://img.shields.io/badge/Runs%20with%20Google_Calendar-000.svg?style=flat-square&logo=googlecalendar&labelColor=f3f3f3&logoColor=#34A853)](https://www.npmjs.com/package/google-spreadsheet)
[![runs with firebase](https://img.shields.io/badge/Runs%20with%20Firebase-000.svg?style=firebase&logo=firebase&labelColor=f3f3f3&logoColor=EB844E)](https://www.npmjs.com/package/date-fns)
[![runs with dotenv](https://img.shields.io/badge/Runs%20with%20dotenv-000.svg?style=flat-square&logo=dotenv&labelColor=f3f3f3&logoColor=#ECD53FE4)](https://www.npmjs.com/package/dotenv)
[![runs with date-fns](https://img.shields.io/badge/Runs%20with%20Date_fns-000.svg?style=flat-square&logo=clockify&labelColor=f3f3f3&logoColor=#770C56)](https://www.npmjs.com/package/date-fns)

# Armorstandart Telegram Bot

**_Built using NodeJS, Firebase, Node Telegram Bot Api, Google Spreadsheet, GoogleAPIs, P(rocess) M(anager) 2, Dotenv, Date-fns_**.

![MegaBot Demo](/img//1-min.jpg)

## Project Description

The project is a telegram bot that provides users with convenient access to information about the online store, product range and faqes. The bot is built to facilitate the user experience, provide important information, and provide direct communication with customers. The bot can respond to user commands and questions, provide links, respond to queries, and help navigate information. Additionally, the bot is capable of scheduling messages in chats, pulling content for these messages from various sources.

## The main functions of the bot:

![MegaBot Demo](/img//3-min.jpg)

### Important information inside the bot:

The bot provides valuable information about the store, such as contact details, address, opening hours, and other relevant details. Additionally, the bot is capable of scheduling messages in chats, pulling content for these messages from various sources, including:

- Google Sheets
- Firebase
- Google Calendar

### Advantages:

Improved user experience and customer service.
Direct access to FAQs.
Simple interaction with the bot through natural language.
Automated message scheduling and delivery, enhancing communication and engagement with customers.

## Technologies Used

- Node.js: The project is built on the Node.js runtime environment, allowing for server-side JavaScript execution and facilitating asynchronous event-driven programming.
- PM2: PM2 is used as a process manager for Node.js applications. It ensures application stability by handling process management, monitoring, and automatic restarts.
- Node-telegram-bot-api: This library provides a straightforward interface for interacting with the Telegram Bot API. It enables the bot to send and receive messages, respond to commands, and manage user interactions within the Telegram platform.
- Firebase: Firebase is used for storing and retrieving data, particularly for managing content scheduling and storing user interactions. It provides real-time database capabilities and cloud storage solutions, allowing the bot to efficiently determine when and where to post content.
- Google APIs: Google APIs are used to integrate with services like Google Calendar and Google Sheets. This enables the bot to retrieve scheduling information and content details to automate posting at the right time and place.
- Google-spreadsheet: The google-spreadsheet library enables integration with Google Sheets. It allows the bot to fetch and update data stored in Google Sheets, facilitating dynamic content management.
- Date-fns: The date-fns library is employed for handling date and time manipulation tasks. It simplifies parsing, formatting, and calculating dates in a user-friendly manner.
- Dotenv: Dotenv is used for managing environment variables within the project. It helps in securely storing configuration information and sensitive data.
- Morgan: Morgan is a logging middleware used to generate detailed request logs. It helps in monitoring and debugging the bot's HTTP requests and responses.
- Shortid: The shortid library generates short and unique IDs, which can be useful for creating identifiers for various data entries or interactions.

## The Tech Stack:

![MegaBot Demo](/img//2-min.jpg)

    node-js
    pm2
    node-telegram-bot-api
    date-fns
    firebase-admin
    google-spreadsheet
    googleapis
    morgan
    shortid

## How to install

### Using Git (recommended)

1.  Clone the project from github. Change "myproject" to your project name.

```bash
git clone https://github.com/Solod-S/tg-armors-backend.git ./myproject
```

### Using manual download ZIP

1.  Download repository
2.  Uncompress to your desired directory

### Replace values with yours in .env!! Exemple of `.env` file.

```env
BOT_TOKEN = BOT_TOKEN;

GOOGLE_CALENDAR_CLIENT_ID = YOUR_GOOGLE_CALENDAR_CLIENT_ID
GOOGLE_CALENDAR_CLIENT_SECRET = YOUR_GOOGLE_CALENDAR_CLIENT_SECRET
```

### Copy to main directory google sheets api credentials json file. Exemple of `googleSheetsApiCredentials.json` file.

```json
{
  "type": "service_account",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "",
  "client_x509_cert_url": "",
  "universe_domain": "googleapis.com"
}
```

### Copy to main directory firebase admin credentials json file. Exemple of `firebase-admin-sdk.json` file.

```json
{
  "type": "service_account",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "",
  "universe_domain": "googleapis.com"
}
```

### Install npm dependencies after installing (Git or manual download)

```bash
cd myproject
npm install
```

## Contributing

Contributions are welcome! If you have any suggestions or improvements, please
create a pull request. For major changes, please open an issue first to discuss
the changes.

**_NOTE: PLEASE LET ME KNOW IF YOU DISCOVERED ANY BUG OR YOU HAVE ANY
SUGGESTIONS_**
