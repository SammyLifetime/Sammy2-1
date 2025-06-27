if (!global.client.busyList) global.client.busyList = {};
if (!global.client.busyUsers) global.client.busyUsers = {};

module.exports = {
  config: {
    name: "busy2",
    version: "2.0",
    author: "Monsterwith",
    countDown: 5,
    role: 0,
    description: {
      vi: "Bật chế độ không làm phiền, khi bạn được tag bot sẽ thông báo",
      en: "Turn on do not disturb mode, bot notifies when you're tagged"
    },
    category: "box chat",
    guide: {
      vi: "{pn} [để trống | <lý do>] : bật chế độ không làm phiền\n{pn} off : tắt chế độ không làm phiền\n{pn} busylist : xem danh sách người đang bận",
      en: "{pn} [empty | <reason>] : turn on do not disturb mode\n{pn} off : turn off do not disturb mode\n{pn} busylist : show list of busy users"
    }
  },

  langs: {
    vi: {
      turnedOff: "✅ | Đã tắt chế độ không làm phiền",
      turnedOn: "✅ | Đã bật chế độ không làm phiền",
      turnedOnWithReason: "✅ | Đã bật chế độ không làm phiền với lý do: %1",
      turnedOnWithoutReason: "✅ | Đã bật chế độ không làm phiền",
      alreadyOn: "%1, người dùng %2 đang bận",
      alreadyOnWithReason: "%1, người dùng %2 đang bận với lý do: %3",
      welcomeBackTagged: "👋 %1, chào mừng bạn trở lại, trong khi bạn vắng mặt đã có những người tag bạn: %2",
      welcomeBackNoTagged: "👋 %1, chào mừng bạn trở lại, trong khi bạn vắng mặt không ai tag bạn",
      busyListEmpty: "Hiện tại không có ai đang bật chế độ bận",
      busyListHeader: "Danh sách người đang bật chế độ bận:"
    },
    en: {
      turnedOff: "✅ | Do not disturb mode has been turned off",
      turnedOn: "✅ | Do not disturb mode has been turned on",
      turnedOnWithReason: "✅ | Do not disturb mode has been turned on with reason: %1",
      turnedOnWithoutReason: "✅ | Do not disturb mode has been turned on",
      alreadyOn: "%1, user %2 is currently busy",
      alreadyOnWithReason: "%1, user %2 is currently busy with reason: %3",
      welcomeBackTagged: "👋 %1, welcome back, while you were away these users tagged you: %2",
      welcomeBackNoTagged: "👋 %1, welcome back, while you were away no one tagged you",
      busyListEmpty: "There is currently no one on busy mode",
      busyListHeader: "List of users on busy mode:"
    }
  },

  onStart: async function({ args, message, event, getLang, usersData }) {
    const senderID = event.senderID;
    const subCommand = args[0]?.toLowerCase();

    if (subCommand === "off") {
      delete global.client.busyUsers[senderID];

      const data = (await usersData.get(senderID)) || {};
      if (data.busy) delete data.busy;
      await usersData.set(senderID, data, "data");

      if (global.client.busyList[senderID]) delete global.client.busyList[senderID];
      return message.reply(getLang("turnedOff"));
    }

    if (subCommand === "busylist") {
      const busyUsers = global.client.busyUsers;
      if (!busyUsers || Object.keys(busyUsers).length === 0) {
        return message.reply(getLang("busyListEmpty"));
      }

      // Build mention body and mentions array
      let body = getLang("busyListHeader") + "\n";
      const mentions = [];
      let count = 0;
      for (const [id, name] of Object.entries(busyUsers)) {
        count++;
        const tag = `@user${count}`;
        body += `${tag} - ${name}\n`;
        mentions.push({ id, tag });
      }

      return message.reply({ body, mentions });
    }

    // Turn ON busy mode with optional reason
    const reason = args.length ? args.join(" ") : "";
    const data = (await usersData.get(senderID)) || {};
    data.busy = reason;
    await usersData.set(senderID, data, "data");

    const userName = await usersData.getName(senderID) || senderID;
    global.client.busyUsers[senderID] = userName;
    global.client.busyList[senderID] = [];

    return message.reply(
      reason ?
        getLang("turnedOnWithReason", reason) :
        getLang("turnedOnWithoutReason")
    );
  },

  onChat: async function({ event, message, getLang, usersData }) {
    const mentions = event.mentions || {};
    const senderID = event.senderID;

    const busyData = (await usersData.get(senderID))?.busy;
    if (busyData !== undefined && busyData !== false) {
      delete global.client.busyUsers[senderID];

      const data = (await usersData.get(senderID)) || {};
      if (data.busy) delete data.busy;
      await usersData.set(senderID, data, "data");

      const taggedList = global.client.busyList[senderID] || [];
      delete global.client.busyList[senderID];

      if (taggedList.length) {
        const taggedMentions = taggedList.map(id => ({
          tag: `@${id}`,
          id
        }));

        return message.reply({
          body: getLang("welcomeBackTagged", `@${senderID}`, taggedMentions.map(m => m.tag).join(", ")),
          mentions: [{ tag: `@${senderID}`, id: senderID }, ...taggedMentions]
        });
      } else {
        return message.reply({
          body: getLang("welcomeBackNoTagged", `@${senderID}`),
          mentions: [{ tag: `@${senderID}`, id: senderID }]
        });
      }
    }

    if (!mentions || Object.keys(mentions).length === 0) return;

    const mentionIDs = Object.keys(mentions);

    for (const userID of mentionIDs) {
      const busyReason = (await usersData.get(userID))?.busy;

      if (busyReason !== undefined && busyReason !== false) {
        if (!global.client.busyList[userID]) global.client.busyList[userID] = [];
        if (!global.client.busyList[userID].includes(senderID)) {
          global.client.busyList[userID].push(senderID);
        }

        return message.reply({
          body: getLang("alreadyOnWithReason", `@${senderID}`, `@${userID}`, busyReason),
          mentions: [
            { tag: `@${senderID}`, id: senderID },
            { tag: `@${userID}`, id: userID }
          ]
        });
      }
    }
  }
};
    
