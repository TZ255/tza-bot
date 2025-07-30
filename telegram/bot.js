const { Bot } = require('grammy');
const getBot1Client = require('../bots/bot1/bot1');
const getBot2Client = require('../bots/bot2/bot2');

const adminID = process.env.TELEGRAM_ADMIN_ID
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

async function TelegramWhatsAppManagerBot() {
  const bot = new Bot(TELEGRAM_BOT_TOKEN);

  //drop pending updates
  try {
    await bot.api.deleteWebhook({ drop_pending_updates: true })
    console.log('Pending Updates Cleared')
  } catch (error) {
    console.log(error?.message)
  }

  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`(TG Manager): ${err.message}`, err);
  });

  bot.command('start', async (ctx) => {
    try {
      await ctx.reply('Hi! Welcome to Shemdoe\'s Telegram WhatsApp bot manager. Run /admin to see commands')
    } catch (error) {
      console.log(error?.message)
    }
  })

  bot.command('admin', async ctx => {
    try {
      await ctx.reply(
        '🤖 WhatsApp Bot Manager\n\n' +
        'Commands:\n' +
        '• /start bot1 - Start Bot 1\n' +
        '• /start bot2 - Start Bot 2\n' +
        '• /stop bot1 - Stop Bot 1\n' +
        '• /stop bot2 - Stop Bot 2\n'
      );
    } catch (error) {
      console.log(error?.message)
    }
  })

  bot.command('manage', async ctx => {
    try {
      if (!ctx.match) return await ctx.reply('This command run with match <start, stop, restart> <botid>');
      if (ctx.chat.id !== Number(adminID)) return await ctx.reply('You are not authorized');

      const botids = ['bot1', 'bot2']
      let match = ctx.match
      let [command, botid] = match.split(' ').map(c => c.trim())
      if (!command || !botid || !botids.includes(botid)) return await ctx.reply('No command or botid provided');

      switch (command.toLowerCase()) {
        case 'start':
          if (botid === 'bot1') {
            await ctx.reply(`Starting Bot 1...`);
            return await getBot1Client();
          }
          if (botid === 'bot2') {
            await ctx.reply(`Starting Bot 2...`);
            return await getBot2Client();
          }
          break;

        case 'stop':
          if (botid === 'bot1') {
            await ctx.reply(`Stopping Bot 1...`);
            return await getBot1Client().destroy();
          }
          if (botid === 'bot2') {
            await ctx.reply(`Stopping Bot 2...`);
            return await getBot2Client().destroy();
          }
          break;

        default:
          return await ctx.reply('Invalid command. Use: start, stop, restart');
      }

    } catch (error) {
      console.log(error?.message)
    }
  })

  bot.start().catch(e => console.log(e.message, e))
}

module.exports = TelegramWhatsAppManagerBot