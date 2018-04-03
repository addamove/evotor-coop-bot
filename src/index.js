/*
TODO

*/

const { Bot } = require('@dlghq/dialog-bot-sdk');
const { users, init } = require('./users');
const API = require('./API');
const path = require('path');
const report = require('./report');
const { tellHowMuchGoodsLefted } = require('./goodsLefted');
const { changePageIterator } = require('./util');
const _ = require('lodash/core');

const bot = new Bot({
  quiet: true,
  endpoints: ['wss://ws1.coopintl.com'],
  username: 'testbot',
  password: '666'
});

bot.onMessage(async (peer, message) => {
  if (peer.type !== 'user') {
    return;
  }

  if (!users[peer.id]) {
    init(peer.id);
    bot.sendTextMessage(peer, 'Пришлите свой токен.');
    bot.sendInteractiveMessage(peer, 'Я не знаю что такое токен.', [
      {
        actions: [
          {
            id: 'q',
            widget: {
              type: 'button',
              value: 'tokenHelp',
              label: 'помощь'
            }
          }
        ]
      }
    ]);
    return;
  } else if (users[peer.id].auth === '') {
    users[peer.id].auth = {
      headers: { 'X-Authorization': message.content.text }
    };
    bot.sendTextMessage(peer, 'Записали!');
  }

  bot.sendTextMessage(
    peer,
    'Меня зовут EvoRobot и я предназначен для удобного информирования тебя о данных по продажам.'
  );
  bot.sendInteractiveMessage(peer, 'Вот что я умею', [
    {
      actions: [
        {
          id: 'q',
          widget: {
            type: 'button',
            value: 'report',
            label: 'отчет'
          }
        }
      ]
    },
    {
      actions: [
        {
          id: 'q',
          widget: {
            type: 'button',
            value: 'goodsLeft',
            label: 'остатки'
          }
        }
      ]
    }
  ]);
});

bot.onInteractiveEvent(async event => {
  if (event.value === 'tokenHelp') {
    bot.sendImageMessage(event.ref.peer, path.join(__dirname, `./images/1.png`));
    bot.sendImageMessage(event.ref.peer, path.join(__dirname, `./images/2.png`));
  }

  if (event.value === 'goodsLeft') {
    const imes = await API.getShopsActions(event.ref.peer.id);
    users[event.ref.peer.id].action = 'goodsLeft';
    if (imes === []) {
      bot.sendTextMessage(event.ref.peer, 'У вас нету зарегестрированных магазинов.');
      return;
    }
    bot.sendInteractiveMessage(event.ref.peer, 'Выберите магазин', imes);
  }

  // goodsLeftedCount
  if (
    event.value.split('#')[0] === 'shop' &&
    users[event.ref.peer.id].action === 'goodsLeft'
  ) {
    const storeUuid = event.value.split('#')[1];
    const goods = await API.getQuantity(storeUuid, event.ref.peer.id);

    if (event.value.split('#')[1] === 'prev' || event.value.split('#')[1] === 'next') {
      changePageIterator(event, goods.length);
    }
    tellHowMuchGoodsLefted(bot, event, goods);
  }

  // 24hourReport
  if (event.value === 'report') {
    if (!_.has(users[event.ref.peer.id], 'reportCache')) {
      try {
        await report.storeGoodsCount(event.ref.peer.id);

        bot.sendTextMessage(
          event.ref.peer,
          'Занесли вас в базу данных, результат будет через 24 часа. Попробуйте еще раз завтра.'
        );
      } catch (error) {
        if (error === 0) {
          bot.sendTextMessage(event.ref.peer, 'Ошибка! У вас нету зарегестрированных магазинов.');

        } else {
          bot.sendTextMessage(event.ref.peer, 'Неизвестная ошибка!');

        }
      }
    } else {
      await bot.sendTextMessage(event.ref.peer, 'Формируем ваш отчет.');
      const rep = await report.getChanges(event.ref.peer.id);
      await bot.sendTextMessage(event.ref.peer, rep);
    }
  }
});
