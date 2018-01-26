# callbag-concat

Callbag factory that concatenates the data from multiple (2 or more) callbag sources. It starts each source at a time: waits for the previous source to end before starting the next source. Works with both pullable and listenable sources.

`npm install callbag-concat`

## example

```js
const fromIter = require('callbag-from-iter');
const iterate = require('callbag-iterate');
const concat = require('callbag-concat');

const source = combine(fromIter([10,20,30]), fromIter(['a','b']));

iterate(x => console.log(x))(source); // 10
                                      // 20
                                      // 30
                                      // a
                                      // b
```
