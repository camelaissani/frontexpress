![frontexpress](http://fontmeme.com/embed.php?text=frontexpress&name=Atype%201%20Light.ttf&size=90&style_color=6F6F75)

A simple vanilla JavaScript router a la [ExpressJS](http://expressjs.com/).

Code the front-end like the back-end.

[frontexpress demo](https://github.com/camelaissani/frontexpress-demo)

 [![Build Status](https://travis-ci.org/camelaissani/frontexpress.svg?branch=master)](https://travis-ci.org/camelaissani/frontexpress)
 [![Code Climate](https://codeclimate.com/github/camelaissani/frontexpress/badges/gpa.svg)](https://codeclimate.com/github/camelaissani/frontexpress)
 [![Coverage Status](https://coveralls.io/repos/github/camelaissani/frontexpress/badge.svg?branch=master)](https://coveralls.io/github/camelaissani/frontexpress?branch=master)
 ![dependencies](https://img.shields.io/gemnasium/mathiasbynens/he.svg)
 ![Size Shield](https://img.shields.io/badge/size-3.55kb-brightgreen.svg)

## Installation

### From npm repository

```bash
$ npm install frontexpress
```

### From bower repository

```bash
$ bower install frontexpress
```

### From CDN

On [jsDelivr](https://cdn.jsdelivr.net/npm/frontexpress@1.2.0/frontexpress.min.js)

## Documentation

[Website and Documentation](http://www.frontexpressjs.com) 

## Usage

```js
import frontexpress from 'frontexpress';

// Front-end application
const app = frontexpress();

// front-end logic on navigation path "/page1"
app.get('/page1', (req, res) => {
    document.querySelector('.content').innerHTML = res.responseText;
});

// front-end logic on navigation path "/page2"
app.get('/page2', (req, res) => {
    document.querySelector('.content').innerHTML = res.responseText;
});

// start front-end application
app.listen();
```

### Routes

Listen GET requests on path /hello:

```js
app.get('/hello', (req, res) => {
  window.alert('Hello World');
});
```

Listen POST requests on path /item:

```js
app.post('/item', (req, res) => {
  window.alert('Got a POST request at /item');
});
```

Listen GET requests on path starting with /api/:

```js
app.get(/^api\//, (req, res) => {
  console.log(`api was requested ${req.uri}`);
});
```

Get parameters from path

```js
app.get('/product/:id', (req, res) => {
  // if we have /product/42 then
  // req.params.id = 42
});
```

```js
app.get('/user/:firstname?/:lastname', (req, res) => {
  // if we have /user/camel/aissani then
  // req.params.firstname = 'camel'
  // req.params.lastname = 'aissani'

  // if we have /user/aissani then
  // req.params.firstname = undefined
  // req.params.lastname = 'aissani'
});
```

```js
app.get('/user/:id', (req, res) => {
  // if we have /user/1,2,3 then
  // req.params.id = [1,2,3]
});
```
You can have the full capabilities of Express-style path with this plugin [frontexpress-path-to-regexp](https://github.com/camelaissani/frontexpress-path-to-regexp)

### Middleware object

The middleware object gives access to more hooks

```js
  class MyMiddleware extends Middleware {
    entered(req) {
      // before request sent
    }

    updated(req, res) {
      // after request sent
      // res has the request response
      window.alert('Hello World');
    }

    exited(req) {
       // before a new request sent
    }

    failed(req, res) {
       // on request failed
    }

    next() {
       // for chaining
       return true;
    }

  }
  app.get('/hello', new MyMiddleware());
```

### Chain handlers

You can provide multiple handlers functions on a navigation path. Invoking ```next()``` function allows to chain the handlers.
At the opposite, when the ```next()``` method is not called the handler chain is stopped.

```js
const h1 = (req, res, next) => { console.log('h1!'); next(); };
const h2 = (req, res, next) => { console.log('h2!') };
const h3 = (req, res, next) => { console.log('h3!'); next(); };

app.get('/example/a', h1);
app.get('/example/a', h2);
app.get('/example/a', h3);
```

On navigation on path /example/a, the browser console displays the following:

```
h1!
h2!
```

h3 is ignored because ```next()``` function was not invoked.

#### app.route()

You can create chainable route handlers for a route path by using ```app.route()```.

```js
app.route('/book')
 .get((req, res) => { console.log('Get a random book') })
 .post((req, res) => { console.log('Add a book') })
 .put((req, res) => { console.log('Update the book') });
```

#### frontexpress.Router

Use the ```frontexpress.Router``` class to create modular, mountable route handlers.

Create a router file named ```birds.js```:

```js
import frontexpress from 'frontexpress';

const router = frontexpress.Router();

// specific middleware for this router
router.use((req, res, next) => {
  console.log(`Time: ${Date.now()}`);
  next();
});

// listen navigation on the home page
router.get('/', (req, res) => {
  document.querySelector('.content').innerHTML = '<p>Birds home page</p>';
});

// listen navigation on the about page
router.get('/about', (req, res) => {
  document.querySelector('.content').innerHTML = '<p>About birds</p>';
});

export default router;
```

Then, load the router module in the app:

```js
import birds  from './birds';
...
app.use('/birds', birds);
```

## Plugins

### Extend frontexpress via plugins:

- [frontexpress-path-to-regexp](https://github.com/camelaissani/frontexpress-path-to-regexp): Add the ability to support Express-style path string such as /user/:name, /user*...

Others are coming

### Write your own plugin

It consists to simply create an object with two properties:
- **name**: the name of your plugin
- **plugin**: the function containing the implementation

Let's assume that we have implemented this plugin in the `frontexpress-my-plugin.js` file as below:

```js
export default {
  name: 'My plugin',
  plugin(app) {
    // the plugin implementation goes here

    // Some ideas
    // you can get settings
    // const transformer = app.get('http GET transformer');
    //
    // you can set settings
    // app.set('http requester', {
    //   fetch() {
    //     ...
    //   }});
    //
    // you can complete routes
    // app.get(...)
  }
};
```

To use it:

```js
import frontexpress from 'frontexpress';
import myPlugin from 'frontexpress-my-plugin';

// Front-end application
const app = frontexpress();

// tell to frontexpress to use your plugin
app.use(myPlugin);
```

## More

[API](https://github.com/camelaissani/frontexpress/blob/master/docs/api.md)

## Tests

 Clone the git repository:

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
