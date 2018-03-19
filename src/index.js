/*
TODO

*/

const { Bot } = require('@dlghq/dialog-bot-sdk');

const bot = new Bot({
  quiet: true,
  endpoints: ['wss://ws1.coopintl.com'],
  username: 'testbot',
  password: '666',
});

const adminGroup = {
  type: 'group',
  id: 765453992,
  key: 'g765453992',
};

const groupIDs = [24538850, 1669311672];

function isGroupValid(id) {
  const res = groupIDs.find(e => id === e);
  if (res) {
    return res;
  }
  return false;
}

bot.onMessage(async (peer, message) => {
  if (isGroupValid(peer.id) && message.content.text.split(' ')[0] === '@testbot') {
    try {
      const messenger = await bot.ready;

      const groupInfo = await messenger.getGroup(peer.id);
      await bot.sendTextMessage(adminGroup, `*${groupInfo.name}*`, {
        peer,
        type: 'forward',
        rids: [message.rid],
      });
    } catch (error) {
      bot.sendTextMessage(peer, 'Что-то пошло не так.');
    }
  }
});
