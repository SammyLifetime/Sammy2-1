const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const KLING_API_KEY = '2a86d4da3ce9d8923e5aba34a5c0c56631d1290796bae885ca5411f55c6f02bc';

module.exports = {
  config: {
    name: "kling",
    author: "King Monsterwith",
    version: "2.1",
    countDown: 5,
    category: "AI Tools",
    role: 0,
    shortDescription: "Generate image, video, or chat via Kling AI",
    usage: "{prefix}kling <image|video|chat> <prompt>",
    example: "{prefix}kling image a dancing baby"
  },

  onStart: async function({ api, event, args, prefix, commandName }) {
    // Only run when correct command is called
    if (commandName !== this.config.name) return;
    return this.handleKling(args, event, api);
  },

  handleKling: async function(args, event, api) {
    const type = args[0]?.toLowerCase();
    const prompt = args.slice(1).join(" ");
    if (!type || !prompt) {
      return api.sendMessage(
        `⚠️ Usage:\n${this.config.usage}\nExample:\n${this.config.example}`,
        event.threadID, event.messageID
      );
    }

    const mode = ['image', 'video', 'chat'].includes(type) ? type : 'chat';
    let endpoint, taskKey, isMedia = false;

    if (mode === 'image') {
      endpoint = 'https://gateway.appypie.com/kling-ai-image/v1/getImageTask';
      taskKey = 'task_id';
      isMedia = true;
    } else if (mode === 'video') {
      endpoint = 'https://api.piapi.ai/api/kling/v1/video';
      taskKey = 'task_id';
      isMedia = true;
    } else {
      endpoint = 'https://gateway.appypie.com/kling-ai-chat/v1/chat';
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': KLING_API_KEY
      };

      const body = { prompt };
      const postRes = await axios.post(endpoint, body, { headers });
      const data = postRes.data;

      if (isMedia) {
        const taskId = data.data?.task_id || data.task_id;
        if (!taskId) {
          return api.sendMessage(`❌ Failed to start ${mode} generation`, event.threadID, event.messageID);
        }

        await api.sendMessage(`⏳ Generating ${mode} (task: ${taskId})…`, event.threadID, event.messageID);

        // Polling
        const statusUrl = mode === 'image' ?
          'https://gateway.appypie.com/kling-ai-polling/v1/getImageStatus' :
          `https://api.piapi.ai/api/kling/v1/video/${taskId}`;

        let fileUrl = null;
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 5000));
          const statusRes = await axios.post(statusUrl, { task_id: taskId }, { headers });
          const stat = statusRes.data.data || statusRes.data;
          if (stat.task_status === 'succeed' && stat.task_result?.images) {
            fileUrl = stat.task_result.images[0].url;
            break;
          }
        }

        if (!fileUrl) {
          return api.sendMessage(`❌ ${mode} generation timed out.`, event.threadID, event.messageID);
        }

        const ext = mode === 'image' ? 'jpg' : 'mp4';
        const fileName = `${uuidv4()}.${ext}`;
        const filePath = path.join(__dirname, 'cache', fileName);
        const fetchRes = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        await fs.outputFile(filePath, fetchRes.data);

        return api.sendMessage({
          body: `✅ Here's your ${mode} for: "${prompt}"`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));

      } else {
        const reply = data.reply || data.message || JSON.stringify(data);
        return api.sendMessage(reply, event.threadID, event.messageID);
      }
    } catch (err) {
      console.error("Kling error:", err.response?.data || err.message);
      return api.sendMessage("❌ Kling API error", event.threadID, event.messageID);
    }
  }
};
