const pool = require('../bd')

exports.getTeams = async (req, res) => {
    try {
        const { game_id } = req.query 
        let queryText = 'SELECT * FROM teams'
        let values = []
        if ( game_id && game_id !== Todos) {
            queryText += 'WHERE game_id = $1'
            values.push(game_id)
        }

        const response = await pool.query(queryText, values)
        res.json(response.rows)
    } catch(error) {
        console.error("Error al obtener los datos:", error.message)
    }
}
