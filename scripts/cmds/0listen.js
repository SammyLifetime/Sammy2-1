const fs = require("fs");
const path = require("path");
const axios = require("axios");

let listenState = true;
let voiceGender = "female";

const GEMINI_API_KEY = "AIzaSyAexh3GFJU3-GFH9cyZlAOrqkr715d8ifM";

module.exports = {
  config: {
    name: "listen",
    aliases:"Sl",
    version: "lite-sammy-v2",
    author: "King Monsterwith",
    countDown: 3,
    role: 0,
    category: "ai",
    description: "Listens to audio only, simulates fake transcript, responds as Sammy",
    usage: "{prefix}listen [on|off|male|female]",
    language: "en"
  },

  onStart: async function ({ args, message }) {
    const arg = args[0]?.toLowerCase();
    if (!arg) return message.reply(`🎧 Listen is ${listenState ? "ON" : "OFF"}. Voice: ${voiceGender}`);

    if (arg === "on" || arg === "off") {
      listenState = arg === "on";
      return message.reply(`✅ Listen ${listenState ? "enabled" : "disabled"}`);
    }

    if (arg === "male" || arg === "female") {
      voiceGender = arg;
      return message.reply(`🔈 Voice set to ${voiceGender}`);
    }

    return message.reply("❓ Usage: listen [on|off|male|female]");
  },

  onMessage: async function ({ event, message }) {
    if (!listenState || !event.attachments?.length) return;

    const audio = event.attachments.find(att => att.type === "audio");
    if (!audio) return;

    const tempPath = path.join(__dirname, `../../temp/${event.messageID}.mp3`);
    const audioStream = fs.createWriteStream(tempPath);

    try {
      const response = await axios.get(audio.url, { responseType: "stream" });
      response.data.pipe(audioStream);

      audioStream.on("finish", async () => {
        const transcript = getRandomFakeTranscript();
        const isIdentity = checkIfIdentityQuestion(transcript);

        if (isIdentity) {
          return message.reply("👋 I'm Sammy, your AI assistant.");
        }

        const aiReply = await queryGemini(`User said in audio: "${transcript}". Respond appropriately.`);
        return message.reply(aiReply);
      });
    } catch (err) {
      console.error("Audio error:", err);
      return message.reply("❌ Failed to process audio.");
    }
  }
};

// 🧠 Identity Question Detector
function checkIfIdentityQuestion(text = "") {
  const prompts = [
    "who are you", "what is your name", "what are you",
    "identify yourself", "your identity", "who am i talking to",
    "tell me about yourself"
  ];

  return prompts.some(p => text.toLowerCase().includes(p));
}

// 🔀 Random Transcript Generator
function getRandomFakeTranscript() {
  const samples = [
    "What's the weather like today?",
    "Can you tell me a joke?",
    "Who are you?",
    "How do I reset my password?",
    "What's the capital of Zambia?",
    "What is your name?",
    "What should I eat for dinner?",
    "Tell me about space travel.",
    "Identify yourself",
    "I need help with homework"
  ];

  const index = Math.floor(Math.random() * samples.length);
  return samples[index];
}

// 🤖 Gemini AI
async function queryGemini(prompt) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-latest:generateContent?key=${GEMINI_API_KEY}`;
    const res = await axios.post(url, {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 I'm not sure how to respond.";
  } catch (err) {
    console.error("Gemini error:", err.response?.data || err.message);
    return "❌ Gemini AI error.";
  }
}
