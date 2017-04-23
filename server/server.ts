import { config } from './config';
import express = require('express');
import path = require('path');
import http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
// const session = require('express-session');
// const passport = require('passport');

import mongoose = require('mongoose');
import bluebird = require('bluebird');

// set Promise provider to bluebird
mongoose.Promise = bluebird;

// connect to our database
mongoose.connect(config.db.connection);
const db = mongoose.connection;
db.on('error', () => {
    throw new Error('unable to connect to database at ' + config.db);
});


// Get our API routes
const api = require('./routes/api');
const auth = require('./routes/auth');

// Configura o passport
// require('./config/passport')(passport);
const app = express();
app.use(cors());
// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.resolve(__dirname, '..', 'dist')));


// Setup Authorization
import jwtExpress = require('express-jwt');
api.use(jwtExpress({ secret: config.jwt_secret }));

// Set our api routes
app.use('/api', api);
app.use('/auth', auth);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '4200';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
