/**
 * @file Defines the main router
 * @module router
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

import express from 'express'
import { router as homeRouter } from './homeRouter.js'
import { router as userRouter } from './userRouter.js'
import { router as booksRouter } from './booksRouter.js'
import { router as cartRouter } from './cartRouter.js'

// Export and create an Express router-instance.
export const router = express.Router()

router.get('/favicon.ico', (req, res) => res.status(204).end())

// Register the sub-router for home page, handling users, books and cart
router.use('/', homeRouter)
router.use('/user', userRouter)
router.use('/books', booksRouter)
router.use('/cart', cartRouter)

// Catch 404 if wrong routes.
router.use((req, res, next) => {
  const error = new Error('Page not found.')
  error.status = 404
  next(error)
})
