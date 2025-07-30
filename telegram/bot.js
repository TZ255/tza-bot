const { Bot } = require('grammy');
const { start, stop, restart, status } = require('../controllers/botManager');
const { setTelegramBot, sendMessageToAdmin } = require('../utils/telegram');

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

  setTelegramBot(bot);

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
        '• /stop bot2 - Stop Bot 2\n' +
        '• /restart bot1 - Restart Bot 1\n' +
        '• /restart bot2 - Restart Bot 2\n' +
        '• /status - Show bot status'
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
      let [command, botid] = ctx.match.split(' ').map(c => c.trim())
      if (!command || !botid || !botids.includes(botid)) return await ctx.reply('No command or botid provided');

      switch (command.toLowerCase()) {
        case 'start':
          await ctx.reply(`Starting ${botid}`)
          await start[botid]()
          return await ctx.reply(`✅ ${botid} started`);

        case 'stop':
          await ctx.reply(`Stopping ${botid}`)
          await stop[botid]()
          return await ctx.reply(`✅ ${botid} stopped`);

        case 'restart':
          await ctx.reply(`Restarting ${botid}`)
          await restart[botid]()
          return await ctx.reply(`✅ ${botid} restart command sent`);

        default:
          return await ctx.reply('Invalid command. Use: start, stop, or restart');
      }

    } catch (error) {
      console.log(error?.message)
    }
  })

  bot.command('status', async (ctx) => {
    try {
      const botStatus = status();
      const message =
        '📊 Bot Status\n\n' +
        `Bot 1: ${botStatus.bot1}\n` +
        `Bot 2: ${botStatus.bot2}`;
      await ctx.reply(message);
    } catch (error) {
      await ctx.reply('❌ Error getting status');
    }
  });

  bot.start().then(() => {
    //clear pending updates
    bot.api.deleteWebhook({ drop_pending_updates: true })
      .catch(e => console.log(e.message))
  }).catch(e => console.log(e.message, e))
}

module.exports = TelegramWhatsAppManagerBot