# obj-multiplex

simple stream multiplexing for `objectMode`

### usage

```js
// create multiplexer
const mux = new ObjMultiplex()

// setup substreams
const streamA = mux.createStream('hello')
const streamB = mux.createStream('world')

// pipe over transport (and back)
mux.pipe(transport).pipe(mux)

// send values over the substreams
streamA.write({ thisIsAn: 'object' })
streamA.write(123)

// or pipe together normally
streamB.pipe(evilAiBrain).pipe(streamB)
```