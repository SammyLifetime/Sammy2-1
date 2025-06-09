const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: ["god"],
    aliases: ["g", "gd"],
    version: "1.5",
    author: "NTKhang fixed by Monsterwith",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Thêm, xóa, sửa quyền author",
      en: "Add, remove, edit author role"
    },
    longDescription: {
      vi: "Thêm, xóa, sửa quyền author",
      en: "Add, remove, edit author role"
    },
    category: "cmd permission",
    guide: {
      vi: '   {pn} [add | -a] <uid | @tag>: Thêm quyền author cho người dùng'
        + '\n	  {pn} [remove | -r] <uid | @tag>: Xóa quyền author của người dùng'
        + '\n	  {pn} [list | -l]: Liệt kê danh sách author',
      en: '   {pn} [add | -a] <uid | @tag>: Add author role for user'
        + '\n	  {pn} [remove | -r] <uid | @tag>: Remove author role of user'
        + '\n	  {pn} [list | -l]: List all authors'
    }
  },

  langs: {
    vi: {
      added: "✅ | Đã thêm quyền author cho %1 người dùng:\n%2",
      alreadyAdmin: "\n⚠ | %1 người dùng đã có quyền author từ trước rồi:\n%2",
      missingIdAdd: "⚠ | Vui lòng nhập ID hoặc tag người dùng muốn thêm quyền author",
      removed: "✅ | Đã xóa quyền author của %1 người dùng:\n%2",
      notAdmin: "⚠ | %1 người dùng không có quyền author:\n%2",
      missingIdRemove: "⚠ | Vui lòng nhập ID hoặc tag người dùng muốn xóa quyền author",
      listAdmin: "👑 | Danh sách author:\n%1"
    },
    en: {
      added: "✅ | Added author role for %1 users:\n%2",
      alreadyAdmin: "\n⚠ | %1 users already have author role:\n%2",
      missingIdAdd: "⚠ | Please enter ID or tag user to add author role",
      removed: "✅ | Removed author role of %1 users:\n%2",
      notAdmin: "⚠ | %1 users don't have author role:\n%2",
      missingIdRemove: "⚠ | Please enter ID or tag user to remove author role",
      listAdmin: "👑 | List of Authors:\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, api }) {
    const permission = global.GoatBot.config.GOD;
    if (!permission.includes(event.senderID)) {
      api.sendMessage("╔════ஜ۩۞۩ஜ═══╗\n\nYou don't have enough permission to use this command. Only My Authors Have Access.\n\n╚════ஜ۩۞۩ஜ═══╝", event.threadID, event.messageID);
      return;
    }

    switch (args[0]) {
      case "add":
      case "-a": {
        if (args[1]) {
          let uids = [];
          if (Object.keys(event.mentions).length > 0)
            uids = Object.keys(event.mentions);
          else if (event.messageReply)
            uids.push(event.messageReply.senderID);
          else
            uids = args.slice(1).filter(arg => !isNaN(arg));
          const notAdminIds = [];
          const authorIds = [];
          for (const uid of uids) {
            if (config.GOD.includes(uid))
              authorIds.push(uid);
            else
              notAdminIds.push(uid);
          }

          config.GOD.push(...notAdminIds);
          const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.filter(({ uid }) => notAdminIds.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
            + (authorIds.length > 0 ? getLang("alreadyAdmin", authorIds.length, authorIds.map(uid => `• ${uid}`).join("\n")) : "")
          );
        }
        else
          return message.reply(getLang("missingIdAdd"));
      }
      case "remove":
      case "-r": {
        if (args[1]) {
          let uids = [];
          if (Object.keys(event.mentions).length > 0)
            uids = Object.keys(event.mentions);
          else
            uids = args.slice(1).filter(arg => !isNaN(arg));
          const notAdminIds = [];
          const authorIds = [];
          for (const uid of uids) {
            if (config.GOD.includes(uid))
              authorIds.push(uid);
            else
              notAdminIds.push(uid);
          }
          for (const uid of authorIds)
            config.GOD.splice(config.GOD.indexOf(uid), 1);
          const getNames = await Promise.all(authorIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (authorIds.length > 0 ? getLang("removed", authorIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
            + (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
          );
        }
        else
          return message.reply(getLang("missingIdRemove"));
      }
      case "list":
      case "-l": {
        const getNames = await Promise.all(config.GOD.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
        return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
      }
      default:
        return message.SyntaxError();
    }
  }
};
