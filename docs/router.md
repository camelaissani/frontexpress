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
