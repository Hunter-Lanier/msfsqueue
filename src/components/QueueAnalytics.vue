<template>
    <div class="analytics p-4">
        <h2 class="text-xl font-bold mb-4">Queue Analytics</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="stat-card p-4 bg-white rounded shadow">
                <h3>Average Wait Time</h3>
                <p class="text-2xl">{{ stats.avgWaitTime }} min</p>
            </div>
            <div class="stat-card p-4 bg-white rounded shadow">
                <h3>Users in Queue</h3>
                <p class="text-2xl">{{ stats.totalUsers }}</p>
            </div>
            <div class="stat-card p-4 bg-white rounded shadow">
                <h3>Completion Rate</h3>
                <p class="text-2xl">{{ stats.completionRate }}%</p>
            </div>
        </div>

        <!-- Queue List -->
        <div class="queue-list bg-white rounded shadow p-4">
            <h3 class="text-lg font-bold mb-4">Current Queue</h3>
            <div v-if="loading" class="text-center py-4">
                Loading queue data...
            </div>
            <div v-else-if="queueList.length === 0" class="text-center py-4">
                No users currently in queue
            </div>
            <div v-else class="space-y-2">
                <div v-for="user in queueList" :key="user.id"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded"
                    :class="{ 'border-l-4 border-blue-500': user.id === currentUserId }">
                    <div>
                        <span class="font-medium">Position {{ user.position }}</span>
                        <span class="text-sm text-gray-600 ml-2">
                            (Waiting {{ formatWaitTime(user.waitTime) }})
                        </span>
                    </div>
                    <div class="text-sm text-gray-500">
                        {{ formatStatus(user.status) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getQueueStats, getQueueList } from '../services/queueService'

const loading = ref(true)
const stats = ref({
    avgWaitTime: 0,
    totalUsers: 0,
    completionRate: 0
})
const queueList = ref([])
const currentUserId = localStorage.getItem('queueUserId')

// Format wait time to human readable format
const formatWaitTime = (minutes) => {
    if (minutes < 60) {
        return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
}

const formatStatus = (status) => {
    const statusMap = {
        'active': '✅ Active',
        'inactive': '⚠️ Needs Check-in',
        'removed': '❌ Removed'
    }
    return statusMap[status] || status
}

const updateQueueData = async () => {
    try {
        const [statsData, listData] = await Promise.all([
            getQueueStats(),
            getQueueList()
        ])

        stats.value = statsData
        queueList.value = listData
    } catch (error) {
        console.error('Failed to fetch queue data:', error)
    } finally {
        loading.value = false
    }
}

// Update queue data every 30 seconds
let updateInterval
onMounted(() => {
    updateQueueData()
    updateInterval = setInterval(updateQueueData, 30000)
})

onUnmounted(() => {
    if (updateInterval) {
        clearInterval(updateInterval)
    }
})
</script>

<style scoped>
.queue-list {
    max-height: 500px;
    overflow-y: auto;
}
</style>