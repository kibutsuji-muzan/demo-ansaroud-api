const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const config = require('../config');

// Pre-compute the hashed password for the demo user at startup
const DEMO_PASSWORD_HASH = bcrypt.hashSync('testuserpassword', 10);

function signToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

exports.google = async (req, res, next) => {
  try {
    const { name, email, google_id } = req.body;
    if (!email || !name || !google_id) return res.status(400).json({ message: 'email, name, google_id required' });

    const demoUser = require('../demodata/user.json');
    const token = signToken({ id: demoUser.user.id, email: demoUser.user.email });

    return res.json({ ...demoUser, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const demoUser = require('../demodata/user.json');
    const demoEmail = demoUser.user.email;

    if (email !== demoEmail) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, DEMO_PASSWORD_HASH);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({ id: demoUser.user.id, email: demoEmail });
    return res.json({ ...demoUser, token });

  } catch (err) {
    next(err);
  }
};

exports.me = (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'unauthenticated' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const demoUser = require('../demodata/user.json');
    return res.json({ id: demoUser.user.id, email: demoUser.user.email, name: demoUser.user.name });
  } catch {
    return res.status(401).json({ message: 'invalid token' });
  }
};
