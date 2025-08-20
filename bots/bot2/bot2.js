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


  /// NEW BOT WILL BE SETTLED HERE
  /// NEW BOT WILL BE SETTLED HERE
  /// NEW BOT WILL BE SETTLED HERE
  client = null
  return client;
}

module.exports = getBot2Client;