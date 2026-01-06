/**
 * @file Defines the home router.
 * @module homeRouter
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

import express from 'express'
import { HomeController } from '../controllers/homeController.js'

// Export and create an Express router instance.
export const router = express.Router()

// Create new HomeController instance.
const homeController = new HomeController()

// Route for handling GET-requests to home page.
router.get('/', (req, res, next) => homeController.index(req, res, next))
