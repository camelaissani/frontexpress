# request

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