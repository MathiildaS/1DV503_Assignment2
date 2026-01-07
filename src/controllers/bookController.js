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

      res.render('books/books', {
        subjects: subjects
      })
    } catch (error) {
      next(error)
    }
  }
}
