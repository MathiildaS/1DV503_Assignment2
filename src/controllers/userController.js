/**
 * @file Defines the user controller that handles user registration, login and logout.
 * @module UserController
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */
import bcrypt from 'bcrypt'
import sqlDatabase from '../config/db.js'

// SQL querie to check existing email
const emailQuery = 'SELECT * FROM members WHERE email = ?'

// SQL querie to insert a new user to the database
const userQuery = 'INSERT INTO members (fname, lname, address, city, zip, phone, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'

/**
 * Encapsulates a controller for handling a user.
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

      // Check if the email from email-field already exists in the database
      const [existingEmail] = await sqlDatabase.query(
        emailQuery,
        [email]
      )

      if (existingEmail.length > 0) {
        req.session.flash = {
          type: 'danger',
          text: 'This email has already been registered. Please use another email or log in.'
        }
        res.redirect(`${process.env.BASE_URL}user/signUp`)
        return
      }

      // Validate zip code (5 digits)
      const zipNum = parseInt(zip)
      if (isNaN(zipNum) || typeof zipNum !== 'number' || zipNum.length > 9 || zipNum < 0) {
        req.session.flash = {
          type: 'danger',
          text: 'Zip code must be a valid number of maximum 9 digits!'
        }
        res.redirect(`${process.env.BASE_URL}user/signUp`)
        return
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Insert user into database
      await sqlDatabase.query(
        userQuery,
        [fname, lname, address, city, zipNum, phone, email, hashedPassword]
      )

      req.session.flash = {
        type: 'success',
        text: 'Account successfully created! Please log in to start your book shopping.'
      }
      res.redirect(`${process.env.BASE_URL}user/logIn`)

    } catch (error) {
      console.error('Registration error:', error)

      // If attempt to break unique email constraint
      if (error.code === 'ER_DUP_ENTRY') {
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
          text: 'You must provide an email and/or password!'
        }
        return res.redirect('./logIn')
      }

      // Fetch user from database based on email from input
      const [users] = await sqlDatabase.query(
        emailQuery,
        [email]
      )

      // Check if user with that email exists
      if (users.length === 0) {
        req.session.flash = {
          type: 'danger',
          text: 'Invalid email or password!'
        }
        return res.redirect('./logIn')
      }

      // get the first user from array of users thanks to unque email constraint
      const user = users[0]

      // Compare passwords
      const samePassword = await bcrypt.compare(password, user.password)

      if (!samePassword) {
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
      res.redirect('/books')
    } catch (error) {
      console.error('Login error:', error)
      req.session.flash = {
        type: 'danger',
        text: 'Login failed. Please try again.'
      }
      res.redirect('./logIn')
    }
  }

  /**
   * When user logs out, destroy session and render logout page
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  postLogOut(req, res) {
    req.session.destroy((error) => {
      if (error) {
        console.error('Logout error:', error)
      }
      res.render('user/logOut')
    })
  }
}