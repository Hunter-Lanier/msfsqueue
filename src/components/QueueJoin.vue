<template>
    <div class="queue-join">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Join the Queue</h2>
        <form @submit.prevent="handleJoin" class="max-w-md mx-auto space-y-6">
            <div class="form-group">
                <label for="contact" class="block text-sm font-medium text-gray-700 mb-2">
                    Email or Phone Number
                </label>
                <input type="text" id="contact" v-model="contactInfo" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your contact information" />
            </div>

            <div class="form-group flex justify-center">
                <RecaptchaV2 @widget-id="handleWidgetId" @error-callback="handleErrorCallback"
                    @expired-callback="onCaptchaExpired" @load-callback="onCaptchaVerified" ref="recaptchaRef" />
            </div>

            <button type="submit" :disabled="!contactInfo || !captchaToken || loading"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                {{ loading ? 'Joining Queue...' : 'Join Queue' }}
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { RecaptchaV2, useRecaptcha } from 'vue3-recaptcha-v2'
import { joinQueue } from '../services/queueService'

const router = useRouter()
const contactInfo = ref('')
const captchaToken = ref('')
const loading = ref(false)
const recaptchaRef = ref(null)
const widgetId = ref(null)

const { handleReset } = useRecaptcha()

const handleWidgetId = (id) => {
    widgetId.value = id
}

const handleErrorCallback = () => {
    console.error('reCAPTCHA error')
    captchaToken.value = ''
}

const onCaptchaVerified = (response) => {
    captchaToken.value = response
}

const onCaptchaExpired = () => {
    captchaToken.value = ''
    handleReset(widgetId.value)
}

const handleJoin = async () => {
    if (!captchaToken.value) {
        alert('Please complete the CAPTCHA')
        return
    }

    loading.value = true
    try {
        console.log('Attempting to join queue...')
        const response = await joinQueue({
            contactInfo: contactInfo.value,
            captchaToken: captchaToken.value
        })
        console.log('Join queue response:', response)

        if (!response.id) {
            throw new Error('Invalid response from server')
        }

        localStorage.setItem('queueUserId', response.id)
        router.push('/status')
    } catch (error) {
        console.error('Failed to join queue:', error)
        alert('Failed to join queue. Please try again.')
        handleReset(widgetId.value)
        captchaToken.value = ''
    } finally {
        loading.value = false
    }
}
</script>