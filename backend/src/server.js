require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, intenta de nuevo en 15 minutos' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/warehouses', require('./routes/warehouses'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/invitations', require('./routes/invitations'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test email endpoint
const { sendEmail, testConnection } = require('./config/email');
app.get('/api/test-email', async (req, res) => {
  console.log('[TEST] Testing SMTP connection...');
  const connected = await testConnection();
  if (!connected) {
    return res.status(500).json({ error: 'SMTP connection failed' });
  }
  const sent = await sendEmail({
    to: req.query.to || process.env.SMTP_USER,
    subject: 'CauCE - Test Email',
    html: '<h1>It works!</h1><p>If you see this, email sending is configured correctly.</p>',
  });
  res.json({ connected, sent });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n  CauCE Backend running on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} user=${process.env.SMTP_USER}`);
  console.log(`  SMTP_PASS defined: ${!!process.env.SMTP_PASS}\n`);
});

module.exports = app;
