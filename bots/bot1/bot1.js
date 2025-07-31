const { Client, LocalAuth } = require('whatsapp-web.js');
const { sendQRToTelegram, sendMessageToAdmin } = require('../../utils/telegram');

let client;
let isInitialized = false;

const getBot1Client = () => {

  if (client && isInitialized) return client;

  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bot1' }),
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
    console.log('QR code received for Bot 1');
    sendQRToTelegram('Bot 1', qr);
  });

  client.on('ready', () => {
    isInitialized = true;
    console.log('✅ Bot 1 ready!')
    sendMessageToAdmin('Bot1 is ready ✅')
  });

  client.on('authenticated', () => console.log('🔐 Bot 1 authenticated'));

  client.on('auth_failure', (msg) => console.error('❌ Bot 1 auth failed:', msg));

  client.on('disconnected', (reason) => {
    isInitialized = false;
    console.log('⚠️ Bot 1 disconnected:', reason)
    sendMessageToAdmin(`⚠️ Bot 1 disconnected: \n${reason}`)
  });

  client.on('message', async msg => {
    if (msg.body.toLowerCase() === 'ping') {
      let chat = await msg.getChat()
      await chat.sendStateTyping(); // Simulate typing
      console.log('Bot 1 received ping command');
      //delay for 2 seconds to simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      await msg.reply('Pong from Bot 1 😂');
    }
  });

  client.initialize();
  return client;
}

module.exports = getBot1Client;