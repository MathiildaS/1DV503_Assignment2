/**
 * @file Defines the cart router.
 * @module cartRouter
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

import express from 'express'
import { CartController } from '../controllers/cartController.js'

// Export and create an Express router-instance.
export const router = express.Router()

const cartController = new CartController()

router.get('/', cartController.listCart)

router.get('/add', cartController.addToCart)