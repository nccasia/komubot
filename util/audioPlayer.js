const {
  createAudioResource,
  createAudioPlayer,
  joinVoiceChannel,
} = require('@discordjs/voice');
const { createReadStream } = require('fs');
const uploadFileData = require('../models/uploadFileData');
const { join } = require('path');

function withoutFirstTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getLastSundayLastWeek() {
  const date = new Date();
  const today = date.getDate();
  const dayOfTheWeek = date.getDay();
  const newDate = date.setDate(today - (dayOfTheWeek || 0));
  return new Date(withoutFirstTime(newDate)).valueOf();
}

function getLastSundayNextWeek() {
  const date = new Date();
  const today = date.getDate();
  const dayOfTheWeek = date.getDay();
  const newDate = date.setDate(today - (dayOfTheWeek - 7 || 7));
  return new Date(withoutFirstTime(newDate)).valueOf();
}

async function audioPlayer(client, message, episode) {
  try {
    const channel = await client.channels.fetch('921323636491710504');
    const player = createAudioPlayer();

    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    }).subscribe(player);
    let dataMp3;
    if (!episode) {
      dataMp3 = await uploadFileData
        .find({
          createdTimestamp: {
            $gte: getLastSundayLastWeek(),
            $lte: getLastSundayNextWeek(),
          },
        })
        .sort({ _id: -1 })
        .limit(1);
    } else {
      dataMp3 = await uploadFileData.find({
        episode,
      });
      if (dataMp3.length === 0) {
        return message.reply('not released yet');
      }
    }

    const fileNameMp3 = dataMp3.map((item) => {
      return item.fileName;
    });

    const resource = await createAudioResource(
      createReadStream(join('uploads', `${fileNameMp3[0]}`))
    );

    player.play(resource);

    if (episode && message) {
      message.channel.send(`@here go to <#921323636491710504>`);
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = audioPlayer;
