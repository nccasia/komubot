const userData = require('../models/userData');
const wfhData = require('../models/wfhData');
const {
  MessageActionRow,
  MessageButton,
	MessageEmbed
} = require('discord.js');

getUserIdByUsername = async(client, req, res) => {
  if (!req.get("X-Secret-Key") || req.get("X-Secret-Key") !== client.config.komubotrest.komu_bot_secret_key) {
    res.status(403).send({ message: "Missing secret key!" });
    return;
  }

  if (!req.body.username) {
    res.status(400).send({ message: "username can not be empty!" });
    return;
  }

  const userdb = await userData.findOne({$or: [
    {email: req.body.username},
    {username: req.body.username},
  ]});

  if (!userdb) {
    res.status(400).send({ message: "User not found!" });
    return;
  }

  res.status(200).send({ username: req.body.username, userid: userdb.id });
}

module.exports.sendMessageKomuToUser = sendMessageKomuToUser = async(client, msg, username) => {
  try {
    const userdb = await userData.findOne({$or: [
      {email: username},
      {username: username},
    ]}).catch(console.error);
    if (!userdb) {
      return null;
    }        
    const user = await client.users.fetch(userdb.id).catch(console.error);
    if (msg == null) {
      return user;
    }
    if (!user) {
      // notify to machleo channel
      const message = `<@${client.config.komubotrest.admin_user_id}> ơi, đồng chí ${username} không đúng format rồi!!!`;
      await client.channels.cache.get(client.config.komubotrest.machleo_channel_id).send(message).catch(console.error);
      return null;
    }
    await user.send(msg);
    return user;
  } catch (error) {
    console.log('error', error);
    const message = `<@${client.config.komubotrest.admin_user_id}> ơi, KOMU không thể gửi tin nhắn cho ${username}!!!`;
    await client.channels.cache.get(client.config.komubotrest.machleo_channel_id).send(message).catch(console.error);
    return null;
  }
}

sendMessageToUser = async(client, req, res) => {
  if (!req.get("X-Secret-Key") || req.get("X-Secret-Key") !== client.config.komubotrest.komu_bot_secret_key) {
    res.status(403).send({ message: "Missing secret key!" });
    return;
  }

  if (!req.body.username) {
    res.status(400).send({ message: "username can not be empty!" });
    return;
  }

  if (!req.body.message) {
    res.status(400).send({ message: "Message can not be empty!" });
    return;
  }
  const username = req.body.username;
  const message = req.body.message;

  try {
    const user = await sendMessageKomuToUser(client, message, username);
    if(!user) {
      res.status(400).send({ message: "Error!" });
      return;
    }
    res.status(200).send({ message: "Successfully!" });
  } catch (error) {
    console.log('error', error);
    res.status(400).send({ message: error });
  }
}

// send image check in to user
sendImageCheckInToUser = async (client, req, res) => {
  // Validate request
  if (!req.get("X-Secret-Key") || req.get("X-Secret-Key") !== client.config.komubotrest.komu_bot_secret_key) {
    res.status(403).send({ message: "Missing secret key!" });
    return;
  }
  if (!req.body.username) {
    res.status(400).send({ message: "username can not be empty!" });
    return;
  }
  if (!req.body.verifiedImageId) {
    res.status(400).send({ message: "VerifiedImageId can not be empty!" });
    return;
  }
  const verifiedImageId = req.body.verifiedImageId.replace(/ /g, "");
  const username = req.body.username;
  try {
    const user = await sendMessageKomuToUser(client, null, username);
    if(!user) {
      res.status(400).send({ message: "Error!" });
      return;
    }

    const path = req.body.pathImage.replace(/\\/g, '/');
    if (!path) {
      res.status(400).send({ message: "Path can not be empty!" });
      return;
    }

    const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('komu_checkin_yes#' + verifiedImageId)
					.setLabel('Yes')
					.setStyle('PRIMARY'),
        new MessageButton()
					.setCustomId('komu_checkin_no#' + verifiedImageId)
					.setLabel('No')
					.setStyle('SECONDARY'),
			);

    const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('Bạn vừa check-in thành công!')
			.setURL('https://komu.vn')
			.setImage('attachment://checkin.jpg')
			.setDescription('Đây có phải là bạn không?');
	
	  await user.send({ embeds: [embed], files: [path], components: [row] });    
    res.status(200).send({ message: "Successfully!" });
  } catch (error) {
    console.log("ERROR: " + error);
    res.status(400).send({ message: error });
  }
};

sendImageLabelToUser = async (client, req, res) => {
  if (!req.get("X-Secret-Key") || req.get("X-Secret-Key") !== client.config.komubotrest.komu_bot_secret_key) {
    res.status(403).send({ message: "Missing secret key!" });
    return;
  }
  if (!req.body.username) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  if (!req.body.imageLabelId) {
    res.status(400).send({ message: "ImageLabelId can not be empty!" });
    return;
  }
  const imagelabel = req.body.imageLabelId.replace(/ /g, "");
  const username = req.body.username;
  try {
    const user = await sendMessageKomuToUser(client, null, username);
    if(!user) {
      res.status(400).send({ message: "Error!" });
      return;
    }

    const path = req.body.pathImage.replace(/\\/g, '/');
    let messages = "";
    let label1 = "";
    let label2 = "";
    if (req.body.questionType == "VERIFY_EMOTION") {
      messages = `Cảm xúc của người trong ảnh là gì?`;
      label1 = `Good`;
      label2 = `Bad`;
    } else {
      messages = `Đây có phải là bạn không?`;
      label1 = `Yes`;
      label2 = `No`;
    }

    const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('komu_wfh_lbl1#' + imagelabel)
					.setLabel(label1)
					.setStyle('PRIMARY'),
                new MessageButton()
					.setCustomId('komu_wfh_lbl2#' + imagelabel)
					.setLabel(label2)
					.setStyle('SECONDARY'),    
			);

    const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('Bạn hãy trả lời tin nhắn WFH!')
			.setURL('https://komu.vn')
			.setImage('attachment://checkin.jpg')
			.setDescription(messages);

    await user.send({ embeds: [embed], files: [path], components: [row] });
    res.status(200).send({ message: "Successfully!" });
  } catch (error) {
    console.log("ERROR: " + error);
    res.status(400).send({ message: error });
  }
}

