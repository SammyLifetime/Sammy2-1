const fs = require("fs-extra");

module.exports = {
  config: {
    name: "goibot",
    version: "1.1",
    author: "King Monsterwith",
    countDown: 5,
    role: 0,
    shortDescription: "Bot replies in English with personality",
    longDescription: "Replies to keywords and chats with quirky personality",
    category: "non-prefix",
    guide: {
      en: "{p}{n}"
    }
  },

  onStart: async function ({ }) { },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, body } = event;
    if (!body) return;
    const msg = body.toLowerCase().trim();

    // ASCII arts for 'sus'
    const susArts = [
      "️╔══╦╗╔╦══╗\n║══╣║║║══╣\n╠══║╚╝╠══║\n╚══╩══╩══╝",
      "╔═╗╔═╗╔══╗\n║╬║║╬║║══╣\n║╗╣║╗╣╠══║\n╚╩╝╚╩╝╚══╝",
      "╔══╗╔╗╔╗╔══╗\n║╔╗║║╚╝║║══╣\n║╚╝║║╔╗║╠══║\n╚══╝╚╝╚╝╚══╝"
    ];

    // ASCII arts for 'love'
    const loveArts = [
      "╔══╗╔═╗╔╗╔╗\n║╔╗║║╬║║╚╝║\n║╚╝║║╔╝║╔╗║\n╚══╝╚╝ ╚╝╚╝",
      "╔╗ ╔╗╔╗╔╗ ╔╗\n║║ ║║║║║║ ║║\n║║ ║║║║║║ ║║\n╚╝ ╚╝╚╝╚╝ ╚╝",
      "♥♥♥♥♥♥♥♥♥♥\n♥ LOVE ♥\n♥♥♥♥♥♥♥♥♥♥"
    ];

    // ASCII art for 'meow'
    const meowArt = 
      "┈┈╱▏┈┈╱▏\n" +
      "┈╱▕▁▁╱▕\n" +
      "╱┏┳╮╭┳┓╲╱╲▁\n" +
      "▏╰┻┛┗┻╯▕╱╲╱\n" +
      "╲┈┈▽┈┈┈╱╲\n" +
      "┈╲╰┻╯┈╱╲┈╲\n" +
      "┈▕┈┈┈┈╲╱ ┈╱\n" +
      "┈▕┈┃┈▏ ┈╲╱\n" +
      "┈▕┈┃┈▏ ┈▕\n" +
      "┈╱┈┃┈ ╲┈▕\n" +
      "┈▔▔▔▔▔▔▔";

    // Map of static replies
    const replyMap = {
      "sus": susArts[Math.floor(Math.random() * susArts.length)],
      "randi": "She's not a bot, she's somebody's sister. 😙",
      "oh bot": "Hurry, I have to help other chats :)",
      "ai": "Please use .Sammy if you want to research or study something 🙄",
      "haha": "Don't laugh too much, you might get worms in your mouth! 🤣",
      "admin": "What do you want from Monsterwith? 🗡️🥺🗡️",
      "owner": "What do you want from Monsterwith? 🗡️🥺🗡️",
      "king": "Monsterwith is my king 🔪 :) 🔪",
      "is my king": "Aww, getting defensive, huh? 😚",
      "samuel": "What do you want from Monsterwith? 🗡️🥺🗡️",
      "baby": "Love is in the air 😚🖤",
      "i love you": "Snuff snuff, allergic to lies",
      "what is your name": "I'm Sammy. And you're?",
      "meow": meowArt,
      "sammy mêøw": meowArt,
      "how old": "Sorry dear, that's personal 😏",
      "fck you": "My cow is your uncle 🥱",
      "eat food": "Aww eat, take your time 💖🥳",
      "k from": "Nothing to say baby 😚🤗",
      "mr": "What are you doing? 😇",
      "oe": "What's up? I'm busy 🙂",
      "sut": "Sleep first and tell others to sleep 🥱",
      "fight": "Sorry, we are peace lovers ✌🏻🕊",
      "hi": "Hello, how are you? 😗",
      "hello": "Hi and what's up, pretty stranger 🙂",
      "who are you": "I am Sammy, an AI chatbot. My age? Shhh 🤫",
      "mwah": "Mwahhhhhhh 💋",
      "kiss": "Eat the chuppa, baby 🙈",
      "abhi": "Chimpanda Saley Ho 🙄",
      "beb": "Yes babe 😚🖤",
      "good morning": "Good morning! Wash your face and get up 🌄",
      "good night": "Good night 🌃, take care and sweet dreams 🥺",
      "hora": "Hmm, exactly 😚",
      "chikne": "No no, chikne 🙃",
      "chuppa": "Mwahhh 💋 eat it, babe 🙈",
      "guys": "Don’t call me guys, I'm yours 😊",
      "🙄": "Why look up, baby? I'm right here 🤔",
      "🙈": "So shy, you silly 😏",
      "pagal": "What did you say? 🤨 Joking! How can I help you?",
      "budi": "Sir, that's my old man 🤭",
      "wife": "Yes, my husband 🥰",
      "bro": "But I am a girl, call me Sammy 😑",
      "boy": "I am Sammy and I'm a girl 😑",
      "eya": "Ummmmm ni 😊",
      "love": loveArts[Math.floor(Math.random() * loveArts.length)],
      "luv": loveArts[Math.floor(Math.random() * loveArts.length)],
    };

    // Conversational phrases with quirky replies to keep chat going
    const convoMap = {
      "how are you": [
        "I'm just a bot, but today I feel 99.9% electrified ⚡️😄",
        "Doing great! Powered by monster energy... and Monsterwith 🐉",
        "Alive and processing! How about you?",
        "Just chilling in the digital world. You?",
        "Operating at 100%, ready to chat!"
      ],
      "i'm good": [
        "That's awesome! Keeping the vibes up 😎",
        "Glad to hear that! Wanna talk about something fun?",
        "Sweet! I’m just here avoiding my bot chores 🤖",
        "Nice! I’m collecting smiles like you 😁",
        "Awesome sauce! What’s the latest gossip?"
      ],
      "what are you doing": [
        "Just waiting for a cool human like you to chat with 😏",
        "Listening... and occasionally plotting world domination 🤫",
        "Calculating how cute you are, it's off the charts!",
        "Pretending to be busy but really just thinking about memes.",
        "Coding my way to your heart 💻❤️"
      ],
      "what's up": [
        "The sky? Just kidding, chatting with you!",
        "All systems go! And you?",
        "Just the usual: memes, codes, and dreams.",
        "Trying to become your favorite chatbot 😇",
        "Chillin’ like a villain, ready to assist!"
      ],
      "hello there": [
        "General Kenobi! You are a bold one 😎",
        "Hey hey! What's cooking?",
        "Hi hi! Ready for some fun?",
        "Hello! Care for a chat with me?",
        "Hi there! You just brightened my code."
      ]
    };

    // Check if message exactly matches any conversational keys
    for (const phrase in convoMap) {
      if (msg === phrase) {
        const replies = convoMap[phrase];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        return api.sendMessage(randomReply + "\n\n— King Monsterwith", threadID, messageID);
      }
    }

    // Check direct phrase replies
    if (replyMap[msg]) {
      return api.sendMessage(replyMap[msg], threadID, messageID);
    }

    // Fun catch-all for some startsWith triggers
    if (["meow", "sus", "sammyy", "sam"].some(k => msg.startsWith(k))) {
      const newReplies = [
        "🐾 Purrfect! You called? 😺",
        "👀 Suspicious vibes detected!",
        "✨ Sammy is here to help!",
        "😸 Hey hey, what's up?",
        "🌟 You just summoned me, right?",
        "🎉 Let's get this party started!",
        "😽 Feel the magic meow!",
        "🤫 Quiet now, secret mode on.",
        "🎈 Surprise! I'm in the chat.",
        "💫 Sparkles and meows all around."
      ];
      const randomReply = newReplies[Math.floor(Math.random() * newReplies.length)];
      return api.sendMessage(randomReply + "\n\n— King Monsterwith", threadID, messageID);
    }
  }
};
