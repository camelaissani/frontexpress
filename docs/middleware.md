# Middleware

## Middleware.entered(request)

Invoked by the app before ajax request are sent or
during the DOM loading (document.readyState === 'loading').
See Application#_callMiddlewareEntered documentation for details.

Override this method to add your custom behaviour

**Parameters**

  **request**: `Object`


## Middleware.exited(request)

Invoked by the app before a new ajax request is sent or before the DOM unloading.
See Application#_callMiddlewareExited documentation for details.

Override this method to add your custom behaviour

**Parameters**

  **request**: `Object`


## Middleware.updated(request, response)

Invoked on ajax request responding or on DOM ready
(document.readyState === 'interactive').
See Application#_callMiddlewareUpdated documentation for details.

Override this method to add your custom behaviour

**Parameters**

  **request**: `Object`

  **response**: `Object`


## Middleware.failed(request, response)

Invoked when ajax request fails.

Override this method to add your custom behaviour

**Parameters**

  **request**: `Object`

  **response**: `Object`


## Middleware.next()

Allow the hand over to the next middleware object or function.

Override this method and return `false` to break execution of
middleware chain.

**Returns**: `Boolean`, `true` by default
