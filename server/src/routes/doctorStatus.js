const express = require('express')

const router = express.Router()
const doctorStatuses = new Map()

router.get('/doctor-status/:doctorId', (req, res) => {
  res.json({
    success: true,
    doctorId: req.params.doctorId,
    isActive: doctorStatuses.get(req.params.doctorId) === true,
  })
})

router.patch('/doctor-status/:doctorId', (req, res) => {
  if (typeof req.body.isActive !== 'boolean') {
    return res.status(400).json({ success: false, message: 'isActive must be a boolean.' })
  }

  doctorStatuses.set(req.params.doctorId, req.body.isActive)
  return res.json({
    success: true,
    doctorId: req.params.doctorId,
    isActive: req.body.isActive,
  })
})

module.exports = router