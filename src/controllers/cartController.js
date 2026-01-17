/**
 * @file Defines the CartController class.
 * @module cartController
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

import sqlDatabase from '../config/db.js'

// All SQL queries used in CartController

// SQL query to get all books in a users cart with book details
const getBooksFromCartQuery = `SELECT books.isbn, books.title, books.author, books.price, cart.qty, (cart.qty * books.price) AS amount
  FROM cart
  JOIN books ON books.isbn = cart.isbn
  WHERE cart.userid = ?
  ORDER BY books.title`

// SQL query to add a new book or add one more if it already exists
const addBookToCartQuery = `INSERT INTO cart (userid, isbn, qty)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE qty = qty + ?`

// SQL query to create and insert a new order
const createOrderQuery = `INSERT INTO orders (userid, created, shipAddress, shipCity, shipZip)
  VALUES (?, ?, ?, ?, ?)`

// SQL query to insert order details
const createOrderDetailsQuery = `INSERT INTO odetails (ono, isbn, qty, amount)
  VALUES (?, ?, ?, ?)`

// SQL query to remove all books from a users cart
const removeAllBooksQuery = `DELETE FROM cart
  WHERE userid = ?`

/**
 * Encapsulates a controller for the cart page.
 */
export class CartController {
  /**
   * Handles GET requests to view a users cart.
   */
  async listCart(req, res, next) {
    try {
      if (!req.session?.onlineUser) {
        req.session.flash = { 
          type: 'danger', 
          text: 'Please log in to view your cart.' }
        return res.redirect('/user/logIn')
      }

      const userId = req.session.onlineUser.userid

      const [booksInCart] = await sqlDatabase.query(getBooksFromCartQuery, [userId])

      let totalPrice = 0
      for (const book of booksInCart) {
        totalPrice += Number(book.amount)
      }

      return res.render('cart/cart', { booksInCart, totalPrice })
    } catch (error) {
      console.error('Cart error:', error)
      req.session.flash = { 
        type: 'danger', 
        text: 'Failed to display items in cart. Please try again.' 
      }
      return res.redirect('/books')
    }
  }

  /**
   * Handles POST requests to add a book to the cart.
   */
  async addToCart(req, res, next) {
    try {
      if (!req.session?.onlineUser) {
        req.session.flash = { 
          type: 'danger', 
          text: 'Please log in to add books to cart.' }
        return res.redirect('/user/logIn')
      }

      const onlineUserID = req.session.onlineUser.userid
      const bookISBN = req.body.isbn
      const amountOfBooks = parseInt(req.body.qty || '1')

      if (!bookISBN) {
        return res.redirect('/books')
      }

      const sqlValues = [onlineUserID, bookISBN, amountOfBooks, amountOfBooks]
      await sqlDatabase.query(addBookToCartQuery, sqlValues)

      req.session.flash = { 
        type: 'success', 
        text: 'Book added to cart!' 
      }
      return res.redirect('/books')
    } catch (error) {
      console.error('Add book to cart error:', error)
      req.session.flash = {
        type: 'danger',
        text: 'Could not add book to cart. Please try again.'
      }
      return res.redirect('/books')
    }
  }

  /**
   * Handles POST requests to create an order with invoice details and clears the cart when checkout.
   */
  async checkout(req, res, next) {
    try {
      if (!req.session?.onlineUser) {
        req.session.flash = { 
          type: 'danger', 
          text: 'You must log in to checkout.' }
        return res.redirect('/user/logIn')
      }

      const onlineUser = req.session.onlineUser
      const onlineUserID = onlineUser.userid

      const [booksInCart] = await sqlDatabase.query(getBooksFromCartQuery, [onlineUserID])

      if (!booksInCart || booksInCart.length === 0) {
        req.session.flash = { 
          type: 'danger', 
          text: 'Your cart is empty.' }
        return res.redirect('/cart')
      }

      let totalPrice = 0
      for (const book of booksInCart) {
        totalPrice += Number(book.amount)
      }

      const orderCreated = new Date()
      const deliveryDate = new Date(orderCreated)
      deliveryDate.setDate(deliveryDate.getDate() + 7)

      const shipAddress = onlineUser.address
      const shipCity = onlineUser.city
      const shipZip = onlineUser.zip

      // Create and add order details
      const [orderInvoiceDetails] = await sqlDatabase.query(createOrderQuery, [
        onlineUserID,
        orderCreated,
        shipAddress,
        shipCity,
        shipZip
      ])

      const ono = orderInvoiceDetails.insertId

      for (const book of booksInCart) {
        await sqlDatabase.query(createOrderDetailsQuery, [ono, book.isbn, book.qty, book.amount])
      }

      await sqlDatabase.query(removeAllBooksQuery, [onlineUserID])

      return res.render('cart/checkout', {
        order: { ono, orderCreated, deliveryDate, shipAddress, shipCity, shipZip },
        booksInCart,
        totalPrice
      })
    } catch (error) {
      console.error('Checkout page error:', error)
      req.session.flash = {
        type: 'danger',
        text: 'Could not checkout.'
      }
    return res.redirect('/books')
    }
  }
}
