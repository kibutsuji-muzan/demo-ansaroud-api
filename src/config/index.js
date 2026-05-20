module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_development_secret_key_12345!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ASSET_BASE_URL: process.env.ASSET_BASE_URL || '',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
};
