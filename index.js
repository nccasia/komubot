const fs = require('fs'),
  { getFreeClientID: getFreeClientID, setToken: setToken } = require('play-dl'),
  {
    Client: Client,
    Intents: Intents,
    Collection: Collection,
    MessageEmbed: MessageEmbed,
  } = require('discord.js'),
  client = new Client({
    messageCacheMaxSize: 200,
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    ],
    partials: ['USER', 'REACTION', 'MESSAGE', 'CHANNEL'],
  }),
  util = require('util'),
  { Player } = require('discord-player'),
  readdir = util.promisify(fs.readdir),
  mongoose = require('mongoose');
client.config = require('./config.js');
client.footer = client.config.footer;
client.owners = [''];
client.commands = new Collection();
client.player = new Player(client, client.config.player);
getFreeClientID().then((e) => {
  setToken({ soundcloud: { client_id: e } });
});
mongoose
  .connect(client.config.database.MongoURL, client.config.database.options)
  .then(() => {
    console.log('[MongoDB]: Ready');
  })
  .catch((e) => {
    console.log('[MongoDB]: Error\n' + e);
  });
const init = async () => {
  const komuhttp = require('./util/komubotrest');
  komuhttp.init(client);
  client.slashcommands = [];
  client.slashexeccommands = new Collection();
  // Loading commands from the commands folder
  const commandFiles = fs
    .readdirSync('./slashcommands')
    .filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./slashcommands/${file}`);
    client.slashcommands.push(command.data.toJSON());
    client.slashexeccommands.set(command.data.name, command.execute);
  }
  fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
  const commands = await readdir('./commands/');
  console.log(`[Commands] ${commands.length} Categories loaded.`);
  commands.forEach(async (command) => {
    (await readdir('./commands/' + command + '/'))
      .filter((file) => file.split('.').pop() === 'js')
      .forEach((file) => {
        const module = require(`./commands/${command}/${file}`);
        client.commands.set(module.name, module);
      });
  });
  const files = await readdir('./events/discord');
  console.log(`[Events] ${files.length} events loaded.`);
  files.forEach((file) => {
    const name = file.split('.')[0];
    const module = require(`./events/discord/${file}`);
    client.on(name, (...event) => module.execute(...event, client));
    delete require.cache[require.resolve(`./events/discord/${file}`)];
  });
  client.player.on('trackStart', async (queue, track) => {
    if (!queue.metadata) return console.log('Not metadata');
    if (queue.metadata.controller) {
      const embed = new MessageEmbed()
        .setAuthor(
          track.requestedBy.tag,
          track.requestedBy.displayAvatarURL(),
          'https://discord.com/api/oauth2/authorize?client_id=922003239887581205&permissions=8&scope=bot%20applications.commands'
        )
        .setDescription(
          'Send a music name/link bellow this message to play music.\n[Invite me](https://komu.vn/invite) | [Premium](https://komu.vn/premium) | [Dashboard](https://komu.vn) | [Commands](https://komu.vn/commands)'
        )
        .addField(
          'Now playing',
          `[**${track.title}**](${track.url}) [<@${track.requestedBy.id}>] \`${track.duration}\``
        )
        .setImage(
          'https://img.shgstatic.com/clutchco-static/image/scale/60x60/s3fs-public/logos/nccsoft_vietnam_logo.png'
        )
        .setFooter(
          `${client.footer}`,
          client.user.displayAvatarURL({ dynamic: true, size: 512 })
        )
        .setColor('#3A871F');
      return queue.metadata.message
        .edit({ embeds: [embed] })
        .catch(console.error);
    } else if (queue.metadata.guildDB.announce) {
      queue.metadata.channel
        .send({
          embeds: [
            {
              color: queue.metadata.guildDB.color,
              author: {
                name: '' + track.requestedBy.tag + ' - Now playing',
                icon_url: track.requestedBy.displayAvatarURL(),
                url: 'https://discord.com/oauth2/authorize?client_id=783708073390112830&scope=bot&permissions=19456',
              },
              description: `[${track.title}](${track.url}) [<@${track.requestedBy.id}>]`,
            },
          ],
        })
        .then((m) => setTimeout(() => m.delete(), track.durationMS));
    }
  });
  client.player.on('tracksAdd', async (queue, tracks) => {
    if (!queue.metadata || queue.metadata.controller) return;
    const loadingTest = await queue.metadata.m.translate(
      'ADDS',
      queue.metadata.guildDB.lang
    );
    queue.metadata.channel.send(loadingTest.replace('{tracks}', tracks.length));
    if (queue.metadata.guildDB.auto_shuffle) {
      await queue
        .shuffle()
        .then(
          queue.metadata.channel.send('`✅` Playlist automaticlly shuffled.')
        );
    }
  });
  client.player.on('trackAdd', async (queue, track) => {
    if (!queue.metadata || queue.metadata.controller) {
      return console.log('Not metadata');
    }
    const a = await queue.metadata.m.translate(
      'MUSIC_ADDED',
      queue.metadata.guildDB.lang
    );
    queue.metadata.channel.send({
      embeds: [
        {
          color: queue.metadata.guildDB.color,
          description: `${a} **[${track.title}](${track.url})**`,
        },
      ],
    });
  });
  client.player.on('queueEnd', async (queue) => {
    if (queue.metadata.controller) {
      const embed = new MessageEmbed()
        .setAuthor(
          `${client.footer}`,
          client.user.displayAvatarURL({ dynamic: true, size: 512 }),
          'https://discord.com/oauth2/authorize?client_id=783708073390112830&scope=bot&permissions=66186704'
        )
        .setDescription(
          'Send a music name/link bellow this message to play music.\n[Invite me](https://komu.vn/invite) | [Premium](https://komu.vn/premium) | [Dashboard](https://komu.vn) | [Commands](https://komu.vn/commands)'
        )
        .addField('Now playing', '__**Nothing playing**__')
        .setImage(
          'https://cdn.discordapp.com/attachments/893185846876975104/900453806549127229/green_bot_banner.png'
        )

        .setFooter(
          `${client.footer}`,
          client.user.displayAvatarURL({ dynamic: true, size: 512 })
        )
        .setColor('#3A871F');
      return queue.metadata.message.edit({ embeds: [embed] });
    }
    const loadingTest = await queue.metadata.m.translate(
      'QUEUE_END',
      queue.metadata.guildDB.lang
    );
    queue.metadata.channel.send({
      embeds: [
        {
          title: 'Queue Concluded',
          color: '#F0B02F',
          description: loadingTest,
        },
      ],
    });
  });
  client.player.on('connectionCreate', async (queue, connection) => {
    if (!queue.metadata || queue.metadata.controller) {
      return console.log('Not metadata');
    }
    const loadingTest = await queue.metadata.m.translate(
      'JOINED',
      queue.metadata.guildDB.lang
    );
    queue.metadata.channel
      .send(
        loadingTest
          .replace('{channel}', connection.channel.name)
          .replace('{text}', queue.metadata.channel)
      )
      .then(console.log('VoiceConnection - Created'));
  });
  client.player.on('channelEmpty', async (queue) => {
    if (queue.metadata.controller) {
      const embed = new MessageEmbed()
        .setAuthor(
          `${client.footer}`,
          client.user.displayAvatarURL({ dynamic: true, size: 512 })
        )
        .setDescription(
          'Send a music name/link bellow this message to play music.\n[Invite me](https://komu.vn/invite) | [Premium](https://komu.vn/premium) | [Dashboard](https://komu.vn) | [Commands](https://komu.vn/commands)'
        )
        .addField('Now playing', '__**Nothing playing**__')
        .setImage(
          'https://cdn.discordapp.com/attachments/893185846876975104/900453806549127229/green_bot_banner.png'
        )

        .setFooter(
          `${client.footer}`,
          client.user.displayAvatarURL({ dynamic: true, size: 512 })
        )
        .setColor('#3A871F');
      return queue.metadata.message.edit({ embeds: [embed] });
    }
    if (!queue.metadata.guildDB.h24) queue.connection.disconnect();
  });
  client.player.on('error', async () => {
    return;
  });
};
init();
client.login(client.config.token).catch((e) => {
  console.log(
    '[Discord login]: Please provide a valid discord bot token\n' + e
  );
});
