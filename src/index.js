/*
TODO

*/

const { Bot } = require('@dlghq/dialog-bot-sdk');
const path = require('path');
const config = require('./config');

const bot = new Bot(config.bot);

const state = {};

const users = {};

bot.onMessage(async (peer, message) => {
  console.log(object);
});

bot.onInteractiveEvent(async (event) => {});
