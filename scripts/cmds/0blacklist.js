const { config } = global.GoatBot;
const { client } = global;
const fs = require('fs');

module.exports = {
  config: {
    name: "blacklist",
    aliases:["bl", "black"],
    version: "1.0",
    author: "King Monsterwith",
    role: 2,
    shortDescription: {
      en: "Add, delete, or list thread IDs from BlackList"
    },
    longDescription: {
      en: "Add, delete, or list thread IDs from BlackList. Usage: /blacklist [add/del/list/enable/disable] [thread ID]"
    },
    category: "ADMIN",
    guide: {
      en: "{pn} [add | del | list | on | off]",
    }
  },
  onStart: async function ({ message, args, threadsData }) {
    let config = {};
    try {
      config = JSON.parse(fs.readFileSync(client.dirConfig));
    } catch (err) {
      console.error('', err);
    }

    const blackListMode = config.blackListMode;
    const blackListIds = blackListMode.blackListIds || [];
    const action = args[0];
    const threadId = args[1];

    if (action === "add") {
      if (!blackListIds.includes(threadId)) {
        const threadData = await threadsData.get(threadId);
        const threadName = threadData.threadName;
        blackListIds.push(threadId);
        blackListMode.blackListIds = blackListIds;
        fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
        message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n• ${threadName} (${threadId}) has been added to BlackListIds ✅\n\n╚════ஜ۩۞۩ஜ═══╝`);
      } else {
        const threadData = await threadsData.get(threadId);
        const threadName = threadData.threadName;
        message.reply(`╔════ஜ۩۞۩ஜ═══╗n\n\n• ${threadName} (${threadId}) is already in the BlackListIds ✅\n\n╚════ஜ۩۞۩ஜ═══╝`);
      }
    } else if (action === "del") {
      const index = blackListIds.indexOf(threadId);
      if (index >= 0) {
        const threadData = await threadsData.get(threadId);
        const threadName = threadData.threadName;
        blackListIds.splice(index, 1);
        blackListMode.blackListIds = blackListIds;
        fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
        message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n• ${threadName} (${threadId}) has been removed from BlackListIds ✅\n\n╚════ஜ۩۞۩ஜ═══╝`);
      } else {
        const threadData = await threadsData.get(threadId);
        const threadName = threadData.threadName;
        message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n• ${threadName} (${threadId}) is not in the BlackListIds ❌\n\n╚════ஜ۩۞۩ஜ═══╝`);
      }
    } else if (action === "list") {
      if (blackListIds.length === 0) {
        message.reply("No thread IDs in BlackListIds ❌");
      } else {
        const threadNames = await Promise.all(
          blackListIds.map(threadId => threadsData.get(threadId).then(data => data.threadName))
        );
        const threadList = blackListIds.map((id, index) => `${index+1}. ${threadNames[index]} (${id})`).join('\n');
        message.reply(`Thread IDs in BlackListIds:\n${threadList}`);
      }
    } else if (action === "on") {
      config.blackListMode.enable = true;
      fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
      message.reply(`╔════ஜ۩۞۩ஜ═══╗BlackListMode has been Enabled ✅\n\n╚════ஜ۩۞۩ஜ═══╝`);
    } else if (action === "off") {
        config.blackListMode.enable = false;
        fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
        message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\nBlackListMode has been Disabled ✅\n\n╚════ஜ۩۞۩ஜ═══╝`);
      } else {
        message.reply("╔════ஜ۩۞۩ஜ═══╗\n\nInvalid action. Usage: /blacklist [add/del/list/enable/disable] [thread ID]\n\n╚════ஜ۩۞۩ஜ═══╝");
      }
      }
      };