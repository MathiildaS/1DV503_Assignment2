/**
 * @file Defines the main router
 * @module router
 */

import express from 'express'
import { router as homeRouter } from './homeRouter.js'

// Export and create an Express router-instance.
export const router = express.Router()

router.get('/favicon.ico', (req, res) => res.status(204).end())

// Register the sub-router for home page.
router.use('/', homeRouter)

// Catch 404 if wrong routes.
router.use((req, res, next) => {
  const error = new Error('Page not found.')
  error.status = 404
  next(error)
})
