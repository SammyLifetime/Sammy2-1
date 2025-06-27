const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "listen",
    version: "1.5",
    author: "Monsterwith",
    countDown: 5,
    role: 0,
    shortDescription: { en: "AI audio reply with voice" },
    longDescription: { en: "Free STT + GPT-4o + voice reply using TTS" },
    category: "ai",
    guide: {
      en: "{pn} on | off\n{pn} male | female"
    }
  },

  onStart: async function ({ message, event, threadsData, args }) {
    const threadData = await threadsData.get(event.threadID) || {};
    const listen = threadData.data?.listen || { enabled: true, voice: "female" };

    if (args[0] === "on") listen.enabled = true;
    else if (args[0] === "off") listen.enabled = false;
    else if (args[0] === "male" || args[0] === "female") listen.voice = args[0];
    else return message.reply(`🎧 Listen is ${listen.enabled ? "ON" : "OFF"}, voice: ${listen.voice}`);

    threadData.data = threadData.data || {};
    threadData.data.listen = listen;
    await threadsData.set(event.threadID, threadData.data);

    return message.reply(`✅ Listen ${args[0]} successfully.`);
  },

  onChat: async function ({ message, event, threadsData, getStreamFromAttachment, api }) {
    const threadData = await threadsData.get(event.threadID);
    const listen = threadData?.data?.listen;

    if (!listen?.enabled || !event?.attachments?.length) return;

    const audio = event.attachments.find(att => att.type === "audio");
    if (!audio) return;

    const waitMsg = await api.sendMessage("🎧 Transcribing audio, please wait...", event.threadID);

    try {
      const stream = await getStreamFromAttachment(audio);
      const tempPath = path.join(__dirname, "cache", `${event.messageID}.mp3`);
      const writer = fs.createWriteStream(tempPath);
      stream.pipe(writer);

      writer.on("finish", async () => {
        // Upload audio to VozLabs STT
        const formData = new FormData();
        formData.append("file", fs.createReadStream(tempPath));

        const sttRes = await axios.post("https://api.vozlabs.net/stt", formData, {
          headers: formData.getHeaders()
        });

        const transcript = sttRes.data?.text || "I couldn’t understand the audio.";
        fs.unlinkSync(tempPath);

        // GPT-4o response
        const gptRes = await axios.post("https://api.openai.com/v1/chat/completions", {
          model: "gpt-4o",
          messages: [{ role: "user", content: transcript }]
        }, {
          headers: {
            Authorization: `Bearer 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`
          }
        });

        const reply = gptRes.data.choices[0].message.content;
        const voice = listen.voice || "female";

        // Get TTS reply (no key needed)
        const ttsUrl = `https://api.monsterapi.ai/tts?text=${encodeURIComponent(reply)}&voice=${voice}`;
        const ttsRes = await axios.get(ttsUrl, { responseType: "arraybuffer" });
        const ttsPath = path.join(__dirname, "cache", `${event.messageID}_tts.mp3`);
        fs.writeFileSync(ttsPath, ttsRes.data);

        await api.unsendMessage(waitMsg.messageID);
        return api.sendMessage({
          body: reply,
          attachment: fs.createReadStream(ttsPath)
        }, event.threadID, () => fs.unlinkSync(ttsPath));
      });
    } catch (err) {
      console.error("Listen+TTS Error:", err);
      await api.unsendMessage(waitMsg.messageID);
      return api.sendMessage("❌ Error transcribing or replying to audio.", event.threadID);
    }
  }
};
                                             
