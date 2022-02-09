const elsaDailyData = require('../../models/elsaDailyData');
const { elsaReport } = require('../../util/elsaReport');

function getTimeWeekMondayToSunday(dayNow) {
  const curr = new Date();
  const currentWeekDay = curr.getDay();
  const lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;
  const firstweek = new Date(new Date(curr).setDate(curr.getDate() - lessDays));
  const arrayDay = Array.from(
    { length: 9 - dayNow - 1 },
    (v, i) => i + dayNow + 1
  );

  function getDayofWeek(rank) {
    return new Date(
      new Date(firstweek).setDate(firstweek.getDate() + rank - 2)
    );
  }
  return arrayDay.map((item) => getDayofWeek(item));
}

function withoutFirstTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(0, 0, 0, 0);
  return date;
}

function withoutLastTime(dateTime) {
  const date = new Date(dateTime);
  date.setHours(23, 59, 59, 999);
  return date;
}

function getyesterdaydate() {
  const today = new Date();
  const yesterday = new Date(withoutLastTime(today));
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

function gettomorrowdate() {
  const today = new Date();
  const yesterday = new Date(withoutFirstTime(today));
  yesterday.setDate(yesterday.getDate() + 1);
  return yesterday;
}

module.exports = {
  name: 'elsa',
  description: 'Elsa daily english group',
  cat: 'komu',
  async execute(message, args, client, guildDB) {
    try {
      if (args[0] === 'weekly') {
        const daily = args.join(' ');
        if (!daily || daily == undefined) {
          return message
            .reply({
              content: '```please add your daily text```',
              ephemeral: true,
            })
            .catch(console.error);
        }
        getTimeWeekMondayToSunday(new Date().getDay()).map(async (item) => {
          await new elsaDailyData({
            userid: message.author.id,
            email:
              message.member != null || message.member != undefined
                ? message.member.displayName
                : message.author.username,
            daily: daily,
            createdAt: item,
            attachment: false,
            channelid: message.channel.id,
          })
            .save()
            .catch((err) => console.log(err));
        });
        message.reply({
          content: '`✅` Daily elsa weekly saved.',
          ephemeral: true,
        });
      } else if (args[0] === 'day') {
        const daily = args.join(' ');
        if (!daily || daily == undefined) {
          return message
            .reply({
              content: '```please add your daily text```',
              ephemeral: true,
            })
            .catch(console.error);
        }
        await new elsaDailyData({
          userid: message.author.id,
          email:
            message.member != null || message.member != undefined
              ? message.member.displayName
              : message.author.username,
          daily: daily,
          createdAt: new Date(),
          attachment: false,
          channelid: message.channel.id,
        })
          .save()
          .catch((err) => console.log(err));
        message.reply({
          content: '`✅` Daily elsa day saved.',
          ephemeral: true,
        });
      } else if (args[0] === 'report') {
        await elsaReport(message, args, client, guildDB);
      } else if (args[0] === 'daily') {
        const links = [];

        message.attachments.forEach((attachment) => {
          try {
            const imageLink = attachment.proxyURL;
            links.push(imageLink);
          } catch (error) {
            console.error(error);
          }
        });
        if (links.length > 0) {
          await elsaDailyData
            .updateOne(
              {
                userid: message.author.id,
                createdAt: {
                  $gte: getyesterdaydate(),
                  $lte: gettomorrowdate(),
                },
              },
              {
                attachment: true,
              }
            )
            .catch(console.log);
          message.reply({
            content: ' You have successfully submitted your assignment.',
            ephemeral: true,
          });
        }
      } else if (args[0] === 'help') {
        return message.channel
          .send(
            '```' +
              '*elsa options' +
              '\n' +
              'options  ' +
              '\n' +
              [
                { name: 'weekly', des: 'daily weekly' },
                { name: 'day', des: 'daily today' },
                { name: 'report', des: 'show daily' },
                { name: 'daily', des: 'submit homeworks' },
              ]
                .map((item) => `- ${item.name} : ${item.des}`)
                .join('\n') +
              '```'
          )
          .catch(console.error);
      } else {
        return message.channel
          .send('```' + '*elsa help' + '```')
          .catch(console.error);
      }
    } catch (err) {
      console.log(err);
    }
  },
};
