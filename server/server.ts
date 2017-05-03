import path = require('path');
import http = require('http');

import express = require('express');
import jwt = require('express-jwt');
import mongoose = require('mongoose');
import bluebird = require('bluebird');

import { config } from './config';


const bodyParser = require('body-parser');
const cors = require('cors');

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

const app = express();
app.use(cors());
// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.resolve(__dirname, '..', 'dist')));


// Set our api routes
app.use('/api', jwt({ secret: config.jwt_secret }) , api);
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
