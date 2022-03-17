const conversationData = require('../models/conversationData.js');
const axios = require('axios');
const userData = require('../models/userData');
const msgData = require('../models/msgData');
const API_TOKEN = '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';
const API_URL = 'http://172.16.100.111:3000/webhooks/rest/webhook';
const userStatus = require('../commands/komu/user_status');
const toggleActivation = require('../commands/komu/toggleActivation');
const syncRole = require('../commands/komu/sync_role');
const ticket = require('../slashcommands/ticket');
const keep = require('../slashcommands/keep');
const wiki = require('../slashcommands/wiki');

const getMessageAI = async (url, sender, message, token) => {
  try {
    const response = await axios.post(
      url,
      {
        sender,
        message,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  } catch (e) {
    return null;
  }
};

const dmmessage = async (message, client) => {
  try {
    const checkArgs = message.content.split(' ').shift();
    const args = message.content.split(' ').splice(1);
    switch (checkArgs) {
      case '*userstatus':
        return userStatus.execute(message, args, client);
      case '*toggleactivation':
        return toggleActivation.execute(message, args);
      case '*sync':
        return syncRole.execute(message, args, client);
      // case '/tick':
      //   return const slashTicket = ticket.execute(message, client);
      // case '/keep':
      //   return const keep = ticket.execute(message, client);
      // case '/wiki':
      //   return const wiki = ticket.execute(message, client);
      default:
        break;
    }
    const channelId = message.channelId;
    const createdTimestamp = message.createdTimestamp;
    const authorId = message.author.id;
    const content = message.content;

    const data = await conversationData
      .findOne({
        channelId: channelId,
        authorId: authorId,
        createdTimestamp: { $gte: Date.now() - 20000 },
      })
      .catch(console.log);

    if (!authorId || !content) return;
    const res = await getMessageAI(
      API_URL,
      message.author.username,
      `${content}`,
      API_TOKEN
    );

    if (res && res.data && res.data.length) {
      res.data.map((item) => {
        return message.channel.send(item.text).catch(console.log);
      });
    } else {
      message.channel.send(
        "Very busy, too much work today. I'm so tired. BRB."
      );
      return;
    }

    if (data) {
      await conversationData
        .updateOne(
          { _id: data._id },
          {
            past_user_inputs: [content],
            generated_responses: res.data.map((item) => item.text),
            updatedTimestamp: createdTimestamp,
          }
        )
        .catch(console.log);
    } else {
      await new conversationData({
        channelId: channelId,
        authorId: authorId,
        createdTimestamp: createdTimestamp,
        updatedTimestamp: createdTimestamp,
        past_user_inputs: [content],
        generated_responses: res.data.map((item) => item.text),
      })
        .save()
        .catch(console.log);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = { dmmessage, getMessageAI, API_TOKEN, API_URL };
