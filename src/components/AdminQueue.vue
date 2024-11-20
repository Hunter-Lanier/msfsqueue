<template>
    <div class="admin-queue">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Queue Administration</h2>
            <div class="flex gap-2">
                <button @click="refreshQueue" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
                    Refresh
                </button>
                <button @click="clearQueue" class="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md">
                    Clear Queue
                </button>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Wait Time
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="user in queueUsers" :key="user.id">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <input type="number" v-model="user.position" @change="updatePosition(user)"
                                class="w-20 px-2 py-1 border rounded">
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">{{ user.contactInfo }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <select v-model="user.status" @change="updateStatus(user)" class="px-2 py-1 border rounded">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="removed">Removed</option>
                            </select>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ formatWaitTime(user.waitTime) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <button @click="removeUser(user.id)" class="text-red-600 hover:text-red-900">
                                Remove
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const queueUsers = ref([])
const isAdmin = ref(false)

// Check admin status on mount
onMounted(async () => {
    const adminPassword = localStorage.getItem('adminPassword')
    if (!adminPassword) {
        const password = prompt('Enter admin password:')
        if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
            localStorage.setItem('adminPassword', password)
            isAdmin.value = true
            await loadQueueData()
        } else {
            alert('Invalid admin password')
            router.push('/')
        }
    } else if (adminPassword === import.meta.env.VITE_ADMIN_PASSWORD) {
        isAdmin.value = true
        await loadQueueData()
    } else {
        router.push('/')
    }
})

const formatWaitTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
}

const loadQueueData = async () => {
    try {
        const response = await fetch('/api/admin/queue')
        const data = await response.json()
        queueUsers.value = data
    } catch (error) {
        console.error('Failed to load queue data:', error)
        alert('Failed to load queue data')
    }
}

const updatePosition = async (user) => {
    try {
        await fetch(`/api/admin/queue/${user.id}/position`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: user.position })
        })
    } catch (error) {
        console.error('Failed to update position:', error)
        alert('Failed to update position')
    }
}

const updateStatus = async (user) => {
    try {
        await fetch(`/api/admin/queue/${user.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: user.status })
        })
    } catch (error) {
        console.error('Failed to update status:', error)
        alert('Failed to update status')
    }
}

const removeUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this user?')) return

    try {
        await fetch(`/api/admin/queue/${userId}`, {
            method: 'DELETE'
        })
        await loadQueueData()
    } catch (error) {
        console.error('Failed to remove user:', error)
        alert('Failed to remove user')
    }
}

const clearQueue = async () => {
    if (!confirm('Are you sure you want to clear the entire queue?')) return

    try {
        await fetch('/api/admin/queue/clear', { method: 'POST' })
        await loadQueueData()
    } catch (error) {
        console.error('Failed to clear queue:', error)
        alert('Failed to clear queue')
    }
}

const refreshQueue = () => loadQueueData()
</script>