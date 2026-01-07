/**
 * @file Defines the user router.
 * @module userRouter
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

import express from 'express'
import { UserController } from '../controllers/userController.js'

// Export and create an Express router-instance.
export const router = express.Router()

const userController = new UserController()

// Render the sign-up form.
router.get('/signUp', userController.signUpForm)

// Handle user registration.
router.post('/signUp', userController.postSignUp)

// Render the login form.
router.get('/logIn', userController.logInForm)

// Handle user login.
router.post('/logIn', userController.postLogIn)

// Handle user logout. Only for logged in users.
router.post('/logOut', userController.postLogOut)