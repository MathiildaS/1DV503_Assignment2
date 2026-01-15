/**
 * @file Defines the CartController class.
 * @module cartController
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

import pool from '../config/db.js'

/**
 * Encapsulates a controller for the cart page.
 */
export class CartController {
  /**
   * Renders the cart view with the users cart items.
   * Handles GET requests to '/cart'.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async listCart(req, res, next) {
    try {
      if (!req.session?.onlineUser) {
        req.session.flash = { type: 'danger', text: 'Please log in to view your cart.' }
        return res.redirect('/user/logIn')
      }

      const userId = req.session.onlineUser.userid

      const [cartItems] = await pool.query(
        `
        SELECT 
          b.isbn, b.title, b.author, b.price,
          c.qty,
          (c.qty * b.price) AS amount
        FROM cart c
        JOIN books b ON b.isbn = c.isbn
        WHERE c.userid = ?
        ORDER BY b.title
        `,
        [userId]
      )

      let totalPrice = 0

      for (const item of cartItems) {
        totalPrice += Number(item.amount)
      }

      res.render('cart/cart', { cartItems, totalPrice })
    } catch (err) {
      console.error('Cart error:', err)
      req.session.flash = {
        type: 'danger',
        text: 'Failed to retrieve cart items. Please try again.'
      }
      res.redirect('/books')
    }
  }

  /**
   * Adds a book to the user's cart.
   * Handles POST requests to '/cart/add'.
   */
  async addToCart(req, res, next) {
    try {
      if (!req.session?.onlineUser) {
        req.session.flash = { type: 'danger', text: 'Please log in to add books to cart.' }
        return res.redirect('/user/logIn')
      }

      const userId = req.session.onlineUser.userid
      const { isbn } = req.body

      if (!isbn) return res.redirect('/books')

      await pool.query(
        `
        INSERT INTO cart (userid, isbn, qty)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE qty = qty + 1
        `,
        [userId, isbn]
      )

      req.session.flash = { type: 'success', text: 'Added to cart!' }
      res.redirect('/books')
    } catch (err) {
      next(err)
    }
  }

  /**
   * Checkout: creates an order and order details, then clears the cart.
   * Handles POST requests to '/cart/checkout'.
   */
  async checkout(req, res, next) {
    try {
      // Implementeras sen – men måste finnas för att router inte ska krascha
      res.send('Checkout not implemented yet')
    } catch (err) {
      next(err)
    }
  }

}
