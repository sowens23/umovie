// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const auth = require('./Javascript/authController'); // Custom authentication controller

const app = express();
const port = process.env.PORT || 3000;

// ================= Middleware =================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session secret comes from the environment (see .env.example); the fallback is for local development only
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// ================= Static Resources =================
// Serve only front-end folders, so server code (server.js, authController.js, db.js) is never downloadable
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/Styling', express.static(path.join(__dirname, 'Styling')));
app.use('/Assets', express.static(path.join(__dirname, 'Assets')));
app.use('/Javascript', (req, res, next) =>
  /^\/script_\w+\.js$/.test(req.path) ? next() : res.sendStatus(404)
);
app.use('/Javascript', express.static(path.join(__dirname, 'Javascript')));

// ================= Authorization Middleware =================
// Require a logged-in session
function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ success: false, message: 'Not logged in' });
}

// Require a specific role (checked on the server, not just in the browser)
function requireRole(role) {
  return (req, res, next) => {
    const roles = (req.session && req.session.user && req.session.user.roles) || [];
    if (roles.includes(role)) return next();
    res.status(403).json({ success: false, message: `Requires ${role} role` });
  };
}

// Act as the logged-in user: ignore any email sent by the browser
function asSessionUser(req, res, next) {
  req.body = { ...req.body, email: req.session.user.email };
  next();
}

// Marketing Managers may look up any user's reactions; everyone else only their own
function asSessionUserUnlessManager(req, res, next) {
  const roles = req.session.user.roles || [];
  if (!roles.includes('Marketing Manager')) req.body = { ...req.body, email: req.session.user.email };
  next();
}

const user = [requireLogin, asSessionUser];

// ================= API Registration =================
app.post('/api/account/login', auth.login);
app.post('/api/account/register', auth.register);
app.get("/api/account/session", auth.getSession);

// For User Account Management
app.post('/api/account/favorite/add', ...user, auth.addFavorites);
app.post('/api/account/favorite/remove', ...user, auth.removeFavorites);
app.post('/api/account/favorite/get', ...user, auth.getFavorites);
app.post('/api/account/like-dislike', ...user, auth.likeDislikeMovie);
app.post('/api/account/like/get', ...user, auth.getLikedMovies);
app.post('/api/account/dislike/get', ...user, auth.getDislikedMovies);
app.post("/api/movies/search", auth.searchMovies);
app.post("/api/movies/getFilePath", requireLogin, auth.getFilePath);
app.post("/api/account/logout", auth.logout);
app.post("/api/account/watchHistory", ...user, auth.updateWatchHistory);
app.post("/api/account/watchHistory/get", ...user, auth.getWatchHistory);
app.post("/api/account/reactions", requireLogin, asSessionUserUnlessManager, auth.getUserReactions);

// For Content Editor
app.post('/api/editor/add-movie', requireRole('Content Editor'), auth.addMovie);
app.post("/api/editor/update-movie", requireRole('Content Editor'), auth.updateMovie);
app.post("/api/editor/delete-movie", requireRole('Content Editor'), auth.deleteMovie);
app.post("/api/movies/import", requireRole('Content Editor'), auth.importMovies);

// For Marketing Manager
app.post('/api/marketing/play-count', requireLogin, auth.updatePlayCount);
app.post("/api/movies/feedback/add", ...user, auth.addFeedback);
app.get("/api/movies/getAllMovies", auth.getAllMovies);
app.get("/api/users/getAllUsers", requireRole('Marketing Manager'), auth.getAllUsers);
app.post("/api/movies/update-note", requireRole('Marketing Manager'), auth.updateMovieNote);

// ================= Default Webpage to jump to =================
app.get('/', (req, res) => {
  res.redirect('/html/index_Login.html');
});

// ================= Start Server =================
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
