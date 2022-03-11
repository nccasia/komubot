module.exports = {
  name: 'kick',
  description: 'kickBot',
  cat: 'komu',
  async execute(message) {
    try {
      const target = message.mentions.members.first();
      target.voice.disconnect().catch(console.error);
    } catch (e) {
      console.log(e);
    }
  },
};
