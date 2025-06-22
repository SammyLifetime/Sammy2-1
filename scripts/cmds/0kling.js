const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const KLING_API_KEY = '2a86d4da3ce9d8923e5aba34a5c0c56631d1290796bae885ca5411f55c6f02bc'; // ✅ PUT YOUR KEY HERE

module.exports = {
  config: {
    name: "kling",
    author: "King Monsterwith",
    version: "2.0",
    countDown: 5,
    category: "AI Tools",
    role: 0,
    description: "Generate image, video, or chat responses using Kling AI",
    usage: "{prefix}kling <image|video|chat> <prompt>",
    example: "{prefix}kling image a dancing baby"
  },

  onStart: async function ({ args, message, event, api }) {
    return this.handleKling(args, event, api);
  },

  onChat: async function ({ args, message, event, api }) {
    return this.handleKling(args, event, api);
  },
  handleKling: async function (args, event, api) {
    const type = args[0]?.toLowerCase();
    const prompt = args.slice(1).join(" ");

    if (!type || !prompt) {
      return api.sendMessage(
        "⚠️ Usage: kling <image|video|chat> <prompt>\n\nExamples:\n- kling image a robot chef\n- kling video astronaut dancing\n- kling chat what is the meaning of life?",
        event.threadID,
        event.messageID
      );
    }

    const isExplicitType = ['image', 'video', 'chat'].includes(type);
    const mode = isExplicitType ? type : 'chat';
    const actualPrompt = isExplicitType ? prompt : args.join(" ");

    const headers = {
      'Content-Type': 'application/json',
      'Subscription-Key': KLING_API_KEY
    };

    try {
      let endpoint = "";
      let payload = {};
      let isMedia = false;

      if (mode === 'image') {
        endpoint = 'https://gateway.appypie.com/kling-ai-image/v1/getImageTask';
        payload = { prompt: actualPrompt, aspect_ratio: "16:9" };
        isMedia = true;
      } else if (mode === 'video') {
        endpoint = 'https://api.piapi.ai/api/v1/task';
        payload = { prompt: actualPrompt, aspect_ratio: "16:9" };
        isMedia = true;
      } else {
        endpoint = 'https://gateway.appypie.com/kling-ai-chat/v1/chat';
        payload = { prompt: actualPrompt };
      }

      const response = await axios.post(endpoint, payload, { headers });

      if (isMedia) {
        const mediaUrl = response.data?.resultUrl;
        if (!mediaUrl) {
          return api.sendMessage("⚠️ No result received from Kling AI.", event.threadID, event.messageID);
        }

        const ext = mode === 'image' ? 'jpg' : 'mp4';
        const fileName = `${uuidv4()}.${ext}`;
        const filePath = path.join(__dirname, 'cache', fileName);

        const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, mediaResponse.data);

        return api.sendMessage({
          body: `✅ Here's your ${mode} for: \"${actualPrompt}\"`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      } else {
        const reply = response.data?.reply || response.data?.message || "🤖 No reply received.";
        return api.sendMessage(reply, event.threadID, event.messageID);
      }

    } catch (err) {
      console.error(\"Kling API error:\", err.message);
      return api.sendMessage(\"❌ Failed to process Kling AI request.\", event.threadID, event.messageID);
    }
  }
};
