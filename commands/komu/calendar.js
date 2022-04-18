const meetingData = require('../../models/meetingData');
const { sendErrorToDevTest } = require('../../util/komubotrest');

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
  name: 'calendar',
  description: 'Calendar',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      let authorId = message.author.id;
      if (message.content === '*calendar') {
        const calendarChannel = message.channelId;
        const list = await meetingData.find({
          channelId: calendarChannel,
          cancel: { $ne: true },
        });

        let mess;
        if (!list) {
          return;
        } else if (Array.isArray(list) && list.length === 0) {
          return message
            .reply({
              content: '`✅` No scheduled meeting.',
              ephemeral: true,
            })
            .catch((err) => {
              const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
              sendErrorToDevTest(client, msg);
            });
        } else {
          for (let i = 0; i <= Math.ceil(list.length / 50); i += 1) {
            if (list.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess =
              '```' +
              'Calendar' +
              '\n' +
              list
                .slice(i * 50, (i + 1) * 50)
                .map((item) => {
                  const dateTime = formatDate(
                    new Date(Number(item.createdTimestamp))
                  );
                  if (item.repeatTime) {
                    return `- ${item.task} ${dateTime} (ID: ${item._id}) ${item.repeat} ${item.repeatTime}`;
                  } else {
                    return `- ${item.task} ${dateTime} (ID: ${item._id}) ${item.repeat}`;
                  }
                })
                .join('\n') +
              '```';
            await message
              .reply({
                content: mess,
                ephemeral: true,
              })
              .catch((err) => {
                const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
                sendErrorToDevTest(client, msg);
              });
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
          return message
            .reply({
              content: 'Not found.',
              ephemeral: true,
            })
            .catch((err) => {
              const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
              sendErrorToDevTest(client, msg);
            });
        } else {
          return message
            .reply({
              content: '`✅` Cancel successfully.',
              ephemeral: true,
            })
            .catch((err) => {
              const msg = `KOMU không gửi được tin nhắn cho <@${authorId}> message: ${err.message} httpStatus: ${err.httpStatus} code: ${err.code}.`;
              sendErrorToDevTest(client, msg);
            });
        }
      } else if (args[0] === 'help') {
        return message.channel
          .send(
            '```' +
              '*calendar options' +
              '\n' +
              'options  ' +
              '\n' +
              [
                { name: 'list', des: 'list calendar' },
                { name: 'cancel _Id', des: 'cancel calendar' },
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
