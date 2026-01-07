/**
 * @file Defines the BookController class.
 * @module bookController
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

import pool from '../config/db.js'

/**
 * Encapsulates a controller for the books page.
 */
export class BookController {
  /**
   * Renders the books list view and sends the rendered HTML as an HTTP response.
   * Handles GET requests to '/books'.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async listBooks(req, res, next) {
    try {
      // Ask the database for all unique subjects
      const result = await pool.query(
        'SELECT DISTINCT subject FROM books ORDER BY subject'
      )

      // The database returns an array inside another array
      const rows = result[0]

      // Create an empty array
      const subjects = []

      // Go through each row and take out the subject value
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        subjects.push(row.subject)
      }

      const selectedSubject = (req.query.subject)

      // Pagination
      const page = parseInt(req.query.page || '1', 10)
      const limit = 5
      const offset = (page - 1) * limit


      let books = []

      if (selectedSubject) {
        // If a subject is selected, fetch books for that subject
        books = await pool.query(
          'SELECT * FROM books WHERE subject = ? LIMIT ? OFFSET ?',
          [selectedSubject, limit, offset]
        )
      } else {
        // If no subject is selected, fetch all books
        books = await pool.query(
          'SELECT * FROM books LIMIT ? OFFSET ?',
          [limit, offset]
        )
      }
      const foundBooks = books[0]

      if (foundBooks.length === 0) {
        req.session.flash = {
          type: 'danger',
          text: 'No books found for the selected subject.'
        }
      }
      res.render('books/books', {
        subjects: subjects,
        books: foundBooks,
        query: { subject: selectedSubject },
        pagination: { page, limit }
      })
    } catch (error) {
      next(error)
    }
  }
}
