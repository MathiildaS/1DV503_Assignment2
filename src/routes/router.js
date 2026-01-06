/**
 * @file Defines the main router
 * @module router
 */

import express from 'express'

// Export and create an Express router-instance.
export const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).send('Server is running ✅')
})

// Catch 404 if wrong routes.
router.use((req, res, next) => {
  const error = new Error('Page not found.')
  error.status = 404
  next(error)
})
