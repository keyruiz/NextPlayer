const express = require('express')
const profilesController = require('../controllers/perfilesController')
const router = express.Router()

router.get('/', profilesController.getProfiles)
router.get('/:id', profilesController.getProfile)
router.post('/', profilesController.postProfile)
router.put('/:id', profilesController.putProfiles)
router.delete('/:id', profilesController.deleteProfile)

module.exports = router
