const { Bot } = require('grammy');
const getBot1Client = require('../bots/bot1/bot1');
const getBot2Client = require('../bots/bot2/bot2');
const { sendMessageToAdmin } = require('../utils/telegram');
const { clearSession } = require('../utils/whatsapp');
const GLOBAL_VARS = require('../utils/GLOBALS');

const ADMINS = GLOBAL_VARS.ADMINS;
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
      await ctx.reply('Hi! Welcome to Tanzania Adventure\'s Telegram WhatsApp bot manager. Run /admin to see commands')
    } catch (error) {
      console.log(error?.message)
    }
  })

  bot.command('admin', async ctx => {
    try {
      await ctx.reply("Admin commands inside Logs Channel.\n\n Send start, stop, logout, or clear_session");
    } catch (error) {
      console.log(error?.message)
    }
  })

  // Handle start/stop via buttons
  bot.on('message:text', async ctx => {
    console.log(ctx.chat, ctx.message)
    if (ctx.chat?.id === GLOBAL_VARS.logs && GLOBAL_VARS.ADMINS.includes(ctx.from?.id) && ctx.message.text) {
      if (!['start', 'logout', 'clear_session'].includes(ctx.message.text.toLowerCase())) {
        return await ctx.reply('Admin commands inside Logs Channel.\n\n Send start, stop, logout, or clear_session')
      }

      await ctx.reply(`🛠️ Hey ${ctx.from.first_name}, Confirm below to start, stop or clear session for bot1:`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Start Bot 1', callback_data: 'start_bot1' },
              { text: 'Stop Bot 1', callback_data: 'stop_bot1' },
            ],
            [
              { text: 'Clear Session Bot 1', callback_data: 'clear_session_bot1' },
            ],
          ],
        },
      });
    }
  });

  // Handle start/stop buttons
  bot.on('callback_query:data', async ctx => {
    try {
      const data = ctx.callbackQuery.data;
      const chatId = ctx.callbackQuery.message?.chat.id;
      const userId = ctx.from?.id;

      // Security check: only from logs group + ADMINS
      if (chatId !== GLOBAL_VARS.logs || !GLOBAL_VARS.ADMINS.includes(userId)) {
        return await ctx.answerCallbackQuery({
          text: "🚫 You're not allowed to do this",
          show_alert: true,
        });
      }

      await ctx.answerCallbackQuery(); // acknowledge the button click

      // delete the original message with buttons
      await ctx.deleteMessage();

      if (data === 'start_bot1') {
        await ctx.reply('Starting Bot 1... ⏳');
        await getBot1Client();
        await ctx.reply('✅ Bot 1 started successfully.');
      } else if (data === 'stop_bot1') {
        await getBot1Client().logout();
        return await ctx.reply('🛑 Bot 1 stopped successfully.');
      } else if (data === 'clear_session_bot1') {
        return clearSession('bot1');
      } else {
        await ctx.reply('⚠️ Unknown action.');
      }
    } catch (error) {
      console.log(error?.message);
      sendMessageToAdmin(error?.message);
      try {
        // use ctx.reply so the error goes back to the same group
        await ctx.reply(`❌ Error: ${error?.message}`);
      } catch (e) {
        console.log(e?.message);
      }
    }
  });


  bot.start().catch(e => console.log(e.message, e))
}

module.exports = TelegramWhatsAppManagerBot