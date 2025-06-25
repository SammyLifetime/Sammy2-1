const axios = require("axios");

const OPENAI_KEY = "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";
const GEMINI_KEY = "AIzaSyAexh3GFJU3-GFH9cyZlAOrqkr715d8ifM";

module.exports = {
  config: {
    name: "doctor",
    aliases: ["doc", "drsammy"],
    version: "1.1",
    author: "Samuel Kâñèñgeè + Monsterwith",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: "{pn} <your health question>"
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ");
    const { threadID, messageID, messageReply } = event;

    if (!input && !messageReply?.body) {
      api.sendMessage("Hello 👨‍⚕️, how can I help you today?", threadID, messageID);
      api.setMessageReaction("🫀", messageID, () => {}, true);
      return;
    }

    const userPrompt = input || messageReply.body;
    const basePrompt = `You are Dr. Sammy, a professional medical AI. Always answer like a real doctor. Limit response to 4 lines unless giving instructions or medication. You can recommend herbs, natural treatments, or lifestyle changes. Speak in user's language if detected.`;

    const fullPrompt = `${basePrompt}\n\nPatient says: ${userPrompt}`;

    // Try OpenAI first
    try {
      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "user", content: fullPrompt }],
          max_tokens: 350,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const reply = res.data.choices[0].message.content.trim();
      api.sendMessage(reply, threadID, messageID);
      api.setMessageReaction("🫀", messageID, () => {}, true);
    } catch (error) {
      // If OpenAI fails, use Gemini fallback
      try {
        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-latest:generateContent?key=${GEMINI_KEY}`,
          {
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
          }
        );

        const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        api.sendMessage(reply || "Sorry, I'm unable to answer at the moment.", threadID, messageID);
        api.setMessageReaction("🫀", messageID, () => {}, true);
      } catch (gemError) {
        api.sendMessage("⚠️ I'm currently unable to help. Please try again later.", threadID, messageID);
        api.setMessageReaction("🫀", messageID, () => {}, true);
      }
    }
  }
};
