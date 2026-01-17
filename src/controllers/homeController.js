/**
 * @file Defines the HomeController class.
 * @module homeController
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

/**
 * Encapsulates a controller for the home page.
 */
export class HomeController {
  /**
   * Redirects to the list of books and filter-form.
   * 
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  index (req, res, next) {
    try {
      res.redirect('/books')
    } catch (error) {
      next(error)
    }
  }
}