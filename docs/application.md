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

Listen to the DOM initialization and the browser history state changes.

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

Create a new `Router` instance for the _uri_.
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


## Application.get(uri, middleware), Application.post(uri, middleware)...

Use the given middleware function or object, with optional _uri_ on
HTTP methods: get, post, put, delete...
Default _uri_ is "/".

```js
     // middleware function will be applied on path "/"
     app.get((req, res, next) => {console.log('Hello')});

     // middleware object will be applied on path "/" and
     app.get(new Middleware());

     // get a setting value
     app.set('foo', 'bar');
     app.get('foo');
     // => "bar"
```

**Parameters**

  **uri**: `String`, path (or setting only for get method)

  **middleware**: `Middleware | function`, Middleware object or function

**Returns**: `app`, for chaining


## Application.httpGet(request, success, failure), Application.httpPost(request, success, failure)...

Make an ajax request (get, post, put, delete...).

```js
   // HTTP GET method
   httpGet('/route1');

   // HTTP GET method
   httpGet({uri: '/route1', data: {'p1': 'val1'});
   // uri invoked => /route1?p1=val1

   // HTTP GET method with browser history management
   httpGet({uri: '/api/users', history: {state: {foo: "bar"}, title: 'users page', uri: '/view/users'});
```

Samples above can be applied on other HTTP methods.

**Parameters**

  **request**: `String | Object` uri or object containing uri, http headers, data, history

  **success**: `Function` success callback

  **failure**: `Function` failure callback
