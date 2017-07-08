# Routing

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
_You can have the full capabilities of Express-style path with this plugin [frontexpress-path-to-regexp](https://github.com/camelaissani/frontexpress-path-to-regexp)_

___

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