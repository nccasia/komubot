const axios = require("axios");
const wfhData = require("../models/wfhData");

async function reportWfh(message, args, client, guildDB) {
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

  const wfhFullday = await wfhData.find({
    $or: [{ status: "ACCEPT" }, { status: "ACTIVE" }],
  });

  let mess;
  if (!wfhFullday) {
    return;
  } else if (Array.isArray(wfhFullday) && wfhFullday.length === 0) {
    mess = "```" + "Không có ai vi phạm trong ngày" + "```";
    return message.channel.send(mess).catch(console.error);
  } else {
    for (let i = 0; i <= Math.ceil(wfhFullday.length / 50); i += 1) {
      if (wfhFullday.slice(i * 50, (i + 1) * 50).length === 0) break;
      mess =
        "```" +
        "Những người không check bot trong ngày hôm nay" +
        "```" +
        wfhFullday
          .slice(i * 50, (i + 1) * 50)
          .map((wfh, index) => `<@${wfh.userid}> `)
          .join("\n");
      return message.channel.send(mess).catch(console.error);
    }
  }
}

async function reportCompalinWfh(message, args, client, guildDB) {
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

  const wfhFullday = await wfhData.find({
    status: "APPROVED",
    complain: true,
  });

  let mess;
  if (!wfhFullday) {
    return;
  } else if (Array.isArray(wfhFullday) && wfhFullday.length === 0) {
    mess = "```" + "Không có ai được approved trong ngày" + "```";
    return message.channel.send(mess).catch(console.error);
  } else {
    for (let i = 0; i <= Math.ceil(wfhFullday.length / 50); i += 1) {
      if (wfhFullday.slice(i * 50, (i + 1) * 50).length === 0) break;
      mess =
        "```" +
        "Những người được approved trong ngày hôm nay" +
        "```" +
        wfhFullday
          .slice(i * 50, (i + 1) * 50)
          .map((wfh, index) => `<@${wfh.userid}> `)
          .join("\n");
      return message.channel.send(mess).catch(console.error);
    }
  }
}

module.exports = { reportWfh, reportCompalinWfh };
