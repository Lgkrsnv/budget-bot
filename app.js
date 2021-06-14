const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const path = require('path');
const User = require('./models/User');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});
console.log('Budget_bot has been started...');

bot.onText(/\/start/, async (msg) => {
  const { id } = msg.chat;
  const user = await User.findOne({ chatId: id });
  if (!user) {
    await User.create({
      username: msg.chat.username, chatId: id, wallet: 0, income: [], outcome: [],
    });
  }
  bot.sendMessage(id, `Hello, ${msg.chat.first_name} ${msg.chat.last_name}!`);
});
bot.onText(/\/status/, async (msg) => {
  const { id } = msg.chat;
  let user = await User.findOne({ chatId: id });
  if (!user) {
    user = await User.create({
      username: msg.chat.username, chatId: id, wallet: 0, income: [], outcome: [],
    });
  }
  if (user.wallet > 50000) {
    bot.sendPhoto(id, './rich.jpeg', {
      caption: `
      Вы настоящий рич бич сэр!
    You have ${user.wallet} rub in your wallet now`,
    });
  } else if (user.wallet > 50000 && user.wallet > 1000) {
    bot.sendMessage(id, `You have ${user.wallet} rub in your wallet now`);
  } else {
    bot.sendPhoto(id, './uncle_scrooge.webp', {
      caption: `
      Притормозите, вы бедны как церковная мышь, сэр!
      You have ${user.wallet} rub in your wallet now`
      ,
    });
  }
});
bot.onText(/\/help/, (msg) => {
  const { id } = msg.chat;
  bot.sendMessage(id, `Введите данные о доходах/расходах в формате:\n /income<пробел>сумма(число!)<пробел> откуда деньги (тут уже можно с пробелами)
  Примеры:
  /income 500 выгулял соседских собак
  или
  /outcome 250 пицца с пепперони`);
});

bot.onText(/\/income (.+)/, async (msg, [source, match]) => {
  const { id } = msg.chat;
  const incomeArr = match.split(' ');
  const sum = incomeArr.shift();
  const forWhat = incomeArr.join(' ');
  try {
    let user = await User.findOneAndUpdate({ chatId: id }, { $push: { income: { sum, forWhat } } });
    user.wallet += Number(sum);
    await user.save();
    bot.sendMessage(id, 'данные были внесены + '  + sum + " рублей за " + forWhat);
  } catch (err) {
    bot.sendMessage(id, JSON.stringify(match, null, 4)) + ' произошла ошибка, проверьте данные';

  };

});
bot.onText(/\/outcome (.+)/, async (msg, [source, match]) => {
  const { id } = msg.chat;
  const outcomeArr = match.split(' ');
  const sum = outcomeArr.shift();
  const forWhat = outcomeArr.join(' ');
  try {
    let user = await User.findOneAndUpdate({ chatId: id }, { $push: { outcome: { sum, forWhat } } });
    user.wallet -= Number(sum);
    await user.save();
    bot.sendMessage(id, 'данные о расходах были внесены -' + sum + " рублей за " + forWhat);
  } catch (err) {
    bot.sendMessage(id, ' произошла ошибка, проверьте данные'+JSON.stringify(match, null, 4));

  };
});

module.exports = app;
