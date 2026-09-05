require('dotenv').config()
const app  = require('./app')

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log('')
  console.log('  ╔══════════════════════════════════════════╗')
  console.log('  ║        MediAI Backend  —  Phase 2        ║')
  console.log('  ╠══════════════════════════════════════════╣')
  console.log(`  ║  Server  : http://localhost:${PORT}          ║`)
  console.log(`  ║  Health  : http://localhost:${PORT}/health   ║`)
  console.log(`  ║  API     : http://localhost:${PORT}/api      ║`)
  console.log('  ╚══════════════════════════════════════════╝')
  console.log('')
})

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] Shutting down gracefully…`)
  server.close(() => {
    console.log('HTTP server closed.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT',  () => gracefulShutdown('SIGINT'))
