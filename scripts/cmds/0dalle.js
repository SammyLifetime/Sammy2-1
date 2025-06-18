const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const KievRPSSecAuth = "FACCBRRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACO7XzIPlZJ+/QAVOyT+VhUCLD1de2Q+EWkw9If3z2QAAq2jn1KiJB/KpetrS7Yix9lUKO93fFkyrDUvlNmFWE2YCZC5eI9XLk1o24qYuVVRkabcSHoNjo10gNHvDsXy6IEW28PGVrRvCKSWaiMMC9Zy+grPj5o3MH+wOcfjo8n3GSn8HkiTWQH5aLuIBqJhMV6rMQxzV+zAO24o2P+OSaK5c5YxxV8x0ZP3sJsJ6I9+/4MF0NLYy7BG754ra6rJJWgmugQJ0oO+Gu4+Ap0hFxcBuqht1f401ws/ugJknz49BZq6YsXaWOFLCtrJ5YaHgdmeLNU4RLl1YRmHEsIe6NSTDMaxpyEq1Rvs59DChnAKKeZoquhEr9hAdTX5VG71NtUovjJVIoLLX/joz1U/tQNA1JRuMddKECTeKFiLFfq9vlHrrNU/k6Fx4oxaQY0UtGrIw53TEN9Aiy429u3Iv6r2sMcBRVkmtr/EOfonj2RUCBDQf1TIEUui4plohv2yInQsnbJUDtTAZMneyowskQGVZcRVznaRnvgUnKCbVR/2aSCWBpDJqYTb5q30di3MfT6tEM2CJUNaDJrbqTFVPtJP2jz9OFp7bJXzcdxmTctw/fC33e3kAQx8F5MIjA2IJwnl9pIlDLwpQtRb1n8im+XVZY/dPrzwr90LnMn1E3EKAQeop/QiBjcA4uMb8QQHYfeefdoaLfW490Wr5fzzFziIRjmsiOiIHwLnW1FRRK/66vtv7mpQkpp2Ccu6ok9o2VBPXcdsZ8yv8jX9iJsoaQw8MAa+xGsZqxGGgjzLUFMjgkRpYKpnC6EuOHpa8DXZTxCiBF0YWlCLIYjqVd2k4hqRYNJrqP4+5n69CC8R78UGoEM1/87kL3tJoKI1AosfkxchbVWVHeQgPIdiVnosD1y3Ke8rkPcbQNPi7IYdqTpNzJo/oLGijQWnhLeXLPhOph9gtfeRInW3Lj6KtqlVpoQVoXtjHgHBvcIz+9aQSdWjzfr29OvLSY3I88iOBNjihN6h9DsU7zjH98tRQDrFRMn+OD5DifPY7rJWpguhNRjI+SAVxXmmBoP5LhcvcXZXMrZ2qUIu+4P2//3qeQMvizxLCg6m2dasrkNXiFxC95AOZ9Ri30JbjEkJR5kbKLcWg+FTrxV3nZE9Vu1PAC1Z/4KWMz7kem6m8jL9RdLxjB+CDbFblwEkwhUVWqsL0gMz5LtkJ9sEPCv5hWsXP+MutGChGfm/0jE7dzvICY1lTLb0jnkF7sjSF/TmJc+fpp4shVzgwU1MbWDGQCwNoKIP19cdncPNO++BjkkSNwXyOmkPg+YcYwkkJeA2POpXuiMZhvKpUMxny68+8QdtJHJH+5Mks+Dl7RPiIjfxwmETYIiKddAIEPnlly4lqEPkWF/CAx/72EtpXV7KwAayy1gHexcF1Oh8tLp166XLomOFqR1ZZ/eAkRTjRDILkSAGRwQC48gSX/BF7HreQo4TME4dfbtoF46yU+JsxuKIJIhUXWSblZvpV4uyxPLqpsTy70hUC7pABi6TkhM+/CLJCjNiQiKyuq3coV8LELDcXGU+SYDJQ/BniyhTJ4e4P/vQ3WauSj6aqoDoX2gaGJ8U6YkpRydu3f/ubskZfuvvjxZvEHNQoXCtTRh16kk4zZ0YQdB0vqI/4JkA3fatb4Ya19MBoQ+Rsj1eJbE1veaqtDEl8ac10tCW5TL1U6044Jp27yH8X3pC8ycHBUOMjwdTTCMlpU88KacHlJDNkZaGra3+4RcrmX7zTtNpSXYQ0UbS/SfTFmzXcndDqIAnvuV8UAHnIqBUSVhg2sTa9hSTZ/NGe0JzX";
const _U = "1njn03Cf12aYeTk5XMtmKY_jiNctWgizZh4LM0p4M8Re_pe0Gr2EtQn_a4PfwUNqOxf3qlOoYBynQBNpCs8R6bWrigAquiHSLt7d5zRvggAJW29MOH_hsx1vhGAFi9L5TPWgTAWx_qvkDiYk9hRApYUrQiurnMkvlCgrKIiF91tfpeHJg3xwLoFCQKFCLLvL0EhNE7A6Dx5javKneo2zNzw";

module.exports = {
  config: {
    name: "dalle",
    version: "1.0.2",
    author: "Monsterwith",
    role: 0,
    countDown: 5,
    shortDescription: { en: "dalle3 image generator" },
    longDescription: { en: "dalle3 is a image generator powdered by OpenAi" },
    category: "𝗔𝗜",
    guide: { en: "{prefix}dalle <search query>" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");

    try {
      const res = await axios.get(`https://dalle3-uus9.onrender.com/dalle3?auth_cookie_U=${_U}&auth_cookie_KievRPSSecAuth=${KievRPSSecAuth}&prompt=${encodeURIComponent(prompt)}`);
      const data = res.data.results.images;

      if (!data || data.length === 0) {
        api.sendMessage("response received but imgurl are missing ", event.threadID, event.messageID);
        return;
      }

      const imgData = [];

      for (let i = 0; i < Math.min(4, data.length); i++) {
        const imgResponse = await axios.get(data[i].url, { responseType: 'arraybuffer' });
        const imgPath = path.join(__dirname, 'cache', `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      }

      await api.sendMessage({
        attachment: imgData,
        body: `Here's your generated image`
      }, event.threadID, event.messageID);

    } catch (error) {
      api.sendMessage("Can't Full Fill this request ", event.threadID, event.messageID);
    }
  }
};
