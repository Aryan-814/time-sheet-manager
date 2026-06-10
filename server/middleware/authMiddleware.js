import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  // Check if the request has an authorization header that starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token 
      token = req.headers.authorization.split(' ')[1];

      // Decrypt the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decrypted payload (userId, role, organizationId) to the request object
      req.user = decoded;

      // Send them through to the actual route!
      return next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized, token failed or expired' });
    }
  }

  // If no token was found at all
  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};