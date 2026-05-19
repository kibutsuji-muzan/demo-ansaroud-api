const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const proxyRoutes = require('./routes/proxy');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const geoRoutes = require('./routes/geo');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : '*';
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());
app.use(morgan('combined'));
app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Static Assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api', geoRoutes);

// health
app.get('/health', (req, res) => res.json({ status: 'ok', env: config.NODE_ENV }));

// error handler (last)
app.use(errorHandler);

module.exports = app;
