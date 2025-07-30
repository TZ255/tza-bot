const { Client, LocalAuth } = require('whatsapp-web.js');
const { sendQRToTelegram } = require('../utils/telegram');

function startBot2() {
  const client = new Client({
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

  client.on('ready', () => console.log('✅ Bot 2 ready!'));

  client.on('authenticated', () => console.log('🔐 Bot 2 authenticated'));

  client.on('auth_failure', (msg) => console.error('❌ Bot 2 auth failed:', msg));

  client.on('disconnected', (reason) => console.log('⚠️ Bot 2 disconnected:', reason));

  client.on('message', async msg => {
    if (msg.body.toLowerCase() === '!ping2') {
      console.log('Bot 2 received ping command');
      await msg.reply('Pong from Bot 2');
    }
  });

  client.initialize();
  return client;
}

module.exports = startBot2;