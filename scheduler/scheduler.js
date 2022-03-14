const cron = require('cron');
const userData = require('../models/userData');
const axios = require('axios');
const moment = require('moment');
const getUserNotDaily = require('../util/getUserNotDaily');
const { MessageEmbed } = require('discord.js');
const getUserOffWork = require('../util/getUserOffWork');
const sendQuizToSingleUser = require('../util/sendQuizToSingleUser');
const {
  sendMessageKomuToUser,
  sendMessageToNhaCuaChung,
  getWFHWarninghMessage,
} = require('../util/komubotrest');
const birthdayUser = require('../util/birthday');
const wfhData = require('../models/wfhData');
const mentionedData = require('../models/mentionedData');
const audioPlayer = require('../util/audioPlayer');
const joincallData = require('../models/joincallData');
const meetingData = require('../models/meetingData');
const voiceChannelData = require('../models/voiceChannelData');
const userQuizData = require('../models/userQuiz');
const { updateRoleProject, updateRoleDiscord } = require('../util/roles');

// Deepai
const deepai = require('deepai');
const API_KEY_DEEPAI = '9763204a-9c9a-4657-b393-5bbf4010217d';
deepai.setApiKey(API_KEY_DEEPAI);

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

    // Get user joining now
    const dataJoining = await joincallData.find({
      status: 'joining',
    });
    const useridJoining = dataJoining.map((item) => item.userid);

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
    const filterFindUser = (filterEmail) => {
      return [
        {
          $match: {
            email: filterEmail,
            deactive: { $ne: true },
            $or: [
              { last_bot_message_id: { $exists: false } },
              { last_bot_message_id: '' },
            ],
            id: { $nin: useridJoining },
            $or: [
              { roles_discord: { $all: ['INTERN'] } },
              { roles_discord: { $all: ['STAFF'] } },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            username: 1,
            last_message_id: 1,
            id: 1,
            roles: 1,
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
            id: 1,
            roles: 1,
          },
        },
      ];
    };
    const userWfhWithSomeCodition = await userData.aggregate(
      filterFindUser({ $in: wfhUserEmail })
    );
    let arrayMessUserWfh = userWfhWithSomeCodition.filter(
      (user) => Date.now() - user.last_message_time >= 1800000
    );

    const userDiffrentWfhWithSomeCodition = await userData.aggregate(
      filterFindUser({ $nin: wfhUserEmail })
    );
    let arrayMessUserDiffWfh = userDiffrentWfhWithSomeCodition.filter(
      (user) => Date.now() - user.last_message_time >= 1800000
    );

    try {
      await Promise.all(
        arrayMessUserWfh.map((userWfh) =>
          sendQuizToSingleUser(client, userWfh, true)
        )
      );
    } catch (error) {
      console.log(error);
    }

    try {
      await Promise.all(
        arrayMessUserDiffWfh.map((userDiffWfh) =>
          sendQuizToSingleUser(client, userDiffWfh)
        )
      );
    } catch (error) {
      console.log(error);
    }
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
        deactive: { $ne: true },
        roles_discord: { $ne: [], $exists: true },
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
      )
        .utcOffset(420)
        .format('YYYY-MM-DD HH:mm:ss')} !\n`;
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
      await userData.updateOne(
        { id: user.id, deactive: { $ne: true } },
        { last_bot_message_id: '' }
      );
    }
  });
}

async function checkMention(client) {
  if (checkTime(new Date())) return;
  const now = Date.now();
  try {
    let mentionedUsers = await mentionedData.find({ confirm: false });
    const notiUser = mentionedUsers.filter(
      (item) =>
        now - item.createdTimestamp >= 1500000 &&
        now - item.createdTimestamp < 1800000 &&
        !item.noti
    );

    mentionedUsers = mentionedUsers.filter(
      (item) => now - item.createdTimestamp >= 1800000
    );

    await Promise.all(
      notiUser.map(async (user) => {
        let mentionChannel = await client.channels.fetch(user.channelId);
        if (mentionChannel.type !== 'GUILD_TEXT') {
          mentionChannel = await client.channels.fetch(mentionChannel.parentId);
        }

        let mentionName = await client.users.fetch(user.authorId);

        const userDiscord = await client.users.fetch(user.mentionUserId);
        userDiscord.send(
          `Hãy trả lời ${mentionName.username} tại channel ${mentionChannel.name} nhé!`
        );
        await mentionedData.updateOne({ _id: user._id }, { noti: true });
      })
    );

    await Promise.all(
      mentionedUsers.map(async (user) => {
        let mentionChannel = await client.channels.fetch(user.channelId);
        if (mentionChannel.type !== 'GUILD_TEXT') {
          mentionChannel = await client.channels.fetch(mentionChannel.parentId);
        }
        const content = `<@${
          user.mentionUserId
        }> không trả lời tin nhắn mention của <@${user.authorId}> lúc ${moment(
          parseInt(user.createdTimestamp.toString())
        )
          .utcOffset(420)
          .format('YYYY-MM-DD HH:mm:ss')} tại channel ${
          mentionChannel.name
        }!\n`;
        const data = await new wfhData({
          userid: user.mentionUserId,
          wfhMsg: content,
          complain: false,
          pmconfirm: false,
          status: 'ACTIVE',
          type: 'mention',
        }).save();
        const message = getWFHWarninghMessage(
          content,
          user.mentionUserId,
          data._id.toString()
        );
        const channel = await client.channels.fetch(
          client.config.komubotrest.machleo_channel_id
        );
        await channel.send(message);
        await mentionedData.updateOne(
          { _id: user._id },
          { confirm: true, punish: true }
        );
      })
    );
  } catch (error) {
    console.log(error);
  }
}

async function topTracker(client) {
  const userTracker = [
    '856211913456877608',
    '922416220056199198',
    '921689631110602792',
    '922297847876034562',
    '922306295346921552',
    '921601073939116073',
    '921261168088190997',
    '921312679354834984',
    '665925240404181002',
  ];
  await Promise.all(
    userTracker.map(async (user) => {
      const userDiscord = await client.users.fetch(user);
      userDiscord.send(`Nhớ bật top tracker <@${user}> nhé!!!`);
    })
  );
}

async function sendQuiz(client) {
  const userDb = await userData
    .find({
      deactive: { $ne: true },
      roles_discord: { $ne: [], $exists: true },
    })
    .select('id username roles -_id');

  async function sendQuizWithCondition(client, user) {
    const quizNearest = await userQuizData.aggregate([
      {
        $match: {
          userid: user.id,
        },
      },
      {
        $sort: { createAt: -1 },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          createAt: 1,
        },
      },
    ]);
    if (quizNearest.length === 0) {
      await sendQuizToSingleUser(client, user);
      return;
    }
    const checkDate = () => {
      let result = false;
      if (
        Date.now() - new Date(quizNearest[0].createAt).getTime() >=
        1000 * 60 * 60 * 2
      ) {
        result = true;
      }
      return result;
    };
    if (quizNearest.length > 0 && checkDate()) {
      await sendQuizToSingleUser(client, user);
    }
  }
  await Promise.all(userDb.map((user) => sendQuizWithCondition(client, user)));
}

async function tagMeeting(client) {
  let guild = client.guilds.fetch('921239248991055882');
  const getAllVoice = client.channels.cache.filter(
    (guild) =>
      guild.type === 'GUILD_VOICE' && guild.parentId === '921239248991055884'
  );
  const repeatMeet = await meetingData.find({
    cancel: { $ne: true },
    reminder: { $ne: true },
  });

  const voiceChannel = getAllVoice.map((item) => item.id);

  const now = new Date();
  now.setHours(now.getHours() + 7);
  let day = now.getDay();
  const dateNowTimestamp = now / 1000 / 60;
  const hourDateNow = now.getHours();
  const dateNow = now.toLocaleDateString('en-US');

  let countVoice = 0;
  let roomMap = [];
  let voiceNow = [];

  const findVoice = await voiceChannelData.find({ status: 'start' });
  findVoice.map((item) => {
    voiceNow.push(item.id);
  });

  const newList = voiceChannel.map(async (voice, index) => {
    const userDiscord = await client.channels.fetch(voice);

    if (userDiscord.members.size > 0) {
      countVoice++;
    }
    if (userDiscord.members.size === 0) {
      roomMap.push(userDiscord.id);
    }
    let roomVoice = roomMap.filter((room) => !voiceNow.includes(room));

    if (index === voiceChannel.length - 1) {
      const timeCheck = repeatMeet.map(async (item) => {
        const hourTimestamp = new Date(+item.createdTimestamp).getHours();
        const minuteTimestamp = +item.createdTimestamp / 1000 / 60;
        const checkFiveMinute = dateNowTimestamp - minuteTimestamp;

        const dateCreatedTimestamp = new Date(
          +item.createdTimestamp.toString()
        ).toLocaleDateString('en-US');
        if (
          countVoice === voiceChannel.length &&
          hourDateNow === hourTimestamp &&
          -5 <= checkFiveMinute &&
          checkFiveMinute <= 0 &&
          dateCreatedTimestamp === dateNow
        ) {
          const fetchChannelFull = await client.channels.fetch(item.channelId);
          fetchChannelFull.send(`@here voice channel full`);
        } else {
          switch (item.repeat) {
            case 'once':
              if (
                hourDateNow === hourTimestamp &&
                -5 <= checkFiveMinute &&
                checkFiveMinute <= 0 &&
                dateCreatedTimestamp === dateNow
              ) {
                const onceFetchChannel = await client.channels.fetch(
                  item.channelId
                );
                if (roomVoice.length !== 0) {
                  onceFetchChannel.send(
                    `@here our meeting room is <#${roomVoice[0]}>`
                  );
                  const onceShift = roomVoice.shift(roomVoice[0]);
                  const channelNameOnce = await client.channels.fetch(
                    onceShift
                  );
                  const originalNameOnce = channelNameOnce.name;
                  await channelNameOnce.setName(
                    `${channelNameOnce.name} (${item.task})`
                  );

                  const newRoomOnce = channelNameOnce.name;
                  await new voiceChannelData({
                    id: channelNameOnce.id,
                    originalName: originalNameOnce,
                    newRoomName: newRoomOnce,
                    createdTimestamp: Date.now(),
                  })
                    .save()
                    .catch((err) => console.log(err));
                } else onceFetchChannel.send(`@here voice channel full`);
                await meetingData.updateOne(
                  { _id: item._id },
                  { reminder: true }
                );
              }
              return;
            case 'daily':
              if (day === 0 || day === 6) return;
              if (
                hourDateNow === hourTimestamp &&
                -5 <= checkFiveMinute &&
                checkFiveMinute <= 0
              ) {
                const dailyFetchChannel = await client.channels.fetch(
                  item.channelId
                );
                if (roomVoice.length !== 0) {
                  dailyFetchChannel.send(
                    `@here our meeting room is <#${roomVoice[0]}>`
                  );
                  const dailyShift = roomVoice.shift(roomVoice[0]);
                  const channelNameDaily = await client.channels.fetch(
                    dailyShift
                  );
                  const originalNameDaily = channelNameDaily.name;
                  await channelNameDaily.setName(
                    `${channelNameDaily.name} (${item.task})`
                  );
                  const newRoomDaily = channelNameDaily.name;
                  await new voiceChannelData({
                    id: channelNameDaily.id,
                    originalName: originalNameDaily,
                    newRoomName: newRoomDaily,
                    createdTimestamp: Date.now(),
                  })
                    .save()
                    .catch((err) => console.log(err));
                } else dailyFetchChannel.send(`@here voice channel full`);
                await meetingData.updateOne(
                  { _id: item._id },
                  { reminder: true }
                );
              }
              return;
            case 'weekly':
              const dateTimeWeekly = new Date(
                +item.createdTimestamp.toString()
              );
              dateTimeWeekly.setDate(dateTimeWeekly.getDate() + 7);
              const weeklyCreatedTimestamp = new Date(dateTimeWeekly).valueOf();
              if (
                hourDateNow === hourTimestamp &&
                -5 <= checkFiveMinute &&
                checkFiveMinute <= 0 &&
                dateCreatedTimestamp === dateNow
              ) {
                const weeklyFetchChannel = await client.channels.fetch(
                  item.channelId
                );
                if (roomVoice.length !== 0) {
                  weeklyFetchChannel.send(
                    `@here our meeting room is <#${roomVoice[0]}>`
                  );
                  const weeklyShift = roomVoice.shift(roomVoice[0]);
                  const channelNameWeekly = await client.channels.fetch(
                    weeklyShift
                  );
                  const originalNameWeekly = channelNameWeekly.name;
                  await channelNameWeekly.setName(
                    `${channelNameWeekly.name} (${item.task})`
                  );
                  const newRoomWeekly = channelNameWeekly.name;
                  await new voiceChannelData({
                    id: channelNameWeekly.id,
                    originalName: originalNameWeekly,
                    newRoomName: newRoomWeekly,
                    createdTimestamp: Date.now(),
                  })
                    .save()
                    .catch((err) => console.log(err));
                } else weeklyFetchChannel.send(`@here voice channel full`);
                await meetingData.updateOne(
                  { _id: item._id },
                  { createdTimestamp: weeklyCreatedTimestamp, reminder: true }
                );
              }
              return;
            case 'repeat':
              const dateTimeRepeat = new Date(
                +item.createdTimestamp.toString()
              );
              dateTimeRepeat.setDate(
                dateTimeRepeat.getDate() + item.repeatTime
              );
              const repeatCreatedTimestamp = new Date(dateTimeRepeat).valueOf();
              if (
                hourDateNow === hourTimestamp &&
                -5 <= checkFiveMinute &&
                checkFiveMinute <= 0 &&
                dateCreatedTimestamp === dateNow
              ) {
                const repeatFetchChannel = await client.channels.fetch(
                  item.channelId
                );
                if (roomVoice.length !== 0) {
                  repeatFetchChannel.send(
                    `@here our meeting room is <#${roomVoice[0]}>`
                  );
                  const repeatShift = roomVoice.shift(roomVoice[0]);
                  const channelNameRepeat = await client.channels.fetch(
                    repeatShift
                  );
                  const originalNameRepeat = channelNameRepeat.name;
                  await channelNameRepeat.setName(
                    `${channelNameRepeat.name} (${item.task})`
                  );
                  const newRoomRepeat = channelNameRepeat.name;
                  await new voiceChannelData({
                    id: channelNameRepeat.id,
                    originalName: originalNameRepeat,
                    newRoomName: newRoomRepeat,
                    createdTimestamp: Date.now(),
                  })
                    .save()
                    .catch((err) => console.log(err));
                } else repeatFetchChannel.send(`@here voice channel full`);
                await meetingData.updateOne(
                  { _id: item._id },
                  { createdTimestamp: repeatCreatedTimestamp, reminder: true }
                );
              }
              return;
            default:
              break;
          }
        }
      });
    }
  });
}

