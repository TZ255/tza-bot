const QRCode = require('qrcode');
const { Bot, InputFile } = require('grammy');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

async function sendQRToTelegram(botName, qrString) {

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

    const inputFile = new InputFile(qrBuffer, `qr-${botName.toLowerCase().replace(' ', '')}.png`);
    
    await bot.api.sendPhoto(adminId, inputFile, {
      caption: `💥 QR Code for ${botName}\n\nScan this with WhatsApp to authenticate.`
    });

    console.log(`QR code sent to Telegram for ${botName}`);
  } catch (error) {
    console.error(`Error sending QR code for ${botName}:`, error);
  }
}

async function sendMessageToAdmin(message) {
  const adminId = process.env.TELEGRAM_ADMIN_ID;
  if (!adminId) {
    console.error('TELEGRAM_ADMIN_ID not set');
    return;
  }

  try {
    await bot.api.sendMessage(adminId, message);
  } catch (error) {
    console.error('Error sending message to admin:', error);
  }
}

module.exports = { sendQRToTelegram, sendMessageToAdmin };