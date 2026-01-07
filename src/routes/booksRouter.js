/**
 * @file Defines the books router.
 * @module booksRouter
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

import express from 'express'
import { BookController } from '../controllers/bookController.js'

// Export and create an Express router-instance.
export const router = express.Router()

const booksController = new BookController()

// Render the books list.
router.get('/', booksController.listBooks)
