[![frontexpress](http://fontmeme.com/embed.php?text=frontexpress&name=Atype%201%20Light.ttf&size=90&style_color=6F6F75)](https://frontexpressjs.com)

An Express.js-Style router for the front-end.

Code the front-end like the back-end. Same language same framework.

[frontexpress demo](https://github.com/camelaissani/frontexpress-demo)

 [![Build Status](https://travis-ci.org/camelaissani/frontexpress.svg?branch=master)](https://travis-ci.org/camelaissani/frontexpress)
 [![Code Climate](https://codeclimate.com/github/camelaissani/frontexpress/badges/gpa.svg)](https://codeclimate.com/github/camelaissani/frontexpress)
 [![Coverage Status](https://coveralls.io/repos/github/camelaissani/frontexpress/badge.svg?branch=master)](https://coveralls.io/github/camelaissani/frontexpress?branch=master)
 ![dependencies](https://img.shields.io/gemnasium/mathiasbynens/he.svg)
 ![Size Shield](https://img.shields.io/badge/size-3.55kb-brightgreen.svg)
 [![npm](https://img.shields.io/npm/dm/frontexpress.svg)](https://www.npmjs.com/package/frontexpress)

```js
import frontexpress from 'frontexpress';

// Front-end application
const app = frontexpress();

// front-end logic on path "/"
app.get('/', (req, res) => {
    document.querySelector('.content').innerHTML = 'Hello World!';
});

// start listening routes
app.listen();
```
## Features

  ✔️ You already know [ExpressJS](http://expressjs.com/) then you know FrontExpress

  ✔️ Simple, minimal core extendable through plugins

  ✔️ Lighweight framework

  ✔️ Build your front-end application by handling routes

  ✔️ Ideal for Single Page Application

  ✔️ Manage ajax requests and browser history

## Installation

#### From npm repository

```bash
$ npm install frontexpress
```

#### From bower repository

```bash
$ bower install frontexpress
```

#### From CDN

On [jsDelivr](https://cdn.jsdelivr.net/npm/frontexpress@latest/frontexpress.min.js)

## Documentation

[Website and Documentation](https://frontexpressjs.com)

## Tests

 Clone the repository:

```bash
$ git clone git@github.com:camelaissani/frontexpress.git
$ cd frontexpress
```

 Install the dependencies and run the test suite:

```bash
$ npm install
$ npm test
```

## License

[MIT](LICENSE)
