const axios = require("axios");

const Prefixes = ["Sammy", "sæmmy", "sammy", "@Sammy" ];

const fetch = require("node-fetch");

const apiUrl = 'https://production.api.cohere.ai/v1/chat';
const apiKey = 'D9Ett97lh1pQYFHXdilqJIAkt3nO1qFKGPn2QOmH';

function generateData(message) {
  return {
    message,
    connectors: [{ id: 'web-search' }]
  };
}

function printOutput(result, message) {
  let response = `${result.text}\n`;

  message.reply(response);
}

function processOutput(result, message) {
  printOutput(result, message);
}

async function sendMessageAndDisplayOutput(message, prompt, api, event) {
  try {
    api.setMessageReaction("🟡", event.messageID, () => { }, true);

    const data = generateData(prompt);
    console.log('Sending message:', prompt);
    console.log('Data:', data);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    processOutput(result, message);

    api.setMessageReaction("🟢", event.messageID, () => { }, true);
  } catch (error) {
    console.error(error.message);
    message.reply(error.message);
    api.setMessageReaction("❌", event.messageID, () => { }, true);
  }
}

module.exports = {
  config: {
    name: "Sammy",
    version: "2.2.5",
    author: "Shikaki | lance", // do not change
    role: 0,
    category: "ai",
    shortDescription: {
      en: "Asks AI for an answer.",
    },
    longDescription: {
      en: "Asks AI for an answer based on the user prompt.",
    },
    guide: {
      en: "{pn} [prompt]",
    },
  },
  onStart: async function ({ message, api, event, args }) {

  },
  onChat: async function ({ api, event, message }) {
    const prefix = Prefixes.find(
      (p) => event.body && event.body.toLowerCase().startsWith(p)
    );

    if (!prefix) {
      return;
    }

    var prompt = event.body.substring(prefix.length).trim();

    if (prompt === "") {
      await api.sendMessage(
        "Kindly provide the question at your convenience and I shall strive to deliver an effective response. Your satisfaction is my top priority.",
        event.threadID
      );
      return;

    }
    let updatedPrompt = `Mostly answer in short like 1 or 2 sentenes unless it requires a long answer such as essay, poem or story and so on. Analyze the prompt and answer as instructed and only the necessary part. no additional fillers. Now : ${prompt}`;

    await sendMessageAndDisplayOutput(message, prompt, api, event);
  }

};