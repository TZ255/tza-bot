const QRCode = require('qrcode');

let telegramBot = null;

function setTelegramBot(bot) {
  telegramBot = bot;
}

async function sendQRToTelegram(botName, qrString) {
  if (!telegramBot) {
    console.error('Telegram bot not initialized');
    return;
  }

  const adminId = process.env.TELEGRAM_ADMIN_ID;
  if (!adminId) {
    console.error('TELEGRAM_ADMIN_ID not set');
    return;
  }

  try {
    console.log(`Generating QR code for ${botName}...`);
    
    const qrBuffer = await QRCode.toBuffer(qrString, {
      type: 'png',
      width: 256,
      margin: 1
    });

    await telegramBot.api.sendPhoto(adminId, qrBuffer, {
      caption: `🔄 QR Code for ${botName}\n\nScan this with WhatsApp to authenticate.`
    });

    console.log(`QR code sent to Telegram for ${botName}`);
  } catch (error) {
    console.error(`Error sending QR code for ${botName}:`, error);
  }
}

async function sendMessageToAdmin(message) {
  if (!telegramBot) {
    console.error('Telegram bot not initialized');
    return;
  }

  const adminId = process.env.TELEGRAM_ADMIN_ID;
  if (!adminId) {
    console.error('TELEGRAM_ADMIN_ID not set');
    return;
  }

  try {
    await telegramBot.api.sendMessage(adminId, message);
  } catch (error) {
    console.error('Error sending message to admin:', error);
  }
}

module.exports = { setTelegramBot, sendQRToTelegram, sendMessageToAdmin };