import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { install } from 'vue3-recaptcha-v2'

const app = createApp(App)

app.use(install, {
    sitekey: '6LfxVoQqAAAAAFZIwM5L0QAeR-93UZVHgsChCnK4',
    cnDomains: false
})

app.use(router)
app.mount('#app') 