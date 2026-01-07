/**
 * @file Defines the BookController class.
 * @module bookController
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

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
  listBooks (req, res, next) {
    try {
      res.render('books/books')
    } catch (error) {
      next(error)
    }
  }
}