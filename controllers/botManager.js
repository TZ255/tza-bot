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

const status = () => ({
  bot1: bots.bot1 ? '✅ Running' : '❌ Stopped',
  bot2: bots.bot2 ? '✅ Running' : '❌ Stopped'
});

module.exports = { start, stop, restart, status };