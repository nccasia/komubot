/* eslint-disable no-unused-vars */
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
      const dataActive = await userData.updateOne(
        {
          id: user.id,
        },
        {
          deactive: true,
        }
      );
      message.reply({
        content: 'Toggle Activation Successfully',
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
    }
  },
};
