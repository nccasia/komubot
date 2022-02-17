const conversationData = require('../models/conversationData.js');
const axios = require('axios');
const userData = require('../models/userData');
const msgData = require('../models/msgData');
const API_TOKEN = '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';
const API_URL = 'http://172.16.100.111:3000/webhooks/rest/webhook';

const dmmessage = async (message) => {
  try {
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
    const newMsg = new msgData({
      channelId: message.channelId,
      guildId: message.guildId,
      id: message.id,
      createdTimestamp: message.createdTimestamp,
      type: message.type,
      system: message.system,
      content: message.content,
      author: message.author.id,
      pinned: message.pinned,
      tts: message.tts,
      nonce: message.nonce,
      webhookId: message.webhookId,
      applicationId: message.applicationId,
      flags: message.flags,
    });
    const newMsgAfter = await newMsg.save();

    await userData.updateOne(
      { id: authorId },
      {
        last_message_id: newMsgAfter.id,
        last_bot_message_id: '',
      }
    );

    const res = await axios
      .post(
        API_URL,
        {
          sender: message.author.username,
          message: `${content}`,
        },
        { headers: { Authorization: `Bearer ${API_TOKEN}` } }
      )
      .catch(() => {
        message.channel.send(
          "Very busy, too much work today. I'm so tired. BRB."
        );
      });

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

module.exports = dmmessage;
