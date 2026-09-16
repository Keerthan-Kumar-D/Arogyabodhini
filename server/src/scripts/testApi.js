const http = require('http')

const tests = [
  { label: 'Test 1: Strong symptoms', body: '{"symptoms":"I have itching, skin rash and nodal skin eruptions"}' },
  { label: 'Test 2: 2-3 symptoms', body: '{"symptoms":"I have a headache and feel dizzy"}' },
  { label: 'Test 3: Natural language', body: '{"symptoms":"I feel like vomiting and have a bad headache"}' },
  { label: 'Test 4: Partial match', body: '{"symptoms":"feeling dizzy and have joint pain"}' },
  { label: 'Test 5: Empty', body: '{"symptoms":"   "}' },
]

const request = (body) => new Promise((resolve, reject) => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/analyze-symptoms',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }
  const req = http.request(options, (res) => {
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => resolve({ status: res.statusCode, body: data }))
  })
  req.on('error', reject)
  req.write(body)
  req.end()
})

;(async () => {
  for (const t of tests) {
    console.log('\n=== ' + t.label + ' ===')
    try {
      const r = await request(t.body)
      const data = JSON.parse(r.body)
      if (data.success) {
        console.log('matchedSymptoms:', data.data.matchedSymptoms)
        console.log('possibleDiseases:', data.data.possibleDiseases)
        console.log('recommendedSpecialist:', data.data.recommendedSpecialist)
        console.log('severity:', data.data.severity, '| confidence:', data.data.confidence)
        console.log('emergencyFlag:', data.data.emergencyFlag)
      } else {
        console.log('Error:', data.message || data.error)
      }
    } catch (e) {
      console.log('Request failed:', e.message)
    }
  }
})()
