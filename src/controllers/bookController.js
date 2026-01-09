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
      const author = (req.query.author)
      const title = (req.query.title)

      // Pagination
      const page = parseInt(req.query.page || '1', 10)
      const limit = 5
      const offset = (page - 1) * limit

      let books = []

      if (selectedSubject && author && title) {
        // If a subject is selected, fetch books for that subject
        books = await pool.query(
          'SELECT * FROM books WHERE subject = ? AND LOWER(author) LIKE LOWER(?) AND LOWER(title) LIKE LOWER(?) LIMIT ? OFFSET ?',
          [selectedSubject, `${author}%`, `%${title}%`, limit, offset]
        )
      } else if (selectedSubject && author) {
        books = await pool.query(
          'SELECT * FROM books WHERE subject = ? AND LOWER(author) LIKE LOWER(?) LIMIT ? OFFSET ?',
          [selectedSubject, `${author}%`, limit, offset]
        )

      } else if (selectedSubject && title) {
        books = await pool.query(
          'SELECT * FROM books WHERE subject = ? AND LOWER(title) LIKE LOWER(?) LIMIT ? OFFSET ?',
          [selectedSubject, `%${title}%`, limit, offset]
        )

      } else if (author) {
        books = await pool.query(
          'SELECT * FROM books WHERE LOWER(author) LIKE LOWER(?) LIMIT ? OFFSET ?',
          [`${author}%`, limit, offset]
        )

      } else if (title) {
        books = await pool.query(
          'SELECT * FROM books WHERE LOWER(title) LIKE LOWER(?) LIMIT ? OFFSET ?',
          [`%${title}%`, limit, offset]
        )

      } else if (selectedSubject) {
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
      // Get total count of books for pagination
      let countResult
      if (selectedSubject && author && title) {
        countResult = await pool.query(
          'SELECT COUNT(*) AS total FROM books WHERE subject = ? AND LOWER(author) LIKE LOWER(?) AND LOWER(title) LIKE LOWER(?)',
          [selectedSubject, `${author}%`, `%${title}%`]
        )

      } else if (selectedSubject && author) {
        countResult = await pool.query(
          'SELECT COUNT(*) AS total FROM books WHERE subject = ? AND LOWER(author) LIKE LOWER(?)',
          [selectedSubject, `${author}%`]
        )

      } else if (selectedSubject && title) {
        countResult = await pool.query(
          'SELECT COUNT(*) AS total FROM books WHERE subject = ? AND LOWER(title) LIKE LOWER(?)',
          [selectedSubject, `%${title}%`]
        )

      } else if (author) {
        countResult = await pool.query(
          'SELECT COUNT(*) AS total FROM books WHERE LOWER(author) LIKE LOWER(?)',
          [`${author}%`]
        )

      } else if (title) {
        countResult = await pool.query(
          'SELECT COUNT(*) AS total FROM books WHERE LOWER(title) LIKE LOWER(?)',
          [`%${title}%`]
        )

      } else if (selectedSubject) {
        countResult = await pool.query(
          'SELECT COUNT(*) AS total FROM books WHERE subject = ?',
          [selectedSubject]
        )

      } else {
        countResult = await pool.query(
          'SELECT COUNT(*) AS total FROM books'
        )
      }

      const totalBooks = countResult[0][0].total
      const totalPages = Math.ceil(totalBooks / limit)

      res.render('books/books', {
        subjects: subjects,
        books: foundBooks,
        query: { subject: selectedSubject, author, title },
        pagination: { page, limit, totalPages }
      })
    } catch (error) {
      next(error)
    }
  }
}
