module.exports = {
  config: {
    name: "block",
    author: "Monsterwith", // Converted by Goatbot Zed
    role: 2,
    shortDescription: "Block or unblock a user",
    longDescription: "Use 'block' or 'unblock' via command or replying to a user's message",
    category: "admin",
    guide: "block/unblock [mention/UID/FB_link] or reply to a message with 'block'"
  },

  onStart: async function({ api, event, args }) {
    await handleBlock(api, event, args, false);
  },

  onReply: async function({ api, event, reply, args }) {
    // If the user replies to someone with 'block' or 'unblock', grab that target
    const originalSender = reply?.senderID;
    if (!originalSender) return;

    const command = args[0]?.toLowerCase();
    if (command !== "block" && command !== "unblock") return;

    await handleBlock(api, event, [command, originalSender], true);
  }
};

// Central handler function
async function handleBlock(api, event, args, isReply) {
  const admins = new Set([
    "UID1","UID2" // add admin UIDs
  ]);
  if (!admins.has(event.senderID)) {
    return api.sendMessage(
      "❌ You don’t have permission to do that.",
      event.threadID, event.messageID
    );
  }

  const action = args[0]?.toLowerCase();
  let targetID = args[1];

  if (!targetID) {
    return api.sendMessage(
      `❌ Usage:\n• block [mention/UID/link]\n• unblock [UID]\nOr reply to a user's message with "block" or "unblock"`,
      event.threadID, event.messageID
    );
  }

  // Resolve profile link to UID
  const linkMatch = targetID.match(
    /https?:\/\/(?:m\.)?facebook\.com\/(?:profile\.php\?id=)?(\d+)/
  );
  if (linkMatch) targetID = linkMatch[1];

  api.changeBlockedStatus(targetID, action === "block", (err) => {
    if (err) {
      console.error(`Error in ${action} for ${targetID}:`, err);
      return api.sendMessage(
        `❌ Failed to ${action} user: ${err.message}`,
        event.threadID, event.messageID
      );
    }

    return api.sendMessage(
      `✅ Successfully ${action === "block" ? "blocked" : "unblocked"} user ${targetID}`,
      event.threadID, event.messageID
    );
  });
  }
      
