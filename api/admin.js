export default async function handler(req, res) {
    // Check admin password
    const adminPassword = req.headers['x-admin-password']
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get queue data
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('queue')
                .select('*')
                .order('position', { ascending: true })

            if (error) throw error
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json({ error: 'Failed to get queue data' })
        }
    }

    // Update user position
    if (req.method === 'PUT' && req.url.includes('/position')) {
        const { userId } = req.query
        const { position } = req.body

        try {
            const { error } = await supabase
                .from('queue')
                .update({ position })
                .eq('id', userId)

            if (error) throw error
            return res.status(200).json({ message: 'Position updated' })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update position' })
        }
    }

    // Update user status
    if (req.method === 'PUT' && req.url.includes('/status')) {
        const { userId } = req.query
        const { status } = req.body

        try {
            const { error } = await supabase
                .from('queue')
                .update({ status })
                .eq('id', userId)

            if (error) throw error
            return res.status(200).json({ message: 'Status updated' })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update status' })
        }
    }

    // Remove user
    if (req.method === 'DELETE') {
        const { userId } = req.query

        try {
            const { error } = await supabase
                .from('queue')
                .delete()
                .eq('id', userId)

            if (error) throw error
            return res.status(200).json({ message: 'User removed' })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to remove user' })
        }
    }

    // Clear queue
    if (req.method === 'POST' && req.url.includes('/clear')) {
        try {
            const { error } = await supabase
                .from('queue')
                .delete()
                .neq('id', '0') // Prevent accidental deletion of system records

            if (error) throw error
            return res.status(200).json({ message: 'Queue cleared' })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to clear queue' })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
} 