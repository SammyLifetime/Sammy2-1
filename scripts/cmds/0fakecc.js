
  const generateFakeCreditCard = () => {
  const name = generateRandomName();
  const cardNumber = generateRandomCardNumber();
  const issuer = getIssuer(cardNumber);
  const expiryDate = generateExpiryDate();
  const cvv = generateRandomCVV();

  return {
    Name: name,
    Credit_Card_Number: cardNumber,
    Issuer: issuer,
    Expiry_Date: expiryDate,
    CVV: cvv
  };
};

const generateRandomName = () => {
  const firstNames = ["King", "Jane", "Alex", "Emily", "Chris", "Latoya"];
  const lastNames = ["Smith", "Monsterwith", "Williams", "Brown", "Jones", "Marks"];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

const generateRandomCardNumber = () => {
  let cardNumber = '';
  for (let i = 0; i < 16; i++) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }
  return cardNumber;
};

const getIssuer = (cardNumber) => {
  const firstDigit = cardNumber[0];
  switch (firstDigit) {
    case '3':
      return 'Amex';
    case '4':
      return 'Visa';
    case '5':
      return 'Mastercard';
    case '6':
      return 'Discover';
    default:
      return 'Unknown';
  }
};

const generateExpiryDate = () => {
  const currentYear = new Date().getFullYear();
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const year = String(currentYear + Math.floor(Math.random() * 5) + 1).slice(-2);
  return `${month}/${year}`;
};

const generateRandomCVV = () => {
  let cvv = '';
  for (let i = 0; i < 3; i++) {
    cvv += Math.floor(Math.random() * 10).toString();
  }
  return cvv;
};

module.exports = {
  config: {
    name: "fakecc",
    version: "1.0",
    author: "Samir Œ",
    countDown: 5,
    role: 0,
    shortDescription: "cc",
    longDescription: "credit card ",
    category: "Utility",
    guide: "{pn}"
  },
  onStart: async function ({ message, args }) {
    const creditCardData = generateFakeCreditCard();
    const responseMessage = ` Credit Card Details \nName: ${creditCardData.Name}\nCard Number: ${creditCardData.Credit_Card_Number}\nIssuer: ${creditCardData.Issuer}\nExpiry Date: ${creditCardData.Expiry_Date}\nCVV: ${creditCardData.CVV}`;
    message.reply(responseMessage);
  }
};