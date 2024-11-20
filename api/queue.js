import { createClient } from '@supabase/supabase-js'
import { initializeApp, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

// Initialize Firebase Admin
const firebaseAdmin = initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS))
})

async function verifyCaptcha(token) {
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
    return data.success
}

async function calculateEstimatedTime(position) {
    // Get historical completion data
    const { data: history } = await supabase
        .from('queue_history')
        .select('completion_time, joined_at')
        .order('completion_time', { ascending: false })
        .limit(10)

    // Calculate average wait time from historical data
    const avgWaitTime = history.reduce((acc, curr) => {
        const wait = new Date(curr.completion_time) - new Date(curr.joined_at)
        return acc + wait
    }, 0) / history.length

    return Math.round((avgWaitTime * position) / (1000 * 60)) // Convert to minutes
}

// Add priority queue logic
async function calculateUserPriority(userId) {
    const { data: user } = await supabase
        .from('queue')
        .select('joined_at, check_in_count, previous_attempts')
        .eq('id', userId)
        .single()

    // Priority formula: earlier join time + more check-ins + failed attempts
    return {
        joinTime: new Date(user.joined_at).getTime(),
        checkIns: user.check_in_count * 1000,
        previousAttempts: (user.previous_attempts || 0) * 5000
    }
}

export default async function handler(req, res) {
    if (req.method === 'POST' && !req.url.includes('/checkin')) {
        try {
            const { contactInfo, captchaToken, fcmToken } = req.body

            // Verify CAPTCHA
            const isValidCaptcha = await verifyCaptcha(captchaToken)
            if (!isValidCaptcha) {
                return res.status(400).json({
                    error: 'Invalid CAPTCHA. Please try again.'
                })
            }

            // Add to queue
            const { data, error } = await supabase
                .from('queue')
                .insert([
                    {
                        contact_info: contactInfo,
                        joined_at: new Date().toISOString(),
                        status: 'active',
                        fcm_token: fcmToken
                    }
                ])
                .single()

            if (error) throw error

            // Send welcome notification if FCM token exists
            if (fcmToken) {
                await getMessaging().send({
                    token: fcmToken,
                    notification: {
                        title: 'Welcome to MSFS 2024 Queue',
                        body: `You are in position ${data.position}. We'll notify you when it's time to check in.`
                    }
                })
            }

            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json({
                error: 'Failed to join queue',
                message: error.message
            })
        }
    }

    // Handle GET request for queue status
    if (req.method === 'GET') {
        const { userId } = req.query

        try {
            // Get user's queue entry
            const { data: userEntry, error: userError } = await supabase
                .from('queue')
                .select('*')
                .eq('id', userId)
                .single()

            if (userError) throw userError

            // Get count of users ahead in queue
            const { count, error: countError } = await supabase
                .from('queue')
                .select('*', { count: 'exact' })
                .eq('status', 'active')
                .lt('joined_at', userEntry.joined_at)

            if (countError) throw countError

            // Calculate estimated wait time (assuming 5 minutes per person)
            const estimatedMinutes = count * 5
            const nextCheckIn = new Date(userEntry.last_check_in || userEntry.joined_at)
            nextCheckIn.setMinutes(nextCheckIn.getMinutes() + 10) // Check-in required every 10 minutes

            return res.status(200).json({
                position: count + 1,
                estimatedWaitTime: `${estimatedMinutes} minutes`,
                nextCheckInTime: nextCheckIn.toISOString(),
                status: userEntry.status
            })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to get queue status' })
        }
    }

    // Handle check-in POST request
    if (req.method === 'POST' && req.url.includes('/checkin')) {
        const { userId } = req.query

        try {
            const { data, error } = await supabase
                .from('queue')
                .update({
                    last_check_in: new Date().toISOString(),
                    status: 'active'
                })
                .eq('id', userId)
                .single()

            if (error) throw error

            return res.status(200).json({ message: 'Check-in successful' })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to check in' })
        }
    }

    // Add these new handlers to the existing file

    // Inside the handler function, add these new conditions
    if (req.method === 'GET' && req.url.includes('/stats')) {
        try {
            const { data: activeUsers } = await supabase
                .from('queue')
                .select('*')
                .eq('status', 'active')

            const { data: completedUsers } = await supabase
                .from('queue_history')
                .select('*')
                .gte('joined_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

            const avgWaitTime = await calculateEstimatedTime(1) // Reuse existing function

            return res.status(200).json({
                avgWaitTime,
                totalUsers: activeUsers.length,
                completionRate: Math.round((completedUsers.length / (completedUsers.length + activeUsers.length)) * 100)
            })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to get queue statistics' })
        }
    }

    if (req.method === 'GET' && req.url.includes('/list')) {
        try {
            const { data: users } = await supabase
                .from('queue')
                .select('*')
                .eq('status', 'active')
                .order('joined_at', { ascending: true })

            const queueList = users.map((user, index) => ({
                id: user.id,
                position: index + 1,
                waitTime: Math.round((Date.now() - new Date(user.joined_at).getTime()) / (1000 * 60)),
                status: user.status
            }))

            return res.status(200).json(queueList)
        } catch (error) {
            return res.status(500).json({ error: 'Failed to get queue list' })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
} 