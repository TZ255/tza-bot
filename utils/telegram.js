const QRCode = require('qrcode');
const { Bot, InputFile } = require('grammy');
const GLOBAL_VARS = require('./GLOBALS');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

async function sendQRToTelegram(botName, qrString) {

  try {
    console.log(`Generating QR code for ${botName}...`);
    
    const qrBuffer = await QRCode.toBuffer(qrString, {
      type: 'png',
      width: 256,
      margin: 1
    });

    const inputFile = new InputFile(qrBuffer, `qr-${botName.toLowerCase().replace(' ', '')}.png`);
    
    await bot.api.sendPhoto(GLOBAL_VARS.logs, inputFile, {
      caption: `💥 QR Code for ${botName}\n\nScan this with WhatsApp to authenticate.`
    });

    console.log(`QR code sent to Telegram for ${botName}`);
  } catch (error) {
    console.error(`Error sending QR code for ${botName}:`, error);
  }
}

async function sendMessageToAdmin(message) {
  try {
    await bot.api.sendMessage(GLOBAL_VARS.shemdoe, message);
  } catch (error) {
    console.error('Error sending message to admin:', error);
  }
}

module.exports = { sendQRToTelegram, sendMessageToAdmin };