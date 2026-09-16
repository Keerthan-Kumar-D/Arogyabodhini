require('dotenv').config()

const connectDB    = require('./config/db')
const app          = require('./app')
const autoSeed     = require('./scripts/autoSeed')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()
    await autoSeed()          // seed specializations + doctors if collections are empty

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

    const gracefulShutdown = (signal) => {
      console.log(`\n[${signal}] Shutting down gracefully…`)

      server.close(() => {
        console.log('HTTP server closed.')
        process.exit(0)
      })
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()