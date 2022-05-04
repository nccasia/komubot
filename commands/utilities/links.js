const Discord = require('discord.js');
module.exports = {
  name: 'links',
  description: 'Envoye un lien pour inviter le bot :)',
  aliases: [
    'add',
    'botinvite',
    'support',
    'discord',
    'invite',
    'code',
    'github',
    'dashboard',
  ],
  cat: 'utilities',
  async execute(message, args, client, guildDB) {
    const here = await message.translate('CLIQ', guildDB.lang);
    const lang = await message.translate('LINKS', guildDB.lang);
    if (message.content.includes('invite') || message.content.includes('add')) {
      message.channel.send({
        embeds: [
          {
            author: {
              name: message.author.username,
              icon_url: message.author.displayAvatarURL({
                dynamic: true,
                size: 512,
              }),
            },
            color: guildDB.color,
            description: `Want to invite KOMU on your server? [Click here](${process.env.LINKS_INVITE})`,
            footer: {
              text: message.client.footer,
              icon_url: message.client.user.displayAvatarURL({
                dynamic: true,
                size: 512,
              }),
            },
          },
        ],
        allowedMentions: { repliedUser: false },
      });
    } else if (
      message.content.includes('support') ||
      message.content.includes('discord')
    ) {
      const embed = new Discord.MessageEmbed()
        .setAuthor(
          `${message.author.username}`,
          message.author.displayAvatarURL({ dynamic: true, size: 512 })
        )
        .setColor(guildDB.color)
        .setDescription(
          `${
            guildDB.lang === 'fr'
              ? ' Vous pouvez rejoindre le discord de support en cliquant [ici](' +
                process.env.LINKS_SUPPORT +
                ')'
              : ' You can join our support discord by clicking [`here`](' +
                process.env.LINKS_SUPPORT +
                ')'
          }`
        )
        .setFooter(
          message.client.footer,
          message.client.user.displayAvatarURL({ dynamic: true, size: 512 })
        );
      message.channel.send({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    } else if (message.content.includes('vote')) {
      const embed = new Discord.MessageEmbed()
        .setAuthor(
          `${message.author.username}`,
          message.author.displayAvatarURL({ dynamic: true, size: 512 })
        )
        .setColor(guildDB.color)
        .setDescription(
          `${
            guildDB.lang === 'fr'
              ? 'Vous pouvez voter pour KOMU [ici](' +
                client.config.topgg_url +
                '/vote)'
              : ' You can upvote me by clicking [here](' +
                client.config.topgg_url +
                '/vote)'
          }`
        )
        .setFooter(
          message.client.footer,
          message.client.user.displayAvatarURL({ dynamic: true, size: 512 })
        );
      message.channel.send({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    } else {
      const embed = new Discord.MessageEmbed()
        .setAuthor(
          `${message.author.username}`,
          message.author.displayAvatarURL({ dynamic: true, size: 512 })
        )
        .setColor(guildDB.color)
        .addField(
          'Support:',
          '[' + here + '](' + process.env.LINKS_SUPPORT + ')',
          true
        )
        .addField(
          'Invite:',
          '[' + here + '](' + process.env.LINKS_INVITE + ')',
          true
        )
        .addField(
          'Dashboard:',
          '[' + here + '](' + process.env.LINKS_WEBSITE + ')',
          true
        )
        .addField(
          'Vote:',
          '[' + here + '](' + client.config.topgg_url + '/vote)',
          true
        )
        .setDescription(lang)
        .setThumbnail(
          message.client.user.displayAvatarURL({
            dynamic: true,
            size: 512,
          })
        )
        .setFooter(
          message.client.footer,
          message.client.user.displayAvatarURL({ dynamic: true, size: 512 })
        );

      message.channel.send({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    }
  },
};
