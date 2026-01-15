import 'dotenv/config'
import sqlDatabase from './config/db.js'
import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import session from 'express-session'
import logger from 'morgan'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sessionConfig } from './config/sessionConfig.js'
import { router } from './routes/router.js'

const expressApp = express()

try {
  await sqlDatabase.query('SELECT 1')
  console.log('Database connected successfully!')
} catch (err) {
  console.error('Database connection failed:', err)
  process.exit(1)
}

const rootDirectory = dirname(fileURLToPath(import.meta.url))
const baseURL = process.env.BASE_URL || '/'

expressApp.use(logger('dev'))
expressApp.set('view engine', 'ejs')
expressApp.set('views', join(rootDirectory, 'views'))
expressApp.set('layout', join(rootDirectory, 'views', 'layouts', 'mainLayout'))
expressApp.set('layout extractScripts', true)
expressApp.set('layout extractStyles', true)
expressApp.use(expressLayouts)

expressApp.use(express.urlencoded({ extended: false }))
expressApp.use(express.static(join(rootDirectory, '..', 'public')))

expressApp.use(session(sessionConfig))

expressApp.use((req, res, next) => {
  if (req.session.flash) {
    res.locals.flash = req.session.flash
    delete req.session.flash
  }
  res.locals.baseURL = baseURL
  res.locals.session = req.session
  next()
})

expressApp.use('/', router)

expressApp.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).render('errors/error', { error: err })
})

expressApp.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`)
})