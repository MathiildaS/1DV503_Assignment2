/**
 * @file Defines the cart router to view and manage the cart of a user.
 * @module cartRouter
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

import express from 'express'
import { CartController } from '../controllers/cartController.js'

// Export and create an Express router-instance.
export const router = express.Router()

// Create new CartController instance.
const cartController = new CartController()

// Display a users cart.
router.get('/', cartController.listCart)

// Add a bokk to the cart,.
router.post('/add', cartController.addToCart)

// Checkout and remove cart. Display order.
router.post('/checkout', cartController.checkout)