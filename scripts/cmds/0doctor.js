const axios = require("axios");

const OPENAI_KEY = "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";
const GEMINI_KEY = "AIzaSyAexh3GFJU3-GFH9cyZlAOrqkr715d8ifM";

module.exports = {
  config: {
    name: "doctor",
    aliases: ["doc", "drsammy"],
    version: "1.0",
    author: "Samuel Kâñèñgeè + Monsterwith",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: "{pn} <your question>"
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ");
    const { threadID, messageID, messageReply } = event;

    if (!input && !messageReply?.body) {
      return api.sendMessage("Hello 👨‍⚕️, how can I help you today?", threadID, messageID);
    }

    const userPrompt = input || messageReply.body;
    const basePrompt = `You are Dr. Sammy, a professional medical AI. Answer in 4 lines or less unless giving treatment or instructions. Be kind, clear, and helpful. You may suggest medicine, natural remedies, or lifestyle changes if needed. Respond in the user's language.`;

    const finalPrompt = `${basePrompt}\n\nPatient: ${userPrompt}`;

    try {
      const openaiRes = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "user", content: finalPrompt }],
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const reply = openaiRes.data.choices[0].message.content.trim();
      return api.sendMessage(reply, threadID, messageID);
    } catch (err) {
      console.warn("❌ OpenAI failed. Trying Gemini...");

      // Fallback to Gemini
      try {
        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-latest:generateContent?key=${GEMINI_KEY}`,
          {
            contents: [{ role: "user", parts: [{ text: finalPrompt }] }]
          }
        );

        const geminiText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return api.sendMessage(geminiText || "Sorry, I couldn't respond.", threadID, messageID);
      } catch (gErr) {
        return api.sendMessage("⚠️ I'm unable to respond right now. Please try again later.", threadID, messageID);
      }
    }
  }
};
