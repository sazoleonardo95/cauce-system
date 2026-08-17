const admin = require('firebase-admin');
const prisma = require('../config/database');

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;

  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn('[FIREBASE] No project ID configured. Push notifications disabled.');
    return;
  }

  try {
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log('[FIREBASE] Initialized successfully');
  } catch (error) {
    console.error('[FIREBASE] Init error:', error.message);
  }
};

const sendToToken = async (token, title, body, data = {}) => {
  if (!firebaseInitialized) return null;

  try {
    const message = {
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ),
    };

    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    if (
      error.code === 'messaging/registration-token-not-registered' ||
      error.code === 'messaging/invalid-registration-token'
    ) {
      await prisma.deviceToken.updateMany({
        where: { token },
        data: { isActive: false },
      });
    }
    return null;
  }
};

const sendPushNotification = async (userId, title, body, data = {}) => {
  if (!firebaseInitialized) return null;

  try {
    const tokens = await prisma.deviceToken.findMany({
      where: { userId, isActive: true },
    });

    if (tokens.length === 0) return null;

    const results = await Promise.allSettled(
      tokens.map((t) => sendToToken(t.token, title, body, data))
    );

    return results.filter((r) => r.status === 'fulfilled' && r.value).length;
  } catch (error) {
    return null;
  }
};

module.exports = { initializeFirebase, sendPushNotification, sendToToken };
