const { admin, db } = require('../firebase');

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address');
    console.error('Usage: node src/scripts/createAdmin.js <email>');
    process.exit(1);
}

const promoteToAdmin = async (email) => {
    try {
        const user = await admin.auth().getUserByEmail(email);
        const userId = user.uid;

        console.log(`Found user: ${email} (${userId})`);

        // Update Firestore
        await db.collection('users').doc(userId).update({
            role: 'admin'
        });

        // Validating update
        const doc = await db.collection('users').doc(userId).get();
        console.log(`User ${email} updated successfully! Role is now: ${doc.data().role}`);

        // Optional: Set custom claims in Firebase Auth (for security rules if we used them)
        // await admin.auth().setCustomUserClaims(userId, { admin: true });

        process.exit(0);
    } catch (error) {
        console.error('Error promoting user:', error);
        process.exit(1);
    }
};

promoteToAdmin(email);
