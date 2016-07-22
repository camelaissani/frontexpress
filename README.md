![frontexpress](http://fontmeme.com/embed.php?text=frontexpress&name=Atype%201%20Light.ttf&size=90&style_color=6F6F75)

 Minimalist front end router framework à la [express](http://expressjs.com/)

 [![Build Status](https://travis-ci.org/camelaissani/frontexpress.svg?branch=master)](https://travis-ci.org/camelaissani/frontexpress)
 [![Code Climate](https://codeclimate.com/github/camelaissani/frontexpress/badges/gpa.svg)](https://codeclimate.com/github/camelaissani/frontexpress)
 [![Coverage Status](https://coveralls.io/repos/github/camelaissani/frontexpress/badge.svg?branch=master)](https://coveralls.io/github/camelaissani/frontexpress?branch=master)
 ![Coverage Status](https://david-dm.org/camelaissani/frontexpress.svg)

```js
import frontexpress from 'frontexpress';
const app = frontexpress();

// listen HTTP GET request on path (/hello)
app.get('/hello', (req, res) => {
  document.querySelector('.content').innerHTML = '<p>Hello World</p>';
});

// listen HTTP GET request on API (/api/xxx)
// update page content with response
app.get(/^\/api\//, (req, res, next) => {
  document.querySelector('.content').innerHTML = res.responseText;
  next();
});

// start listening frontend application requests
app.listen();
```

## Installation

```bash
$ npm install frontexpress
```

## Quick Start

 The quickest way to get started with frontexpress is to clone the [frontexpress-demo](https://github.com/camelaissani/frontexpress-demo) repository.

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

## Disclaimer

>
> In this first version of frontexpress, the API is not completely the miror of the expressjs one.
>
> There are some missing methods. Currently, the use, get, post... methods having a middlewares array as parameter are not available.
> The string pattern to define route paths is not yet implemented.
>
> Obviously, the objective is to have the same API as expressjs when the methods make sense browser side.
>

## Routing

### Basic routing

Routing allows to link the frontend application with HTTP requests to a particular URI (or path).
The link can be specific to an HTTP request method (GET, POST, and so on).

The following examples illustrate how to define simple routes.

Listen an HTTP GET request on URI (/):

```js
app.get('/', (req, res) => {
  window.alert('Hello World');
});
```

Listen an HTTP POST request on URI (/):

```js
app.post('/', (req, res) => {
  window.alert('Got a POST request at /');
});
```

### Route paths

Route paths, in combination with a request method, define the endpoints at which requests can be made.
Route paths can be strings (see basic routing section), or regular expressions.

This route path matches all GET request paths which start with (/api/):

```js
app.get(/^api\//, (req, res) => {
  console.log(`api was requested ${req.uri}`);
});
```

### Route handlers

You can provide multiple callback functions to handle a request. Invoking ```next()``` function allows to pass the control to subsequent routes.
Whether ```next()``` method is not called the handler chain is stoped

```js
const h1 = (req, res, next) => { console.log('h1!'); next(); };
const h2 = (req, res, next) => { console.log('h2!') };
const h3 = (req, res, next) => { console.log('h3!'); next(); };

app.get('/example/a', h1);
app.get('/example/a', h2);
app.get('/example/a', h3);
```

A response to a GET request on path (/example/a) displays:

```
h1!
h2!
```

h3 is ignored because ```next()``` function was not invoked.

### app.route()

You can create chainable route handlers for a route path by using ```app.route()```.

```js
app.route('/book')
 .get((req, res) => { console.log('Get a random book') })
 .post((req, res) => { console.log('Add a book') })
 .put((req, res) => { console.log('Update the book') });
```

### frontexpress.Router

Use the ```frontexpress.Router``` class to create modular, mountable route handlers.

Create a router file named ```birds.js``` in the app directory, with the following content:

```js
import frontexpress from 'frontexpress';

const router = frontexpress.Router();

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log(`Time: ${Date.now()}`);
  next();
});

// react on home page route
router.get('/', (req, res) => {
  document.querySelector('.content').innerHTML = '<p>Birds home page</p>';
});

// react on about route
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

The app will now be able to react on requests (/birds) and (/birds/about)

## API

| Class         | Method        |
| ------------- | --------------|
|Frontexpress   ||
||[frontexpress()](https://github.com/camelaissani/frontexpress/blob/master/docs/frontexpress.md#frontexpress-1)|
||[frontexpress.Router](https://github.com/camelaissani/frontexpress/blob/master/docs/frontexpress.md#frontexpressrouter)|
||[frontexpress.Middleware](https://github.com/camelaissani/frontexpress/blob/master/docs/frontexpress.md#frontexpressmiddleware)|
|||
| Application   ||
||[set(setting, value)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationsetsetting-val) |
||[listen(callback)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationlistencallback) |
||[route(uri)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationrouteuri) |
||[use(uri, middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationuseuri-middleware) |
|| get(uri, middleware) |
|| post(uri, middleware) |
|| put(uri, middleware) |
|| delete(uri, middleware) |
|| httpGet(request, success, failure) |
|| httpPost(request, success, failure) |
|| httpPut(request, success, failure) |
|| httpDelete(request, success, failure) |
|||
| Router        ||
||[use(middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/router.md#routerusemiddleware) |
||[all(middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/router.md#routerallmiddleware) |
|| get(uri, middleware) |
|| post(uri, middleware) |
|| put(uri, middleware) |
|| delete(uri, middleware) |
|||
| Middleware    ||
||[entered(request)](https://github.com/camelaissani/frontexpress/blob/master/docs/middleware.md#middlewareenteredrequest) |
||[exited(request)](https://github.com/camelaissani/frontexpress/blob/master/docs/middleware.md#middlewareexitedrequest) |
||[updated(request, response)](https://github.com/camelaissani/frontexpress/blob/master/docs/middleware.md#middlewareupdatedrequest-response) |
||[failed(request, response)](https://github.com/camelaissani/frontexpress/blob/master/docs/middleware.md#middlewarefailedrequest-response) |
||[next()](https://github.com/camelaissani/frontexpress/blob/master/docs/middleware.md#middlewarenext) |
## License

 [MIT](LICENSE)