async function updateReminderMeeting(client) {
  const repeatMeet = await meetingData.find({
    reminder: true,
  });

  const now = new Date();
  now.setHours(now.getHours() + 7);
  const dateNowTimestamp = now / 1000 / 60;
  const hourDateNow = now.getHours();
  const dateNow = now.toLocaleDateString('en-US');

  const timeCheck = repeatMeet.map(async (item) => {
    const hourTimestamp = new Date(+item.createdTimestamp).getHours();
    const minuteTimestamp = +item.createdTimestamp / 1000 / 60;
    const checkFiveMinute = dateNowTimestamp - minuteTimestamp;

    const dateCreatedTimestamp = new Date(
      +item.createdTimestamp.toString()
    ).toLocaleDateString('en-US');

    if (
      hourDateNow === hourTimestamp &&
      checkFiveMinute >= 5 &&
      dateCreatedTimestamp === dateNow
    ) {
      await meetingData.updateOne({ _id: item._id }, { reminder: false });
    }
  });
}

async function sendMessTurnOffPc(client) {
  const staffRoleId = '921328149927690251';
  const channel = await client.channels.fetch('921239541388554240');
  const roles = await channel.guild.roles.fetch(staffRoleId);
  const membersName = roles.members.map(async (member) => {
    const userid = await userData.find({ username: member.displayName });
    await Promise.all(
      userid.map(async (user) => {
        const userDiscord = await client.users.fetch(user.id);
        userDiscord.send(
          `Nhớ tắt máy trước khi ra về nếu không dùng nữa nhé!!!`
        );
      })
    );
  });
}

