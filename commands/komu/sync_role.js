const userData = require('../../models/userData');
const axios = require('axios');
module.exports = {
  name: 'sync',
  description: 'WFH Daily',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      if (args[0] === 'role') {
        const userDb = await userData.find({ deactive: { $ne: true } });
        const emailArray = userDb.map((user) => user.email);

        for (const email of emailArray) {
          const url = encodeURI(
            `${client.config.wiki.api_url}${email}@ncc.asia`
          );
          let response;
          try {
            response = await axios.get(url, {
              headers: {
                'X-Secret-Key': client.config.wiki.api_key_secret,
              },
            });
          } catch (error) {
            continue;
          }
          if (!response || !response.data.result) {
            await userData.updateOne(
              { email, deactive: { $ne: true } },
              { roles: [] }
            );
            continue;
          }

          let roles;
          if (
            Array.isArray(response.data.result.projectDtos) &&
            response.data.result.projectDtos.length !== 0
          ) {
            roles = response.data.result.projectDtos.map(
              (project) => project.projectRole
            );
          } else {
            roles = [];
          }
          const rolesRemoveDuplicate = [...new Set(roles)];
          await userData.updateOne(
            { email, deactive: { $ne: true } },
            { roles: rolesRemoveDuplicate }
          );
        }

        return message.reply('Update role success!!!');
      }
    } catch (err) {
      console.log(err);
    }
  },
};
