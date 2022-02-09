const cron = require('cron');
const userData = require('../models/userData');
const axios = require('axios');
const moment = require('moment');
const getUserNotDaily = require('../util/getUserNotDaily');
const sendQuizToSingleUser = require('../util/sendQuizToSingleUser');
const {
  sendMessageKomuToUser,
  sendMessageToNhaCuaChung,
  getWFHWarninghMessage,
} = require('../util/komubotrest');
const birthdayUser = require('../util/birthday');
const wfhData = require('../models/wfhData');
// const testQuiz = require("../testquiz");

function setTime(date, hours, minute, second, msValue) {
  return date.setHours(hours, minute, second, msValue);
}

function checkTime(time) {
  if (!time) return false;
  let result = false;
  const curDate = new Date();
  const timezone = curDate.getTimezoneOffset() / -60;
  const fFistTime = new Date(setTime(curDate, 6 + timezone, 0, 0, 0)).getTime();
  const lFistTime = new Date(
    setTime(curDate, 6 + timezone, 30, 0, 0)
  ).getTime();

  const lLastTime = new Date(
    setTime(curDate, 10 + timezone, 25, 0, 0)
  ).getTime();

  if (
    (time.getTime() >= fFistTime && time.getTime() < lFistTime) ||
    time.getTime() >= lLastTime
  ) {
    result = true;
  }

  return result;
}

async function showDaily(client) {
  console.log('[Scheduler] Run');
  try {
    const { notDailyMorning } = await getUserNotDaily(null, null, null, client);
    // send message komu to user

    await Promise.all(
      notDailyMorning.map((email) =>
        sendMessageKomuToUser(
          client,
          "Don't forget to daily, dude! Don't be mad at me, we are friends I mean we are best friends.",
          email
        )
      )
    );
  } catch (error) {
    console.log(error);
  }
}

function getUserNameByEmail(string) {
  if (string.includes('@ncc.asia')) {
    return string.slice(0, string.length - 9);
  }
}
async function pingWfh(client) {
  try {
    console.log('[Scheduler run]');
    if (checkTime(new Date())) return;
    let wfhGetApi;
    try {
      wfhGetApi = await axios.get(client.config.wfh.api_url, {
        headers: {
          securitycode: client.config.wfh.api_key_secret,
        },
      });
    } catch (error) {
      console.log(error);
    }

    if (!wfhGetApi || wfhGetApi.data == undefined) {
      return;
    }

    const wfhUserEmail = wfhGetApi.data.result.map((item) =>
      getUserNameByEmail(item.emailAddress)
    );

    if (
      (Array.isArray(wfhUserEmail) && wfhUserEmail.length === 0) ||
      !wfhUserEmail
    ) {
      return;
    }
    const result = await userData.aggregate([
      {
        $match: {
          email: { $in: wfhUserEmail },
          $or: [
            { last_bot_message_id: { $exists: false } },
            { last_bot_message_id: '' },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          username: 1,
          last_message_id: 1,
        },
      },
      { $match: { last_message_id: { $exists: true } } },
      {
        $lookup: {
          from: 'komu_msgs',
          localField: 'last_message_id',
          foreignField: 'id',
          as: 'last_message',
        },
      },
      {
        $project: {
          username: 1,
          last_message_time: {
            $first: '$last_message.createdTimestamp',
          },
        },
      },
    ]);
    let arrayMessUser = result.filter(
      (user) => Date.now() - user.last_message_time >= 1800000
    );

    if (
      (Array.isArray(arrayMessUser) && arrayMessUser.length === 0) ||
      !arrayMessUser
    ) {
      return;
    }
    arrayMessUser = [...new Set(arrayMessUser.map((user) => user.username))];
    await Promise.all(
      arrayMessUser.map((username) => {
        return sendMessageKomuToUser(
          client,
          "Are you there? Please say something to me. I'm sad because they are so serious. I'm just an adorable bot, work for the money!!!",
          username,
          true
        );
      })
    );
  } catch (error) {
    console.log(error);
  }
}

// eslint-disable-next-line no-unused-vars
async function sendQuiz(client) {
  try {
    console.log('Send quiz run ');
    const randomUser = await userData.aggregate([
      {
        $project: {
          _id: 0,
          id: 1,
          username: 1,
          roles: 1,
        },
      },
    ]);
    return await Promise.all(
      randomUser.map((user) => sendQuizToSingleUser(client, user))
    );
  } catch (error) {
    console.log(error);
  }
}
async function happyBirthday(client) {
  const result = await birthdayUser(client);

  try {
    await Promise.all(
      await result.map((item) =>
        sendMessageToNhaCuaChung(
          client,
          `${item.wish} <@${item.user.id}> +1 trà sữa full topping nhé b iu`
        )
      )
    );
  } catch (error) {
    console.log(error);
  }
}

async function punish(client) {
  if (checkTime(new Date())) return;
  const users = await userData.aggregate([
    {
      $match: {
        last_bot_message_id: { $exists: true, $ne: '' },
      },
    },
    {
      $lookup: {
        from: 'komu_msgs',
        localField: 'last_bot_message_id',
        foreignField: 'id',
        as: 'last_message',
      },
    },
    {
      $project: {
        id: 1,
        username: 1,
        createdTimestamp: {
          $first: '$last_message.createdTimestamp',
        },
      },
    },
  ]);

  users.map(async (user) => {
    if (Date.now() - user.createdTimestamp >= 1800000) {
      const content = `<@${user.id}> không trả lời tin nhắn WFH lúc ${moment(
        parseInt(user.createdTimestamp.toString())
      ).format('YYYY-MM-DD HH:mm:ss')} !\n`;
      const data = await new wfhData({
        userid: user.id,
        wfhMsg: content,
        complain: false,
        pmconfirm: false,
        status: 'ACTIVE',
      }).save();
      const message = getWFHWarninghMessage(
        content,
        user.id,
        data._id.toString()
      );
      const channel = await client.channels.fetch(
        client.config.komubotrest.machleo_channel_id
      );
      await channel.send(message);
      await userData.updateOne({ id: user.id }, { last_bot_message_id: '' });
    }
  });
}

exports.scheduler = {
  run(client) {
    new cron.CronJob(
      '00 00 9 * * 1-5',
      () => showDaily(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '*/5 9-11,13-17 * * 1-5',
      () => pingWfh(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '*/1 9-11,13-17 * * 1-5',
      () => punish(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '00 09 * * 0-6',
      () => happyBirthday(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    // new cron.CronJob(
    //   "*/10 * 8-17 * * 1-5",
    //   async () => await sendQuiz(client),
    //   null,
    //   false,
    //   "Asia/Ho_Chi_Minh"
    // ).start();
  },
};
