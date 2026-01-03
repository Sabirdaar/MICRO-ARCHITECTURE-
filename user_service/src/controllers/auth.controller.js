const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { admin, db } = require('../firebase');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

/**
 * Email / Password Register
 */
exports.register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: `${firstName} ${lastName}`,
  });

  await db.collection('users').doc(userRecord.uid).set({
    email,
    firstName,
    lastName,
    provider: 'password',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const token = jwt.sign(
    { id: userRecord.uid, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.status(201).json({
    message: 'User created successfully',
    user: { id: userRecord.uid, email, firstName, lastName },
    token,
  });
};

/**
 * Email / Password Login
 */
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
  
      // Firebase does NOT validate password server-side
      // You must use Firebase Auth REST API or client SDK
      return res.status(400).json({
        error: 'Use Google Auth or client-side Firebase email/password login'
      });
  
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  };

/**
 * Google Login
 */
exports.googleAuth = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'ID token required' });
  }

  const decoded = await admin.auth().verifyIdToken(idToken);

  const userRef = db.collection('users').doc(decoded.uid);
  const snap = await userRef.get();

  if (!snap.exists) {
    await userRef.set({
      email: decoded.email,
      firstName: decoded.name?.split(' ')[0] || '',
      lastName: decoded.name?.split(' ')[1] || '',
      provider: 'google',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  const token = jwt.sign(
    { id: decoded.uid, email: decoded.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    message: 'Google login successful',
    user: {
      id: decoded.uid,
      email: decoded.email,
      firstName: decoded.name?.split(' ')[0],
      lastName: decoded.name?.split(' ')[1],
    },
    token,
  });
};

/**
 * Get Profile
 */
exports.profile = async (req, res) => {
  const doc = await db.collection('users').doc(req.user.id).get();
  res.json({ id: req.user.id, ...doc.data() });
};
