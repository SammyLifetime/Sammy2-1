const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const FormData = require("form-data");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "listen",
    version: "4.3",
    author: "King Monsterwith",
    shortDescription: "AI listens and responds in any language with voice",
    longDescription: "Reply to audio or text, bot replies in voice (.mp3) using GPT-4o",
    category: "ai",
    guide: {
      en: "{pn} [text or reply to audio/text] — speaks back in any language"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const userInput = args.join(" ");
    const repliedMsg = event.messageReply;
    const audioUrl = repliedMsg?.attachments?.[0]?.url;
    const isAudioLink = userInput.startsWith("http") && userInput.includes(".mp3");

    let promptText = userInput;
    const waitMsg = await message.reply("⏳ Please wait, processing...");

    try {
      // 🔊 Handle audio input
      if (audioUrl || isAudioLink) {
        try {
          const audioStream = await getStreamFromURL(audioUrl || userInput);
          const form = new FormData();
          form.append("file", audioStream, {
            filename: "audio.mp3",
            contentType: "audio/mpeg"
          });
          form.append("model", "whisper-1");

          const transcript = await axios.post(
            "https://api.openai.com/v1/audio/transcriptions",
            form,
            {
              headers: {
                ...form.getHeaders(),
                Authorization: `Bearer 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`
              }
            }
          );

          promptText = transcript.data.text;
        } catch (err) {
          await message.unsend(waitMsg.messageID);
          const error = err.response?.data?.error?.message || err.message;
          return message.reply(`❌ Whisper API error: ${error}`);
        }
      } else if (repliedMsg?.body && !userInput) {
        promptText = repliedMsg.body;
      }

      if (!promptText) {
        await message.unsend(waitMsg.messageID);
        return message.reply("❗ Please reply with audio or type your message.");
      }

      // 🌍 Language detection
      let langCode = "en";
      try {
        const detectRes = await axios.post(
          "https://ws.detectlanguage.com/0.2/detect",
          new URLSearchParams({ q: promptText }).toString(),
          {
            headers: {
              Authorization: "Bearer eb0606981823c877e0adca305512a01b",
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        );
        langCode = detectRes.data.data.detections[0]?.language || "en";
      } catch (err) {
        console.error("Language detection failed:", err.messag
      
