const { Manga, login } = require("mangadex-full-api");
const axios = require("axios");

module.exports = {
  config: {
    name: "manga2",
    version: "1.0",
    author: "King Monsterwith",
    countDown: 5,
    role: 0,
    description: "Search for manga on MangaDex",
    usage: "{pn} <title>",
    category: "anime"
  },

  onStart: async function ({ args, message }) {
    const query = args.join(" ");
    if (!query) return message.reply("❌ Please enter a manga title.");

    try {
      // Optional: Login for more access (guest access still works)
      await login(); // Anonymous login

      const results = await Manga.search(query, { limit: 1 });
      if (!results.length) return message.reply("❌ No manga found.");

      const manga = results[0];
      const title = manga.title;
      const description = manga.description.en || "No description available.";
      const url = `https://mangadex.org/title/${manga.id}`;
      const coverURL = await manga.getCoverURL();

      const reply = `📚 ${title}\n\n📝 ${description.slice(0, 300)}...\n🔗 ${url}`;
      return message.reply({ body: reply, attachment: await global.utils.getStreamFromURL(coverURL) });
    } catch (e) {
      console.error(e);
      return message.reply("❌ An error occurred while fetching manga.");
    }
  }
};
      
