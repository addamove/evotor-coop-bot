const API = require('../API');
const { users } = require('../users');

const storeGoodsCount = async id => {
  let res = [];

  await API.getShops().then(async shops => {
    console.log(`${shops} shops`);
    await shops.map(async shop => {
      console.log(shop);

      const goods = await API.getGoods(shop.uuid);

      res = goods.map(item => ({
        name: item.name,
        quantity: item.quantity
      }));

      console.log(res);
    });

    users[id].reportCache = res;
    return res;
  });
};

const getChanges = id => {
  const orig = users[id].reportCache;
  const update = storeGoodsCount(id);
  const difference = [];

  orig.map((item, index) => {
    if (item.quantity < update[index].quantity && item.name === update[index].name) {
      difference.push({
        name: update[index].name,
        difference: item.quantity - update[index].quantity
      });
    }
  });

  console.log(difference);

  return difference;
};

module.exports = {
  getChanges,
  storeGoodsCount
};
