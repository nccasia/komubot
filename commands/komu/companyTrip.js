const companyTripData = require('../../models/companyTripData');
const { MessageEmbed } = require('discord.js');

const transArgs = (userArgs) => {
  if (userArgs.includes('<@!')) {
    return {
      id: userArgs.slice(3, userArgs.length - 1),
    };
  } else {
    return { username: userArgs };
  }
};

module.exports = {
  name: 'roommate',
  description: 'NCC company trip',
  cat: 'komu',
  async execute(message, args) {
    try {
      if (args[0]) {
        const userArgs = transArgs(args[0]);
        const userMention = await companyTripData.find({
          userId: userArgs.id,
          year: '2022',
        });

        if (userMention.length === 0) {
          message.reply({
            content:
              'Người này không có trong danh sách. Hẹn gặp vào NCC COMPANY TRIP 2023',
            ephemeral: true,
          });
        }

        userMention.map(async (item) => {
          const listUserRoomMention = await companyTripData.find({
            room: item.room,
            year: '2022',
          });

          roomTripMention = listUserRoomMention
            .map(
              (room) =>
                `<@${room.userId}> văn phòng ${room.office} (${room.role})`
            )
            .join('\n');
          messMention = userMention
            .map((list) => `Danh sách phòng ${list.room} \n${roomTripMention}`)
            .join('\n');
          const EmbedMention = new MessageEmbed()
            .setTitle(`Chào mừng bạn đến với NCC COMPANY TRIP 2022`)
            .setColor('RED')
            .setDescription(`${messMention}`);
          await message.reply({ embeds: [EmbedMention] }).catch(console.error);
        });
      } else {
        const author = message.author.id;

        const user = await companyTripData.find({
          userId: author,
          year: '2022',
        });

        if (user.length === 0) {
          message.reply({
            content: 'Hẹn gặp bạn vào NCC COMPANY TRIP 2023',
            ephemeral: true,
          });
        }

        user.map(async (item) => {
          const listUserRoom = await companyTripData.find({
            room: item.room,
            year: '2022',
          });

          roomTrip = listUserRoom
            .map(
              (room) =>
                `<@${room.userId}> văn phòng ${room.office} (${room.role})`
            )
            .join('\n');
          mess = user
            .map((list) => `Danh sách phòng ${list.room} \n${roomTrip}`)
            .join('\n');
          const Embed = new MessageEmbed()
            .setTitle(`Chào mừng bạn đến với NCC COMPANY TRIP 2022`)
            .setColor('RED')
            .setDescription(`${mess}`);
          await message.reply({ embeds: [Embed] }).catch(console.error);
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};
