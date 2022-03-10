const meetingData = require('../../models/meetingData');
const voiceChannelData = require('../../models/voiceChannelData');
const messHelp =
  '```' +
  '*meeting now' +
  '\n' +
  '*meeting task dd/mm/yyyy 00:00 repeat timerepeat' +
  '\n' +
  '*meeting task dd/mm/yyyy 00:00 once' +
  '\n' +
  '*meeting task dd/mm/yyyy 00:00 daily' +
  '\n' +
  '*meeting task dd/mm/yyyy 00:00 weekly' +
  '```';

module.exports = {
  name: 'meeting',
  description: 'Meeting',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      const channel_id = message.channel.id;
      if (!args[0]) {
        return message.channel.send(messHelp);
      }
      if (args[0] === 'now') {
        if (
          message.member.voice.channel &&
          message.member.voice.channel.type === 'GUILD_VOICE'
        ) {
          const voiceCheck = message.member.voice.channel;
          return message.channel.send(
            `Everyone please join the voice channel <#${voiceCheck.id}>`
          );
        } else {
          let guild = await client.guilds.fetch('921239248991055882');
          const getAllVoice = client.channels.cache.filter(
            (guild) =>
              guild.type === 'GUILD_VOICE' &&
              guild.parentId === '921239248991055884'
          );
          const voiceChannel = getAllVoice.map((item) => item.id);

          let roomMap = [];
          let countVoice = 0;
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
              if (countVoice === voiceChannel.length) {
                {
                  const fetchChannelFull = await client.channels.fetch(
                    message.channelId
                  );
                  fetchChannelFull.send(`Voice channel full`);
                }
              } else {
                const nowFetchChannel = await client.channels.fetch(
                  message.channelId
                );
                const roomRandom = Math.floor(Math.random() * roomVoice.length);
                if (roomVoice.length !== 0) {
                  nowFetchChannel.send(
                    `Our meeting room is <#${roomVoice[roomRandom]}>`
                  );
                } else nowFetchChannel.send(`Voice channel full`);
              }
            }
          });
        }
      } else {
        const task = args.slice(0, 1).join(' ');
        const datetime = args.slice(1, 3).join(' ');
        let repeat = args.slice(3, 4).join(' ');
        let repeatTime = args.slice(4, args.length).join(' ');
        const checkDate = args.slice(1, 2).join(' ');
        const checkTime = args.slice(2, 3).join(' ');
        if (
          !/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/.test(
            checkDate
          )
        ) {
          return message.channel.send(messHelp);
        }
        if (!/(2[0-3]|[01][0-9]):[0-5][0-9]/.exec(checkTime)) {
          return message.channel.send(messHelp);
        }

        if (repeat === '') repeat = 'once';
        const list = ['once', 'daily', 'weekly', 'repeat'];
        if (list.includes(repeat) === false)
          return message.channel.send(messHelp);

        const day = datetime.slice(0, 2);
        const month = datetime.slice(3, 5);
        const year = datetime.slice(6);

        const fomat = `${month}/${day}/${year}`;
        const dateObject = new Date(fomat);
        var timestamp = dateObject.getTime();
        const response = await meetingData({
          channelId: channel_id,
          task: task,
          createdTimestamp: timestamp,
          repeat: repeat,
          repeatTime: repeatTime,
        }).save();
        message.reply({ content: '`✅` Meeting saved.', ephemeral: true });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
