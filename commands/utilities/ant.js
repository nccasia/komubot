const { fetchAntFeed } = require('../../util/ant');
const { MessageEmbed } = require('discord.js');

const buildFeedMessage = (message, feed) => {
  const content = `
**Articles:**

${feed.items
  .map((item, index) => {
    return `- #${index + 1}, [${item.title}](${item.link})`;
  })
  .join('\n')}
`;

  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(feed.title)
    .setURL(feed.link)
    .addField('Feed', feed.description, false)
    .setDescription(content)
    .setTimestamp()
    .setFooter({
      text: 'From ant.nccsoft.vn',
      iconURL:
        'https://cdn.w600.comps.canstockphoto.com/ant-warrior-icon-cartoon-style-drawing_csp84458099.jpg',
    });

  if (feed.image) {
    embed.setThumbnail(feed.image.url);
  }

  return embed;
};

const handleAntFeed = async (message, args) => {
  const slug = args[0] || '';
  try {
    const feed = await fetchAntFeed({ slug });
    const embed = buildFeedMessage(message, feed);
    return message.reply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    return message.reply(`Failed to get feed for ${slug}`);
  }
};

module.exports = {
  name: 'ant',
  description: 'Display ant feed',
  aliases: ['pcon'],
  usages: ['ant [slug]'],
  cat: 'utilities',
  async execute(message, args) {
    try {
      if (args[0] === 'help') {
        return message.reply(
          'Using *ant [slug] to display ant feed, a slug could be an org, user or tag'
        );
      }
      return handleAntFeed(message, args);
    } catch (err) {
      console.log(err);
    }
  },
};
