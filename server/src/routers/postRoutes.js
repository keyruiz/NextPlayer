const express = require('express')
const postController = require('../controllers/postController');
const router = express.Router()

router.get('/', postControllerr.getPost)
router.post(`/`, postController.postPost)
router.put('/:id', postController.putPost)
router.delete('/:id',postController.deletePost)

module.exports = router
