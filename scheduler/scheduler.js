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
const timeVoiceAloneData = require('../models/timeVoiceAloneData');
// const testQuiz = require("../testquiz");
const userQuizData = require('../models/userQuiz');
const { updateRoleProject, updateRoleDiscord } = require('../util/roles');
const datingData = require('../models/datingData');
const remindData = require('../models/remindData');

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

function withoutTime(dateTime) {
  const date = new Date(dateTime);
  const curDate = new Date();
  const timezone = curDate.getTimezoneOffset() / -60;
  date.setHours(0 + timezone, 0, 0, 0);
  return date;
}

function getTimeToDay() {
  const today = new Date();
  const tomorrows = new Date();
  const tomorrowsDate = tomorrows.setDate(tomorrows.getDate() + 1);

  return {
    firstDay: new Date(withoutTime(today)),
    lastDay: new Date(withoutTime(tomorrowsDate)),
  };
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
    let userOff = [];
    try {
      const { notSendUser } = await getUserOffWork();
      userOff = notSendUser;
    } catch (error) {
      console.log(error);
    }
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
            last_bot_message_id: 1,
          },
        },
        {
          $match: {
            last_message_id: { $exists: true },
            last_bot_message_id: {
              $exists: true,
            },
          },
        },
        {
          $lookup: {
            from: 'komu_msgs',
            localField: 'last_bot_message_id',
            foreignField: 'id',
            as: 'last_message_bot',
          },
        },
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
            message_bot_timestamp: {
              $first: '$last_message_bot.createdTimestamp',
            },
            message_timestamp: {
              $first: '$last_message.createdTimestamp',
            },
            id: 1,
            roles: 1,
          },
        },
      ];
    };
    const userWfhWithSomeCodition = await userData.aggregate(
      filterFindUser({ $nin: userOff })
    );
    const coditionGetTimeStamp = (user) => {
      let result = false;
      if (!user.message_bot_timestamp || !user.message_timestamp) {
        result = true;
      } else {
        if (
          Date.now() - user.message_bot_timestamp >= 1800000 &&
          Date.now() - user.message_timestamp >= 1800000
        ) {
          result = true;
        }
      }
      return result;
    };
    const arrayUser = userWfhWithSomeCodition.filter((user) =>
      coditionGetTimeStamp(user)
    );
    try {
      await Promise.all(
        arrayUser.map((userWfh) => sendQuizToSingleUser(client, userWfh, true))
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
  const users = await userData.aggregate([
    {
      $match: {
        deactive: { $ne: true },
        roles_discord: { $ne: [], $exists: true },
        last_bot_message_id: { $exists: true, $ne: '' },
        email: { $in: wfhUserEmail },
        botPing: true,
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
    if (
      Date.now() - user.createdTimestamp >= 1800000 &&
      user.createdTimestamp <= getTimeToDay().lastDay.getTime() &&
      user.createdTimestamp >= getTimeToDay().firstDay.getTime()
    ) {
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
      await userData.updateOne(
        { id: user.id, deactive: { $ne: true } },
        { botPing: false }
      );
      await channel.send(message);
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
  try {
    let userOff = [];
    try {
      const { notSendUser } = await getUserOffWork();
      userOff = notSendUser;
    } catch (error) {
      console.log(error);
    }

    const filterFindUser = (filterEmail) => {
      return [
        {
          $match: {
            email: filterEmail,
            deactive: { $ne: true },
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
            last_bot_message_id: 1,
            id: 1,
            roles: 1,
          },
        },
        { $match: { last_bot_message_id: { $exists: true } } },
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
    const userSendQuiz = await userData.aggregate(
      filterFindUser({ $nin: userOff })
    );

    let arrayUser = userSendQuiz.filter(
      (user) =>
        !user.last_message_time ||
        Date.now() - user.last_message_time >= 1000 * 60 * 60 * 2
    );
    await Promise.all(
      arrayUser.map((user) => sendQuizToSingleUser(client, user, true))
    );
  } catch (error) {
    console.log(error);
  }
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
  const hourDateNow = now.getHours();
  const dateNow = now.toLocaleDateString('en-US');
  const minuteDateNow = now.getMinutes();

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
        let checkFiveMinute;
        let hourTimestamp;
        const dateScheduler = new Date(+item.createdTimestamp);
        const minuteDb = dateScheduler.getMinutes();

        if (minuteDb >= 0 && minuteDb <= 4) {
          checkFiveMinute = minuteDb + 60 - minuteDateNow;
          const hourDb = dateScheduler;
          setHourTimestamp = hourDb.setHours(hourDb.getHours() - 1);
          hourTimestamp = new Date(setHourTimestamp).getHours();
        } else {
          checkFiveMinute = minuteDb - minuteDateNow;
          hourTimestamp = dateScheduler.getHours();
        }

        const dateCreatedTimestamp = new Date(
          +item.createdTimestamp.toString()
        ).toLocaleDateString('en-US');
        if (
          countVoice === voiceChannel.length &&
          hourDateNow === hourTimestamp &&
          0 <= checkFiveMinute &&
          checkFiveMinute <= 5 &&
          dateCreatedTimestamp === dateNow
        ) {
          const fetchChannelFull = await client.channels.fetch(item.channelId);
          fetchChannelFull.send(`@here voice channel full`);
        } else {
          switch (item.repeat) {
            case 'once':
              if (
                hourDateNow === hourTimestamp &&
                0 <= checkFiveMinute &&
                checkFiveMinute <= 5 &&
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
                  let originalNameOnce = channelNameOnce.name;
                  const searchTermOnce = '(';
                  const indexOfFirstOnce =
                    originalNameOnce.indexOf(searchTermOnce);
                  if (indexOfFirstOnce > 0) {
                    originalNameOnce = originalNameOnce.slice(
                      0,
                      indexOfFirstOnce - 1
                    );
                    await channelNameOnce.setName(
                      `${originalNameOnce} (${item.task})`
                    );
                  } else
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
                0 <= checkFiveMinute &&
                checkFiveMinute <= 5
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
                  let originalNameDaily = channelNameDaily.name;
                  const searchTermDaily = '(';
                  const indexOfFirstDaily =
                    originalNameDaily.indexOf(searchTermDaily);
                  if (indexOfFirstDaily > 0) {
                    originalNameDaily = originalNameDaily.slice(
                      0,
                      indexOfFirstDaily - 1
                    );
                    await channelNameDaily.setName(
                      `${originalNameDaily} (${item.task})`
                    );
                  } else
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
              const dateWeekly = dateTimeWeekly.getDay();
              if (
                hourDateNow === hourTimestamp &&
                0 <= checkFiveMinute &&
                checkFiveMinute <= 5 &&
                dateWeekly === day
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
                  let originalNameWeekly = channelNameWeekly.name;
                  const searchTermWeekly = '(';
                  const indexOfFirstWeekly =
                    originalNameWeekly.indexOf(searchTermWeekly);
                  if (indexOfFirstWeekly > 0) {
                    originalNameWeekly = originalNameWeekly.slice(
                      0,
                      indexOfFirstWeekly - 1
                    );
                    await channelNameWeekly.setName(
                      `${originalNameWeekly} (${item.task})`
                    );
                  } else
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
                  { reminder: true }
                );
              }
              return;
            case 'repeat':
              const newDateTimestamp = new Date(
                +item.createdTimestamp.toString()
              );
              now.setHours(0, 0, 0, 0);
              newDateTimestamp.setHours(0, 0, 0, 0);
              const diffTime = Math.abs(now - newDateTimestamp);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (
                hourDateNow === hourTimestamp &&
                0 <= checkFiveMinute &&
                checkFiveMinute <= 5 &&
                diffDays % item.repeatTime === 0 &&
                now - newDateTimestamp > 0
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
                  let originalNameRepeat = channelNameRepeat.name;
                  const searchTermRepeat = '(';
                  const indexOfFirstRepeat =
                    originalNameRepeat.indexOf(searchTermRepeat);
                  if (indexOfFirstRepeat > 0) {
                    originalNameRepeat = originalNameRepeat.slice(
                      0,
                      indexOfFirstRepeat - 1
                    );
                    await channelNameRepeat.setName(
                      `${originalNameRepeat} (${item.task})`
                    );
                  } else
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
                  { reminder: true }
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
  const hourDateNow = now.getHours();
  const minuteDateNow = now.getMinutes();

  const timeCheck = repeatMeet.map(async (item) => {
    let checkFiveMinute;
    let hourTimestamp;
    const dateScheduler = new Date(+item.createdTimestamp);

    const minuteDb = dateScheduler.getMinutes();
    if (minuteDb >= 0 && minuteDb <= 4) {
      checkFiveMinute = minuteDb + 60 - minuteDateNow;
      const hourDb = dateScheduler;
      setHourTimestamp = hourDb.setHours(hourDb.getHours() - 1);
      hourTimestamp = new Date(setHourTimestamp).getHours();
    } else {
      checkFiveMinute = minuteDateNow - minuteDb;
      hourTimestamp = dateScheduler.getHours();
    }

    if (hourDateNow === hourTimestamp && checkFiveMinute > 5) {
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

async function kickMemberVoiceChannel(client) {
  let guild = client.guilds.fetch('921239248991055882');
  const getAllVoice = client.channels.cache.filter(
    (guild) =>
      guild.type === 'GUILD_VOICE' && guild.parentId === '921239248991055884'
  );
  const voiceChannel = getAllVoice.map((item) => item.id);

  const timeNow = Date.now();
  let roomMap = [];
  let voiceNow = [];

  const timeVoiceAlone = await timeVoiceAloneData.find({
    status: { $ne: true },
  });
  timeVoiceAlone.map(async (item) => {
    voiceNow.push(item.channelId);
    if (timeNow - item.start_time >= 600000) {
      const fetchVoiceNcc8 = await client.channels.fetch(item.channelId);
      if (fetchVoiceNcc8.members.first) {
        const target = fetchVoiceNcc8.members.first();
        if (target && target.voice)
          target.voice.disconnect().catch(console.error);
      }

      await timeVoiceAloneData.updateMany(
        { channelId: item.channelId },
        { status: true }
      );
    }
  });

  const newList = voiceChannel.map(async (voice, index) => {
    const userDiscord = await client.channels.fetch(voice);
    if (userDiscord.members.size === 0 || userDiscord.members.size > 1) {
      await timeVoiceAloneData.updateMany(
        { channelId: voice },
        { status: true }
      );
    }

    if (userDiscord.members.size === 1) {
      roomMap.push(userDiscord.id);
    }

    let roomVoice = roomMap.filter((room) => !voiceNow.includes(room));

    if (index === voiceChannel.length - 1) {
      roomVoice.map(async (item) => {
        await new timeVoiceAloneData({
          channelId: item,
          status: false,
          start_time: timeNow,
        })
          .save()
          .catch((err) => console.log(err));
      });
    }
  });
}

async function dating(client) {
  const now = new Date();
  let minute = now.getMinutes();
  let dating = [];
  let datingIdMan = [];
  let datingIdWoman = [];
  let datingEmailMAn = [];
  let datingEmailWoman = [];
  let resCheckUserMan = [];
  let resCheckUserWoman = [];
  let listJoinCall = [];

  if (minute === 0) {
    const response = await axios.get(
      'http://timesheetapi.nccsoft.vn/api/services/app/Public/GetAllUser'
    );
    if (!response.data || !response.data.result) return;

    let userMan = [];
    let userWomen = [];
    response.data.result.map((item) => {
      if (item.sex === 0)
        userMan.push({
          email: getUserNameByEmail(item.emailAddress),
          branch: item.branch,
        });
      if (item.sex === 1)
        userWomen.push({
          email: getUserNameByEmail(item.emailAddress),
          branch: item.branch,
        });
    });

    let emailUserMan = [];
    let emailUserWomen = [];
    userMan.map((item) => {
      if (!item.email) return;
      emailUserMan.push(item.email);
    });
    userWomen.map((item) => {
      if (!item.email) return;
      emailUserWomen.push(item.email);
    });

    let result = [];
    const userDating = await datingData.find();
    userDating.map(async (item) => {
      result.push(item.email);
    });

    const checkJoinCall = await joincallData.find({
      status: 'joining',
    });
    checkJoinCall.map(async (item) => {
      listJoinCall.push(item.userid);
    });

    const checkUserMan = await userData
      .find({
        email: { $in: emailUserMan, $nin: result },
        id: { $nin: listJoinCall },
        deactive: { $ne: true },
      })
      .select('id email -_id');

    const checkUserWoman = await userData
      .find({
        email: { $in: emailUserWomen, $nin: result },
        id: { $nin: listJoinCall },
        deactive: { $ne: true },
      })
      .select('id email -_id');

    if (!checkUserMan || !checkUserWoman) return;

    let guild = client.guilds.fetch('921239248991055882');
    const getAllVoice = client.channels.cache.filter(
      (guild) =>
        guild.type === 'GUILD_VOICE' && guild.parentId === '921239248991055884'
    );
    const voiceChannel = getAllVoice.map((item) => item.id);
    let roomMap = [];
    let countVoice = 0;

    for (let i = 0; i < 5; i++) {
      let checkCaseMan = [];
      let checkCaseWoman = [];
      const arr = [0, 1, 2, 3];
      randomOne = Math.floor(Math.random() * arr.length);
      arrMan = arr[randomOne];
      arr.splice(arrMan, 1);
      randomTwo = Math.floor(Math.random() * arr.length);
      arrWoman = arr[randomTwo];
      console.log(arrMan);
      console.log(arrWoman);

      userMan.map((man) => {
        if (man.branch === arrMan && man.email) checkCaseMan.push(man.email);
      });

      userWomen.map((women) => {
        if (women.branch === arrWoman && women.email)
          checkCaseWoman.push(women.email);
      });

      checkUserMan.map((item) => {
        resCheckUserMan.push(item.email);
      });
      const datingUserMan = resCheckUserMan.filter((item) =>
        checkCaseMan.includes(item)
      );

      checkUserWoman.map((item) => {
        resCheckUserWoman.push(item.email);
      });

      const datingUserWoman = resCheckUserWoman.filter((item) =>
        checkCaseWoman.includes(item)
      );

      if (datingUserMan.length > 0 && datingUserWoman.length > 0) {
        indexMan = Math.floor(Math.random() * datingUserMan.length);
        indexWoman = Math.floor(Math.random() * datingUserWoman.length);
        randomMan = datingUserMan[indexMan];
        randomWoman = datingUserWoman[indexWoman];
        dating.push(randomMan, randomWoman);

        checkUserMan.map((item) => {
          dating.map((dt) => {
            if (item.email === dt && !datingIdMan.includes(item.id)) {
              datingIdMan.push(item.id);
              datingEmailMAn.push(item.email);
            }
          });
        });
        checkUserWoman.map((item) => {
          dating.map((dt) => {
            if (item.email === dt && !datingIdWoman.includes(item.id)) {
              datingIdWoman.push(item.id);
              datingEmailWoman.push(item.email);
            }
          });
        });
      } else continue;
    }

    voiceChannel.map(async (voice, index) => {
      const userDiscord = await client.channels.fetch(voice);

      if (userDiscord.members.size > 0) {
        countVoice++;
      }
      if (userDiscord.members.size === 0) {
        roomMap.push(userDiscord.id);
      }
      if (index === voiceChannel.length - 1) {
        if (countVoice === voiceChannel.length) {
          {
            const fetchChannelFull = await client.channels.fetch(
              '956782882226073610'
            );
            fetchChannelFull.send(`Voice channel full`);
          }
        } else {
          const nowFetchChannel = await client.channels.fetch(
            '956782882226073610'
          );
          for (i = 0; i < datingIdWoman.length; i++) {
            if (roomMap.length !== 0) {
              await nowFetchChannel.send(
                `Hãy vào <#${roomMap[0]}> trò chuyện cuối tuần thôi nào <@${datingIdMan[i]}> <@${datingIdWoman[i]}>`
              );
              await new datingData({
                channelId: roomMap[0],
                userId: datingIdMan[i],
                email: datingEmailMAn[i],
                createdTimestamp: Date.now(),
                sex: 0,
                loop: i,
              })
                .save()
                .catch((err) => console.log(err));

              await new datingData({
                channelId: roomMap[0],
                userId: datingIdWoman[i],
                email: datingEmailWoman[i],
                createdTimestamp: Date.now(),
                sex: 1,
                loop: i,
              })
                .save()
                .catch((err) => console.log(err));
              roomMap.shift(roomMap[0]);
            } else nowFetchChannel.send(`Voice channel full`);
          }
        }
      }
    });
  }

  if (minute > 0 && minute < 6) {
    let idManPrivate = [];
    let idWomanPrivate = [];
    let idVoice = [];

    const timeNow = new Date();
    const timeStart = timeNow.setHours(0, 0, 0, 0);
    const timeEnd = timeNow.setHours(23, 0, 0, 0);
    const findDating = await datingData
      .find({
        createdTimestamp: {
          $gte: timeStart,
          $lte: timeEnd,
        },
      })
      .sort({ loop: 1 });

    findDating.map((item) => {
      if (item.sex === 0) {
        idManPrivate.push(item.userId);
        idVoice.push(item.channelId);
      } else idWomanPrivate.push(item.userId);
    });

    let fetchGuild = client.guilds.fetch('921239248991055882');
    const getAllVoicePrivate = client.channels.cache.filter(
      (guild) =>
        guild.type === 'GUILD_VOICE' && guild.parentId === '956767420377346088'
    );
    const voiceChannelPrivate = getAllVoicePrivate.map((item) => item.id);
    let roomMapPrivate = [];
    let countVoicePrivate = 0;

    voiceChannelPrivate.map(async (voice, index) => {
      const userDiscordPrivate = await client.channels.fetch(voice);

      if (userDiscordPrivate.members.size > 0) {
        countVoicePrivate++;
      }
      if (userDiscordPrivate.members.size === 0) {
        roomMapPrivate.push(userDiscordPrivate.id);
      }
      if (index === voiceChannelPrivate.length - 1) {
        for (i = 0; i < idWomanPrivate.length; i++) {
          const fetchVoiceNcc8 = await client.channels.fetch(idVoice[i]);
          if (fetchVoiceNcc8.guild.members) {
            const targetMan = await fetchVoiceNcc8.guild.members.fetch(
              idManPrivate[i]
            );
            if (targetMan && targetMan.voice && targetMan.voice.channelId)
              targetMan.voice.setChannel(roomMapPrivate[0]);
            const targetWoman = await fetchVoiceNcc8.guild.members.fetch(
              idWomanPrivate[i]
            );
            if (targetWoman && targetWoman.voice && targetWoman.voice.channelId)
              targetWoman.voice.setChannel(roomMapPrivate[0]);
          }
          roomMapPrivate.shift(roomMapPrivate[0]);
        }
      }
    });
  }
}

async function sendQuizEnglish(client) {
  try {
    let userOff = [];
    try {
      const { notSendUser } = await getUserOffWork();
      userOff = notSendUser;
    } catch (error) {
      console.log(error);
    }

    const userSendQuiz = await userData
      .find({
        email: { $nin: userOff },
        deactive: { $ne: true },
      })
      .select('id roles username -_id');

    await Promise.all(
      userSendQuiz.map((user) =>
        sendQuizToSingleUser(client, user, false, 'english')
      )
    );
  } catch (error) {
    console.log(error);
  }
}

async function sendMesageRemind(client) {
  try {
    const data = await remindData.find({ cancel: false });

    const now = new Date();
    now.setHours(now.getHours() + 7);
    const hourDateNow = now.getHours();
    const dateNow = now.toLocaleDateString('en-US');
    const minuteDateNow = now.getMinutes();

    data.map(async (item) => {
      let checkFiveMinute;
      let hourTimestamp;

      const dateScheduler = new Date(+item.createdTimestamp);
      const minuteDb = dateScheduler.getMinutes();

      if (minuteDb >= 0 && minuteDb <= 4) {
        checkFiveMinute = minuteDb + 60 - minuteDateNow;
        const hourDb = dateScheduler;
        setHourTimestamp = hourDb.setHours(hourDb.getHours() - 1);
        hourTimestamp = new Date(setHourTimestamp).getHours();
      } else {
        checkFiveMinute = minuteDb - minuteDateNow;
        hourTimestamp = dateScheduler.getHours();
      }

      const dateCreatedTimestamp = new Date(
        +item.createdTimestamp.toString()
      ).toLocaleDateString('en-US');

      if (
        hourDateNow === hourTimestamp &&
        0 <= checkFiveMinute &&
        checkFiveMinute <= 5 &&
        dateCreatedTimestamp === dateNow
      ) {
        const fetchChannel = await client.channels.fetch(item.channelId);
        fetchChannel.send(
          `<@${item.mentionUserId}>, due today ${item.content} of <@${item.authorId}>`
        );
        await remindData.updateOne({ _id: item._id }, { cancel: true });
      }
    });
  } catch (error) {
    console.log(error);
  }
}

function cronJobOneMinute(client) {
  sendMesageRemind(client);
  kickMemberVoiceChannel(client);
  updateReminderMeeting(client);
  tagMeeting(client);
}

exports.scheduler = {
  run(client) {
    new cron.CronJob(
      '*/1 * * * *',
      () => cronJobOneMinute(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
    new cron.CronJob(
      '0-5/1 17 * * 5',
      () => dating(client),
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
    new cron.CronJob(
      '0 9,11,14,16 * * 1-5',
      () => sendQuizEnglish(client),
      null,
      false,
      'Asia/Ho_Chi_Minh'
    ).start();
  },
};
