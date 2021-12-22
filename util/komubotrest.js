const userData = require('../models/userData');
const {
  MessageActionRow,
  MessageButton,
	MessageEmbed
} = require('discord.js');

sendMessageKomuToUser = async(client, msg, username) => {
  try {
    const userdb = await userData.findOne({username: username});
    if (!userdb) {
        return null;
    }        
    const user = await client.users.fetch(userdb.id);
    if (!user) {
        return null;
    }
    await user.send(msg);
    return user;
  } catch (error) {
    console.log('error', error);
    return null;
  }
}

sendMessageToUser = async(client, req, res) => {
  if(!req.get("X-Secret-Key") || req.get("X-Secret-Key") !== client.config.komubotrest.komu_bot_secret_key) {
    res.status(403).send({message: "Missing secret key!"});
  }
  if (!req.body.userName) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  const userName = req.body.userName;
  const mess = req.body.message;
  sendMessageKomuToUser(client, mess, userName).then(user => {
    if(user) {
      res.status(200).send({message: "Successfully!"});
    } else {
      res.status(400).send({message: "Error!"});
    }
  });
}

// send image check in to user
sendImageCheckInToUser = async (client, req, res) => {
  // Validate request
  if (!req.get("X-Secret-Key") || req.get("X-Secret-Key") !== client.config.komubotrest.komu_bot_secret_key) {
    res.status(403).send({ message: "Missing secret key!" });
    return;
  }
  if (!req.body.username) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  const username = req.body.username;
  try {
    const user = await sendMessageKomuToUser(client, 'Bạn vừa check-in thành công!', username);
    if(!user) {
        res.status(400).send({ message: "Error!" });
        return;
    }

    const path = req.body.pathImage.replace(/\\/g, '/');

    const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('komu_checkin_yes')
					.setLabel('Yes')
					.setStyle('PRIMARY'),
                new MessageButton()
					.setCustomId('komu_checkin_no')
					.setLabel('No')
					.setStyle('SECONDARY'),
			);

    const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('Komu daily checkin')
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
  
  const username = req.body.username;
  try {
    const user = await sendMessageKomuToUser(client, 'Bạn hãy trả lời tin nhắn WFH!', username);
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
					.setCustomId('komu_wfh_lbl1')
					.setLabel(label1)
					.setStyle('PRIMARY'),
                new MessageButton()
					.setCustomId('komu_wfh_lbl2')
					.setLabel(label2)
					.setStyle('SECONDARY'),    
			);

    const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('Komu WFH ping pong')
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

  const message = req.body.message;
  const channelid = req.body.channelid;

  try {
    client.channels.cache.get(channelid).send(message).then(() => {
      res.status(200).send({ message: "Successfully!" });
    }).catch(err => {
      res.status(400).send({ message: err });
    });
  } catch (error) {
    console.log('error', error);
  }
}

sendMessageToMachLeo = async(client, req, res) => {
  req.body.channelid = client.config.komubotrest.machleo_channel_id;
  req.body.message =  `<@${userName}> không trả lời tin nhắn WFH lúc ${createDate} !`;
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

exports.init = async(client) => {
  const express = require("express")
  const bodyParser = require('body-parser')
  const app = express()
  app.use(bodyParser.json())
  
  app.post("/sendMessageToChannel", (req, res) => { sendMessageToChannel(client, req, res); });

  app.post("/sendImageCheckInToUser", (req, res) => { sendImageCheckInToUser(client, req, res); });

  app.post("/sendImageLabelToUser", (req, res) => { sendImageLabelToUser(client, req, res); });

  app.post("/sendMessageToMachLeo", (req, res) => { sendMessageToMachLeo(client, req, res); });

  app.post("/sendMessageToThongBao", (req, res) => { sendMessageToThongBao(client, req, res); });

  app.post("/sendMessageToThongBaoPM", (req, res) => { sendMessageToThongBaoPM(client, req, res); });

  app.listen(client.config.komubotrest.http_port, client.config.komubotrest.http_ip, () => console.log(`Server is listening on port ${client.config.komubotrest.bodyParserhttp_port}!`));
}