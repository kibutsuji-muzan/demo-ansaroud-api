// src/config/shipping.js
// Shipping cost configuration. Override via environment variables.
module.exports = {
  LOCAL_CITIES: (process.env.LOCAL_DELIVERY_CITIES || 'lucknow').split(',').map(c => c.trim().toLowerCase()),
  LOCAL_COST: parseInt(process.env.LOCAL_SHIPPING_COST || '150', 10),
  LOCAL_TITLE: process.env.LOCAL_SHIPPING_TITLE || 'Local Delivery',
  NATIONAL_COST: parseInt(process.env.NATIONAL_SHIPPING_COST || '300', 10),
  NATIONAL_TITLE: process.env.NATIONAL_SHIPPING_TITLE || 'Pan India Shipping',
  INTERNATIONAL_COST: parseInt(process.env.INTERNATIONAL_SHIPPING_COST || '1200', 10),
  INTERNATIONAL_TITLE: process.env.INTERNATIONAL_SHIPPING_TITLE || 'International Shipping',
  COD_CITIES: (process.env.COD_CITIES || 'lucknow').split(',').map(c => c.trim().toLowerCase()),
};
