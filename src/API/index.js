// const token = 'ef473a0a-fbfe-4e98-a9eb-2504761e50f7';
const { users } = require('../users');
const axios = require('axios');

function getShops(id) {
  const URL = 'https://api.evotor.ru/api/v1/inventories/stores/search';
  const shopsNames = [];

  return new Promise((resolve, reject) => {
    axios
      .get(URL, users[id].auth)
      .then(r => {
        r.data.map(element => {
          if (element) {
            shopsNames.push({ name: element.name, uuid: element.uuid });
          }
        });

        const actions = shopsNames.map(e => ({
          actions: [
            {
              id: 'q',
              widget: {
                type: 'button',
                value: `q_shop#${e.uuid}`,
                label: e.name
              }
            }
          ]
        }));

        resolve(actions);
      })
      .catch(error => {
        reject(error);
        console.log(`error 3 ${error}`);
      });
  });
}

function getQuantity(storeUuid, id) {
  // const URL = 'https://evotor-f15fb.firebaseio.com/1/shops/3/inventories.json';
  const URL = `https://api.evotor.ru/api/v1/inventories/stores/${storeUuid}/products`;
  const goods = [];

  return new Promise((resolve, reject) => {
    axios
      .get(URL, users[id].auth)
      .then(r => {
        r.data.map(e => {
          if (e) {
            goods.push(`${e.name} - ${e.quantity}`);
          }
        });

        resolve(goods);
      })
      .catch(error => {
        console.log(`error 3 ${error}`);
        reject();
      });
  });
}

module.exports = {
  getQuantity,
  getShops
};
