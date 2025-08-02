const { Client, LocalAuth } = require('whatsapp-web.js');
const { sendQRToTelegram, sendMessageToAdmin } = require('../../utils/telegram');
const { ShemdoeAssistant } = require('../../utils/ai-assistant');

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

  //custom on destroy
  // Store original destroy method
  const originalDestroy = client.destroy.bind(client);

  // Override destroy method to add custom logging
  client.destroy = async function () {
    console.log('🛑 Bot 1 is being destroyed...');
    sendMessageToAdmin('🛑 Bot 1 is being destroyed...');

    try {
      const result = await originalDestroy();

      // Reset state after successful destruction
      isInitialized = false;
      console.log('✅ Bot 1 destroyed successfully');
      sendMessageToAdmin('✅ Bot 1 destroyed successfully');

      return result;
    } catch (error) {
      console.error('❌ Error during Bot 1 destruction:', error);
      sendMessageToAdmin(`❌ Error during Bot 1 destruction: ${error.message}`);

      // Reset state even on error
      isInitialized = false;
      throw error;
    }
  };

  client.on('message', async msg => {
    try {
      let user_text = msg.body
      if (!msg.fromMe) {
        let chat = await msg.getChat()
        await chat.sendStateTyping(); // Simulate typing
        console.log('Bot 1 received a message');

        //structure openai response
        let response = await ShemdoeAssistant(chat.id.user, user_text)
        await msg.reply(response);
      }
    } catch (error) {
      console.log(error?.message)
      sendMessageToAdmin(error?.message)
    }
  });

  client.initialize();
  return client;
}

module.exports = getBot1Client;