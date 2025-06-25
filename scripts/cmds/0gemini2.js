const axios = require('axios');

module.exports = {
  config: {
    name: "gemini2",
    author: "King Monsterwith",
    version: "1.7",
    countDown: 5,
    role: 0,
    category: "ai",
    description: "Chat with Gemini AI",
    usage: "{prefix}gemini <your message>",
    language: "en",
    example: "{prefix}gemini What is quantum computing?"
  },

  onStart: async function ({ message, event, args }) {
    const input = args.join(" ");
    if (!input) return message.reply("💬 Please enter a message to send to Gemini.");

    const reply = await queryGemini(input);
    return message.reply(reply);
  },

  onReply: async function ({ event, message, Reply, args }) {
    const input = args.join(" ");
    const reply = await queryGemini(input);
    return message.reply(reply);
  }
};

// Gemini AI API Call Function
async function queryGemini(prompt) {
  const apiKey = "AIzaSyAexh3GFJU3-GFH9cyZlAOrqkr715d8ifM";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-latest:generateContent?key=${apiKey}`;

  try {
    const res = await axios.post(url, {
      contents: [
        {
          parts: [{ text: prompt }],
          role: "user"
        }
      ]
    });

    const reply = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || "⚠️ Gemini didn't return any response.";
  } catch (err) {
    console.error("Gemini API Error:", err.response?.data || err.message);
    return "❌ Error talking to Gemini AI.";
  }
      }
