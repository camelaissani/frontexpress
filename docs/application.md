# Application

## Application.set(setting, val) 

Assign `setting` to `val`, or return `setting`'s value.

```js
   app.set('foo', 'bar');
   app.set('foo');
   // => "bar"
```

**Parameters**

  **setting**: `String`, setting name

  **val**: `*`, setting value

**Returns**: `app`, for chaining


## Application.listen(callback) 

Listen to DOM initialization and history state changes.

The callback function is called once the DOM has
the `document.readyState` equals to 'interactive'.

```js
   app.listen(()=> {
       console.log('App is listening requests');
       console.log('DOM is ready!');
   });
```

**Parameters**

  **callback**: `function`, DOM is ready callback


## Application.route(uri) 

Returns a new `Router` instance for the _uri_.
See the Router api docs for details.

```js
   app.route('/');
   // =>  new Router instance
```

**Parameters**

  **uri**: `String`, path

**Returns**: `Router`, for chaining


## Application.use(uri, middleware) 

Use the given middleware function or object, with optional _uri_.
Default _uri_ is "/".

```js
   // middleware function will be applied on path "/"
   app.use((req, res, next) => {console.log('Hello')});

   // middleware object will be applied on path "/"
   app.use(new Middleware());
```

**Parameters**

   **uri**: `String`, path

   **middleware**: `Middleware | function`, Middleware object or function

**Returns**: `app`, for chaining
