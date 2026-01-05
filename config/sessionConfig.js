export const sessionConfig = {
 name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'strict',
    httpOnly: true
  }
}

if (process.env.NODE_ENV === 'production') {
  sessionConfig.cookie.secure = true
}
