const Joi = require('joi');
const shipping = require('../config/shipping');

const demoOrders = require('../demodata/orders.json');

// Helper to build WP params
function buildWpParams(query) {
  const allowedParams = ['page', 'per_page', 'search', 'after', 'before', 'exclude', 'include', 'offset', 'order', 'orderby', 'parent', 'parent_exclude', 'status', 'customer', 'product', 'dp'];
  const out = {};
  for (const k of allowedParams) {
    if (query[k] !== undefined && query[k] !== null && query[k] !== '') {
      out[k] = query[k];
    }
  }
  return out;
}

exports.orders = async (req, res, next) => {
  try {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).optional(),
      per_page: Joi.number().integer().min(1).max(100).optional(),
      search: Joi.string().optional(),
      status: Joi.string().optional(),
    }).unknown(true);

    const { error } = schema.validate(req.query);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    return res.status(200).json(demoOrders);
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const schema = Joi.object({
      payment_method: Joi.string().valid('cod', 'razorpay').default('razorpay'),
      payment_method_title: Joi.string().optional(),
      set_paid: Joi.boolean().default(false),
      address: Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        address_1: Joi.string().required(),
        address_2: Joi.string().allow('').optional(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postcode: Joi.string().required(),
        country: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        label: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required()
      }).required(),
      line_items: Joi.array().items(
        Joi.object({
          product_id: Joi.number().integer().required(),
          variation_id: Joi.number().integer().optional(),
          quantity: Joi.number().integer().min(1).required()
        })
      ).min(1).required()
    }).unknown(false);

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const address = value.address;
    const city = (address.city || '').trim().toLowerCase();
    const country = (address.country || '').trim().toUpperCase();

    // Shipping calculation from config
    let shippingCost;
    let shippingMethodTitle;
    if (shipping.LOCAL_CITIES.includes(city)) {
      shippingCost = shipping.LOCAL_COST;
      shippingMethodTitle = `${shipping.LOCAL_TITLE} (${address.city})`;
    } else if (country === 'IN') {
      shippingCost = shipping.NATIONAL_COST;
      shippingMethodTitle = shipping.NATIONAL_TITLE;
    } else {
      shippingCost = shipping.INTERNATIONAL_COST;
      shippingMethodTitle = shipping.INTERNATIONAL_TITLE;
    }

    // COD is only available in configured COD cities
    const isCodCity = shipping.COD_CITIES.includes(city);
    let finalPaymentMethod;
    let finalStatus;
    let createRazorpayOrder;

    if (value.payment_method === 'cod' && isCodCity) {
      finalPaymentMethod = 'cod';
      finalStatus = 'processing';
      createRazorpayOrder = false;
    } else {
      finalPaymentMethod = 'razorpay';
      finalStatus = 'pending';
      createRazorpayOrder = true;
    }

    const wcOrder = demoOrders[0] || { id: 12345, status: finalStatus, total: String(shippingCost) };

    if (createRazorpayOrder) {
      return res.status(201).json({
        success: true,
        order: wcOrder,
        razorpay_order: { id: 'order_demo_12345' },
        key_id: 'demo_key_id'
      });
    }

    return res.status(201).json(wcOrder);

  } catch (err) {
    next(err);
  }
};

const crypto = require('crypto');

exports.verifyPayment = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Demo Payment verified and order updated'
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = demoOrders.find(o => o.id == id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};
