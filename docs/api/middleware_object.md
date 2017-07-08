# Middleware object

### entered(request)

Invoked by the app before ajax request are sent or
during the DOM loading (document.readyState === 'loading').

Override this method to add your custom behaviour

**Parameters**

  **request**: `Object`


### exited(request)

Invoked by the app before a new ajax request is sent or before the DOM unloading.

Override this method to add your custom behaviour

**Parameters**

  **request**: `Object`


### updated(request, response)

Invoked on ajax request responding or on DOM ready
(document.readyState === 'interactive').

Override this method to add your custom behaviour

**Parameters**

  **request**: `Object`

  **response**: `Object`


### failed(request, response)

Invoked when ajax request fails.

Override this method to add your custom behaviour

**Parameters**

  **request**: `Object`

  **response**: `Object`


### next()

Allow the hand over to the next middleware object or function.

Override this method and return `false` to break execution of
middleware chain.

**Returns**: `Boolean`, `true` by default
