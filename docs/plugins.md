# Plugins

Extend frontexpress via plugins.

|Available plugins||
|:------|:------|
| [frontexpress-path-to-regexp](https://github.com/camelaissani/frontexpress-path-to-regexp) | Add the ability to support Express-style path string such as /user/:name, /user*... |

Others are coming

### Create your own plugin

It consists to simply create an object with two properties:
- **name**: the name of your plugin
- **plugin**: the function containing the implementation

Let's assume that we have implemented this plugin in the `frontexpress-my-plugin.js` file as below:

```js
export default {
  name: 'My plugin',
  plugin(app) {
    // the plugin implementation goes here

    // Some ideas
    // you can get settings
    // const transformer = app.get('http GET transformer');
    //
    // you can set settings
    // app.set('http requester', {
    //   fetch() {
    //     ...
    //   }});
    //
    // you can complete routes
    // app.get(...)
  }
};
```

To use it:

```js
import frontexpress from 'frontexpress';
import myPlugin from 'frontexpress-my-plugin';

// Front-end application
const app = frontexpress();

// tell to frontexpress to use your plugin
app.use(myPlugin);
```