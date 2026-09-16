const express = require('express')
const { loginDoctor } = require('../controllers/doctorAuthController')

const router = express.Router()

router.post('/doctor-auth/login', loginDoctor)

module.exports = router