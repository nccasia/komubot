const userData = require('../../models/userData');
const { sendErrorToDevTest } = require('../../util/komubotrest');

const messHelp =
  '```' + '*toggleactivation username' + '\n' + '*toggleactivation id' + '```';

module.exports = {
  name: 'toggleactivation',
  description: 'Toggle Activation',
  cat: 'komu',
  async execute(message, args) {
    try {
      let authorId = args[0];
      const findUserId = await userData.findOne({
        $or: [{ id: authorId }, { username: authorId }],
      });

      if (findUserId === null)
        return message
          .reply({
            content: `${messHelp}`,
            ephemeral: true,
          })
          .catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
      if (findUserId.deactive !== true) {
        await userData.updateOne(
          {
            id: findUserId.id,
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
            sendErrorToDevTest(client, authorId, err);
          });
      } else {
        await userData.updateOne(
          {
            id: findUserId.id,
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
            sendErrorToDevTest(client, authorId, err);
          });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
