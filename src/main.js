import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { install } from 'vue3-recaptcha-v2'

const app = createApp(App)

app.use(install, {
    sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
    cnDomains: false
})

app.use(router)
app.mount('#app') 