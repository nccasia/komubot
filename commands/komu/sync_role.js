const userData = require('../../models/userData');
const axios = require('axios');
module.exports = {
  name: 'sync',
  description: 'WFH Daily',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      if (args[0] === 'role') {
        await updateRoleProject(client);
        return message.reply('Update role success!!!');
      }
    } catch (err) {
      console.log(err);
    }
  },
};
