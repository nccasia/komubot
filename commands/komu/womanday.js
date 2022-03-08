const pollEmbed = require('../../util/pollEmbed.js');
const { sendMessageKomuToUser } = require('../../util/komubotrest');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const userData = require('../../models/userData');
const axios = require('axios');
function getUserNameByEmail(string) {
  if (string.includes('@ncc.asia')) {
    return string.slice(0, string.length - 9);
  }
}
module.exports = {
  name: 'happy',
  description: 'create a poll',
  cat: 'komu',
  async execute(message, args, client) {
    try {
      if (args[0] !== "women's" || args[1] !== 'day') return;
      const response = await axios.get(
        'http://timesheetapi.nccsoft.vn/api/services/app/Public/GetAllUser'
      );
      if (!response.data || !response.data.result) return;
      const userWomenTest = response.data.result
        .filter((user) => user.sex === 1)
        .map((item) => getUserNameByEmail(item.emailAddress));

      const userWoman = await userData
        .find({
          email: { $in: userWomenTest },
          deactive: { $ne: true },
        })
        .select('id email -_id');

      for (user of userWoman) {
        const Embed = new MessageEmbed()
          .setTitle("Happy Women's Day 💋")
          .setDescription(
            'Sắp đến mùng 8 tháng 3 \n Giá hoa thì đắt giá quà thì cao' +
              '\n' +
              'Tiền lương tiêu hết hồi nào' +
              '\n' +
              'Bonus thì lại chẳng trao dịp này' +
              '\n' +
              'Thôi thì có tấm thân gầy' +
              '\n' +
              'Nguyện trao gửi phận đến tay ai cần' +
              '\n' +
              'Cùng những lời chúc có vần' +
              '\n' +
              'Một trái tim nhỏ, ngàn lần yêu thương' +
              '\n' +
              'Chúc cho may mắn đủ đường' +
              '\n' +
              'Chị em đến tháng......lĩnh lương nhiều nhiều' +
              '\n' +
              'Ung dung chẳng nghĩ tiền tiêu' +
              '\n' +
              'Công việc thuận lợi mọi điều hanh thông' +
              '\n' +
              'Đến tuổi chúc sớm lấy chồng' +
              '\n' +
              'Gia đình hạnh phúc thành công mọi đường' +
              '\n' +
              'Chị em chưa có người thương' +
              '\n' +
              'Sớm có thằng rước thuận đường tình duyên' +
              '\n' +
              'Anh em phải nhớ không quên' +
              '\n' +
              'Chị em mãi đẹp nữ quyền lên ngôi.' +
              '\n' +
              '*From NCC8 with Love*'
          )
          .setColor('RED')
          .setFooter({
            text: 'Nhiều 🎁 hấp dẫn bên dưới đang chờ đón chị em',
          })
          .setImage(
            'https://media.discordapp.net/attachments/921593472039915551/950241681041670164/unknown.png'
          );
        const row = new MessageActionRow();
        for (let i = 0; i < 5; i++) {
          row.addComponents(
            new MessageButton()
              .setCustomId(`8/3_&userid=${user.id}&key=${i}`)
              .setLabel('🎁')
              .setStyle('PRIMARY')
          );
        }

        await sendMessageKomuToUser(
          client,
          { embeds: [Embed], components: [row] },
          user.email
        );
      }
    } catch (error) {
      console.log(error);
    }
  },
};
