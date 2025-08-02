const { Client, LocalAuth } = require('whatsapp-web.js');
const { sendQRToTelegram, sendMessageToAdmin } = require('../../utils/telegram');
const { ShemdoeAssistant } = require('../../utils/ai-assistant');
const { clearSession } = require('../../utils/whatsapp');

const clientConfig = {
  clientId: 'bot2',
  clientName: 'Bot 2'
}

let client;
let isInitialized = false;

const getBot2Client = () => {

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

  client.on('message', async msg => {
    try {
      let user_text = msg.body
      if (!msg.fromMe) {
        let chat = await msg.getChat()
        await chat.sendStateTyping(); // Simulate typing
        console.log(`${clientConfig.clientName} received a message`);

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

module.exports = getBot2Client;