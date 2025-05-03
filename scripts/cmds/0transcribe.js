const axios = require('axios');

module.exports = {
    config: {
        name: "ytlix",
        aliases: ["ytcribe", "transcribe"],
        version: "1.0",
        author: "Samir Œ x DmatrixPikachu ",
        shortDescription: "Get transcript from the provided YouTube link ",
        longDescription: "Fetches transcript using the provided YouTube link.",
        category: "ai",
        guide: { en: "{pn} [question]" },
    },

    onStart: async function ({ message, args }) {
        const question = args.join(" ");
        if (!question) {
            return message.reply("❌ Please provide a link to proceed.");
        } else {
            try {
                const response = await axios.get(`https://apis-samir.onrender.com/yt/transcript?url=${encodeURIComponent(question)}`);


                const urlBase = response.data.transcript;

                message.reply(`caption: ${urlBase}`);
            } catch (e) {
                console.error(e);
                message.reply("❌ Error while fetching the response.");
            }
        }
    }
};
//limiter 1 minutes. higher than limit may cause storten response