async function sendSubmitTimesheet(client) {
  let getListUserLogTimesheet;
  try {
    getListUserLogTimesheet = await axios.get(
      client.config.submitTimesheet.api_url_getListUserLogTimesheet
    );
  } catch (error) {
    console.log(error);
  }

  if (!getListUserLogTimesheet) {
    return;
  }
  const getListUser = getListUserLogTimesheet.data.result.map(async (item) => {
    const list = getUserNameByEmail(item.emailAddress);
    const checkUser = await userData.find({
      email: list,
      deactive: { $ne: true },
      roles_discord: { $ne: [], $exists: true },
    });
    checkUser.map(async (user) => {
      const userDiscord = await client.users.fetch(user.id);
      userDiscord.send(
        `Nhớ submit timesheet cuối tuần tránh bị phạt bạn nhé!!!`
      );
    });
  });
}

async function checkJoinCall(client) {
  console.log(['Schulder run']);
  const now = new Date();
  const HOURS = 2;
  const beforeHours = new Date(now.getTime() - 1000 * 60 * 60 * HOURS);

  await joincallData.updateMany(
    {
      status: 'joining',
      start_time: {
        $lte: beforeHours,
      },
    },
    {
      $set: {
        status: 'finish',
        end_time: new Date(),
      },
    }
  );
}
async function turnOffBot(client) {
  const fetchVoiceNcc8 = await client.channels.fetch('921323636491710504');
  const target = await fetchVoiceNcc8.guild.members.fetch('922003239887581205');
  target.voice.disconnect().catch(console.error);
}

exports.scheduler = {
  run(client) {
    new cron.CronJob(
      '*/1 * * * *',
      () => updateReminderMeeting(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '*/1 * * * *',
      () => tagMeeting(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '15 13 * * 5',
      () => audioPlayer(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
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
    new cron.CronJob(
      '*/1 9-11,13-17 * * 1-5',
      () => checkMention(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '45 08 * * 1-5',
      async () => await topTracker(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '30 17 * * 1-5',
      () => sendMessTurnOffPc(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '00 12 * * 0',
      () => sendSubmitTimesheet(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '0 0 * * 1',
      () => updateRoleProject(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '0 * * * *',
      () => updateRoleDiscord(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '0 9-11,13-17 * * 1-5',
      () => checkJoinCall(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '0 9,11,13,15 * * 1-5',
      () => sendQuiz(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '15 14 * * 5',
      () => turnOffBot(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
  },
};
