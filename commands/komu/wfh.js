const { sendErrorToDevTest } = require('../../util/komubotrest');
const axios = require('axios');

function getUserNameByEmail(string) {
  if (string.includes('@ncc.asia')) {
    return string.slice(0, string.length - 9);
  }
}

async function getApiWfh(client, date) {
  let wfhGetApi;
  let dataWfh = [];
  try {
    wfhGetApi = await axios.get(`${client.config.wfh.api_url}?date=${date}`, {
      headers: {
        securitycode: process.env.WFH_API_KEY_SECRET,
      },
    });
  } catch (error) {
    console.log(error);
  }

  if (!wfhGetApi || wfhGetApi.data == undefined) {
    return;
  }
  wfhGetApi.data.result.map((item) =>
    dataWfh.push({
      email: getUserNameByEmail(item.emailAddress),
      status: item.status,
    })
  );
  return dataWfh;
}

module.exports = {
  name: 'wfh',
  description: 'WFH',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      if (args[0] === 'daily') {
        let currentDate = new Date();
        let dateTime = new Date(currentDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const month = dateTime.slice(0, 2);
        const day = dateTime.slice(3, 5);
        const year = dateTime.slice(6);

        const date = `${year}-${month}-${day}`;

        const data = await getApiWfh(client, date);

        let mess;
        if (!data) {
          return;
        } else if (Array.isArray(data) && data.length === 0) {
          return message
            .reply({
              content: '`✅` No Data Wfh.',
              ephemeral: true,
            })
            .catch((err) => {
              sendErrorToDevTest(client, authorId, err);
            });
        } else {
          for (let i = 0; i <= Math.ceil(data.length / 50); i += 1) {
            if (data.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess =
              '```' +
              'WFH' +
              '\n' +
              data
                .slice(i * 50, (i + 1) * 50)
                .map((item) => `${item.email} (${item.status})`)
                .join('\n') +
              '```';
            await message
              .reply({
                content: mess,
                ephemeral: true,
              })
              .catch((err) => {
                sendErrorToDevTest(client, authorId, err);
              });
          }
        }
      } else if (args[0] === 'weekly') {
        let dateMondayToSFriday = [];
        const current = new Date();
        const first = current.getDate() - current.getDay();
        const firstday = new Date(current.setDate(first + 1)).toString();
        for (let i = 1; i < 6; i++) {
          const next = new Date(current.getTime());
          next.setDate(first + i);
          const dateTime = new Date(next).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
          dateMondayToSFriday.push(dateTime);
        }
        for (const itemDay of dateMondayToSFriday) {
          const month = itemDay.slice(0, 2);
          const day = itemDay.slice(3, 5);
          const year = itemDay.slice(6);

          const date = `${year}-${month}-${day}`;
          const dateFormat = `${day}-${month}-${year}`;

          const data = await getApiWfh(client, date);

          let mess;
          if (!data) {
            return;
          } else if (Array.isArray(data) && data.length === 0) {
            return message
              .reply({
                content: '`✅` No Data Wfh.',
                ephemeral: true,
              })
              .catch((err) => {
                sendErrorToDevTest(client, authorId, err);
              });
          } else {
            for (let i = 0; i <= Math.ceil(data.length / 50); i += 1) {
              if (data.slice(i * 50, (i + 1) * 50).length === 0) break;
              mess =
                '```' +
                `WFH ${dateFormat}` +
                '\n' +
                data
                  .slice(i * 50, (i + 1) * 50)
                  .map((item) => `${item.email} (${item.status})`)
                  .join('\n') +
                '```';
              await message
                .reply({
                  content: mess,
                  ephemeral: true,
                })
                .catch((err) => {
                  sendErrorToDevTest(client, authorId, err);
                });
            }
          }
        }
      } else {
        let dateTime = args[0];
        const day = dateTime.slice(0, 2);
        const month = dateTime.slice(3, 5);
        const year = dateTime.slice(6);

        const date = `${year}-${month}-${day}`;

        const data = await getApiWfh(client, date);

        let mess;
        if (!data) {
          return;
        } else if (Array.isArray(data) && data.length === 0) {
          return message
            .reply({
              content: '`✅` No Data Wfh.',
              ephemeral: true,
            })
            .catch((err) => {
              sendErrorToDevTest(client, authorId, err);
            });
        } else {
          for (let i = 0; i <= Math.ceil(data.length / 50); i += 1) {
            if (data.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess =
              '```' +
              `WFH ${dateTime}` +
              '\n' +
              data
                .slice(i * 50, (i + 1) * 50)
                .map((item) => `${item.email} (${item.status})`)
                .join('\n') +
              '```';
            await message
              .reply({
                content: mess,
                ephemeral: true,
              })
              .catch((err) => {
                sendErrorToDevTest(client, authorId, err);
              });
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
};
