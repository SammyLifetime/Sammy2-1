const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "file",
    author: "King Monsterwith",
    version: "2.1",
    category: "owner",
    role: 0,
    description: "Send/open files securely via chat",
    usage: "file send|open|all|help <filename> [text]",
    example: "file send hi.js"
  },

  onStart: async function({ args, message, event, api }) {
    const owners = new Set([
      "61575847331340","100090034473716","61555364517421",
      "100071743848974","100089801347113","100053534644778",
      "100074118110057"
    ]);
    if (!owners.has(event.senderID)) {
      return api.sendMessage("❌ Permission denied (owner only).", event.threadID, event.messageID);
    }

    const [sub, fileArg, ...rest] = args;
    const cmd = sub?.toLowerCase();
    const BASE_DIR = path.resolve(__dirname, '..', 'cmds');
    let filepath;

    try {
      if (fileArg) {
        filepath = getSafePath(fileArg);
      }
    } catch (err) {
      return message.reply(`❌ ${err.message}`);
    }

    try {
      switch (cmd) {
        case 'send':
          if (!fileArg) return message.reply("Usage: file send <filename>");
          if (!(await fs.pathExists(filepath))) {
            return message.reply(`❌ File not found: ${fileArg}`);
          }
          {
            const data = await fs.readFile(filepath, 'utf8');
            const preview = data.length > 5000 ? data.slice(0, 5000) + "\n…[truncated]" : data;
            message.reply(`📄 Contents of ${fileArg}:\n\`\`\`\n${preview}\n\`\`\``);
          }
          break;

        case 'open':
          if (!fileArg || rest.length === 0) return message.reply("Usage: file open <filename> <text>");
          await fs.outputFile(filepath, rest.join(' '), 'utf8');
          message.reply(`✅ File written: ${fileArg}`);
          break;

        case 'all':
          const files = await fs.readdir(BASE_DIR);
          message.reply(`🗂️ Files in cmds:\n${files.join('\n')}`);
          break;

        case 'help':
        default:
          message.reply(
`Usage:
• file send <filename> — read a file
• file open <filename> <text> — write
• file all — list available files
• file help — show this message`
          );
      }

    } catch (err) {
      console.error("File CMD Error:", err);
      message.reply(`❌ Error: ${err.message}`);
    }
  }
};

// Helpers

function getSafePath(userInput) {
  const BASE_DIR = path.resolve(__dirname, '..', 'cmds');
  const cleaned = path.basename(userInput);
  const fullPath = path.resolve(BASE_DIR, cleaned);
  if (!fullPath.startsWith(BASE_DIR + path.sep)) {
    throw new Error('Invalid file name');
  }
  return fullPath;
              }
          
