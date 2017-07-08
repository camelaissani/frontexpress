# Middleware

## middleware function

After registering a middleware function, the application invokes it with these parameters:

```js
  (request, response, next) => {
    next();
  }
```

## middleware object

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