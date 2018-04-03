/*
TODO

*/

const { Bot } = require('@dlghq/dialog-bot-sdk');
const { users, init } = require('./users');
const API = require('./API');
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

bot.onMessage(async peer => {
  if (peer.type !== 'user') {
    return;
  }

  if (!users[peer.id]) {
    init(peer.id);
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
  if (event.value === 'goodsLeft') {
    const imes = await API.getShopsActions();
    users[event.ref.peer.id].action = 'goodsLeft';
    bot.sendInteractiveMessage(event.ref.peer, 'Выберите магазин', imes);
  }

  // goodsLeftedCount
  if (
    event.value.split('#')[0] === 'shop' &&
    users[event.ref.peer.id].action === 'goodsLeft'
  ) {
    const storeUuid = event.value.split('#')[1];
    const goods = await API.getQuantity(storeUuid);

    if (event.value.split('#')[1] === 'prev' || event.value.split('#')[1] === 'next') {
      changePageIterator(event, goods.length);
    }
    tellHowMuchGoodsLefted(bot, event, goods);
  }

  // 24hourReport
  if (event.value === 'report') {
    if (!_.has(users[event.ref.peer.id], 'reportCache')) {
      bot.sendTextMessage(
        event.ref.peer,
        'Занесли вас в базу данных, результат будет через 24 часа. Попробуйте еще раз завтра.'
      );

      report.storeGoodsCount(event.ref.peer.id);
    } else {
      await bot.sendTextMessage(event.ref.peer, "Формируем ваш отчет.")
      const rep = await report.getChanges(event.ref.peer.id);
      await bot.sendTextMessage(event.ref.peer, rep);
    }
  }
});
