/**
 * @file Defines the user controller.
 * @module UserController
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */
import bcrypt from 'bcrypt'
import pool from '../config/db.js'

/**
 * Encapsulates a controller for user operations.
 */
export class UserController {
  /**
   * Renders the sign-up form.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  signUpForm(req, res) {
    res.render('user/signUp')
  }

  /**
   * Handles user registration.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async postSignUp(req, res) {
    try {
      const { fname, lname, address, city, zip, phone, email, password } = req.body

      // Validate that all fields are filled
      if (!fname || !lname || !address || !city || !zip || !phone || !email || !password) {
        req.session.flash = { type: 'danger', text: 'You must fill in all fields.' }
        res.redirect(`${process.env.BASE_URL}user/signUp`)
        return
      }

      // Check if the email already exists in the database
      const [existingUser] = await pool.query(
        'SELECT * FROM members WHERE email = ?',
        [email]
      )


      if (existingUser.length > 0) {
        req.session.flash = {
          type: 'danger',
          text: 'This email is already registered. Please use another email or log in.'
        }
        res.redirect(`${process.env.BASE_URL}user/signUp`)
        return
      }

      // Validate zip code (5 digits)
      const zipNum = parseInt(zip)
      if (isNaN(zipNum) || typeof zipNum !== 'number' || zip.length > 9) {
        req.session.flash = {
          type: 'danger',
          text: 'Zip code must be a number of maximum 9 digits!'
        }
        res.redirect(`${process.env.BASE_URL}user/signUp`)
        return
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Insert user into database
      await pool.query(
        'INSERT INTO members (fname, lname, address, city, zip, phone, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [fname, lname, address, city, zipNum, phone, email, hashedPassword]
      )

      req.session.flash = {
        type: 'success',
        text: 'Account successfully created! Please log in to start your book shopping.'
      }
      res.redirect(`${process.env.BASE_URL}user/logIn`)

    } catch (err) {
      console.error('Registration error:', err)
      req.session.flash = {
        type: 'danger',
        text: 'Registration failed. Please try again.'
      }
      res.redirect(`${process.env.BASE_URL}user/signUp`)
    }
  }

  /**
   * Renders the login form.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  logInForm(req, res) {
    res.render('user/logIn')
  }

}