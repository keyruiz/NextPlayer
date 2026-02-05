const pool = require('../bd')

const handleSteamReturn = async (identifier, profiler,done) => {
    const steamId= escapeIdentifier.split('/').pop()
    try {
        const res = await pool.query ('SELECT user_id FROM external_Account WHERE external_user_id' = $1, [steamId])
        if (res.rows.length > 0) {
            return done(null, {id: rows[0].user_id})
        }

        const newUser = await pool.query('INSERT INTO users (role) VALUES (1$) RETURNING id', ['user'])

        const newUserId = newUser.row[0].id;

        await pool.query ('INSERT INTO external_account (user_id, provider, external_user_id) VALUES ($1, $2, $3)', [newUserId, 'steam', steamId])

        return done(null, {id: newUserId})
    } catch (err){
        return done(err, null)
    }
}