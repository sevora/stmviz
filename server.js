/*
 * If you're asking what the server is for
 * while it appears to have a very minimal use.
 * Well this means that the application is basically just
 * a static site, and doesn't really need a server. Well
 * but at least there is one.
 */

// Automatically loads .env if there is one.
require('dotenv').config();

const express = require('express');
const secure = require('express-force-https'); // This middleware forces https if not on localhost.
const app = express();

app.use(secure);
app.use(express.static('web'));

// Listen to given port or port 3000 if there aren't any.
app.listen(process.env.PORT || 3000, function() { console.log('Server is running on specified port!') });
