/**
 * @file Defines the BookController class that handles displaying books, search and pagination.
 * @module bookController
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

import sqlDatabase from '../config/db.js'

/**
 * All queries to databse used in the BookController
 */

// SQL query to get all books with limit and offset for pagination
const allBooksQuery = 'SELECT * FROM books LIMIT ? OFFSET ?'

// SQL querie to get all subjects from alla books
const subjectsQuery = 'SELECT DISTINCT subject FROM books ORDER BY subject'

// SQL querie to get all books from selected subject
const booksFromSubjectQuery = 'SELECT * FROM books WHERE subject = ? LIMIT ? OFFSET ?'

// SQL querie to get all books from searched author
const booksFromAuthorQuery = 'SELECT * FROM books WHERE LOWER(author) LIKE LOWER(?) LIMIT ? OFFSET ?'

// SQL querie to get all books from searched title
const booksFromTitleQuery = 'SELECT * FROM books WHERE LOWER(title) LIKE LOWER(?) LIMIT ? OFFSET ?'

// SQL querie to get all books from searched subject, author and title
const booksFromSubjectAuthorTitleQuery = 'SELECT * FROM books WHERE subject = ? AND LOWER(author) LIKE LOWER(?) AND LOWER(title) LIKE LOWER(?) LIMIT ? OFFSET ?'

// SQL querie to get all books from searched subject andauthor
const booksFromSubjectAuthorQuery = 'SELECT * FROM books WHERE subject = ? AND LOWER(author) LIKE LOWER(?) LIMIT ? OFFSET ?'

// SQL querie to get all books from searched subject and title
const booksFromSubjectTitleQuery = 'SELECT * FROM books WHERE subject = ? AND LOWER(title) LIKE LOWER(?) LIMIT ? OFFSET ?'

// SQL querie to count total number of books for pagination
const countAllBooksQuery = 'SELECT COUNT(*) AS totalRowsOfBooks FROM books'

// SQL querie to count total number of books for pagination when chosen subject
const countBooksFromSubjectQuery = 'SELECT COUNT(*) AS totalRowsOfBooks FROM books WHERE subject = ?'

// SQL querie to count total number of books for pagination when search for author
const countBooksFromAuthorQuery = 'SELECT COUNT(*) AS totalRowsOfBooks FROM books WHERE LOWER(author) LIKE LOWER(?)'

// SQL querie to count total number of books for pagination when search for title
const countBooksFromTitleQuery = 'SELECT COUNT(*) AS totalRowsOfBooks FROM books WHERE LOWER(title) LIKE LOWER(?)'

// SQL querie to count total number of books for pagination when search with subject, author and title
const countBooksFromSubjectAuthorTitleQuery = 'SELECT COUNT(*) AS totalRowsOfBooks FROM books WHERE subject = ? AND LOWER(author) LIKE LOWER(?) AND LOWER(title) LIKE LOWER(?)'

// SQL querie to count total number of books for pagination when search with subject and author
const countBooksFromSubjectAuthorQuery = 'SELECT COUNT(*) AS totalRowsOfBooks FROM books WHERE subject = ? AND LOWER(author) LIKE LOWER(?)'

// SQL querie to count total number of books for pagination when search with subject and title
const countBooksFromSubjectTitleQuery = 'SELECT COUNT(*) AS totalRowsOfBooks FROM books WHERE subject = ? AND LOWER(title) LIKE LOWER(?)'

/**
 * Encapsulates a controller for the books page.
 */
export class BookController {
  /**
   * Renders five books from database with search options and pagination.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async listAllBooks(req, res, next) {
    try {
      // Ask the database for all subjects
      const subjectsResult = await sqlDatabase.query(subjectsQuery)

      const subjectRows = subjectsResult[0]
      const allSubjects = []

      // Collect all subjects to make user able to select one
      for (let i = 0; i < subjectRows.length; i++) {
        const foundSubject = subjectRows[i]
        allSubjects.push(foundSubject.subject)
      }

      const selectedSubject = req.query.subject
      const author = req.query.author
      const title = req.query.title

      // Set the current page number to page 1 if no number in query
      const currentPageNumber = parseInt(req.query.page || '1')
      const limitOfBooks = 5

      // Calculate how many books to skip based on current page number
      const bookRowsToSkip = (currentPageNumber - 1) * limitOfBooks

      // Get all books from database based on search and pagination, with all books as deafult.
      let queryToUse = allBooksQuery
      let sqlValues = [limitOfBooks, bookRowsToSkip]

      let countQueryToUse = countAllBooksQuery
      let countSQLValues = []

      if (selectedSubject && author && title) {
        queryToUse = booksFromSubjectAuthorTitleQuery
        sqlValues = [selectedSubject, `${author}%`, `%${title}%`, limitOfBooks, bookRowsToSkip]

        countQueryToUse = countBooksFromSubjectAuthorTitleQuery
        countSQLValues = [selectedSubject, `${author}%`, `%${title}%`]
      } else if (selectedSubject && author) {
        queryToUse = booksFromSubjectAuthorQuery
        sqlValues = [selectedSubject, `${author}%`, limitOfBooks, bookRowsToSkip]

        countQueryToUse = countBooksFromSubjectAuthorQuery
        countSQLValues = [selectedSubject, `${author}%`]
      } else if (selectedSubject && title) {
        queryToUse = booksFromSubjectTitleQuery
        sqlValues = [selectedSubject, `%${title}%`, limitOfBooks, bookRowsToSkip]

        countQueryToUse = countBooksFromSubjectTitleQuery
        countSQLValues = [selectedSubject, `%${title}%`]
      } else if (author) {
        queryToUse = booksFromAuthorQuery
        sqlValues = [`${author}%`, limitOfBooks, bookRowsToSkip]

        countQueryToUse = countBooksFromAuthorQuery
        countSQLValues = [`${author}%`]
      } else if (title) {
        queryToUse = booksFromTitleQuery
        sqlValues = [`%${title}%`, limitOfBooks, bookRowsToSkip]

        countQueryToUse = countBooksFromTitleQuery
        countSQLValues = [`%${title}%`]
      } else if (selectedSubject) {
        queryToUse = booksFromSubjectQuery
        sqlValues = [selectedSubject, limitOfBooks, bookRowsToSkip]

        countQueryToUse = countBooksFromSubjectQuery
        countSQLValues = [selectedSubject]
      }

      const [foundBooks] = await sqlDatabase.query(queryToUse, sqlValues)
      const [countRows] = await sqlDatabase.query(countQueryToUse, countSQLValues)

      // Returns the value from the field totalRowsOfBooks in the database
      const totalBooks = countRows[0].totalRowsOfBooks

      // Calculate total number of pages for pagination
      const totalPages = Math.ceil(totalBooks / limitOfBooks)

      let isLoggedInUser = false

      if (req.session && req.session.onlineUser) {
        isLoggedInUser = true
      }

      res.render('books/books', {
        subjects: allSubjects,
        books: foundBooks,
        selectedSubject, 
        author, 
        title,
        currentPage: currentPageNumber, 
        booksPerPage: limitOfBooks, 
        totalPages,
        isLoggedInUser
      })
    } catch (error) {
      console.error('Book page error:', error)
      req.session.flash = {
        type: 'danger',
        text: 'Could not fetch books. Please try again.'
      }
      res.redirect('/books')
    }
  }
}
