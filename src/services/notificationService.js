import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const firebaseApp = initializeApp(firebaseConfig)
const messaging = getMessaging(firebaseApp)

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            })
            return token
        }
        throw new Error('Notification permission denied')
    } catch (error) {
        console.error('Notification permission error:', error)
        throw error
    }
}

export const onMessageReceived = (callback) => {
    return onMessage(messaging, (payload) => {
        callback(payload)
    })
} 