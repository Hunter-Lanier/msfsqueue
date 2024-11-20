import { createRouter, createWebHistory } from 'vue-router'
import QueueJoin from '../components/QueueJoin.vue'
import QueueStatus from '../components/QueueStatus.vue'
import AdminQueue from '../components/AdminQueue.vue'

const routes = [
    {
        path: '/',
        name: 'join',
        component: QueueJoin
    },
    {
        path: '/status',
        name: 'status',
        component: QueueStatus,
        beforeEnter: (to, from, next) => {
            const userId = localStorage.getItem('queueUserId')
            if (!userId) {
                next('/')
            } else {
                next()
            }
        }
    },
    {
        path: '/admin',
        name: 'admin',
        component: AdminQueue
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router 