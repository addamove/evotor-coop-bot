/*
TODO

*/

const { Bot } = require('@dlghq/dialog-bot-sdk');
const { users, init } = require('./users');
const API = require('./API');
const { tellHowMuchGoodsLefted, changePageIterator } = require('./goodsLefted');

const bot = new Bot({
  quiet: true,
  endpoints: ['wss://ws1.coopintl.com'],
  username: 'testbot',
  password: '666'
});

bot.onMessage(async peer => {
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
            value: 'quantity',
            label: 'остатки'
          }
        }
      ]
    }
  ]);
});

bot.onInteractiveEvent(async event => {
  if (event.value === 'quantity') {
    const imes = await API.getShops();

    bot.sendInteractiveMessage(event.ref.peer, 'Выберите магазин', imes);
  }
  // goodsLeftedCount
  if (event.value.split('#')[0] === 'q_shop') {
    const storeUuid = event.value.split('#')[1];
    const goods = await API.getQuantity(storeUuid);

    if (event.value.split('#')[1] === 'prev' || event.value.split('#')[1] === 'next') {
      changePageIterator(event, goods.length);
    }
    tellHowMuchGoodsLefted(bot, event, goods);
  }
});
