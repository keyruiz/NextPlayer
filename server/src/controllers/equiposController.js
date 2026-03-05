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
        res.status(200).json(response.rows)
    } catch(error) {
        console.error(error)
        console.status(500).json({error: 'Error en el servidor al obtener los equipos'})
    }
}

exports.getTeamsId = async (req, res) => {
    try {
        const { id } = req.params;

        let query = "SELECT e.*, g.name AS name_game FROM teams e JOIN games g ON e.game_id = g.id WHERE e.id = $1"
        let response = await pool.query(query, [id])
        if (response.rowCount === 0) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }
        res.status(200).json(response.rows[0])
    } catch(error) {
        console.error(error)
        res.status(500).json({error: 'Error al obtener equipos por id'})
    }
}

exports.postTeams = async (req, res) => {
    try {
        const {name, game_id, logo, description} = req.body
        const des = description === "" ? null : description
        //Falta añadir transaccion para hacer que el user cambia a ceo al hacer el equipo
        const nuevoEquipo = await pool.query('INSERT INTO teams (game_id, name, logo, description) VALUES $1, $2, $3, $4 RETURNING id', [game_id, name, logo, des])
        res.status(201).json(nuevoEquipo)
    } catch (error) {
        console.error(error)
        res.status(500).json({error: `Error al crear equipo `})
    }
}

exports.putTeam = async (req, res) => {
    try {
        const { id } = req.params
        const { name, logo, description } = req.body
        const des = description === "" ? null : description
        //A falta de añadir validacion si el ceo es el que hace el edit
        const equipoAct = await pool.query(
            `UPDATE teams 
            SET 
                name = COALESCE($1, name), 
                logo = COALESCE($2, logo),
                description = COALESCE($3, description)
            WHERE id = $4 
            RETURNING *`, [name, logo, des, id])
        res.status(200).json(equipoAct)
    } catch(error) {
        console.error(error)
        res.status(500).json({error: 'Error del servidor al actualizar equipo'})
    }
}

exports.deleteTeam = async (req,res) => {
    try {
        const {id} = req.params7
        //A falta de añadir validacion si es el CEO
        await pool.query('DELETE FROM teams WHERE id = $1', [id])
        res.status(200).json({message: 'Equipo borrado con exito'})
    } catch(error) {
        console.error(error)
        res.status(500).json({error: 'Error del servidor al borrar equipo'})
    }
}

