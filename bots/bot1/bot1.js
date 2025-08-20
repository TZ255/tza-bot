const { Client, LocalAuth } = require('whatsapp-web.js');
const { sendQRToTelegram, sendMessageToAdmin } = require('../../utils/telegram');
const { ShemdoeAssistant } = require('../../utils/ai-assistant');
const { clearSession } = require('../../utils/whatsapp');

const clientConfig = {
  clientId: 'bot1',
  clientName: 'Bot 1'
}

let client;
let isInitialized = false;

const getBot1Client = () => {

  if (client && isInitialized) return client;

  client = new Client({
    authStrategy: new LocalAuth({ clientId: clientConfig.clientId }),
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
    console.log(`QR code received for ${clientConfig.clientName}`);
    sendQRToTelegram(clientConfig.clientName, qr);
  });

  client.on('ready', () => {
    isInitialized = true;
    console.log(`✅ ${clientConfig.clientName} ready!`)
    sendMessageToAdmin(`${clientConfig.clientName} is ready ✅`)
  });

  client.on('authenticated', () => console.log(`🔐 ${clientConfig.clientName} authenticated`));

  client.on('auth_failure', (msg) => {
    console.error(`${clientConfig.clientName} auth failed:`, msg)
    sendMessageToAdmin(`${clientConfig.clientName} auth failed: ${msg}\n\nDeleting the session file.... send start command to start it`)
    clearSession(clientConfig.clientId)
    isInitialized = false;
  });

  client.on('disconnected', (reason) => {
    isInitialized = false;
    console.log(`⚠️ ${clientConfig.clientName} disconnected:`, reason)
    sendMessageToAdmin(`⚠️ ${clientConfig.clientName} disconnected: \n${reason}`)
  });

  //custom on destroy
  // Store original destroy method
  const originalDestroy = client.destroy.bind(client);

  // Override destroy method to add custom logging
  client.destroy = async function () {
    console.log(`🛑 ${clientConfig.clientName} is being destroyed...`);
    sendMessageToAdmin(`🛑 ${clientConfig.clientName} is being destroyed...`);

    try {
      const result = await originalDestroy();

      // Reset state after successful destruction
      isInitialized = false;
      console.log(`✅ ${clientConfig.clientName} destroyed successfully`);
      sendMessageToAdmin(`✅ ${clientConfig.clientName} destroyed successfully`);

      return result;
    } catch (error) {
      console.error(`❌ Error during ${clientConfig.clientName} destruction:`, error);
      sendMessageToAdmin(`❌ Error during ${clientConfig.clientName} destruction: ${error.message}`);

      // Reset state even on error
      isInitialized = false;
      throw error;
    }
  };

  client.on('message', async (msg) => {
    let typingInterval;

    try {
      // Ignore messages from me, status updates, gifs
      if (msg.fromMe || msg.isStatus || msg.isGif) {
        return console.log(`${clientConfig.clientName} unsupported msg`);
      }

      // Ignore groups
      if (msg.from.endsWith('@g.us')) {
        return console.log(`${clientConfig.clientName} group message ignored`);
      }

      // Handle media
      if (msg.hasMedia) {
        return await msg.reply('Hey! I’m just an assistant bot and can’t process files or media yet.\nPlease reach out to our support team, we’ll be happy to help:\n> WhatsApp: +255 754 042 154');
      }

      const user_text = msg.body?.trim() || '';
      if (!user_text) return console.log('Empty body');

      console.log(`${clientConfig.clientName} received: ${user_text}`);

      let chat = await msg.getChat();
      await chat.sendStateTyping();

      // Keep typing indicator until response is ready
      typingInterval = setInterval(() => {
        chat.sendStateTyping().catch((e) => console.log(e?.message));
      }, 4000);

      // Get AI response
      const response = await ShemdoeAssistant(chat.id.user, user_text);

      // Stop typing indicator
      clearInterval(typingInterval);

      await msg.reply(response);

    } catch (error) {
      clearInterval(typingInterval);
      console.log(error?.message);
      sendMessageToAdmin(error?.message);
    }
  });

  client.initialize();
  return client;
}

module.exports = getBot1Client;