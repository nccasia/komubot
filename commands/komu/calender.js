const meetingData = require('../../models/meetingData');

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  const d = [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/');

  const t = [
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
  ].join(':');

  return `${d} ${t}`;
}

module.exports = {
  name: 'calender',
  description: 'Calender',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      if (args[0] === 'list') {
        const calenderChannel = message.channelId;
        const list = await meetingData.find({
          channelId: calenderChannel,
          cancel: { $ne: true },
        });
        let mess;

        if (!list) {
          return;
        } else if (Array.isArray(list) && list.length === 0) {
          mess = '```' + 'No Calender' + '```';
          return message.channel.send(mess).catch(console.error);
        } else {
          for (let i = 0; i <= Math.ceil(list.length / 50); i += 1) {
            if (list.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess =
              '```' +
              'Calender' +
              '\n' +
              list
                .slice(i * 50, (i + 1) * 50)
                .map((item) => {
                  const d = formatDate(new Date(Number(item.createdTimestamp)));
                  return `- ${item.task} ${d} (ID: ${item._id})`;
                })
                .join('\n') +
              '```';
            await message.channel.send(mess).catch(console.error);
          }
        }
      } else if (args[0] === 'cancel') {
        if (!args[1])
          return message.channel
            .send('```' + '*report help' + '```')
            .catch(console.error);
        const id = args[1];
        const findId = await meetingData.findOneAndUpdate(
          { _id: id },
          { cancel: true }
        );

        if (!findId) {
          return;
        } else {
          return message.channel
            .send('delete calender successfully')
            .catch(console.error);
        }
      } else if (args[0] === 'help') {
        return message.channel
          .send(
            '```' +
              '*calender options' +
              '\n' +
              'options  ' +
              '\n' +
              [
                { name: 'list', des: 'list calender' },
                { name: 'cancel _Id', des: 'cancel calender' },
              ]
                .map((item) => `- ${item.name} : ${item.des}`)
                .join('\n') +
              '```'
          )
          .catch(console.error);
      } else {
        return message.channel
          .send('```' + '*report help' + '```')
          .catch(console.error);
      }
    } catch (err) {
      console.log(err);
    }
  },
};
