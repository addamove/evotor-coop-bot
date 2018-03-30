const users = {
  //   111971177: {  },
};

function init(id) {
  users[id] = {
    i: 1
  };
}

module.exports = {
  users,
  init
};
