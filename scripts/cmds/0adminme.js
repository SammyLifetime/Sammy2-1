module.exports = {
  config: {
    name: "adminme",
    aliases: ["respect", "mythrown"],
    version: "1.0",
    author: "King Monsterwith Samuel Kâñèñgeè",
    countDown: 0,
    role: 0,
    shortDescription: "Give admin and show respect",
    longDescription: "Gives admin privileges in the thread and shows a respectful message.",
    category: "owner",
    guide: "{pn} adminme",
  },

  onStart: async function ({ message, args, api, event, usersData, ThreadData}) {
    try {
      console.log('Sender ID:', event.senderID);

      const permission = ["61575847331340", "100093041946125", "100077250049300", "100053534644778"];
      if (!permission.includes(event.senderID)) {
        return api.sendMessage(
          "╔════ஜ۩۞۩ஜ═══╗\n\n(\/)\ •_•)\/ >🧠\nyou Drop This Dumb Ass\n\n╚════ஜ۩۞۩ஜ═══╝",
          event.threadID,
          event.messageID
        );
      }

      const threadID = event.threadID;
      const adminID = event.senderID;
      
      // Change the user to an admin
      await api.changeAdminStatus(threadID, adminID, true);

      api.sendMessage(
        `╔════ஜ۩۞۩ஜ═══╗\n\nI respect you, your highness! You are now an admin in this thread.\n\n╚════ஜ۩۞۩ஜ═══╝`,
        threadID
      );
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      api.sendMessage("╔════ஜ۩۞۩ஜ═══╗\n\nAn error occurred while promoting to admin.\n\n╚════ஜ۩۞۩ஜ═══╝", event.threadID);
    }
  },
};
