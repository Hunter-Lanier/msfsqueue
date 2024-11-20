export default function handler(req, res) {
    // Enable CORS for development
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    // Handle queue join
    if (req.method === 'POST' && req.url === '/queue') {
        const mockUser = {
            id: 'user_' + Date.now(),
            position: 1,
            status: 'active'
        }
        return res.status(200).json(mockUser)
    }

    // Handle queue status
    if (req.method === 'GET' && req.url.includes('/queue/stats')) {
        return res.status(200).json({
            avgWaitTime: 15,
            totalUsers: 42,
            completionRate: 85
        })
    }

    // Handle queue list
    if (req.method === 'GET' && req.url.includes('/queue/list')) {
        return res.status(200).json([
            {
                id: '1',
                position: 1,
                waitTime: 5,
                status: 'active'
            },
            {
                id: '2',
                position: 2,
                waitTime: 10,
                status: 'active'
            }
        ])
    }

    res.status(404).json({ error: 'Not found' })
} 