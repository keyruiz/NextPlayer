const pool = require('../bd')

exports.getPost = async (req, res) => {
    try {
        const { game_id} = req.query
        let queryText = 'SELECT * FROM post'
        let values = []
        if ( game_id && game_id !== 'Todos') {
            queryText += 'WHERE game_id = $1'
            values.push(game_id)
        }

        const response = await poolquery(queryText, values)
        res.json(response.rows)
    } catch(error) {
        console.log(error)
    }
} 

exports.postPost = async (req, res) => {
    try {
        const { user_id, game_id, title, description, role, rank } = req.body;
     
        const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [user_id]);

        if (userCheck.rowCount === 0) {
            return res.status(404).json({ error: "El usuario no existe." });
        }

        const userRole = userCheck.rows[0].role;

        if (userRole !== 'user') {
            return res.status(403).json({ 
                error: "Acceso denegado. Solo los usuarios con rol 'user' pueden crear posts." 
            });
        }

        const query = `
            INSERT INTO posts (user_id, game_id, title, description, role, rank, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, true)
            RETURNING *
        `;

        const values = [user_id, game_id, title, description, role, rank];
        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch(error) {
        if (error.code === '23503') {
            return res.status(400).json({ error: "El usuario o el juego especificado no existen." });
        }

        res.status(500).json({ error: "Hubo un error al procesar la publicación" })
    }
}

exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params; 
        const { user_id } = req.body; 

        if (!user_id) {
            return res.status(400).json({ error: "Es necesario el ID del usuario para verificar la propiedad." });
        }

        const query = `
            DELETE FROM posts 
            WHERE id = $1 AND user_id = $2 
            RETURNING *
        `;

        const result = await pool.query(query, [id, user_id]);

        if (result.rowCount === 0) {
            return res.status(403).json({ 
                error: "No se ha podido borrar el post. O no existe, o no tienes permiso porque no eres el autor." 
            });
        }

        res.json({ 
            message: "Post eliminado con éxito por su autor.",
            deletedPost: result.rows[0]
        });
    }
    catch {
        console.error("Error al eliminar el post:", error);
        
        if (error.code === '23503') {
            return res.status(400).json({ 
                error: "No se puede eliminar el post porque tiene datos relacionados vinculados." 
            });
        }

        res.status(500).json({ error: "Error interno del servidor al intentar borrar el post" });
    }
}

exports.putPost = async(req, res) => {
    try {
        const { id } = req.params; // El ID del post a editar
        const { user_id, title, description, role, rank } = req.body;

        // 1. Validación: Necesitamos el ID del usuario que intenta editar
        if (!user_id) {
            return res.status(400).json({ error: "ID de usuario requerido para verificar autoría." });
        }

        // 2. Query con COALESCE y verificación de autoría en el WHERE
        const query = `
            UPDATE posts 
            SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                role = COALESCE($3, role),
                rank = COALESCE($4, rank)
            WHERE id = $5 AND user_id = $6
            RETURNING *
        `;

        const values = [
            title || null, 
            description || null, 
            role || null, 
            rank || null, 
            id, 
            user_id
        ];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(403).json({ 
                error: "No tienes permiso para editar este post o el post no existe." 
            });
        }

        res.json({
            message: "Post actualizado correctamente",
            post: result.rows[0]
        });
    } catch(error) {

    }
}