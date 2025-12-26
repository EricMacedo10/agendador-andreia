importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "YOUR_API_KEY_PLACEHOLDER",
    projectId: "agendador-andreia",
    messagingSenderId: "366661706684",
    appId: "1:366661706684:web:0b0a8c0e2b3e8e1f578f13"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png', // Ensure this icon exists or use a generic one
        badge: '/icon-192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
