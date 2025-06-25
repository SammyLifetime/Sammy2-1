const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "play",
    author: "King Monsterwith",
    version: "1.3",
    countDown: 5,
    category: "media",
    role: 0,
    description: "Download YouTube audio/video without ytdl-core",
    usage: "play <keyword|link> [-v|-a]",
    example: "play munn belongs with you -a"
  },

  onStart: async function ({ args, message }) {
    const mode = args.includes("-a") ? "audio" : "video";
    const query = args.filter(a => a !== "-a" && a !== "-v").join(" ");
    if (!query) return message.reply("📌 Usage: play <song/link> [-v|-a]");

    // YouTube Search
    const apiKey = "AIzaSyBnm83iCcXE15R0UcnVpJKyxbeyfPn9xxs";
    const searchUrl = `https://www.googleapis.com/youtube/v3/search`;
    const searchRes = await axios
      .get(searchUrl, {
        params: {
          part: "snippet",
          q: query,
          maxResults: 1,
          type: "video",
          key: apiKey
        }
      })
      .catch(() => null);

    if (!searchRes || !searchRes.data.items.length)
      return message.reply("❌ No results found.");

    const videoId = searchRes.data.items[0].id.videoId;
    const title = searchRes.data.items[0].snippet.title;
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    // Use 3rd-party link resolver
    const infoApi = `https://yt.trompa.top/info?url=${encodeURIComponent(url)}`;
    const info = await axios.get(infoApi).catch(() => null);
    if (!info?.data) return message.reply("❌ Failed to get download info.");

    const sources = mode === "audio" ? info.data.audio : info.data.video;
    if (!sources || !sources.length)
      return message.reply(`❌ No ${mode} formats found.`);

    const limit = mode === "audio" ? 26 : 100;
    const stream = sources.find(f => f.filesize && f.filesize <= limit * 1024 * 1024);
    if (!stream) return message.reply(`❌ No ${mode} under ${limit}MB found.`);

    // Download and send
    const ext = mode === "audio" ? "mp3" : "mp4";
    const filename = `${videoId}_${Date.now()}.${ext}`;
    const filepath = path.join(__dirname, "..", "..", "temp", filename);

    try {
      const res = await axios.get(stream.url, { responseType: "stream" });
      const writer = fs.createWriteStream(filepath);
      res.data.pipe(writer);

      writer.on("finish", () => {
        message.reply(
          { body: title, attachment: fs.createReadStream(filepath) },
          () => fs.unlinkSync(filepath)
        );
      });
    } catch (err) {
      console.error("Download error", err);
      return message.reply("❌ Failed to download the file.");
    }
  }
};
