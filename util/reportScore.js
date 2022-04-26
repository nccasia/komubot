const userData = require('../models/userData');
const { MessageEmbed } = require('discord.js');

async function reportScore(message) {
  try {
    const userid = message.author.id;
    const username = message.author.username;

    if (!userid || !username) return;

    const scoresQuizData = await userData.aggregate([
      {
        $match: {
          deactive: { $ne: true },
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          scores_quiz: 1,
          username: 1,
        },
      },
      {
        $sort: {
          scores_quiz: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);
    let mess;
    if (Array.isArray(scoresQuizData) && scoresQuizData.length === 0) {
      mess = '```' + 'no result' + '```';
    } else {
      mess = scoresQuizData
        .map(
          (item) =>
            `<@${item.id}>(${item.username}) - ${item.scores_quiz || 0} points`
        )
        .join('\n');
    }

    const Embed = new MessageEmbed()
      .setTitle('Top 10 quiz points')
      .setColor('RED')
      .setDescription(`${mess}`);
    return message.reply({ embeds: [Embed] }).catch(console.error);
  } catch (error) {
    console.log(error);
  }
}
module.exports = reportScore;
