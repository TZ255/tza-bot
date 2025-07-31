const { Client, LocalAuth } = require('whatsapp-web.js');
const { sendQRToTelegram, sendMessageToAdmin } = require('../../utils/telegram');

let client;
let isInitialized = false;

const getBot2Client = () => {

  if (client && isInitialized) return client;

  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bot2' }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', (qr) => {
    console.log('QR code received for Bot 2');
    sendQRToTelegram('Bot 2', qr);
  });

  client.on('ready', () => {
    isInitialized = true;
    console.log('✅ Bot 2 ready!')
    sendMessageToAdmin('Bot2 is ready ✅')
  });

  client.on('authenticated', () => console.log('🔐 Bot 2 authenticated'));

  client.on('auth_failure', (msg) => console.error('❌ Bot 2 auth failed:', msg));

  client.on('disconnected', (reason) => {
    isInitialized = false;
    console.log('⚠️ Bot 2 disconnected:', reason)
    sendMessageToAdmin(`⚠️ Bot 2 disconnected: \n${reason}`)
  });

  client.on('message', async msg => {
    if (msg.body.toLowerCase() === 'ping') {
      let chat = await msg.getChat()
      await chat.sendStateTyping(); // Simulate typing
      console.log('Bot 2 received ping command');
      //delay for 2 seconds to simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      await msg.reply('Pong from Bot 2 😂');
    }
  });

  client.initialize();
  return client;
}

module.exports = getBot2Client;