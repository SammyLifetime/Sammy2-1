const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "transcribe",
    version: "1.0",
    author: "Monsterwith",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Transcribe replied audio to text" },
    longDescription: { en: "Reply to an audio message with this command to transcribe it into text (supports all languages)" },
    category: "ai",
    guide: {
      en: "{pn} (as a reply to an audio message)"
    }
  },

  onStart: async function ({ event, api, args, message, getStreamFromAttachment }) {
    const reply = event.messageReply;
    if (!reply || !reply.attachments || reply.attachments.length === 0) {
      return message.reply("❌ Please reply to an audio message to transcribe it.");
    }

    const audio = reply.attachments.find(att => att.type === "audio");
    if (!audio) {
      return message.reply("❌ The replied message must be an audio file.");
    }

    const waitMsg = await api.sendMessage("🔄 Transcribing audio...", event.threadID);

    try {
      const stream = await getStreamFromAttachment(audio);
      const tempPath = path.join(__dirname, "cache", `${event.messageID}.mp3`);
      const writer = fs.createWriteStream(tempPath);
      stream.pipe(writer);

      writer.on("finish", async () => {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(tempPath));

        const res = await axios.post("https://api.vozlabs.net/stt", formData, {
          headers: formData.getHeaders()
        });

        fs.unlinkSync(tempPath);

        const text = res.data?.text;
        await api.unsendMessage(waitMsg.messageID);

        if (!text) {
          return api.sendMessage("⚠️ Could not transcribe the audio.", event.threadID, event.messageID);
        }

        return api.sendMessage(`📝 Transcription:\n${text}`, event.threadID, event.messageID);
      });
    } catch (err) {
      console.error("Transcribe error:", err.message);
      await api.unsendMessage(waitMsg.messageID);
      return api.sendMessage("❌ Error occurred during transcription.", event.threadID);
    }
  }
};
