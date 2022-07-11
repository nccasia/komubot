const { MessageEmbed } = require('discord.js');
const checklistData = require('../models/checklistData');
const subcategoryData = require('../models/subcategoryData');

let categorys = ['tester', 'loren', 'inter', 'dev', 'hr'];
let subcategorys = [];
let arr = [];
for (let i = 1; i <= categorys.length; i++) {
  arr.push(`${i}`);
}

async function checkList(message, args) {
  let authorId = message.author.id;
  if (!args[0]) {
    let mess;
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
  } else if (args[0] && !args[1]) {
    let option;
    subcategorys = [];

    if (arr.includes(args[0])) {
      option = categorys[args[0] - 1];
    } else {
      option = args[0];
    }

    let checklists = await checklistData.find({ category: option });

    let mess;
    if (checklists.length === 0) {
      mess = '```' + 'There are no categories' + '```';
      return message.reply(mess).catch((err) => {
        sendErrorToDevTest(client, authorId, err);
      });
    } else {
      for (let i = 0; i < checklists.length; i++) {
        subcategorys = [...subcategorys].concat({
          id: checklists[i].id,
          categoryId: option,
          category: checklists[i].subcategory,
        });
      }
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
    let optionCategory;
    let optionSubcategory;
    let arrSub = [];

    if (categorys.length === 0 || subcategorys.length === 0) {
      return message.reply(`Please *checklist category`).catch((err) => {
        sendErrorToDevTest(client, authorId, err);
      });
    }

    if (arr.includes(args[0])) {
      optionCategory = categorys[args[0] - 1];
    } else {
      optionCategory = args[0];
    }

    for (let i = 1; i <= subcategorys.length; i++) {
      arrSub.push(`${i}`);
    }

    if (arrSub.includes(args[1])) {
      optionSubcategory = subcategorys[parseInt(args[1] - 1)];
    } else {
      optionSubcategory = subcategorys.find((element) => {
        if (element.category === args.slice(1).join(' ')) {
          return true;
        } else {
          return false;
        }
      });
    }

    if (optionSubcategory === undefined) {
      return message
        .reply(`You are entering the wrong subcategory`)
        .catch((err) => {
          sendErrorToDevTest(client, authorId, err);
        });
    }

    if (optionCategory !== optionSubcategory.categoryId) {
      return message
        .reply(`You are entering the wrong category`)
        .catch((err) => {
          sendErrorToDevTest(client, authorId, err);
        });
    }

    let subcategory = await subcategoryData.find({
      checklistId: optionSubcategory.id,
    });

    let mess;
    if (subcategory.length === 0) {
      mess = '```' + 'There are no subcategories' + '```';
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
          .setTitle(` ${optionSubcategory.category} (${optionCategory})`)
          .setColor('RED')
          .setDescription(`${mess}`);
        await message.reply({ embeds: [Embed] }).catch((err) => {
          sendErrorToDevTest(client, authorId, err);
        });
      }
      subcategorys = [];
    }
  }
}

module.exports = checkList;
