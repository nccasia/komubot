const axios = require('axios');
const { MessageEmbed } = require('discord.js');

const messHelp = '```' + '*gem rank' + '\n' + '*gem rank username' + '```';

module.exports = {
  name: 'gem',
  description: 'Gem rank',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      if (args[0] === 'rank') {
        if (args[1]) {
          let rankUsername;
          try {
            rankUsername = await axios.get(
              `${client.config.gem.api_url_getMyRank}${args[1]}`
            );
          } catch (error) {
            return message.reply({
              content: `${messHelp}`,
              ephemeral: true,
            });
          }

          const rank = rankUsername.data.outputRankingDTO;
          let mess = `elo: ${rank.elo}, ranking: ${rank.ranking}`;
          const Embed = new MessageEmbed()
            .setTitle(`${rank.username} ranking`)
            .setColor('RED')
            .setDescription(`${mess}`);
          await message.reply({ embeds: [Embed] }).catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
        } else {
          postGemRank = await axios.post(client.config.gem.api_url_getTopRank, {
            page: 0,
            size: 15,
          });
          const rankTop = postGemRank.data.content;

          for (let i = 0; i <= Math.ceil(rankTop.length / 50); i += 1) {
            if (rankTop.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess = rankTop
              .slice(i * 50, (i + 1) * 50)
              .map(
                (list) =>
                  `${list.displayName}-elo: ${list.elo}, ranking: ${list.ranking}`
              )
              .join('\n');
            const Embed = new MessageEmbed()
              .setTitle(`Top ranking`)
              .setColor('RED')
              .setDescription(`${mess}`);
            await message.reply({ embeds: [Embed] }).catch(console.error);
          }
        }
      } else {
        return message
          .reply({
            content: `${messHelp}`,
            ephemeral: true,
          })
          .catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
