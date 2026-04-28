import { NextResponse } from 'next/server';

export async function GET() {
    const swContent = `
// Import Firebase Messaging for background notifications
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
// Values injected via Next.js Route Handler from environment variables
firebase.initializeApp({
    apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}",
    authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}",
    measurementId: "${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''}"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Nova Notificação';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'appointment-reminder',
        requireInteraction: true,
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click received.');

    event.notification.close();

    // Open the app when notification is clicked
    event.waitUntil(
        clients.openWindow('/')
    );
});

// PWA Cache
const CACHE_NAME = 'agendador-andreia-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/dashboard/schedule',
                '/manifest.json',
                '/favicon.ico'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
`;

    return new NextResponse(swContent, {
        headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
    });
}
