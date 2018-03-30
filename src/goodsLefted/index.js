const { users } = require('../users');

function changePageIterator(event, goodsLength) {
  const MAX_BY_PAGE = 10;

  if (event.value.split('#')[1] === 'prev') {
    users[event.ref.peer.id].i -= 1;
    if (users[event.ref.peer.id].i <= 0) {
      users[event.ref.peer.id].i = 1;
    }
  } else {
    // if user wants next page

    if (users[event.ref.peer.id].i >= Math.ceil(goodsLength / MAX_BY_PAGE)) {
      return;
    }

    users[event.ref.peer.id].i += 1;
  }
}

function paginate(array, pageSize, pageNumber) {
  pageNumber -= 1; // because pages logically start with 1, but technically with 0
  return array.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
}

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
  tellHowMuchGoodsLefted,
  changePageIterator
};
