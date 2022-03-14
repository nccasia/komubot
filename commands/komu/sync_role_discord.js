const userData = require('../../models/userData');
const axios = require('axios');
const { updateRoleDiscord } = require('../../util/roles');
module.exports = {
  name: 'sync_role_discord',
  description: 'WFH Daily',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      await updateRoleDiscord(client);
      message.channel.send(`Update Roles Success`);
    } catch (err) {
      console.log(err);
    }
  },
};
