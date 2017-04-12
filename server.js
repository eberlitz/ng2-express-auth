const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

// Get our API routes
const api = require('./server/routes/api');

// Configura o passport
require('./server/config/passport')(passport);

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));


// required for passport
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();
  // if they aren't redirect them to the home page
  res.redirect('/');
}

// Set our api routes
app.use('/api', api);

// -----------------------------------------------------

// facebook -------------------------------

// send to facebook to do the authentication
app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

// facebook -------------------------------

// send to facebook to do the authentication
router.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

// handle the callback after facebook has authorized the user
router.get('/connect/facebook/callback',
  passport.authorize('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

// google ---------------------------------

// send to google to do the authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// the callback after google has authenticated the user
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

// google ---------------------------------

// send to google to do the authentication
app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

// the callback after google has authorized the user
app.get('/connect/google/callback',
  passport.authorize('google', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));


// facebook -------------------------------
app.get('/unlink/facebook', function (req, res) {
  var user = req.user;
  user.facebook.token = undefined;
  user.save(function (err) {
    res.redirect('/profile');
  });
});

// google ---------------------------------
app.get('/unlink/google', function (req, res) {
  var user = req.user;
  user.google.token = undefined;
  user.save(function (err) {
    res.redirect('/profile');
  });
});
// ------------------------------------------------------

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
