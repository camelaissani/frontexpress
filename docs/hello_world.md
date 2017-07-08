## Hello world example

```js
import frontexpress from 'frontexpress';

// Front-end application
const app = frontexpress();

app.get('/', (req, res) => {
    document.querySelector('.content').innerHTML = 'Hello World!';
});

// start front-end application
app.listen();
```