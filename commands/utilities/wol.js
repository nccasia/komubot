const wol = require('wake_on_lan');
const find = require('local-devices');

function discoverDevice(macOrIp) {
  const isMac = (macOrIp || '').indexOf(':') > -1;
  if (isMac) {
    return Promise.resolve({
      mac: macOrIp
    });
  }
  return find(macOrIp);
}

function wakeDevice(macAddress) {
  return new Promise((resolve, reject) => {
    wol.wake(macAddress, (error) => {
      if (error) {
        return reject(new Error('Cannot send WoL packet.'));
      }
      return resolve(macAddress);
    });
  });
}

function handleWoL(message, args) {
  const identity = args[0];
  return discoverDevice(identity)
    .then((device) => {
      if (!device || !device.mac) {
        console.log(device);
        throw new Error('error while discovering device.');
      }
      return wakeDevice(device.mac);
    })
    .then(() => {
      return message.reply('WoL packet sent!');
    })
    .catch((err) => {
      console.error(err);
      return message.reply(`Sorry, I can not reach you pc (${err.message})`);
    });
}

module.exports = {
  name: 'wol',
  description: 'Turn on an pc on LAN (WoL)',
  aliases: ['pcon'],
  usages: [
    'wol <mac_address> [office]',
    'wol <mac_address>',
    'pcon <mac_address> [office]',
    'pcon <mac_address>',
  ],
  cat: 'utilities',
  async execute(message, args) {
    try {
      return handleWoL(message, args);
    } catch (err) {
      console.log(err);
    }
  },
};
