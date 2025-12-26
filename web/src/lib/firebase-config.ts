import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Cloud Messaging
let messaging: ReturnType<typeof getMessaging> | null = null;

// Only initialize messaging in browser environment
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            messaging = getMessaging(app);
        }
    });
}

export { app, messaging };

// Request FCM token
export async function requestNotificationPermission(): Promise<string | null> {
    try {
        // Ensure messaging is supported and initialized
        const supported = await isSupported();
        if (!supported) {
            console.log('Firebase Messaging not supported');
            return null;
        }

        // Initialize messaging if not already done
        if (!messaging) {
            messaging = getMessaging(app);
        }

        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            });
            return token;
        }

        return null;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
}

// Listen to foreground messages
export function onMessageListener() {
    return new Promise((resolve) => {
        if (messaging) {
            onMessage(messaging, (payload) => {
                resolve(payload);
            });
        }
    });
}
