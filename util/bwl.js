const bwlData = require('../models/bwlData.js');
const fs = require('fs');
const downloader = require('image-downloader')
const { v4: uuidv4 } = require('uuid');

const mediaPath = "./media/attachments/";

const download_image = (url, imagePath) => {
    downloader.image({ url: url, dest: mediaPath + imagePath })
    .then(({ filename }) => {
        console.log('Saved to', filename)
    })
    .catch((err) => console.error(err))
}

const bwl = async (message, client) => {
    try {
        const chid = message.channelId;
        const messageId = message.id;
        const guildId = message.guildId;
        const createdTimestamp = message.createdTimestamp;
        
        const authorId = message.author.id;

        let links = [];
        message.embeds.forEach(embed => {
            try {
                if (embed.type == 'image') {
                    console.log("downloading " + embed.url);
                    const filename = uuidv4() + "_" + embed.url.split('/').pop();
                    download_image(embed.url, filename);
                    links.push(filename);
                }
            } catch (error) {
                console.error(error);
            }
        });
        message.attachments.forEach(attachment => {
            try {
                const imageLink = attachment.proxyURL;
                console.log("downloading attachment " + imageLink);
                const filename = uuidv4() + "_" + imageLink.split('/').pop();
                download_image(imageLink, filename);                
                links.push(filename);
            } catch (error) {
                console.error(error);
            }
        });

        if (links.length > 0) {
            const data = await new bwlData({
                channelId: chid,
                messageId: messageId,
                guildId: guildId,
                authorId: authorId,
                links: links,
                createdTimestamp: createdTimestamp
            }).save().catch(console.error);
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = bwl;