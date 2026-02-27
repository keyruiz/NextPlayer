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