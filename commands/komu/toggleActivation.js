const userData = require('../../models/userData');

const transArgs = (userArgs) => {
  if (userArgs.includes('<@!')) {
    return {
      id: userArgs.slice(3, userArgs.length - 1),
    };
  } else {
    return { username: userArgs };
  }
};

module.exports = {
  name: 'toggleactivation',
  description: 'Toggle Activation',
  cat: 'komu',
  async execute(message, args) {
    try {
      const user = transArgs(args[0]);
      const findUserId = await userData.find({
        id: user.id,
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
          message.reply({
            content: 'Disable Account Successfully',
            ephemeral: true,
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
          message.reply({
            content: 'Enable Account Successfully',
            ephemeral: true,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  },
};
