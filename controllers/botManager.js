const startBot1 = require('../bots/bot1');
const startBot2 = require('../bots/bot2');

const bots = {
  bot1: null,
  bot2: null
};

const start = {
  bot1: () => {
    if (!bots.bot1) {
      console.log('Starting Bot 1...');
      bots.bot1 = startBot1();
    } else {
      console.log('Bot 1 is already running');
    }
  },
  bot2: () => {
    if (!bots.bot2) {
      console.log('Starting Bot 2...');
      bots.bot2 = startBot2();
    } else {
      console.log('Bot 2 is already running');
    }
  }
};

const stop = {
  bot1: async () => {
    if (bots.bot1) {
      console.log('Stopping Bot 1...');
      await bots.bot1.destroy();
      bots.bot1 = null;
    } else {
      console.log('Bot 1 is not running');
    }
  },
  bot2: async () => {
    if (bots.bot2) {
      console.log('Stopping Bot 2...');
      await bots.bot2.destroy();
      bots.bot2 = null;
    } else {
      console.log('Bot 2 is not running');
    }
  }
};

const restart = {
  bot1: async () => {
    console.log('Restarting Bot 1...');
    await stop.bot1();
    setTimeout(() => start.bot1(), 2000);
  },
  bot2: async () => {
    console.log('Restarting Bot 2...');
    await stop.bot2();
    setTimeout(() => start.bot2(), 2000);
  }
};

const send = {
  bot1: async (messageData) => {
    if (!bots.bot1) {
      return { success: false, message: 'Bot 1 is not running' };
    }
    try {
      const [message, number] = messageData.split(' | ').map(s => s.trim());
      if (!message || !number) {
        return { success: false, message: 'Invalid format. Use: message | number' };
      }
      await bots.bot1.sendMessage(`${number}@c.us`, message);
      console.log(`Bot 1 sent message to ${number}`);
      return { success: true, message: `Message sent to ${number}` };
    } catch (error) {
      console.error('Bot 1 send error:', error);
      return { success: false, message: `Failed to send: ${error.message}` };
    }
  },
  bot2: async (messageData) => {
    if (!bots.bot2) {
      return { success: false, message: 'Bot 2 is not running' };
    }
    try {
      const [message, number] = messageData.split(' | ').map(s => s.trim());
      if (!message || !number) {
        return { success: false, message: 'Invalid format. Use: message | number' };
      }
      await bots.bot2.sendMessage(`${number}@c.us`, message);
      console.log(`Bot 2 sent message to ${number}`);
      return { success: true, message: `Message sent to ${number}` };
    } catch (error) {
      console.error('Bot 2 send error:', error);
      return { success: false, message: `Failed to send: ${error.message}` };
    }
  }
};

const status = () => ({
  bot1: bots.bot1 ? '✅ Running' : '❌ Stopped',
  bot2: bots.bot2 ? '✅ Running' : '❌ Stopped'
});

module.exports = { start, stop, restart, status, send };