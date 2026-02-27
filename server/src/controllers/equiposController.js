const pool = require('../bd')

exports.getTeams = async (req, res) => {
    try {
        const { game_id } = req.query 
        let queryText = 'SELECT * FROM teams'
        let values = []
        if ( game_id && game_id !== 'Todos') {
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
        if (response.rows.length === 0) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }
        res.json(response.rows[0])
    } catch(error) {
        console.error("Error al obtener el equipo por id", error.message)
    }
}

exports.postTeams = async (req, res) => {
    try {
        const {name, game_id, logo, description} = req.body
        const des = description === "" ? null : description
        const nuevoEquipo = await pool.query('INSERT INTO teams (game_id, name, logo, description) VALUES $1, $2, $3, $4 RETURNING id', [game_id, name, logo, des])
        res.json(nuevoEquipo)
    } catch (error) {
        console.error("Error al insertar el equipo nuevo", error.message)
    }
}

exports.putTeam = async (req, res) => {
    try {
        const {id} = req.params
        const {name, game_id, logo, description} = req.body
        const des = description === "" ? null : description
        const equipoAct = await pool.query(
            `UPDATE teams 
            SET 
                name = COALESCE($1, name), 
                logo = COALESCE($2, logo),
                description = COALESCE($3, description)
            WHERE id = $4 
            RETURNING *`, [name, logo, description, id])
        res.json(equipoAct)
    } catch(error) {
        console.error(error)
    }
}

exports.deleteTeam = async (req,res) => {
    try {
        const {id} = req.params
        await pool.query('DELETE FROM teams WHERE id = $1', [id])
    } catch(error) {
        console.error(error)
    }
}

