import express from 'express'
import { getProfileByUserId, saveProfile, addSkill } from '../controllers/profileController.js'

const router = express.Router()

router.get('/:userId', getProfileByUserId)
router.post('/', saveProfile)
router.post('/skills', addSkill)

export default router
