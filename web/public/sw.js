
// Import Firebase Messaging for background notifications
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
firebase.initializeApp({
    apiKey: "AIzaSyAFqU9mpPpDs5qKvm4nsOWcEHGSJos0YEg",
    authDomain: "agendador-andreia.firebaseapp.com",
    projectId: "agendador-andreia",
    storageBucket: "agendador-andreia.firebasestorage.app",
    messagingSenderId: "61392425666",
    appId: "1:61392425666:web:457e48f21b7b9296fbe15b",
    measurementId: "G-4MVYWTR75Y"
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
