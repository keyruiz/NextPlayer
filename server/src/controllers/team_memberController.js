const pool = require('../bd')

exports.inviteMember = async (req, res) => {
    const { team_id, invited_user_id, my_user_id } = req.body;

    try {
        const team = await pool.query('SELECT owner_id FROM teams WHERE id = $1', [team_id]);
        if (team.rowCount === 0) return res.status(404).json({ error: "Equipo no encontrado" });
        if (team.rows[0].owner_id !== my_user_id) {
            return res.status(403).json({ error: "No eres el CEO de este equipo" });
        }

        const membersCount = await pool.query(
            'SELECT COUNT(*) FROM team_members WHERE team_id = $1 AND status = $2', 
            [team_id, 'active']
        );
        if (parseInt(membersCount.rows[0].count) >= 6) {
            return res.status(400).json({ error: "El equipo ya tiene 6 miembros (5 + CEO)" });
        }

        await pool.query(
            'INSERT INTO team_members (team_id, user_id, role, status) VALUES ($1, $2, $3, $4)',
            [team_id, invited_user_id, 'player', 'pending']
        );

        res.status(201).json({ message: "Invitación enviada correctamente" });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ error: "El usuario ya tiene una invitación o ya es miembro" });
        res.status(500).json({ error: "Error al invitar" });
    }
};

exports.updateMember = async (req, res) => {
    const { team_id, target_user_id, my_user_id, action, new_role } = req.body;

    try {
        if (action === 'accept') {
            if (my_user_id !== target_user_id) return res.status(403).json({ error: "No puedes aceptar invitaciones ajenas" });
            
            const result = await pool.query(
                'UPDATE team_members SET status = $1, joined_at = NOW() WHERE team_id = $2 AND user_id = $3 AND status = $4 RETURNING *',
                ['active', team_id, target_user_id, 'pending']
            );
            if (result.rowCount === 0) return res.status(404).json({ error: "Invitación no encontrada" });
            return res.status(200).json(result.rows[0]);
        }

        if (action === 'change_role') {
            const team = await pool.query('SELECT owner_id FROM teams WHERE id = $1', [team_id]);
            if (team.rows[0].owner_id !== my_user_id) return res.status(403).json({ error: "Solo el CEO cambia roles" });

            const result = await pool.query(
                'UPDATE team_members SET role = $1 WHERE team_id = $2 AND user_id = $3 RETURNING *',
                [new_role, team_id, target_user_id]
            );
            return res.status(200).json(result.rows[0]);
        }

    } catch (error) {
        res.status(500).json({ error: "Error en el servidor al actualizar miembro" });
    }
};

exports.deleteMember = async (req, res) => {
    const { team_id, target_user_id, my_user_id } = req.body;

    try {
        const team = await pool.query('SELECT owner_id FROM teams WHERE id = $1', [team_id]);
        const isCEO = team.rows[0].owner_id === my_user_id;
        const isSelf = my_user_id === target_user_id;


        if (!isCEO && !isSelf) {
            return res.status(403).json({ error: "No tienes permiso para quitar a este miembro" });
        }

        if (isCEO && isSelf) {
            return res.status(400).json({ error: "El CEO no puede abandonar el equipo. Debes transferir el mando o borrar el equipo." });
        }

        const result = await pool.query(
            'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2 RETURNING *',
            [team_id, target_user_id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: "El miembro no existe en este equipo" });

        let msg = isSelf ? "Has salido del equipo o rechazado la invitación" : "Miembro expulsado por el CEO";
        res.status(200).json({ message: msg });

    } catch (error) {
        res.status(500).json({ error: "Error del servidor al eliminar miembro" });
    }
};


exports.getTeamMembers = async (req, res) => {
    const { team_id } = req.params;
    try {
        const query = `
            SELECT tm.user_id, p.username, tm.role, tm.status, tm.joined_at 
            FROM team_members tm
            JOIN profiles p ON tm.user_id = p.user_id
            WHERE tm.team_id = $1 AND tm.status = 'active'
        `;
        const result = await pool.query(query, [team_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error del servidor al obtener miembros" });
    }
};