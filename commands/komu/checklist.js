const checklistData = require('../../models/checklistData');
const subcategoryData = require('../../models/subcategoryData');
const { MessageEmbed } = require('discord.js');

let categorys = [];
let subcategorys = [];

module.exports = {
  name: 'checklist',
  description: 'checklist',
  cat: 'komu',
  async execute(message, args) {
    try {
      let authorId = message.author.id;
      if (!args[0]) {
        let checklists = await checklistData.find();
        if (checklists.legnth === 0) {
          return;
        }
        for (let i = 0; i < checklists.length; i++) {
          categorys = [...categorys]
            .concat(checklists[i].category)
            .filter((item, i, arr) => item && arr.indexOf(item) === i);
        }

        let mess;
        if (categorys.length === 0) {
          mess = '```' + 'Không có danh mục nào' + '```';
          return message.reply(mess).catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
        } else {
          for (let i = 0; i <= Math.ceil(categorys.length / 50); i += 1) {
            if (categorys.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess = categorys
              .slice(i * 50, (i + 1) * 50)
              .map((item, index) => {
                return `${index + 1}: ${item}`;
              })
              .join('\n');
            const Embed = new MessageEmbed()
              .setTitle(`Checklist`)
              .setColor('RED')
              .setDescription(`${mess}`);
            await message.reply({ embeds: [Embed] }).catch((err) => {
              sendErrorToDevTest(client, authorId, err);
            });
          }
        }
      } else if (args[0] && !args[1]) {
        subcategorys = [];
        if (categorys.length === 0) {
          return message.reply(`Vui lòng *checklist`).catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
        }
        if (!parseInt(args[0]) || parseInt(args[0]) > categorys.length) {
          return message
            .reply(`Vui lòng lựa chọn từ số 1 đến ${categorys.length}`)
            .catch((err) => {
              sendErrorToDevTest(client, authorId, err);
            });
        }

        const option = categorys[args[0] - 1];
        let checklists = await checklistData.find({ category: option });

        for (let i = 0; i < checklists.length; i++) {
          subcategorys = [...subcategorys].concat({
            id: checklists[i].id,
            categoryId: args[0],
            category: checklists[i].subcategory,
          });
        }
        let mess;
        if (checklists.length === 0) {
          mess = '```' + 'Không có danh mục nào' + '```';
          return message.reply(mess).catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
        } else {
          for (let i = 0; i <= Math.ceil(checklists.length / 50); i += 1) {
            if (checklists.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess = checklists
              .slice(i * 50, (i + 1) * 50)
              .map((item, index) => {
                return `${index + 1}: ${item.subcategory}`;
              })
              .join('\n');
            const Embed = new MessageEmbed()
              .setTitle(` Checklist ${option}`)
              .setColor('RED')
              .setDescription(`${mess}`);
            await message.reply({ embeds: [Embed] }).catch((err) => {
              sendErrorToDevTest(client, authorId, err);
            });
          }
        }
      } else if (args[1]) {
        if (categorys.length === 0 || subcategorys.length === 0) {
          return message.reply(`Vui lòng *checklist category`).catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
        }

        const option = categorys[args[0] - 1];
        const optionsubcatgory = subcategorys[0];

        if (parseInt(args[0]) !== parseInt(optionsubcatgory.categoryId)) {
          return message.reply(`Bạn đang nhập sai category`).catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
        }

        if (!parseInt(args[1]) || parseInt(args[1]) > subcategorys.length) {
          return message
            .reply(`Vui lòng lựa chọn từ số 1 đến ${subcategorys.length}`)
            .catch((err) => {
              sendErrorToDevTest(client, authorId, err);
            });
        }

        let subcategory = await subcategoryData.find({
          checklistId: optionsubcatgory.id,
        });

        let mess;
        if (subcategory.length === 0) {
          mess = '```' + 'Không có danh mục nào' + '```';
          return message.reply(mess).catch((err) => {
            sendErrorToDevTest(client, authorId, err);
          });
        } else {
          for (let i = 0; i <= Math.ceil(subcategory.length / 50); i += 1) {
            if (subcategory.slice(i * 50, (i + 1) * 50).length === 0) break;
            mess = subcategory
              .slice(i * 50, (i + 1) * 50)
              .map((item) => {
                return `${item.title}`;
              })
              .join('\n');
            const Embed = new MessageEmbed()
              .setTitle(` ${optionsubcatgory.category} (${option})`)
              .setColor('RED')
              .setDescription(`${mess}`);
            await message.reply({ embeds: [Embed] }).catch((err) => {
              sendErrorToDevTest(client, authorId, err);
            });
          }
          categorys = [];
          subcategorys = [];
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
};