sendMessageToChannel = async(client, req, res) => {    
  if (!req.get("X-Secret-Key") || req.get("X-Secret-Key") !== client.config.komubotrest.komu_bot_secret_key) {
    res.status(403).send({ message: "Missing secret key!" });
    return;
  }

  if (!req.body.channelid) {
    res.status(400).send({ message: "ChannelId can not be empty!" });
    return;
  }

  if (!req.body.message) {
    res.status(400).send({ message: "Message can not be empty!" });
    return;
  }
  var message = req.body.message;
  const channelid = req.body.channelid;
  
  if (req.body.machleo == true && req.body.machleo_userid != undefined) {
    const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('komu_wfh_complain#'+req.body.machleo_userid+'#'+req.body.wfhid)
					.setLabel('I\'am in daily call')
          .setEmoji('⏳')
					.setStyle('DANGER'),
				new MessageButton()
					.setCustomId('komu_wfh_accept#'+req.body.machleo_userid+'#'+req.body.wfhid)
					.setLabel('Accept')
          .setEmoji('✍')
					.setStyle('PRIMARY'),	
				//new MessageButton()
				//	.setCustomId('komu_wfh_accept_but#'+req.body.machleo_userid+'#'+req.body.wfhid)
				//	.setLabel('Accept But...')
        //  .setEmoji('✍')
				//	.setStyle('SECONDARY'),
			);
    message = { content: message, components: [row] };
  }

  try {
    channel = await client.channels.fetch(channelid);
    await channel.send(message);
    res.status(200).send({ message: "Successfully!" });
  } catch (error) {
    console.log('error', error);
    res.status(400).send({ message: error });
  }
}

sendMessageToMachLeo = async(client, req, res) => {
  req.body.channelid = client.config.komubotrest.machleo_channel_id;
  if (!req.body.username) {
    res.status(400).send({ message: "username can not be empty!" });
    return;
  }
  if (!req.body.createdate) {
    res.status(400).send({ message: "createdate can not be empty!" });
    return;
  }

  const userdb = await userData.findOne({$or: [
    {email: req.body.username},
    {username: req.body.username},
  ]});
  var userid = "";
  req.body.message =  ` không trả lời tin nhắn WFH lúc ${req.body.createdate} !\n`;

  if (!userdb) {
    console.log("User not found in DB!", req.body.username);
    req.body.message += `<@${client.config.komubotrest.admin_user_id}> ơi, đồng chí ${req.body.username} không đúng format rồi!!!`
    userid = req.body.username;
  } else {
    req.body.machleo_userid = userdb.id;
    userid = userdb.id;
  }

  req.body.message = `<@${userid}>` + req.body.message;
  req.body.machleo = true;

  // store to db
  const data = await new wfhData({
    userid: userid,
    wfhMsg: req.body.message,
    complain: false,
    pmconfirm: false,
    status: "ACTIVE",
  }).save().catch(err => {
    console.log("Error: ", err);
    res.status(400).send({ message: err });
    return;
  });

  req.body.wfhid = data._id.toString();
  await sendMessageToChannel(client, req, res);
}

sendMessageToThongBaoPM = async(client, req, res) => {
  req.body.channelid = client.config.komubotrest.thongbao_pm_channel_id;
  await sendMessageToChannel(client, req, res);
}

sendMessageToThongBao = async(client, req, res) => {
  req.body.channelid = client.config.komubotrest.thongbao_channel_id;
  await sendMessageToChannel(client, req, res);
}

sendMessageToFinance = async(client, req, res) => {
  req.body.channelid = client.config.komubotrest.finance_channel_id;
  await sendMessageToChannel(client, req, res);
}

exports.init = async(client) => {
  const express = require("express")
  const bodyParser = require('body-parser')
  const app = express()
  app.use(bodyParser.json())
  app.post("/getUserIdByUsername", (req, res) => { getUserIdByUsername(client, req, res); });
  app.post("/sendMessageToUser", (req, res) => { sendMessageToUser(client, req, res); });
  app.post("/sendMessageToChannel", (req, res) => { sendMessageToChannel(client, req, res); });
  app.post("/sendImageCheckInToUser", (req, res) => { sendImageCheckInToUser(client, req, res); });
  app.post("/sendImageLabelToUser", (req, res) => { sendImageLabelToUser(client, req, res); });
  app.post("/sendMessageToMachLeo", (req, res) => { sendMessageToMachLeo(client, req, res); });
  app.post("/sendMessageToThongBao", (req, res) => { sendMessageToThongBao(client, req, res); });
  app.post("/sendMessageToThongBaoPM", (req, res) => { sendMessageToThongBaoPM(client, req, res); });
  app.post("/sendMessageToFinance", (req, res) => { sendMessageToFinance(client, req, res); });

  app.listen(client.config.komubotrest.http_port, client.config.komubotrest.http_ip, () => console.log(`Server is listening on port ${client.config.komubotrest.http_port}!`));
}