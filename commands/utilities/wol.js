const wol = require('wake_on_lan');

function handleWoL(instructions, message, args) {
  const instructions = args.join(' ');
  const macAddress = instructions[1];
  wol.wake(macAddress, function (error) {
    if (error) {
      message.reply('Sorry, I can not reach you pc :(');
    } else {
      message.reply('Yay, your pc now on : )');
    }
  });
}

module.exports = {
  name: 'wakepc',
  description: 'Turn on an pc on LAN (WoL)',
  aliases: ['pcon', 'wol'],
  usages: [
    'wol <mac_address> [office]',
    'wol <mac_address>',
    'wakepc <mac_address> [office]',
    'wakepc <mac_address>',
  ],
  cat: 'utilities',
  async execute(message, args) {
    try {
      const instructions = args.join(' ');
      return handleWoL(instructions, message, args);
    } catch (err) {
      console.log(err);
    }
  },
};
