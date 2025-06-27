const fs = require("fs");
const path = require("path");
const axios = require("axios");
const puppeteer = require("puppeteer");

// Load your Bing session cookie
const { bing_cookie } = require("../../bing.json");

module.exports = {
  config: {
    name: "dalle",
    author: "King Monsterwith",//King Monsterwith 
    version: "1.2",
    countdown: 5,
    role: 0,
    description: "Generate image using Bing Image Creator (with your _U cookie)",
    usage: "<prompt>",
    category: "ai",
    example: "dalle sunset over alien ruins"
  },

  onStart: async function ({ args, message, event, api }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply(
        "🎯 Please give me a prompt. Example: `dalle neon owl in a cyberpunk city`"
      );
    }

    message.reply("🔮 DALL·E is dreaming… please wait.");

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
      const page = await browser.newPage();

      // inject your _U cookie so Bing sees you as a logged-in user
      await page.setCookie({
        name: "_U",
        value: bing_cookie,
        domain: ".bing.com",
        path: "/",
        httpOnly: true,
        secure: true
      });

      // navigate and generate
      await page.goto("https://www.bing.com/images/create", {
        waitUntil: "networkidle2"
      });
      const inputSel = 'textarea[aria-label="Enter a description for the image you want"]';
      await page.waitForSelector(inputSel);
      await page.type(inputSel, prompt, { delay: 50 });
      await page.click('button[type="submit"]');

      // wait for result
      await page.waitForSelector(".mimg", { timeout: 60000 });
      const imageUrl = await page.$eval(".mimg", img => img.src);

      // download & send
      const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const tmpPath = path.join(__dirname, `tmp_${event.senderID}.jpg`);
      fs.writeFileSync(tmpPath, data);

      api.sendMessage(
        {
          body: `🖼️ Here’s what “${prompt}” looks like:`,
          attachment: fs.createReadStream(tmpPath)
        },
        event.threadID,
        () => fs.unlinkSync(tmpPath)
      );

    } catch (err) {
      console.error("❌ dalle error:", err);
      message.reply(
        "⚠️ Something went wrong generating your image. Check your _U cookie or try again later."
      );
    } finally {
      if (browser) await browser.close();
    }
  }
};
  
