/*
TODO

*/

const { Bot } = require('@dlghq/dialog-bot-sdk');
const { users, init } = require('./users');
const API = require('./API');
const path = require('path');

const bot = new Bot({
  quiet: true,
  endpoints: ['wss://ws1.coopintl.com'],
  username: 'testbot',
  password: '666'
});

function changePageIterator(event, goodsLength) {
  if (event.value.split('#')[1] === 'prev') {
    users[event.ref.peer.id].i -= 1;
    if (users[event.ref.peer.id].i <= 0) {
      users[event.ref.peer.id].i = 1;
    }
  } else {
    if (users[event.ref.peer.id].i >= Math.ceil(goodsLength / 10)) {
      return;
    }
    users[event.ref.peer.id].i += 1;
  }
}

function paginate(array, pageSize, pageNumber) {
  pageNumber -= 1; // because pages logically start with 1, but technically with 0
  return array.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
}

function TellHowMuchGoodsLefted(event, goods) {
  if (users[event.ref.peer.id].i === 1 && event.value.split('#')[1] !== 'prev') {
    bot.sendInteractiveMessage(
      event.ref.peer,
      `Остатки:\n${paginate(goods, 10, users[event.ref.peer.id].i).join('\n')}`,
      [
        {
          actions: [
            {
              id: 'q',
              widget: {
                type: 'button',
                value: 'q_shop#next',
                label: 'далее'
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
                value: 'q_shop#prev',
                label: 'назад'
              }
            }
          ]
        }
      ]
    );
  } else {
    bot.editInteractiveMessage(
      event.ref.peer,
      event.ref.rid,
      `Остатки:\n${paginate(goods, 10, users[event.ref.peer.id].i).join('\n')}`,
      [
        {
          actions: [
            {
              id: 'q',
              widget: {
                type: 'button',
                value: 'q_shop#next',
                label: 'далее'
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
                value: 'q_shop#prev',
                label: 'назад'
              }
            }
          ]
        }
      ]
    );
  }
}

bot.onMessage(async (peer, message) => {
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
            value: 'quantity',
            label: 'остатки'
          }
        }
      ]
    }
  ]);
});

bot.onInteractiveEvent(async event => {
  if (event.value === 'tokenHelp') {
    bot.sendImageMessage(event.ref.peer, path.join(__dirname, `./images/1_a.png`));
  }
  if (event.value === 'quantity') {
    try {
      const imes = await API.getShops(event.ref.peer.id);

      bot.sendInteractiveMessage(event.ref.peer, 'Выберите магазин', imes);
    } catch (error) {
      bot.sendTextMessage(
        event.ref.peer,
        'К сожалению ваш токен не подходит.\nПришлите свой токен.'
      );
      init(event.ref.peer.id);
    }
  }

  if (event.value.split('#')[0] === 'q_shop') {
    const storeUuid = event.value.split('#')[1];
    const goods = await API.getQuantity(storeUuid, event.ref.peer.id);

    if (event.value.split('#')[1] === 'prev' || event.value.split('#')[1] === 'next') {
      changePageIterator(event, goods.length);
    }
    TellHowMuchGoodsLefted(event, goods);
  }
});
