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
            `${client.config.role.api_url_getRole}?email=${email}@ncc.asia`
          );
          let response;
          try {
            response = await axios.get(url, {
              headers: {
                'X-Secret-Key': client.config.role.x_secret_key,
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
