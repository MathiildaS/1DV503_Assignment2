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
      if (err.code === 'ER_DUP_ENTRY') {
        req.session.flash = {
          type: 'danger',
          text: 'This email is already registered!'
        }
      } else {
        req.session.flash = {
          type: 'danger',
          text: 'Registration failed. Please try again.'
        }
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

  /**
   * Handles user login.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async postLogIn(req, res) {
    try {
      const { email, password } = req.body

      // Validate input
      if (!email || !password) {
        req.session.flash = {
          type: 'danger',
          text: 'Email and password are required!'
        }
        return res.redirect('./logIn')
      }

      // Fetch user from database
      const [users] = await pool.query(
        'SELECT * FROM members WHERE email = ?',
        [email]
      )
      if (users.length === 0) {
        req.session.flash = {
          type: 'danger',
          text: 'Invalid email or password!'
        }
        return res.redirect('./logIn')
      }
      const user = users[0]

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        req.session.flash = {
          type: 'danger',
          text: 'Invalid email or password!'
        }
        return res.redirect('./logIn')
      }
      // Set user session
      req.session.onlineUser = {
        userid: user.userid,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        address: user.address,
        city: user.city,
        zip: user.zip,
        phone: user.phone
      }
      req.session.flash = {
        type: 'success',
        text: `Welcome back, ${req.session.onlineUser.fname}!`
      }      
      console.log('Redirecting to:')
      res.redirect('../books/books')
    } catch (err) {
      console.error('Login error:', err)
      req.session.flash = {
        type: 'error',
        text: 'Login failed. Please try again.'
      }
      res.redirect('./logIn')
    }
  }

  /**
   * Handles user logout.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  postLogOut(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err)
      }
      res.render('user/logOut')
    })
  }
}