const users = {
  //   111971177: {  },
};

function init(id) {
  users[id] = {
    i: 1,
    auth: ''
  };
}

module.exports = {
  users,
  init
};
