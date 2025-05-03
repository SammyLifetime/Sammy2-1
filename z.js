const axios = require("axios");

module.exports = {
config: {
		name: "",
    version: "1.0",
		author: "Samuel Kâñèñgeè/King Monsterwith",
		countDown: 5,
		role: 0,
		shortDescription: "",
		longDescription: "",
		category: "",
		guide: {
      en: "{p}{n}",
    }
	},

 onStart: async function ({ api, event, args }) {
 }
};

const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "vip",
    version: "1.6", // Upgraded version to 1.6
    author: "NTKhang",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: "Thêm, xóa, sửa quyền vip",
      en: "Add, remove, edit vip role"
    },
    longDescription: {
      vi: "Thêm, xóa, sửa quyền vip",
      en: "Add, remove, edit vip role"
    },
    category: "box chat",
    guide: {
      vi: '   {pn} [add | -a] <uid | @tag>: Thêm quyền vip cho người dùng'
        + '\n	  {pn} [remove | -r] <uid | @tag>: Xóa quyền vip của người dùng'
        + '\n	  {pn} [list | -l]: Liệt kê danh sách vip',
      en: '   {pn} [add | -a] <uid | @tag>: Add vip role for user'
        + '\n	  {pn} [remove | -r] <uid | @tag>: Remove vip role of user'
        + '\n	  {pn} [list | -l]: List all vips'
    }
  },

  langs: {
    vi: {
      added: "✅ | Đã thêm quyền vip cho %1 người dùng:\n%2",
      alreadyAdmin: "\n⚠ | %1 người dùng đã có quyền vip từ trước rồi:\n%2",
      missingIdAdd: "⚠ | Vui lòng nhập ID hoặc tag người dùng muốn thêm quyền vip",
      removed: "✅ | Đã xóa quyền vip của %1 người dùng:\n%2",
      notAdmin: "⚠ | %1 người dùng không có quyền vip:\n%2",
      missingIdRemove: "⚠ | Vui lòng nhập ID hoặc tag người dùng muốn xóa quyền vip",
      listAdmin: "👑 | Danh sách vip:\n%1"
    },
    en: {
      added: "✅ | Added vip role for %1 users:\n%2",
      alreadyAdmin: "\n⚠ | %1 users already have vip role:\n%2",
      missingIdAdd: "⚠ | Please enter ID or tag user to add vip role",
      removed: "✅ | Removed vip role of %1 users:\n%2",
      notAdmin: "⚠ | %1 users don't have vip role:\n%2",
      missingIdRemove: "⚠ | Please enter ID or tag user to remove vip role",
      listAdmin: "👑 | List of VIPs:\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, api }) {
    const permission = global.GoatBot.config.GOD;
    if (!permission.includes(event.senderID)) {
      api.sendMessage("You don't have enough permission to use this command. Only My Authors Have Access.", event.threadID, event.messageID);
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
            uids = args.filter(arg => !isNaN(arg));
          const notAdminIds = [];
          const vipIds = [];
          for (const uid of uids) {
            if (config.vipUser.includes(uid))
              vipIds.push(uid);
            else
              notAdminIds.push(uid);
          }

          config.vipUser.push(...notAdminIds);
          const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
            + (vipIds.length > 0 ? getLang("alreadyAdmin", vipIds.length, vipIds.map(uid => `• ${uid}`).join("\n")) : "")
          );
        } else {
          return message.reply(getLang("missingIdAdd"));
        }
      }

      case "remove":
      case "-r": {
        if (args[1]) {
          let uids = [];
          if (Object.keys(event.mentions).length > 0)
            uids = Object.keys(event.mentions)[0];
          else
            uids = args.filter(arg => !isNaN(arg));
          const notAdminIds = [];
          const vipIds = [];
          for (const uid of uids) {
            if (config.vipUser.includes(uid))
              vipIds.push(uid);
            else
              notAdminIds.push(uid);
          }
          for (const uid of vipIds)
            config.vipUser.splice(config.vipUser.indexOf(uid), 1);
          const getNames = await Promise.all(vipIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (vipIds.length > 0 ? getLang("removed", vipIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
            + (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
          );
        } else {
          return message.reply(getLang("missingIdRemove"));
        }
      }

      case "list":
      case "-l": {
        const getNames = await Promise.all(config.vipUser.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
        return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n"));
      }

      default:
        return message.SyntaxError();
    }
  }
};