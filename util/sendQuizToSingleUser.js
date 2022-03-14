const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { sendMessageKomuToUser } = require('./komubotrest');
const {
  randomQuiz,
  embedQuestion,
  addScores,
  saveQuestionCorrect,
  saveQuestionInCorrect,
} = require('./quiz');
const userData = require('../models/userData');
const newEmbed = (message, color) =>
  new MessageEmbed().setTitle(message).setColor(color);

async function sendQuizToSingleUser(client, userInput, botPing = false) {
  try {
    // random userid
    if (!userInput) return;
    const userid = userInput.id;
    const username = userInput.username;

    const q = await randomQuiz(userInput, client, 'scheduler');
    if (!q) return;
    const Embed = embedQuestion(q);

    const row = new MessageActionRow();
    for (let i = 0; i < q.options.length; i++) {
      row.addComponents(
        new MessageButton()
          .setCustomId(
            `question_&id=${q._id}&key=${i + 1}&correct=${
              q.correct
            }&userid=${userid}`
          )
          .setLabel((i + 1).toString())
          .setStyle('PRIMARY')
      );
    }
    const user = await sendMessageKomuToUser(
      client,
      { embeds: [Embed], components: [row] },
      username,
      botPing
    );
    await userData.updateOne(
      { id: userid },
      {
        last_message_id: user.last_message_id,
      }
    );
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendQuizToSingleUser;
