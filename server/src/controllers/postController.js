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
        res.status(200).json(response.rows)
    } catch(error) {
        console.log(error)
        res.status(500).json({error: 'Erro del servidor al obtener posts'})
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

        const postCheck = await pool.query(
            'SELECT id FROM posts WHERE user_id = $1',
            [user_id]
        );

        if (postCheck.rowCount > 0) {
            return res.status(400).json({ 
                error: "Ya tienes una publicación activa. Elimina la anterior antes de crear una nueva." 
            });
        }

        const query = `
            INSERT INTO posts (user_id, game_id, title, description, role, rank)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        const values = [user_id, game_id, title, description, role, rank];
        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch(error) {
        if (error.code === '23503') {
            return res.status(400).json({ error: "El usuario o el juego especificado no existen." });
        }
        res.status(500).json({ error: "Error en el servidor al publicar post" })
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
        `;

        const result = await pool.query(query, [id, user_id]);

        if (result.rowCount === 0) {
            return res.status(403).json({ 
                error: "No se ha podido borrar el post. O no existe, o no tienes permiso porque no eres el autor." 
            });
        }

        res.status(200).json({ 
            message: "Post eliminado con éxito."
        });
    }
    catch {
        console.error("Error al eliminar el post:", error);
        res.status(500).json({ error: "Error interno del servidor al intentar borrar el post" });
    }
}

exports.putPost = async(req, res) => {
    try {
        const { id } = req.params; 

        const { user_id, title, description, role, rank } = req.body;


        if (!user_id) {
            return res.status(400).json({ error: "ID de usuario requerido para verificar autoría." });
        }

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

        const values = [title, description, role, rank, id, user_id];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(403).json({ 
                error: "No tienes permiso para editar este post o el post no existe." 
            });
        }

        res.status(200).json(result,rows[0]);
    } catch(error) {
        console.error(error)
        res.status(500).json({error: 'Error del servidor al querer borrar el post'})
    }
}