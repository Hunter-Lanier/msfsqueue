importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js')

firebase.initializeApp({
    apiKey: 'your_api_key',
    projectId: 'your_project_id',
    messagingSenderId: 'your_sender_id',
    appId: 'your_app_id'
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification
    self.registration.showNotification(title, {
        body,
        icon: '/icon.png'
    })
}) 