/**
 * @file Configuration of the express-session that controls storing of a user session.
 * @module sessionConfig
 * @author Mathilda Segerlund <ms228qs@student.lnu.se>
 */

export const sessionConfig = {
 name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  // Session lives for 24h
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'strict',
    httpOnly: true
  }
}

