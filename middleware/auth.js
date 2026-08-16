const jwt = require('jsonwebtoken');

const auth = (options = { required: true }) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (options.required) {
        return res.status(401).json({ error: 'Authentication required. No token provided.' });
      }
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_key_signal_gap_2026';

    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      next();
    } catch (err) {
      if (options.required) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
      }
      req.user = null;
      next();
    }
  };
};

module.exports = auth;
