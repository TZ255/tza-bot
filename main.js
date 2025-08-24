require('dotenv').config();
const express = require('express');
const TelegramWhatsAppManagerBot = require('./telegram/bot');
const { formatEnglishClub } = require('./utils/englishclub');
const { sendWhatsAppChannelMessage } = require('./utils/whatsapp');
const getBot1Client = require('./bots/bot1/bot1');
const { default: mongoose } = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4100;

// database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to Vyuo Degree'))
  .catch((err) => {
    console.log(err)
  })

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

//starting bot on server start -- start on telegram
// getBot1Client();
// getBot2Client();

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