const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const uuid = require('uuid');

const splitToChunks = (chunkSize, array) => array.reduce(
  (segments, _, index) => (index % chunkSize === 0
    ? [...segments, array.slice(index, index + chunkSize)]
    : segments),
  [],
);

const MAX_UUIDS_PER_MESSAGE = 110;
const UUID_LENGTH = 37;
const MAX_UUIDS_COUNT = 10000;

const bot = new TelegramBot(process.env.TOKEN, {
  polling: { params: { timeout: 1 } },
});

bot.on('message', (message) => {
  switch (message.text) {
    case '/start':
    case '/help':
      bot.sendMessage(message.chat.id, 'Hi there! I\'m UUID version 4 bot.\nI will generate UUIDv4 ids for you=). Send a number to generate a bunch of UUIDs, or send any message to generate one.\nType /start or /help to see this message.');
      break;
    default: {
      try {
        if (Number.isNaN(Number(message.text))) {
          bot.sendMessage(message.chat.id, uuid.v4());
        } else {
          const uuids = [...Array(Math.min(Number(message.text), MAX_UUIDS_COUNT)).keys()]
            .reduce((result) => {
              result += `${uuid.v4()}\n`; // eslint-disable-line no-param-reassign
              return result;
            }, '');
          const chunks = splitToChunks(UUID_LENGTH * MAX_UUIDS_PER_MESSAGE, uuids.split(''));
          chunks.forEach((chunk) => {
            bot.sendMessage(message.chat.id, chunk.join(''));
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
});

process.on('unhandledRejection', () => {
  console.log('unhandled Promise rejection');
});
