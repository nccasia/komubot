const userData = require('../../models/userData');
const { sendErrorToDevTest } = require('../../util/komubotrest');

module.exports = {
  name: 'toggleactivation',
  description: 'Toggle Activation',
  cat: 'komu',
  async execute(message, args) {
    try {
      let authorId = message.author.id;
      const checkMention = message.mentions.members.first();
      const findUserId = await userData.find({
        id: checkMention.user.id,
      });
      findUserId.map(async (item) => {
        if (item.deactive !== true) {
          const disableUser = await userData.updateOne(
            {
              id: item.id,
            },
            {
              deactive: true,
            }
          );
          message
            .reply({
              content: 'Disable account successfully',
              ephemeral: true,
            })
            .catch((err) => {
              const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
              sendErrorToDevTest(client, msg);
            });
        } else {
          const enableUser = await userData.updateOne(
            {
              id: item.id,
            },
            {
              deactive: false,
            }
          );
          message
            .reply({
              content: 'Enable account successfully',
              ephemeral: true,
            })
            .catch((err) => {
              const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
              sendErrorToDevTest(client, msg);
            });
        }
      });
    } catch (err) {
      console.log(err);
    }
  },
};
