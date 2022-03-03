const userData = require('../../models/userData');
const axios = require('axios');
module.exports = {
  name: 'sync_role_discord',
  description: 'WFH Daily',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      try {
        const user = await userData
          .find({ deactive: { $ne: true } })
          .select('id -_id');
        const userids = user.map((item) => item.id);
        // console.log(userids);
        for (let userid of userids) {
          let member;
          try {
            member = await message.guild.members.fetch(userid);
          } catch (error) {
            message.channel.send(`<@!${userid}> : No Roles`);
            continue;
          }

          const roles = member.roles.cache
            .filter((roles) => roles.id !== message.guild.id)
            .map((role) => role.name);
          await userData.updateOne({ id: userid }, { roles_discord: roles });
        }
        message.channel.send(`Update Roles Success`);
      } catch (error) {
        console.log(error);
      }
    } catch (err) {
      console.log(err);
    }
  },
};
