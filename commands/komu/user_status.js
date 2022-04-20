const userData = require('../../models/userData');
const axios = require('axios');
const { sendErrorToDevTest } = require('../../util/komubotrest');

module.exports = {
  name: 'userstatus',
  description: 'user status',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      let authorId = message.author.id;
      if (args[0] === 'help' || !args[0]) {
        return message.channel.send(
          '```' +
            'Command: *userstatus username' +
            '\n' +
            'Example: *userstatus a.nguyenvan' +
            '```'
        );
      }

      let email = args[0];
      const user = await userData.findOne({
        $or: [{ email }, { username: email }],
      });

      if (!user)
        return message.reply(`Wrong Email!`).catch((err) => {
          sendErrorToDevTest(client, authorId, err);
        });
      const getUserStatus = await axios.get(
        `${client.config.user_status.api_url_userstatus}?emailAddress=${email}@ncc.asia`
      );
      if (!getUserStatus.data) return;

      let mess;

      if (!getUserStatus.data.result) {
        mess = 'Work At Office';
      } else {
        mess = getUserStatus.data.result.message;
      }

      return message.reply(mess).catch((err) => {
        sendErrorToDevTest(client, authorId, err);
      });
    } catch (e) {
      console.log(e);
    }
  },
};
