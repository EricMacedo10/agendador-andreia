"use client";

import { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase-config';

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check current permission status
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }

        // Listen to foreground messages
        onMessageListener()
            .then((payload: any) => {
                console.log('Foreground message received:', payload);
                // Show notification manually in foreground
                if (payload.notification) {
                    new Notification(payload.notification.title, {
                        body: payload.notification.body,
                        icon: '/icon-192.png'
                    });
                }
            })
            .catch((err) => console.log('Failed to receive foreground message:', err));
    }, []);

    const requestPermission = async () => {
        setLoading(true);
        try {
            const fcmToken = await requestNotificationPermission();

            if (fcmToken) {
                setToken(fcmToken);
                setPermission('granted');

                // Save token to backend
                await fetch('/api/notifications/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: fcmToken })
                });

                return fcmToken;
            } else {
                setPermission('denied');
                return null;
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            setPermission('denied');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        permission,
        token,
        loading,
        requestPermission
    };
}
