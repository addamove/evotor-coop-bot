/*
TODO

*/

const { Bot } = require('@dlghq/dialog-bot-sdk');

const bot = new Bot({
  quiet: true,
  endpoints: ['wss://ws1.dlg.im'],
  username: 'mention_bot',
  password: 'eTy)xnyMX93:CGpjEV-Wsi!V',
});

const adminGroup = {
  type: 'group',
  id: 162263878,
  key: 'g162263878',
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
