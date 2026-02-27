const express = require('express')
const equipoController = require('../controllers/equiposController');
const router = express.Router()
router.get('/', equipoController.getTeams)
router.get('/:id', equipoController.getTeamsId)
router.post(`/`, equipoController.postTeams)
router.put('/:id', equipoController.putTeam)
router.delete('/:id',equipoController.deleteTeam)

module.exports = router
