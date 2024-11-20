<template>
    <div class="min-h-screen bg-gray-50">
        <div class="max-w-4xl mx-auto px-4 py-8">
            <header class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900">MSFS 2024 Queue System</h1>
                <p class="mt-2 text-gray-600">Track your position in the Microsoft Flight Simulator queue</p>
            </header>

            <main class="bg-white rounded-lg shadow-lg p-6 mb-8">
                <router-view></router-view>
            </main>

            <QueueAnalytics />

            <footer class="mt-12 text-center text-gray-600 text-sm">
                <p>Check back regularly to maintain your place in queue</p>
                <p class="mt-2">© 2024 MSFS Queue System</p>
            </footer>
        </div>
    </div>
</template>

<script setup>
import QueueAnalytics from './components/QueueAnalytics.vue'
</script>