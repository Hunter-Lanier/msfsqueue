<template>
    <div class="queue-status p-6 bg-white rounded-lg shadow">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Your Queue Status</h2>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <div v-else class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="text-sm font-medium text-gray-500">Your Position</h3>
                    <p class="mt-1 text-3xl font-semibold text-gray-900">{{ position }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="text-sm font-medium text-gray-500">Estimated Wait</h3>
                    <p class="mt-1 text-3xl font-semibold text-gray-900">{{ estimatedWaitTime }}</p>
                </div>
            </div>

            <div class="check-in-section bg-blue-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-sm font-medium text-blue-900">Next Check-in</h3>
                        <p class="mt-1 text-blue-700">{{ nextCheckInTime }}</p>
                    </div>
                    <button @click="handleCheckIn" :disabled="checkInLoading"
                        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                        <svg v-if="checkInLoading" class="animate-spin -ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        {{ checkInLoading ? 'Checking in...' : 'Check In' }}
                    </button>
                </div>
            </div>

            <div class="auto-checkin bg-gray-50 p-4 rounded-lg">
                <label class="flex items-center space-x-3">
                    <input type="checkbox" v-model="autoCheckIn" @change="toggleAutoCheckIn"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span class="text-sm font-medium text-gray-900">Enable automatic check-in</span>
                </label>
                <p class="mt-2 text-sm text-gray-500">
                    We'll automatically check in for you every 10 minutes
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getQueueStatus, checkIn } from '../services/queueService'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const checkInLoading = ref(false)
const position = ref(0)
const estimatedWaitTime = ref('')
const nextCheckInTime = ref('')
const autoCheckIn = ref(false)
let autoCheckInInterval

const userId = localStorage.getItem('queueUserId')

const handleCheckIn = async () => {
    if (!userId) {
        router.push('/')
        return
    }

    checkInLoading.value = true
    try {
        await checkIn(userId)
        // Refresh status after check-in
        await updateStatus()
    } catch (error) {
        console.error('Check-in failed:', error)
        alert('Failed to check in. Please try again.')
    } finally {
        checkInLoading.value = false
    }
}

const updateStatus = async () => {
    if (!userId) {
        router.push('/')
        return
    }

    try {
        const status = await getQueueStatus(userId)
        position.value = status.position
        estimatedWaitTime.value = status.estimatedWaitTime
        nextCheckInTime.value = new Date(status.nextCheckInTime).toLocaleTimeString()
    } catch (error) {
        console.error('Failed to load queue status:', error)
        alert('Failed to load queue status. Please try again.')
    } finally {
        loading.value = false
    }
}

const toggleAutoCheckIn = () => {
    if (autoCheckIn.value) {
        autoCheckInInterval = setInterval(handleCheckIn, 10 * 60 * 1000) // 10 minutes
    } else {
        clearInterval(autoCheckInInterval)
    }
}

// Update status every minute
let statusInterval
onMounted(() => {
    updateStatus()
    statusInterval = setInterval(updateStatus, 60000)
})

onUnmounted(() => {
    if (statusInterval) {
        clearInterval(statusInterval)
    }
    clearInterval(autoCheckInInterval)
})
</script>