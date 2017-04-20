#  Creating a MEAN application with Teradata Covalent (Angular 2+)

Covalent angular 2 boilerplate with express server and social authentication



https://teradata.github.io/covalent/#/docs

```bash
git clone https://github.com/Teradata/covalent-quickstart.git ng2-express-auth
cd ng2-express-auth
rm -rf .git
git init
git add .
git commit -m "Initial commit"
git remote add origin
git push -u origin master
npm i -g @angular/cli@latest yarn
```

Install packages with NPM:

```bash
npm i
```

Or using YARN:

```bash
  npm i -g yarn
  yarn
```

If you get this error:

> error An unexpected error occurred: "https://registry.yarnpkg.com/@angular%2fplatform-browser: self signed certificate in certificate chain".

You probably is behind an company firewall. You can disable strict-ssl using the following command:

```bash
yarn config set "strict-ssl" false
```

Time to serve the app:

```bash
ng serve
```




 npm install --save express body-parser

 Then create a file server.js and a folder server in the root of our angular project. The server.js file will have the server code, that will point to the server folder, where the rest of the server implementation is.



```js
 Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

// Get our API routes
const api = require('./server/routes/api');

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set our api routes
app.use('/api', api);

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
```


The above code sets up a simple express app, with an /api route and all other routes are directed towards the dist/index.html page. This catch all route, denoted with *, MUST come last after all other API routes have been defined.

The /api route points to a file ./server/routes/api.js. Let's create this file.

```js
const express = require('express');
const router = express.Router();

/* GET api listing. */
router.get('/', (req, res) => {
  res.send('api works');
});

module.exports = router;
```


One last thing before we run this. Since the catch all route is pointing to dist/index.html, we need to do a build of the angular app.

    ng build


This creates the dist folder with the angular 2 app built files. Now we can serve the app with express.

    node server.js


Going to http://localhost:3000 should load the app, and http://localhost:3000/api should show as below.




References:

-[MEAN App with Angular 2 and the Angular CLI](https://scotch.io/tutorials/mean-app-with-angular-2-and-the-angular-cli)





1 setup Angular 2 boilerplate using covalent
2 setup server for static files and api with express
3 setup authentication

---

# 3 Authentication

References:

- [Easy Node Authentication](https://github.com/scotch-io/easy-node-authentication)


https://github.com/auth0-blog/nodejs-jwt-authentication-sample
https://github.com/auth0-blog/angular2-authentication-sample


*** https://github.com/CuppaLabs/angular2-social-login
*** https://github.com/nitishvu/angular2-login-seed/




# 3.2 Google Authentication

Go to https://console.developers.google.com/

Create a new project

Enable 'Google+ API'

In the menu select **Credentials** then create new **OAuth Client ID** credentials

Configure consent screen

Choose Web Application




https://github.com/auth0/express-jwt
