const express = require('express')
const team_membersController = require('../controllers/team_memberController')
const router = express.Router()



router.get('/:team_id', teamMembersController.getTeamMembers);
router.post('/invite', teamMembersController.inviteMember);
router.put('/update', teamMembersController.updateMember);
router.delete('/remove', teamMembersController.deleteMember);
module.exports = router;