const pool = require('../bd')

exports.postProfile = async (req, res) => {
    try {
        const {user_id, username, bio, country} = req.body
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id])
        if (userCheck.rowCount === 0) {
            return res.json(404).json({
                error: "El usuario no existe en la base de datos"
            })
        }
        const biografia = bio  === "" ? null : bio
        const createProfile = await pool.query('INSERT INTO profiles (user_id, username, bio, country) VALUES ($1, $2, $3, $4)', {user_id, username, biografia, country})
        res.status(201).json(createProfile)
    } catch(error) {
        console.error(error)
        res.status(500).json({error: "Error del servidor añadir usuario"})
    }
}

exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params
        let perfil = await pool.query('SELECT * FROM profiles WHERE id = $1', [id])
        if (userCheck.rowCount === 0) {
            return resstatus(404).json({
                error: "El usuario no existe en la base de datos"
            })
        }
        res.status(200).json(perfil.rows[0])
    }
    catch(error){
        console.error(error)
        res.status(500).jSon({error: "Error del servidor al obtener perfil"})
    }
}

exports.getProfiles = async (req, res) => {
    try {
        let result = await pool.query("SELECT * FROM profiles")
        res.status(200).json(result.rows)
    } catch(error) {
        console.error(error)
        res.status(500).json({error: "Error del servidor al obtener perfiles"})
    }
}

exports.putProfiles = async (req, res) => {
    try {
        const { id } = req.params
        const  {user_id, username, bio, country} = req.body
        if (!user_id || !username) {
            return res.status(400).json({ error: "user_id y username son obligatorios" });
        }
        const result = await pool.query(`UPDATE profiles
            SET 
                username = COALESCE($1, username), 
                bio = COALESCE($2, bio),
                country = COALESCE($3, country0)
            WHERE id = $4 AND user_id = $5 
            RETURNING *`, [username, bio, country, id, user_id])
        if (result.rowCount === 0) {
            return res.status(403).json({ 
                error: "No se encontró el perfil o no tienes permiso para editarlo" 
            });
        }
        res.status(200).json(result.rows[0])        
    }catch(error) {
        console.error(error)
        res.status(500).json({error: "Error del servidor al obtener actualizar perfil"})
    }
}

exports.deleteProfile = async (req, res) => {
    try {
        const {id} = req.params
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: "El user_id es necesario para verificar la propiedad." });
        }

        const result = await pool.query('DELETE FROM profiles WHERE id = $1 AND user_id = $2', [id, user_id]);

        // 4. Comprobamos si se borró algo
        if (result.rowCount === 0) {
            return res.status(403).json({ 
                error: "No se pudo eliminar: el perfil no existe o no tienes permiso." 
            });
        }
        
        res.status(200).json({ message: "Perfil eliminado correctamente"});
    } catch(error) {
        console.error(error)
        res.status(500).json({error: "Error del servidor al borrar el perfil"})
    }
}