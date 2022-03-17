const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { sendMessageKomuToUser } = require('./komubotrest');
const {
  randomQuiz,
  embedQuestion,
  addScores,
  saveQuestionCorrect,
  saveQuestionInCorrect,
  saveQuestion,
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
    const btn = new MessageEmbed()
      .setColor('#e11919')
      .setTitle('Complain')
      .setURL(`http://quiz.nccsoft.vn/question/update/${q._id}`);

    await sendMessageKomuToUser(
      client,
      { embeds: [Embed, btn], components: [row] },
      username,
      botPing
    );
    await saveQuestion(userid, q._id);
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendQuizToSingleUser;
