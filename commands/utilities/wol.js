const wol = require('wake_on_lan');
const find = require('local-devices');

function discoverDevice(macOrIp) {
  const isIp = (macOrIp || '').indexOf('.') > -1;
  if (!isIp) {
    return Promise.resolve({
      mac: macOrIp,
    });
  }
  return find(macOrIp).catch(() => {
    return discoverDeviceFallback(macOrIp);
  });
}

function discoverDeviceFallback(ip) {
  return find(null).then((devices) => {
    return devices.find((dev) => {
      return dev.ip == ip;
    });
  });
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
      return message.reply(`Failed, ${err.message}`);
    });
}

module.exports = {
  name: 'wol',
  description: 'Turn on an pc on LAN (WoL)',
  aliases: ['pcon'],
  usages: ['wol <mac|ip>', 'wol <mac|ip>', 'pcon <mac|ip>', 'pcon <mac|ip>'],
  cat: 'utilities',
  async execute(message, args) {
    try {
      if (args[0] === 'debug') {
        return find(null).then((res) => {
          message.reply(JSON.stringify(res));
        });
      }
      return handleWoL(message, args);
    } catch (err) {
      console.log(err);
    }
  },
};