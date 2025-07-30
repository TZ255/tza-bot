const { Client, LocalAuth } = require('whatsapp-web.js');
const { sendQRToTelegram, sendMessageToAdmin } = require('../utils/telegram');

function startBot1() {
  const client = new Client({
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
    console.log('✅ Bot 1 ready!')
    sendMessageToAdmin('Bot1 is ready ✅')
  });

  client.on('authenticated', () => console.log('🔐 Bot 1 authenticated'));

  client.on('auth_failure', (msg) => console.error('❌ Bot 1 auth failed:', msg));

  client.on('disconnected', (reason) => {
    console.log('⚠️ Bot 1 disconnected:', reason)
    sendMessageToAdmin(`⚠️ Bot 1 disconnected: \n${reason}`)
  });

  client.on('message', async msg => {
    if (msg.body.toLowerCase() === 'ping1') {
      console.log('Bot 1 received ping command');
      await msg.reply('Pong from Bot 1');
    }
  });

  client.initialize();
  return client;
}

module.exports = startBot1;