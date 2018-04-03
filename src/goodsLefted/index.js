const { users } = require('../users');
const { paginate } = require('../util');

function tellHowMuchGoodsLefted(bot, event, goods) {
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

module.exports = {
  tellHowMuchGoodsLefted
};
