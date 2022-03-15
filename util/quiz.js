const { MessageEmbed: MessageEmbed } = require('discord.js');
const questionData = require('../models/quizData');
const userData = require('../models/userData');
const userquizData = require('../models/userQuiz');

async function randomQuiz(userInput, context, type) {
  // context is message or client
  // message if this is commands
  // client if this is scheduler
  // type is commands or scheduler

  try {
    let roles;
    let roleRandom;
    if (userInput.roles && userInput.roles.length > 0) {
      roles = [...userInput.roles, 'policy'];
      roleRandom =
        roles[Math.floor(Math.random() * roles.length)].toLowerCase();
    } else {
      roleRandom = 'policy';
    }

    const questionAnswered = await userquizData.find(
      {
        userid: userInput.id,
      },
      {
        _id: 0,
        quizid: 1,
      }
    );

    let questionAnsweredId = questionAnswered.map((item) => item.quizid);

    const questions = await questionData.aggregate([
      {
        $match: {
          _id: { $nin: questionAnsweredId },
          role: roleRandom,
          isVerify: true,
          accept: true,
          $expr: { $lte: [{ $strLenCP: '$title' }, 256] },
        },
      },
      {
        $sample: { size: 1 },
      },
    ]);
    if (Array.isArray(questions) && questions.length === 0) {
      const mess = 'You have answered all the questions!!!';
      if (type === 'commands') {
        await context.channel.send(mess);
      } else {
        return;
      }
    } else {
      return questions[0];
    }
  } catch (error) {
    console.log(error);
  }
}

function embedQuestion(question) {
  const Embed = new MessageEmbed()
    .setTitle(question.title)
    .setDescription(
      question.options.map((otp, index) => `${index + 1} - ${otp}`).join('\n')
    )
    .setColor('RANDOM')
    .setFooter({
      text: 'Reply to this message with the correct question number!',
    });
  return Embed;
}
async function addScores(userid) {
  try {
    const user = await userData.findOne({
      id: userid,
      deactive: { $ne: true },
    });
    let newUser;
    if (user.scores_quiz) {
      user.scores_quiz = user.scores_quiz + 5;
      newUser = await user.save();
    } else {
      user.scores_quiz = 5;
      newUser = await user.save();
    }
    return newUser;
  } catch (error) {
    console.log(error);
  }
}

async function saveQuestionCorrect(userid, questionid, answerkey) {
  try {
    const answer = await userquizData.findOne({
      $and: [
        { userid: userid },
        {
          quizid: questionid,
        },
      ],
    });

    if (!answer) {
      const newAnswer = new userquizData({
        userid: userid,
        quizid: questionid,
        correct: true,
        answer: answerkey,
      });
      await newAnswer.save();
    } else {
      answer.answer = answerkey;
      answer.correct = true;
      await answer.save();
    }
  } catch (error) {
    console.log(error);
  }
}

async function saveQuestionInCorrect(userid, questionid, answerkey) {
  try {
    const answer = await userquizData.findOne({
      $and: [
        { userid: userid },
        {
          quizid: questionid,
        },
      ],
    });
    if (!answer) {
      const newAnswer = new userquizData({
        userid: userid,
        quizid: questionid,
        correct: false,
        answer: answerkey,
      });
      await newAnswer.save();
    } else {
      answer.answer = answerkey;
      await answer.save();
    }
  } catch (error) {
    console.log(error);
  }
}

// const filterAwaitMessage = (userid) => ({
//   filter: (u2) => u2.author.id === userid,
//   time: 60000,
//   max: 1,
//   errors: ["time"],
// });
module.exports = {
  randomQuiz,
  embedQuestion,
  addScores,
  saveQuestionCorrect,
  saveQuestionInCorrect,
};
