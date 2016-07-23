# Router


## Router.use(middleware)

Use the given middleware function or object on this router.

```js
   // middleware function
   router.use((req, res, next) => {console.log('Hello')});

   // middleware object
   router.use(new Middleware());
```

**Parameters**

  **middleware**: `Middleware | function`, Middleware object or function

  **Returns**: `Router`, for chaining


## Router.all(middleware)

Use the given middleware function or object on this router for
all HTTP methods.

```js
   // middleware function
   router.all((req, res, next) => {console.log('Hello')});

   // middleware object
   router.all(new Middleware());
```

**Parameters**

  **middleware**: `Middleware | function`, Middleware object or function

  **Returns**: `Router`, for chaining


## Router.get(uri, middleware), Router.post(uri, middleware)...

Use the given middleware function or object, with optional _uri_ on
HTTP methods: get, post, put, delete...
Default _uri_ is "/".

```js
 // middleware function will be applied on path "/"
 router.get((req, res, next) => {console.log('Hello')});

 // middleware object will be applied on path "/" and
 router.get(new Middleware());

 // middleware function will be applied on path "/user"
 router.post('/user', (req, res, next) => {console.log('Hello')});

 // middleware object will be applied on path "/user" and
 router.post('/user', new Middleware());
```

**Parameters**

  **uri**: `String`, path

  **middleware**: `Middleware | function`, Middleware object or function

**Returns**: `Router`, for chaining
