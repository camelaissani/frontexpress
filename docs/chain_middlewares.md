# Chain middlewares

You can provide multiple middleware functions on a navigation path. Invoking ```next()``` function allows to chain the middlewares.
At the opposite, when the ```next()``` method is not called the chain is stopped.

```js
const m1 = (req, res, next) => { console.log('m1!'); next(); };
const m2 = (req, res, next) => { console.log('m2!') };
const m3 = (req, res, next) => { console.log('m3!'); next(); };

app.get('/example/a', m1);
app.get('/example/a', m2);
app.get('/example/a', m3);
```

On navigation on path /example/a, the browser console displays the following:

```
m1!
m2!
```

m3 is ignored because ```next()``` function was not invoked.

Also, you can create chainable route middlewares for a route path by using ```app.route()```.

```js
app.route('/book')
 .get((req, res) => { console.log('Get a random book') })
 .post((req, res) => { console.log('Add a book') })
 .put((req, res) => { console.log('Update the book') });
```