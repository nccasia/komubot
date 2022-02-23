const { Message, MessageEmbed, Guild, User } = require('discord.js');
const lang = require('../languages/lang.json');
const translate = require('@vitalets/google-translate-api');
const guildData = require('../models/guildData');
const userData = require('../models/userData');
const msgData = require('../models/msgData');
/**
 * Add a guild in the database
 * @param {number} guildID The ID of the guild
 */
User.prototype.addDB = async function (displayname = {}) {
  const komuUser = await new userData({
    id: this.id,
    username: this.username,
    discriminator: this.discriminator,
    avatar: this.avatar,
    bot: this.bot,
    system: this.system,
    banner: this.banner,
    email: displayname,
    flags: this.flags,
    premium_type: this.premium_type,
    public_flags: this.public_flags,
  });

  let data = await userData.findOne({
    username: this.username,
    deactive: { $ne: true },
  });
  if (!data) await komuUser.save();

  data = await userData.findOne({
    email: displayname,
    deactive: { $ne: true },
  });
  if (!data) await komuUser.save();
};
/**
 * Add a guild in the database
 * @param {number} guildID The ID of the guild
 */
Message.prototype.addDB = async function () {
  return new msgData({
    channelId: this.channelId,
    guildId: this.guildId,
    deleted: this.deleted,
    id: this.id,
    createdTimestamp: this.createdTimestamp,
    type: this.type,
    system: this.system,
    content: this.content,
    author: this.author.id,
    pinned: this.pinned,
    tts: this.tts,
    nonce: this.nonce,
    editedTimestamp: this.editedTimestamp,
    webhookId: this.webhookId,
    applicationId: this.applicationId,
    flags: this.flags,
  }).save();
};
/**
 * Add a guild in the database
 * @param {number} guildID The ID of the guild
 */
Guild.prototype.addDB = async function (guildID = {}) {
  if (!guildID || isNaN(guildID)) {
    guildID = this.id;
  }
  return new guildData({
    serverID: guildID,
    prefix: '*',
    lang: 'en',
    premium: null,
    premiumUserID: null,
    color: '#3A871F',
    backlist: null,
  }).save();
};
/**
 * Fetchs a guild in the database
 * @param {number} guildID The ID of the guild to fetch
 */
Guild.prototype.fetchDB = async function (guildID = {}) {
  if (!guildID || isNaN(guildID)) {
    guildID = this.id;
  }
  let data = await guildData.findOne({ serverID: guildID });
  if (!data) data = await this.addDB();
  return data;
};
Message.prototype.translate = function (text, guildDB = {}) {
  if (!text || !lang.translations[text]) {
    throw new Error(
      `Translate: Params error: Unknow text ID or missing text ${text}`
    );
  }
  if (!guildDB) return console.log('Missing guildDB');
  return lang.translations[text][guildDB];
};

Guild.prototype.translate = async function (text = {}) {
  if (text) {
    if (!lang.translations[text]) {
      throw new Error(`Unknown text ID "${text}"`);
    }
  } else {
    throw new Error('Not text Provided');
  }
  const langbd = await guildData.findOne({ serverID: this.id });
  let target;
  if (langbd) {
    target = langbd.lang;
  } else {
    target = 'en';
  }
  return lang.translations[text][target];
};
Guild.prototype.translatee = async function (text, target = {}) {
  if (text) {
    if (!lang.translations[text]) {
      throw new Error(`Unknown text ID "${text}"`);
    }
  } else {
    throw new Error('Aucun texte indiqué ');
  }
  return lang.translations[text][target];
};

Message.prototype.gg = async function (text) {
  if (!text) {
    this.errorOccurred('No text provided', 'en');
    throw new Error('Aucun texte indiqué ');
  }
  const target = this.guild.lang;
  const texttoreturn = await translate(text, { to: target })
    .then((res) => res.text)
    .catch((error) => console.log(error));
  return texttoreturn
    .replace('show', 'channel')
    .replace('living room', 'channel')
    .replace('room', 'channel');
};

Message.prototype.errorMessage = function (text) {
  if (text) {
    return this.channel.send({
      embeds: [
        {
          description: text,
          color: '#C73829',
          author: {
            name: this.guild.name,
            icon_url: this.guild.icon
              ? this.guild.iconURL({ dynamic: true })
              : 'https://cdn.discordapp.com/attachments/748897191879245834/782271474450825226/0.png?size=128',
          },
        },
      ],
    });
  } else {
    this.errorOccurred('No text provided', 'en');
    throw new Error('Error: No text provided');
  }
};
Message.prototype.succesMessage = function (text) {
  if (text) {
    this.channel.send({
      embeds: [
        {
          description: text,
          color: '#2ED457',
        },
      ],
    });
  } else {
    this.errorOccurred('No text provided', 'en');
    throw new Error('Error: No text provided');
  }
};
Message.prototype.usage = async function (guildDB, cmd = {}) {
  let langUsage;
  if (cmd.usages) {
    langUsage = await this.translate('USES', guildDB.lang);
  } else {
    langUsage = await this.translate('USES_SING', guildDB.lang);
  }
  const read = await this.translate('READ', guildDB.lang);
  const u = await this.translate('ARGS_REQUIRED', guildDB.lang);
  this.channel.send({
    embeds: [
      {
        description: `${u.replace(
          '{command}',
          cmd.name
        )}\n${read}\n\n**${langUsage}**\n${
          cmd.usages
            ? cmd.usages.map((x) => guildDB.prefix + x).join('\n')
            : guildDB.prefix + cmd.name + ' ' + cmd.usage
        }`,
        color: '#C73829',
        author: {
          name: this.author.username,
          icon_url: this.author.displayAvatarURL({ dynamic: !0, size: 512 }),
        },
      },
    ],
  });
};
Message.prototype.mainMessage = function (text) {
  if (text) {
    const embed1 = new MessageEmbed()
      .setAuthor(this.author.tag, this.author.displayAvatarURL())
      .setDescription(`${text}`)
      .setColor('#3A871F')
      .setFooter(
        this.client.footer,
        this.client.user.displayAvatarURL({ dynamic: true, size: 512 })
      );
    this.channel
      .send({ embeds: [embed1], allowedMentions: { repliedUser: false } })
      .then((m) => {
        m.react('<:delete:830790543659368448>');
        const filter = (reaction, user) =>
          reaction.emoji.id === '830790543659368448' &&
          user.id === this.member.id;
        const collector = m.createReactionCollector({
          filter,
          time: 11000,
          max: 1,
        });
        collector.on('collect', async () => {
          m.delete();
        });
        collector.on('end', () => m.reactions.removeAll());
      });
  } else {
    throw new Error('Error: No text provided');
  }
};
/**
 * Send an error message in the current channel
 * @param {string} error the code of the error
 */
Message.prototype.errorOccurred = async function (err, guildDB = {}) {
  const content = await this.translate('ERROR', guildDB.lang);
  const r = new MessageEmbed()
    .setColor('#F0B02F')
    .setTitle(content.title)
    .setDescription(content.desc)
    .setFooter(
      'Error code: ' + err + '',
      this.client.user.displayAvatarURL({ dynamic: !0, size: 512 })
    );
  return this.channel.send({ embeds: [r] });
};
