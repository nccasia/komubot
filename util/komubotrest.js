const userData = require('../models/userData');
const wfhData = require('../models/wfhData');
const msgData = require('../models/msgData');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const getUserIdByUsername = async (client, req, res) => {
  if (
    !req.get('X-Secret-Key') ||
    req.get('X-Secret-Key') !== client.config.komubotrest.komu_bot_secret_key
  ) {
    res.status(403).send({ message: 'Missing secret key!' });
    return;
  }

  if (!req.body.username) {
    res.status(400).send({ message: 'username can not be empty!' });
    return;
  }

  const userdb = await userData.findOne({
    $or: [
      { email: req.body.username, deactive: { $ne: true } },
      { username: req.body.username, deactive: { $ne: true } },
    ],
  });

  if (!userdb) {
    res.status(400).send({ message: 'User not found!' });
    return;
  }

  res.status(200).send({ username: req.body.username, userid: userdb.id });
};

const sendMessageKomuToUser = async (
  client,
  msg,
  username,
  botPing = false
) => {
  try {
    const userdb = await userData
      .findOne({
        $or: [
          { email: username, deactive: { $ne: true } },
          { username: username, deactive: { $ne: true } },
        ],
      })
      .catch(console.error);
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
      await client.channels.cache
        .get(client.config.komubotrest.machleo_channel_id)
        .send(message)
        .catch(console.error);
      return null;
    }
    const sent = await user.send(msg);
    const newMessage = new msgData(sent);
    await newMessage.save();
    if (botPing) {
      userdb.last_bot_message_id = sent.id;
      userdb.botPing = true;
    }
    await userdb.save();
    return user;
  } catch (error) {
    console.log('error', error);
    const message = `KOMU không gửi được tin nhắn cho <@${userdb.id}>. Hãy ping <@${client.config.komubotrest.admin_user_id}> để được hỗ trợ nhé!!!`;
    await client.channels.cache
      .get(client.config.komubotrest.machleo_channel_id)
      .send(message)
      .catch(console.error);
    const messageItAdmin = `KOMU không gửi được tin nhắn cho <@${userdb.id}>. <@${client.config.komubotrest.admin_user_id}> hỗ trợ nhé!!!`;
    await client.channels.cache
      .get(client.config.komubotrest.itadmin_channel_id)
      .send(messageItAdmin)
      .catch(console.error);
    return null;
  }
};

const sendMessageToUser = async (client, req, res) => {
  if (
    !req.get('X-Secret-Key') ||
    req.get('X-Secret-Key') !== client.config.komubotrest.komu_bot_secret_key
  ) {
    res.status(403).send({ message: 'Missing secret key!' });
    return;
  }

  if (!req.body.username) {
    res.status(400).send({ message: 'username can not be empty!' });
    return;
  }

  if (!req.body.message) {
    res.status(400).send({ message: 'Message can not be empty!' });
    return;
  }
  const username = req.body.username;
  const message = req.body.message;

  try {
    const user = await sendMessageKomuToUser(client, message, username);
    if (!user) {
      res.status(400).send({ message: 'Error!' });
      return;
    }
    res.status(200).send({ message: 'Successfully!' });
  } catch (error) {
    console.log('error', error);
    res.status(400).send({ message: error });
  }
};

// send image check in to user
const sendImageCheckInToUser = async (client, req, res) => {
  // Validate request
  if (
    !req.get('X-Secret-Key') ||
    req.get('X-Secret-Key') !== client.config.komubotrest.komu_bot_secret_key
  ) {
    res.status(403).send({ message: 'Missing secret key!' });
    return;
  }
  if (!req.body.username) {
    res.status(400).send({ message: 'username can not be empty!' });
    return;
  }
  if (!req.body.verifiedImageId) {
    res.status(400).send({ message: 'VerifiedImageId can not be empty!' });
    return;
  }
  const verifiedImageId = req.body.verifiedImageId.replace(/ /g, '');
  const username = req.body.username;
  try {
    const user = await sendMessageKomuToUser(client, null, username);
    if (!user) {
      res.status(400).send({ message: 'Error!' });
      return;
    }

    const path = req.body.pathImage.replace(/\\/g, '/');
    if (!path) {
      res.status(400).send({ message: 'Path can not be empty!' });
      return;
    }

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('komu_checkin_yes#' + verifiedImageId)
        .setLabel('Yes')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('komu_checkin_no#' + verifiedImageId)
        .setLabel('No')
        .setStyle('SECONDARY')
    );

    const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Bạn vừa check-in thành công!')
      .setURL('https://komu.vn')
      .setImage('attachment://checkin.jpg')
      .setDescription('Đây có phải là bạn không?');

    await user.send({ embeds: [embed], files: [path], components: [row] });
    res.status(200).send({ message: 'Successfully!' });
  } catch (error) {
    console.log('ERROR: ' + error);
    res.status(400).send({ message: error });
  }
};

