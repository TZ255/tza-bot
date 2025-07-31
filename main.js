require('dotenv').config();
const express = require('express');
const TelegramWhatsAppManagerBot = require('./telegram/bot');
const { formatEnglishClub } = require('./utils/englishclub');
const { sendWhatsAppChannelMessage } = require('./utils/whatsapp');
const getBot1Client = require('./bots/bot1/bot1');
const getBot2Client = require('./bots/bot2/bot2');

const app = express();
const PORT = process.env.PORT || 4000;
const imp = {
    englishClub: "120363417496609622@newsletter",
    shemdoe: process.env.SHEMDOE_NUM,
    mk_vip: '255711935460@c.us',
    nyimboMpya: '120363401810537822@newsletter'
}

app.use(express.json());

function checkEnv() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is required');
    process.exit(1);
  }
  
  if (!process.env.TELEGRAM_ADMIN_ID) {
    console.error('❌ TELEGRAM_ADMIN_ID is required');
    process.exit(1);
  }
  
  console.log('✅ Environment variables OK');
}

//starting bot on server start
getBot1Client();
getBot2Client();

// Basic health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    service: 'WhatsApp Bot Manager',
    timestamp: new Date().toISOString()
  });
});

// Bot status API endpoint
app.get('/api/status', (req, res) => {
  try {
    const botStatus = status();
    res.json({
      success: true,
      data: botStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// // Start bot endpoint
// app.post('/api/start/:botId', (req, res) => {
//   const { botId } = req.params;
  
//   if (botId !== 'bot1' && botId !== 'bot2') {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid bot ID. Use bot1 or bot2'
//     });
//   }
  
//   try {
//     start[botId]();
//     res.json({
//       success: true,
//       message: `${botId} start command sent`,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Stop bot endpoint
// app.post('/api/stop/:botId', async (req, res) => {
//   const { botId } = req.params;
  
//   if (botId !== 'bot1' && botId !== 'bot2') {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid bot ID. Use bot1 or bot2'
//     });
//   }
  
//   try {
//     await stop[botId]();
//     res.json({
//       success: true,
//       message: `${botId} stopped`,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Restart bot endpoint
// app.post('/api/restart/:botId', async (req, res) => {
//   const { botId } = req.params;
  
//   if (botId !== 'bot1' && botId !== 'bot2') {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid bot ID. Use bot1 or bot2'
//     });
//   }
  
//   try {
//     await restart[botId]();
//     res.json({
//       success: true,
//       message: `${botId} restart command sent`,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

//posting english word to whatsapp channel
app.post('/post/english', async (req, res) => {
    try {
        const wordObj = req.body;

        if (!wordObj) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if(wordObj.secret !== process.env.SECRET) {
            return res.status(400).json({ message: 'Unauthorized' });
        }

        const message = await formatEnglishClub(wordObj)
        await sendWhatsAppChannelMessage('bot2', message, imp.englishClub);
        res.status(200).json({ message: 'Word sent successfully' });
    } catch (error) {
        console.error('Error saving word:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

async function startServer() {
  try {
    console.log('🚀 Starting WhatsApp Bot Manager Server...');
    
    checkEnv();
    
    // Start Telegram bot
    console.log('📱 Initializing Telegram bot...');
    TelegramWhatsAppManagerBot();
    
    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Express server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/`);
      console.log('📱 Send /start to Telegram bot to manage WhatsApp bots');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
function shutdown() {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

startServer();