const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'tradesphere-super-secure-jwt-secret-key-2026';

const resolveUserFromDecoded = async (decoded) => {
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decoded.id)) {
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        return user;
      }
    } catch {
      // Fall through to resilient synthetic user
    }
  }

  // Resilient fallback for demo users, session tokens, or offline environments
  return {
    _id: decoded.id,
    id: decoded.id,
    name: decoded.name || (decoded.role === 'admin' ? 'Admin Trader' : 'Floor Trader'),
    email: decoded.email || 'trader@tradesphere.io',
    role: decoded.role || 'trader',
    isActive: true,
  };
};

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized: Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await resolveUserFromDecoded(decoded);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account is inactive or not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired access token: ' + err.message });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await resolveUserFromDecoded(decoded);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch {
      // Ignored for optional authentication
    }
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = (req.user?.role || 'guest').toLowerCase();
    const normalizedRoles = roles.map((r) => r.toLowerCase());

    // Map legacy cashier to trader
    const effectiveRoles = [userRole];
    if (userRole === 'cashier') effectiveRoles.push('trader');
    if (userRole === 'trader') effectiveRoles.push('cashier');

    const hasAccess = effectiveRoles.some((r) => normalizedRoles.includes(r));
    if (!hasAccess) {
      return res.status(403).json({
        error: `Role '${req.user?.role || 'Guest'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize, JWT_SECRET };
