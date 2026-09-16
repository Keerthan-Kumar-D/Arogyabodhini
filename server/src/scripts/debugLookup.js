require('dotenv').config()
const mongoose = require('mongoose')
const Doctor = require('../models/Doctor')

mongoose.connect(process.env.MONGODB_URI, { dbName: 'arogyabodhini' }).then(async () => {
  const all = await Doctor.find({}).lean()
  console.log('Total doctors in DB:', all.length)
  console.log('\nBy specialty:')
  const bySpec = {}
  all.forEach(d => {
    const s = d.specialty || 'Unknown'
    if (!bySpec[s]) bySpec[s] = []
    bySpec[s].push(d.name)
  })
  Object.entries(bySpec).sort().forEach(([spec, names]) => {
    console.log(`  ${spec} (${names.length}): ${names.join(', ')}`)
  })
  mongoose.disconnect()
}).catch(e => console.error(e.message))
