const mongoose = require('mongoose')

const doctorSpecializationSchema = new mongoose.Schema(
  {
    disease: String,
    specialty: String,
  },
  {
    collection: 'doctor_specialization',
    strict: false,
  }
)

module.exports = mongoose.model('DoctorSpecialization', doctorSpecializationSchema)
