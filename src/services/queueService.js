const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api'

export const joinQueue = async ({ contactInfo, captchaToken }) => {
    console.log('Sending join request...')
    try {
        const response = await fetch(`${API_BASE_URL}/queue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contactInfo,
                captchaToken
            }),
        })

        console.log('Response status:', response.status)

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to join queue')
        }

        const data = await response.json()
        console.log('Join queue response data:', data)
        return data
    } catch (error) {
        console.error('Join queue error:', error)
        throw error
    }
}

export const getQueueStatus = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/queue/${userId}`)

    if (!response.ok) {
        throw new Error('Failed to get queue status')
    }

    return response.json()
}

export const checkIn = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/queue/${userId}/checkin`, {
        method: 'POST',
    })

    if (!response.ok) {
        throw new Error('Failed to check in')
    }

    return response.json()
}

export const subscribeToQueueUpdates = async (userId, callback) => {
    const eventSource = new EventSource(`${API_BASE_URL}/queue/${userId}/updates`)

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        callback(data)
    }

    return () => eventSource.close()
}

export const getQueueStats = async () => {
    const response = await fetch(`${API_BASE_URL}/queue/stats`)

    if (!response.ok) {
        throw new Error('Failed to get queue statistics')
    }

    return response.json()
}

export const getQueueList = async () => {
    const response = await fetch(`${API_BASE_URL}/queue/list`)

    if (!response.ok) {
        throw new Error('Failed to get queue list')
    }

    return response.json()
} 