const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { admin, db } = require('../firebase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Register with email/password
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    console.log('Registering user:', { email, firstName, lastName }); // Debug Log

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const userId = userRecord.uid;

    // Create profile in Firestore
    await db.collection('users').doc(userId).set({
      firstName,
      lastName,
      email,
      role: 'user', // Default role
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate JWT (Backend session token)
    const token = jwt.sign(
      { id: userId, email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        firstName,
        firstName,
        lastName,
        role: 'user',
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login (Standard) - Now expects Frontend to Verify Password via Client SDK
// However, to support the current "Login via Backend" flow without full frontend rewrite,
// we can verify the ID Token sent by frontend (if frontend sends ID token)
// OR if frontend sends email/password, we are STUCK because Admin SDK cannot verify password.
//
// STRATEGY: Frontend MUST be updated to send ID Token after Client Login.
// This route will now exchange ID Token for Backend Session Token.
router.post('/login', async (req, res) => {
  try {
    const { idToken, email, password } = req.body;

    // Support legacy (email/password) only if using in-memory (which we are removing)
    // or if we switch to Client SDK.
    // Since plan says Frontend will use Client SDK, we expect 'idToken' here.

    if (!idToken && (email && password)) {
      return res.status(400).json({ error: 'Backend login via password not supported. Use Client SDK and send ID Token.' });
    }

    if (!idToken) {
      return res.status(400).json({ error: 'ID Token required' });
    }

    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    // Get Profile from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    let userData = userDoc.exists ? userDoc.data() : {};

    // Generate Backend JWT
    const token = jwt.sign(
      { id: userId, email: userEmail },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: userId,
        email: userEmail,
        firstName: userData.firstName || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: userData.role || 'user',
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Google login/register
router.post('/google-auth', async (req, res) => {
  try {
    const { idToken, email, firstName, lastName } = req.body;

    console.log('Google Auth Request:', { email, firstName, lastName });

    if (!idToken) {
      console.log('Google Auth Error: Missing idToken');
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify the ID token - THIS IS THE PROPER WAY
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('ID Token verified successfully for UID:', decodedToken.uid);
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return res.status(401).json({ error: 'Invalid ID token' });
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    // Optional: Check if email matches token (security check)
    if (email && email !== userEmail) {
      console.warn('Warning: Request email does not match Token email', { requestEmail: email, tokenEmail: userEmail });
    }

    // Create/Update profile in Firestore
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      console.log('Creating new user profile in Firestore:', userId);
      await userRef.set({
        firstName,
        lastName,
        email: userEmail,
        email: userEmail,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      console.log('User profile exists, updating timestamp:', userId);
      await userRef.update({
        updatedAt: new Date()
      });
    }

    // Create backend session token
    const token = jwt.sign(
      { id: userId, email: userEmail },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Google Auth Success, returning backend token');
    res.json({
      message: 'Google authentication successful',
      user: {
        id: userId,
        email: userEmail,
        firstName: doc.exists ? doc.data().firstName : firstName,
        lastName: doc.exists ? doc.data().lastName : lastName,
        role: doc.exists ? doc.data().role : 'user',
      },
      token,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userRef = db.collection('users').doc(req.user.id);

    await userRef.update({
      firstName,
      lastName,
      updatedAt: new Date()
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName,
        lastName,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user public profile by ID (for Admin Dashboard)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    // Return only public info
    res.json({
      id: userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email, // Optional, might be useful for admin
      role: userData.role
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { router: router, userRoutes: router };