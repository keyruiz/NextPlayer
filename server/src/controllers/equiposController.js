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

exports.getTeamsId = async (req, res) => {
    try {
        const {id } = req.params;

        let query = "SELECT e.*, g.name AS name_game FROM teams e JOIN games g ON e.game_id = g.id WHERE e.id = $1"
        let response = await pool.query(query, [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }
        res.json(result.rows[0])
    } catch(error) {
        console.error("Error al obtener el equipo por id", error.message)
    }
}