const sendImageLabelToUser = async (client, req, res) => {
  if (
    !req.get('X-Secret-Key') ||
    req.get('X-Secret-Key') !== client.config.komubotrest.komu_bot_secret_key
  ) {
    res.status(403).send({ message: 'Missing secret key!' });
    return;
  }
  if (!req.body.username) {
    res.status(400).send({ message: 'Content can not be empty!' });
    return;
  }
  if (!req.body.imageLabelId) {
    res.status(400).send({ message: 'ImageLabelId can not be empty!' });
    return;
  }
  const imagelabel = req.body.imageLabelId.replace(/ /g, '');
  const username = req.body.username;
  try {
    const user = await sendMessageKomuToUser(client, null, username);
    if (!user) {
      res.status(400).send({ message: 'Error!' });
      return;
    }

    const path = req.body.pathImage.replace(/\\/g, '/');
    let messages = '';
    let label1 = '';
    let label2 = '';
    if (req.body.questionType == 'VERIFY_EMOTION') {
      messages = 'Cảm xúc của người trong ảnh là gì?';
      label1 = 'Good';
      label2 = 'Bad';
    } else {
      messages = 'Đây có phải là bạn không?';
      label1 = 'Yes';
      label2 = 'No';
    }

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('komu_wfh_lbl1#' + imagelabel)
        .setLabel(label1)
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('komu_wfh_lbl2#' + imagelabel)
        .setLabel(label2)
        .setStyle('SECONDARY')
    );

    const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Bạn hãy trả lời tin nhắn WFH!')
      .setURL('https://komu.vn')
      .setImage('attachment://checkin.jpg')
      .setDescription(messages);

    await user.send({ embeds: [embed], files: [path], components: [row] });
    res.status(200).send({ message: 'Successfully!' });
  } catch (error) {
    console.log('ERROR: ' + error);
    res.status(400).send({ message: error });
  }
};

const sendMessageToChannel = async (client, req, res) => {
  if (
    !req.get('X-Secret-Key') ||
    req.get('X-Secret-Key') !== client.config.komubotrest.komu_bot_secret_key
  ) {
    res.status(403).send({ message: 'Missing secret key!' });
    return;
  }

  if (!req.body.channelid) {
    res.status(400).send({ message: 'ChannelId can not be empty!' });
    return;
  }

  if (!req.body.message) {
    res.status(400).send({ message: 'Message can not be empty!' });
    return;
  }
  let message = req.body.message;
  const channelid = req.body.channelid;

  if (req.body.machleo && req.body.machleo_userid != undefined) {
    message = getWFHWarninghMessage(
      message,
      req.body.machleo_userid,
      req.body.wfhid
    );
  }

  try {
    const channel = await client.channels.fetch(channelid);
    await channel.send(message);
    res.status(200).send({ message: 'Successfully!' });
  } catch (error) {
    console.log('error', error);
    res.status(400).send({ message: error });
  }
};

const getWFHWarninghMessage = (content, userId, wfhId) => {
  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('komu_wfh_complain#' + userId + '#' + wfhId)
      .setLabel("I'am in daily call")
      .setEmoji('⏳')
      .setStyle('DANGER'),
    new MessageButton()
      .setCustomId('komu_wfh_accept#' + userId + '#' + wfhId)
      .setLabel('Accept')
      .setEmoji('✍')
      .setStyle('PRIMARY')
  );
  return { content, components: [row] };
};

const sendMessageToMachLeo = async (client, req, res) => {
  req.body.channelid = client.config.komubotrest.machleo_channel_id;
  if (!req.body.username) {
    res.status(400).send({ message: 'username can not be empty!' });
    return;
  }
  if (!req.body.createdate) {
    res.status(400).send({ message: 'createdate can not be empty!' });
    return;
  }

  const userdb = await userData.findOne({
    $or: [
      { email: req.body.username, deactive: { $ne: true } },
      { username: req.body.username, deactive: { $ne: true } },
    ],
  });
  let userid = '';
  req.body.message = ` không trả lời tin nhắn WFH lúc ${req.body.createdate} !\n`;

  if (!userdb) {
    console.log('User not found in DB!', req.body.username);
    req.body.message += `<@${client.config.komubotrest.admin_user_id}> ơi, đồng chí ${req.body.username} không đúng format rồi!!!`;
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
    status: 'ACTIVE',
  })
    .save()
    .catch((err) => {
      console.log('Error: ', err);
      res.status(400).send({ message: err });
    });

  req.body.wfhid = data._id.toString();
  await sendMessageToChannel(client, req, res);
};

const sendMessageToThongBaoPM = async (client, req, res) => {
  req.body.channelid = client.config.komubotrest.thongbao_pm_channel_id;
  await sendMessageToChannel(client, req, res);
};

const sendMessageToThongBao = async (client, req, res) => {
  req.body.channelid = client.config.komubotrest.thongbao_channel_id;
  await sendMessageToChannel(client, req, res);
};

const sendMessageToFinance = async (client, req, res) => {
  req.body.channelid = client.config.komubotrest.finance_channel_id;
  await sendMessageToChannel(client, req, res);
};

