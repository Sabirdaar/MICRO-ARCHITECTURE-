const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

console.log('--- Config Check ---');
console.log('Project ID:', serviceAccount.project_id);
console.log('Client Email:', serviceAccount.client_email);
console.log('Private Key Length:', serviceAccount.private_key ? serviceAccount.private_key.length : 0);
console.log('Private Key Start:', serviceAccount.private_key ? serviceAccount.private_key.substring(0, 30) : 'MISSING');

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase App Initialized');
} catch (e) {
    console.error('Init Error:', e);
    process.exit(1);
}

async function testCreateUser() {
    try {
        const email = `test_${Date.now()}@example.com`;
        console.log(`Attempting to create user: ${email}`);
        const user = await admin.auth().createUser({
            email,
            password: 'password123',
        });
        console.log('SUCCESS: User created with UID:', user.uid);

        // Test Firestore Write
        console.log('Attempting Firestore write...');
        const db = admin.firestore();
        await db.collection('test_users').doc(user.uid).set({
            test: true,
            createdAt: new Date()
        });
        console.log('SUCCESS: Firestore write successful');

        // Cleanup
        await admin.auth().deleteUser(user.uid);
        await db.collection('test_users').doc(user.uid).delete();
        console.log('Cleanup: User and Doc deleted');
    } catch (error) {
        console.error('FAILURE: Operation Error:', error);
        if (error.code) console.error('Error Code:', error.code);
        if (error.message) console.error('Error Message:', error.message);
    }
}

testCreateUser();
