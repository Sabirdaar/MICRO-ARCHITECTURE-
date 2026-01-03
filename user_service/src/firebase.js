const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    console.log('Initializing Firebase in firebase.js...');
    console.log('Project ID:', serviceAccount.projectId);

    if (!serviceAccount.privateKey || !serviceAccount.clientEmail) {
      throw new Error('Missing Firebase Credentials in Environment');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase initialized successfully in firebase.js');
  } catch (error) {
    console.error('Firebase initialization error in firebase.js:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

module.exports = { admin, db };
