const API = require('../API');
const { users } = require('../users');
const { paginate } = require('../util');

const storeGoodsCount = id =>
  new Promise((resolved, rejected) => {
    API.getShops(id)
      .then(
        async shops =>
          new Promise(async (resolve, reject) => {
            console.log(shops.length);
            if (shops.length === 0) {
              rejected(shops.length);
            }

            await shops.map(async shop => {
              try {
                const goods = await API.getGoods(shop.uuid);

                let res = [];
                res = goods.map(item => ({
                  name: item.name,
                  quantity: item.quantity
                }));

                resolve(res);
              } catch (error) {
                console.log(error);
                reject(error);
              }
            });
          })
      )
      .then(r => {
        users[id].reportCache = r;
        console.log(`${r[0].quantity} res`);
        resolved(r);
      });
  });

const getChanges = async id => {
  const orig = users[id].reportCache;
  const updated = await storeGoodsCount(id);
  const difference = [];

  orig.map((item, index) => {
    if (item.quantity > updated[index].quantity && item.name === updated[index].name) {
      difference.push({
        name: updated[index].name,
        difference: item.quantity - updated[index].quantity
      });
    }
  });

  if (difference.length === 0) {
    return 'Продаж не было.';
  }
  const res = paginate(
    difference.map(item => `Продано ${item.name} ${item.difference}шт`),
    10,
    1
  ).join('\n');

  return res;
};

module.exports = {
  getChanges,
  storeGoodsCount
};