const sendMessageToNhaCuaChung = async (client, msg) => {
  await client.channels.cache
    .get(client.config.komubotrest.nhacuachung_channel_id)
    .send(msg)
    .catch(console.error);
  return null;
};
const sendMessageToChannelById = async (client, channelId, msg) => {
  try {
    const channel = await client.channels.fetch(channelId);
    await channel.send(msg);
  } catch (error) {
    console.log(error);
  }
};
const sendEmbedMessage = async (client, req, res) => {
  try {
    if (
      !req.get('X-Secret-Key') ||
      req.get('X-Secret-Key') !== client.config.komubotrest.komu_bot_secret_key
    ) {
      res.status(403).send({ message: 'Missing secret key!' });
      return;
    }
    if (!req.body.title) {
      res.status(400).send({ message: 'title can not be empty!' });
      return;
    }
    if (!req.body.description) {
      res.status(400).send({ message: 'decription can not be empty!' });
      return;
    }
    if (!req.body.image) {
      res.status(400).send({ message: 'image can not be empty!' });
      return;
    }
    const embed = (title, des, image) =>
      new MessageEmbed()
        .setTitle(title)
        .setDescription(des)
        .setColor('RED')
        .setImage(image);

    const { title, description, image } = req.body;
    let isSendChannel = true;
    let isSendAllUser = false;
    let isSendUserAndChannel = false;
    if (!req.body.channelId && !req.body.userId) {
      isSendAllUser = true;
    } else if (req.body.channelId && req.body.userId) {
      isSendUserAndChannel = true;
    } else if (!req.body.channelId) {
      isSendChannel = false;
    } else if (!req.body.userId) {
      isSendAllUser = true;
    }
    if (isSendUserAndChannel) {
      const channelId = req.body.channelId;
      const userId = req.body.userId;
      await sendMessageToChannelById(client, channelId, {
        embeds: [embed(title, description, image)],
      });
      const user = await userData
        .findOne({ id: userId })
        .select('-_id username');
      await sendMessageKomuToUser(
        client,
        { embeds: [embed(title, description, image)] },
        user.username
      );
    } else if (isSendChannel) {
      const channelId = req.body.channelId;
      await sendMessageToChannelById(client, channelId, {
        embeds: [embed(title, description, image)],
      });
    } else if (isSendAllUser) {
      const users = await userData.find({}).select('username -_id');
      await Promise.all(
        users.map((user) =>
          sendMessageKomuToUser(
            client,
            { embeds: [embed(title, description, image)] },
            user.username
          )
        )
      );
    } else if (!isSendAllUser) {
      const userId = req.body.userId;
      const user = await userData
        .findOne({ id: userId })
        .select('-_id username');
      await sendMessageKomuToUser(
        client,
        { embeds: [embed(title, description, image)] },
        user.username
      );
    }
  } catch (error) {
    console.log(error);
  }
};
const init = async (client) => {
  const express = require('express');
  const bodyParser = require('body-parser');
  const multer = require('multer');
  const cors = require('cors');
  const uploadFileData = require('../models/uploadFileData');
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '.mp3');
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg') {
      cb(null, true);
    } else {
      cb(new Error('You can only upload mp3 file'), false);
    }
  };

  const mp3 = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 100,
    },
    fileFilter: fileFilter,
  });

  app.post('/getUserIdByUsername', (req, res) => {
    getUserIdByUsername(client, req, res);
  });
  app.post('/sendMessageToUser', (req, res) => {
    sendMessageToUser(client, req, res);
  });
  app.post('/sendMessageToChannel', (req, res) => {
    sendMessageToChannel(client, req, res);
  });
  app.post('/sendImageCheckInToUser', (req, res) => {
    sendImageCheckInToUser(client, req, res);
  });
  app.post('/sendImageLabelToUser', (req, res) => {
    sendImageLabelToUser(client, req, res);
  });
  app.post('/sendMessageToMachLeo', (req, res) => {
    sendMessageToMachLeo(client, req, res);
  });
  app.post('/sendMessageToThongBao', (req, res) => {
    sendMessageToThongBao(client, req, res);
  });
  app.post('/sendMessageToThongBaoPM', (req, res) => {
    sendMessageToThongBaoPM(client, req, res);
  });
  app.post('/sendMessageToFinance', (req, res) => {
    sendMessageToFinance(client, req, res);
  });
  app.post('/sendEmbedMessage', (req, res) => {
    sendEmbedMessage(client, req, res);
  });
  app.post('/uploadFile', mp3.single('File'), async (req, res, next) => {
    const file = req.file;
    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
    }
    if (!req.body.episode) {
      res.status(400).send({ message: 'episode can not be empty!' });
      return;
    }
    const episode = req.body.episode;
    await new uploadFileData({
      filePath: file.path,
      fileName: `${file.filename}`,
      createdTimestamp: Date.now(),
      episode,
    })
      .save()
      .catch((err) => console.log(err));
    res.send(file);
  });

  app.listen(
    client.config.komubotrest.http_port,
    client.config.komubotrest.http_ip,
    () =>
      console.log(
        `Server is listening on port ${client.config.komubotrest.http_port}!`
      )
  );
};

module.exports = {
  init,
  sendMessageToNhaCuaChung,
  sendMessageKomuToUser,
  getWFHWarninghMessage,
};
