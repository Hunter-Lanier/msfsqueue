// Add this function at the top
async function verifyCaptcha(token) {
    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: token,
            }),
        })

        const data = await response.json()
        console.log('CAPTCHA verification response:', data)
        return data.success
    } catch (error) {
        console.error('CAPTCHA verification error:', error)
        return false
    }
}

export default async function handler(req, res) {
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
    if (req.method === 'POST' && !req.url.includes('/checkin')) {
        try {
            const { contactInfo, captchaToken } = req.body

            // Verify CAPTCHA
            const isValidCaptcha = await verifyCaptcha(captchaToken)
            if (!isValidCaptcha) {
                return res.status(400).json({
                    error: 'Invalid CAPTCHA. Please try again.'
                })
            }

            const mockUser = {
                id: 'user_' + Date.now(),
                position: 1,
                status: 'active',
                contactInfo: contactInfo
            }

            console.log('User joined queue:', mockUser)
            return res.status(200).json(mockUser)
        } catch (error) {
            console.error('Queue join error:', error)
            return res.status(500).json({
                error: 'Failed to join queue',
                message: error.message
            })
        }
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