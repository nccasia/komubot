const wol = require('wake_on_lan');
const find = require('local-devices');
const broadcastAddress = require('broadcast-address');
const os = require('os');
var net = require('net');

function getAvailableBroadcastAddresses() {
  const interfacesNames = Object.keys(os.networkInterfaces());
  const addresses = [];
  for (const name of interfacesNames) {
    try {
      const addr = broadcastAddress(name);
      addresses.push(addr);
    } catch (e) {
      // ingnore
      console.log(e);
    }
  }
  return addresses;
}

function discoverDevice(macOrIp, ipAddress) {
  const isIp = (macOrIp || '').indexOf('.') > -1;
  if (!isIp) {
    return Promise.resolve({
      mac: macOrIp,
      ip: ipAddress,
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

function wakeDevice(macAddress, netMask, silent) {
  return new Promise((resolve, reject) => {
    wol.wake(
      macAddress,
      { address: netMask, port: 7, num_packets: 3 },
      (error) => {
        if (error && !silent) {
          return reject(new Error('Cannot send WoL packet.'));
        }
        return resolve({ macAddress, netMask });
      }
    );
  });
}

function wakeDeviceOnAvailableNetworks(macAddress) {
  const addresses = getAvailableBroadcastAddresses();

  return Promise.all(
    addresses.map((addr) => wakeDevice(macAddress, addr, true))
  );
}

function sendCMDToPfsense(branch, identity, ipAddress) {
  switch (branch) {
    case 'hn2':
      host = '10.10.40.1';
      break;
   case 'hn3':
      host = '10.10.70.1';
      break;
    case 'dn':
      host = '10.10.30.1';
      break;
    case 'sg1':
      host = '10.10.10.1';
      break;
    case 'sg2':
      host = '10.10.50.1';
      break;
    case 'vinh':
      host = '10.10.20.1';
      break;
    case 'qn':
      host = '10.10.60.1';
      break;  
    default:
      return;
  }

  try {
    var client = new net.Socket();
    client.connect(
      {
        host: host,
        port: 6996,
      },
      () => {
        // 'connect' listener
        console.log('connected to server!', ipAddress, identity);
        client.write(`${ipAddress} ${identity}`);
      }
    );

    client.on('data', (data) => {
      console.log(data.toString());
      client.end();
    });
  } catch (err) {
    console.log(err);
  }
}

function handleWoL(message, args) {
  const identity = args[0];
  const ipAddress = args[1];
  const branch = args[2];
  sendCMDToPfsense(branch, identity, ipAddress);
  return discoverDevice(identity, ipAddress)
    .then((device) => {
      if (!device || !device.mac) {
        console.log(device);
        throw new Error('error while discovering device.');
      }
      return device;
    })
    .then((device) => {
      if (device.ip) {
        return wakeDevice(device.mac, device.ip);
      }
      return wakeDeviceOnAvailableNetworks(device.mac);
    })
    .then((res) => {
      if (!res.macAddress && !res.length) {
        throw new Error('no WoL packet sent!');
      }
      return message.reply('Done, WoL packet sent!');
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
  usages: ['wol <mac> [ip]'],
  cat: 'utilities',
  async execute(message, args) {
    try {
      if (args[0] === 'help') {
        return message.reply(
          'Using WoL to turn on an pc on LAN using mac address.\n*wol <your mac> [your ip]\n*tips: you can you *keep command to save your mac and ip'
        );
      }
      return handleWoL(message, args);
    } catch (err) {
      console.log(err);
    }
  },
};
