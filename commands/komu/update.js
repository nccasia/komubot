const userData = require('../../models/userData');
const userQuizData = require('../../models/userQuiz');

module.exports = {
  name: 'update',
  description: 'WFH Daily',
  cat: 'komu',
  async execute(message, args) {
    try {
      if (args[0] === 'point') {
        const user = await userData.find({}).select('id -_id');
        const userids = user.map((item) => item.id);
        for (let userid of userids) {
          const countQuizCorrect = await userQuizData.find({
            userid: userid,
            correct: true,
          });
          const point = countQuizCorrect.length * 5;
          await userData.updateOne({ id: userid }, { scores_quiz: point });
        }
        message.channel.send('Update Point Successfully');
      }
    } catch (err) {
      console.log(err);
    }
  },
};
