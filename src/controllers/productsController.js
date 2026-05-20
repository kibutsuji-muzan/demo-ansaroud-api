const Joi = require('joi');
const config = require('../config');

const demoProducts = require('../demodata/products.json');
const demoCategories = require('../demodata/categories.json');
const demoTags = require('../demodata/tags.json');

const allowedParams = ['per_page', 'include', 'category', 'tag', 'search', 'page', 'orderby', 'order'];
const assetBaseUrlFromEnv = (config.ASSET_BASE_URL || '').replace(/\/+$/, '');

// Shared query param schema for product-list endpoints
const listQuerySchema = Joi.object({
  per_page: Joi.number().integer().min(1).max(100).optional(),
  include: Joi.string().optional(),
  category: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
  tag: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
  search: Joi.string().optional(),
  page: Joi.number().integer().min(1).optional(),
  orderby: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').optional()
}).unknown(true);

function buildWpParams(query) {
  const out = {};
  for (const k of allowedParams) {
    if (query[k] !== undefined && query[k] !== null && query[k] !== '') {
      out[k] = query[k];
    }
  }
  if (out.per_page) out.per_page = Number(out.per_page) || out.per_page;
  if (out.page) out.page = Number(out.page) || out.page;
  return out;
}

function applyPagination(arr, params) {
  if (params.page && params.per_page) {
    const start = (params.page - 1) * params.per_page;
    return arr.slice(start, start + params.per_page);
  }
  if (params.per_page) {
    return arr.slice(0, params.per_page);
  }
  return arr;
}

function getRequestBaseUrl(req) {
  if (assetBaseUrlFromEnv) return assetBaseUrlFromEnv;

  const forwardedProto = req.get('x-forwarded-proto');
  const forwardedHost = req.get('x-forwarded-host');
  const protocol = (forwardedProto || req.protocol || 'http').split(',')[0].trim();
  const host = (forwardedHost || req.get('host') || '').split(',')[0].trim();
  if (!host) return '';

  return `${protocol}://${host}`;
}

function toPublicAssetUrl(rawPath, baseUrl) {
  if (typeof rawPath !== 'string' || !rawPath) return rawPath;
  if (/^https?:\/\//i.test(rawPath)) return rawPath;

  const normalizedPath = rawPath.startsWith('assets/') ? `/${rawPath}` : rawPath;
  if (!normalizedPath.startsWith('/assets/')) return rawPath;

  const encodedPath = encodeURI(normalizedPath);
  return baseUrl ? `${baseUrl}${encodedPath}` : encodedPath;
}

function formatProductAssetUrls(product, baseUrl) {
  const safeImages = Array.isArray(product.images)
    ? product.images.map((image) => ({
      ...image,
      src: toPublicAssetUrl(image.src, baseUrl),
      thumbnail: toPublicAssetUrl(image.thumbnail, baseUrl)
    }))
    : product.images;

  return {
    ...product,
    images: safeImages
  };
}

exports.products = async (req, res, next) => {
  try {
    const { error } = listQuerySchema.validate(req.query);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const params = buildWpParams(req.query);
    let results = [...demoProducts];

    if (params.include) {
      const includeIds = params.include.split(',').map(id => parseInt(id.trim(), 10));
      results = results.filter(p => includeIds.includes(p.id));
    }
    if (params.category) {
      const catId = parseInt(params.category, 10);
      results = results.filter(p => p.categories && p.categories.some(c => c.id === catId));
    }
    if (params.tag) {
      const tagId = parseInt(params.tag, 10);
      results = results.filter(p => p.tags && p.tags.some(t => t.id === tagId));
    }
    if (params.search) {
      const searchStr = params.search.toLowerCase();
      results = results.filter(p => p.name && p.name.toLowerCase().includes(searchStr));
    }

    const baseUrl = getRequestBaseUrl(req);
    const response = applyPagination(results, params).map((product) => formatProductAssetUrls(product, baseUrl));
    console.log(response[0].images[0].src);
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

exports.productById = async (req, res, next) => {
  try {
    const { error } = Joi.object({
      id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required()
    }).validate(req.params);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const product = demoProducts.find(p => p.id == req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    const baseUrl = getRequestBaseUrl(req);
    response = formatProductAssetUrls(product, baseUrl);
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

exports.categories = async (req, res, next) => {
  try {
    const { error } = listQuerySchema.validate(req.query);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const params = buildWpParams(req.query);
    return res.status(200).json(applyPagination([...demoCategories], params));
  } catch (err) {
    next(err);
  }
};

exports.tags = async (req, res, next) => {
  try {
    const { error } = listQuerySchema.validate(req.query);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const params = buildWpParams(req.query);
    return res.status(200).json(applyPagination([...demoTags], params));
  } catch (err) {
    next(err);
  }
};
