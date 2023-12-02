![Version](https://img.shields.io/badge/Version-1.0-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![runs with nodedotjs](https://img.shields.io/badge/Runs%20with%20NodeJs-000.svg?style=flat-square&logo=nodedotjs&labelColor=f3f3f3&logoColor=#339933)](https://nodejs.org/ru)
[![runs with pm2](https://img.shields.io/badge/Runs%20with%20PM2-000.svg?style=flat-square&logo=pm2&labelColor=f3f3f3&logoColor=2B037A)](https://www.npmjs.com/package/pm2)
[![runs with node-telegram-bot-api](https://img.shields.io/badge/Runs%20with%20Node_Telegram_Bot_Api-000.svg?style=flat-square&logo=telegram&labelColor=f3f3f3&logoColor=#26A5E4)](https://www.npmjs.com/package/node-telegram-bot-api)
[![runs with google-spreadsheet](https://img.shields.io/badge/Runs%20with%20Google_Spreadsheet-000.svg?style=flat-square&logo=googlesheets&labelColor=f3f3f3&logoColor=#34A853)](https://www.npmjs.com/package/google-spreadsheet)
[![runs with dotenv](https://img.shields.io/badge/Runs%20with%20dotenv-000.svg?style=flat-square&logo=dotenv&labelColor=f3f3f3&logoColor=#ECD53FE4)](https://www.npmjs.com/package/dotenv)
[![runs with date-fns](https://img.shields.io/badge/Runs%20with%20Date_fns-000.svg?style=flat-square&logo=clockify&labelColor=f3f3f3&logoColor=#770C56)](https://www.npmjs.com/package/date-fns)

# Megabite Telegram Bot

**_Built using NodeJS, Node Telegram Bot Api, Google Spreadsheet, P(rocess) M(anager) 2, Dotenv, Date-fns_**.

![MegaBot Demo](/img//1-min.jpg)

## Project Description

The project is a telegram bot that provides users with convenient access to information about the online store, product range, promotions, promotional codes and feedback. The bot is built to facilitate the user experience, provide important information, and provide direct communication with customers. The bot can respond to user commands and questions, provide links, respond to queries, and help navigate information.

## The main functions of the bot:

![MegaBot Demo](/img//3-min.jpg)

### 1. Web application:

The bot provides access to the React web application, where users can get acquainted with the rich assortment of the online store in detail. Here they have the opportunity not only to search for products, view descriptions and characteristics, but also to find useful information, such as:

- contact details: Users can easily find ways to contact the store, including email, phone number, and store address. This provides a direct communication channel for questions and requests.
- return policy: Important information about the return and exchange policy, which allows buyers to be sure that their interests are protected when buying.
- shipping information: A detailed description of shipping methods, times and costs so that customers can evaluate the options available.
- information about current promotions: Important information about current promotions.
- feedback form: Direct communication with the store.

### 2. Feedback form inside the bot:

Users can use a special form provided by the bot to submit a request or feedback. This provides a direct line of communication between customers and the store.

### 3. Promotions and promo codes inside the bot:

The bot provides information about current promotions, discounts and available promo codes. Users can be aware of special offers and save on purchases.

### 4. Important information inside the bot:

The bot provides useful information about the store, such as contact details, address, opening hours, and other details.

### Advantages:

Improved user experience and customer service.
Direct access to the assortment and promotions of the store.
Possibility of quick feedback and support.
Simple interaction with the bot through natural language.
The "Telegram Bot for Online Store" project was created to provide convenient and effective ways of interaction between the store and its customers, as well as to provide quick access to information about the store's products and offers.

## Technologies Used

- Node.js: The project is built on the Node.js runtime environment, allowing for server-side JavaScript execution and facilitating asynchronous event-driven programming.
- PM2: PM2 is used as a process manager for Node.js applications. It ensures application stability by handling process management, monitoring, and automatic restarts.
- Node-telegram-bot-api: This library provides a straightforward interface for interacting with the Telegram Bot API. It enables the bot to send and receive messages, respond to commands, and manage user interactions within the Telegram platform.
- Date-fns: The date-fns library is employed for handling date and time manipulation tasks. It simplifies parsing, formatting, and calculating dates in a user-friendly manner.
- Dotenv: Dotenv is used for managing environment variables within the project. It helps in securely storing configuration information and sensitive data.
- Google-spreadsheet: The google-spreadsheet library enables integration with Google Sheets. It allows the bot to fetch and update data stored in Google Sheets, facilitating dynamic content management.
- Morgan: Morgan is a logging middleware used to generate detailed request logs. It helps in monitoring and debugging the bot's HTTP requests and responses.
- Shortid: The shortid library generates short and unique IDs, which can be useful for creating identifiers for various data entries or interactions.

## The Tech Stack:

![MegaBot Demo](/img//2-min.jpg)

    node-js
    pm2
    node-telegram-bot-api
    date-fns
    google-spreadsheet
    morgan
    shortid

## How to install

### Using Git (recommended)

1.  Clone the project from github. Change "myproject" to your project name.

```bash
git clone https://github.com/Solod-S/tg-web-app-react-megabite-backend.git ./myproject
```

### Using manual download ZIP

1.  Download repository
2.  Uncompress to your desired directory

### Replace values with yours in .env!! Exemple of `.env` file.

```env
PORT = YOUR_PORT;
TOKEN = BOT_TOKEN;
WEB_APP_URL = LINK_TO_PWA;
```

### Copy to main directory google sheets api credentials json file. Exemple of `.json` file.

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

### Install npm dependencies after installing (Git or manual download)

```bash
cd myproject
npm install
```

## Future Plans

- improve google spreadsheet functions

## Contributing

Contributions are welcome! If you have any suggestions or improvements, please
create a pull request. For major changes, please open an issue first to discuss
the changes.

**_NOTE: PLEASE LET ME KNOW IF YOU DISCOVERED ANY BUG OR YOU HAVE ANY
SUGGESTIONS_**

<!-- https://www.npmjs.com/package/react-image-gallery -->
