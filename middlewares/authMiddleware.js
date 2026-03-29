const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.driverMiddleware = (req, res, next) => {
  if (req.user && (req.user.role === 'driver' || req.user.role === 'captain')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Drivers only' });
  }
};
