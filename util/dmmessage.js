const conversationData = require("../models/conversationData.js");
const axios = require("axios");

API_TOKEN = "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"
API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"

const dmmessage = async (message, client) => {
    try {
        const channelId = message.channelId;
        const createdTimestamp = message.createdTimestamp;
        const authorId = message.author.id;
        const content = message.content;

        const data = await conversationData.findOne({ channelId: channelId, 
			authorId: authorId, createdTimestamp: { $gte: Date.now() - 20000 } }).catch(console.log); 

        var generated_responses = []
        var past_user_inputs = []

        if (data) {
            generated_responses = data.generated_responses;
            past_user_inputs = data.past_user_inputs;
        }
        
        console.log(generated_responses, past_user_inputs);

        const res = await axios.post(API_URL,
        {
            "past_user_inputs": past_user_inputs,
            "generated_responses": generated_responses,
            "text": `${content}`,
        }, 
        { headers: {"Authorization": `Bearer ${API_TOKEN}`} }).catch(console.log);

        if (res && res.data && res.data.generated_text) {
            message.channel.send(res.data.generated_text).catch(console.log);
        }
        if (data) {
            await conversationData.updateOne({_id: data._id}, {
                past_user_inputs: res.data.conversation.past_user_inputs,
                generated_responses: res.data.conversation.generated_responses,
                updatedTimestamp: createdTimestamp
            }).catch(console.log);
        } else {
            await new conversationData({
                channelId: channelId,
                authorId: authorId,
                createdTimestamp: createdTimestamp,
                updatedTimestamp: createdTimestamp,                
                past_user_inputs: res.data.conversation.past_user_inputs,
                generated_responses: res.data.conversation.generated_responses,
            }).save().catch(console.log);
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = dmmessage;