# API

|               | Method        | Short description |
| :------------- | :--------------| :----------------- |
|Frontexpress |||
||[frontexpress()](https://github.com/camelaissani/frontexpress/blob/master/docs/frontexpress.md#frontexpress-1)|Creates an instance of application|
||[frontexpress.Router()](https://github.com/camelaissani/frontexpress/blob/master/docs/frontexpress.md#frontexpressrouter)|Creates a Router object|
||[frontexpress.Middleware](https://github.com/camelaissani/frontexpress/blob/master/docs/frontexpress.md#frontexpressmiddleware)|Returns the Middleware class |
||||
|Application |||
||[set(setting, value)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationsetsetting-val)|Assigns a setting|
||[listen(callback)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationlistencallback)|Starts the application|
||[route(uri)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationrouteuri)|Gets a Router initialized with a root path|
||[use(uri, middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationuseuri-middleware)|Sets a middleware|
||||
||[get(uri, middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationgeturi-middleware-applicationposturi-middleware)|Applies a middleware on given path for a GET request|
||[post(uri, middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationgeturi-middleware-applicationposturi-middleware)|Applies a middleware on given path for a POST request|
||[put(uri, middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationgeturi-middleware-applicationposturi-middleware)|Applies a middleware on given path for a PUT request|
||[delete(uri, middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationgeturi-middleware-applicationposturi-middleware)|Applies a middleware on given path for a DELETE request|
||||
||[httpGet(request, success, failure)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationhttpgetrequest-success-failure-applicationhttppostrequest-success-failure)|Invokes a GET ajax request|
||[httpPost(request, success, failure)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationhttpgetrequest-success-failure-applicationhttppostrequest-success-failure)|Invokes a POST ajax request|
||[httpPut(request, success, failure)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationhttpgetrequest-success-failure-applicationhttppostrequest-success-failure)|Invokes a PUT ajax request|
||[httpDelete(request, success, failure)](https://github.com/camelaissani/frontexpress/blob/master/docs/application.md#applicationhttpgetrequest-success-failure-applicationhttppostrequest-success-failure)|Invokes a DELETE ajax request|
||||
|Router |||
||[use(middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/router.md#routerusemiddleware)|Sets a middleware|
||[all(middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/router.md#routerallmiddleware)|Sets a middleware on all HTTP method requests|
||||
||[get(uri, middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/router.md#routergeturi-middleware-routerposturi-middleware)|Applies a middleware on given path for a GET request|
||[post(uri, middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/router.md#routergeturi-middleware-routerposturi-middleware)|Applies a middleware on given path for a POST request|
||[put(uri, middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/router.md#routergeturi-middleware-routerposturi-middleware)|Applies a middleware on given path for a PUT request|
||[delete(uri, middleware)](https://github.com/camelaissani/frontexpress/blob/master/docs/router.md#routergeturi-middleware-routerposturi-middleware)|Applies a middleware on given path for a DELETE request|
||||
|Middleware |||
||[entered(request)](https://github.com/camelaissani/frontexpress/blob/master/docs/middleware.md#middlewareenteredrequest)|Invoked by the app before an ajax request is sent|
||[exited(request)](https://github.com/camelaissani/frontexpress/blob/master/docs/middleware.md#middlewareexitedrequest)|Invoked by the app before a new ajax request is sent|
||[updated(request, response)](https://github.com/camelaissani/frontexpress/blob/master/docs/middleware.md#middlewareupdatedrequest-response)|Invoked by the app after an ajax request has responded|
||[failed(request, response)](https://github.com/camelaissani/frontexpress/blob/master/docs/middleware.md#middlewarefailedrequest-response)|Invoked by the app after an ajax request has failed|
||[next()](https://github.com/camelaissani/frontexpress/blob/master/docs/middleware.md#middlewarenext)|Allows to break the middleware chain execution|

# middleware function

After registering a middleware function, the application invokes it with these parameters:

```js
  (request, response, next) => {
    next();
  }
```

**request**: `Object`, the ajax request information sent by the app

**response**: `Object`, the response of request

**next**: `Function`, the `next()` function to call to not break the middleware execution chain

# request object

```js
  {
    method,
    uri,
    headers,
    data,
    history: {
      state,
      title,
      uri
    }
  }
```

**method**: `String`, HTTP methods 'GET', 'POST'...

**uri**: `String`, path

**headers**: `Object`, custom HTTP headers

**data**: `Object`, data attached to the request

**history**: `Object`, object with properties state, title and uri

>**If the history object is set, it will activate the browser history management.** See [browser pushState() method](https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method) for more information about state, title, and uri (url).
> uri and history.uri can be different.

**params**: `Object`, object containing the path parameters

# response object

```js
  {
    status,
    statusText,
    responseText,
    errorThrown,
    errors
  }
```

**status**: `Number`, HTTP status 200, 404, 401, 500...

**statusText**: `String`

**responseText**: `String` response content

**errorThrown**: `Object` exception thrown (if request fails)

**errors**: `String` error description (if request fails)
