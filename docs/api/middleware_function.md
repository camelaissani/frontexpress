# Middleware function

### (request, response, next) => {}

After registering a middleware function, the application invokes it with these parameters:

**request**: `Object`, the ajax request information sent by the app

**response**: `Object`, the response of request

**next**: `Function`, the `next()` function to call to not break the middleware execution chain