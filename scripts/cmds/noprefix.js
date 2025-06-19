// ⚙️ Module entry starts here
module.exports = {
  config: {
    name: "noprefix",
    version: "1.0",
    author: "LiANE/King Monsterwith",
    role: 2,
    category: "Config",
    shortDescription: { en: "Add/remove no-prefix aliases" },
    guide: { en: "noprefix add <alias> <command> | del <alias>" }
  },

  onStart: async function({ args, message }) {
    const [sub, alias, cmd] = args;
    const aliases = await loadAliases();

    const invalid = () => message.reply("Usage: noprefix add <alias> <command> OR del <alias>");

    if (sub === "add") {
      if (!alias || !cmd) return invalid();
      if (aliases[alias]) return message.reply(`Alias '${alias}' already → '${aliases[alias]}'`);
      aliases[alias] = cmd;
      await saveAliases(aliases);
      message.reply(`✅ Alias '${alias}' → '${cmd}' added`);
    } else if (sub === "del") {
      if (!alias) return invalid();
      if (!aliases[alias]) return message.reply(`Alias '${alias}' not found`);
      delete aliases[alias];
      await saveAliases(aliases);
      message.reply(`✅ Alias '${alias}' removed`);
    } else invalid();
  },

  onChat: async function(context) {
    const { args, event = {}, message, api, ...rest } = context;
    const key = args[0];
    const aliases = await loadAliases();
    const cmdName = aliases[key];
    if (!cmdName) return;

    // Safe destructuring of event
    const {
      threadID = null,
      senderID = null,
      messageID = null,
      body = null
    } = event;

    try {
      const files = await fs.readdir(__dirname);
      const match = files.find(f => {
        const base = path.basename(f, ".js").toLowerCase();
        return base === cmdName.toLowerCase();
      });
      if (!match) {
        throw new Error(`Command module '${cmdName}.js' not found`);
      }

      const cmdModule = require(path.join(__dirname, match));
      for (const fn of ["onStart", "onChat"]) {
        if (typeof cmdModule[fn] === "function") {
          await cmdModule[fn]({ api, args, event, message, role: context.role, getLang: context.getLang, usersData: context.usersData, threadsData: context.threadsData, dashBoardData: context.dashBoardData });
        }
      }
    } catch (err) {
      console.error(`❌ No‑prefix exec error (${key} → ${cmdName}):`, err);
      message.reply(`❌ Error executing alias '${key}' → '${cmdName}':\n${err.message}`);
    }
  }
};

// Helper functions
const fs = require("fs/promises");
const path = require("path");
const aliasFile = path.join(__dirname, "aliases.json");

async function loadAliases() {
  try {
    const raw = await fs.readFile(aliasFile, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveAliases(obj) {
  await fs.writeFile(aliasFile, JSON.stringify(obj, null, 2), "utf8");
        }
