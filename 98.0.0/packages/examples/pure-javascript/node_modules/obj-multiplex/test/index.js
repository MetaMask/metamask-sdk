const test = require('tape')
const once = require('once')
const { PassThrough, Transform } = require('readable-stream')
const endOfStream = require('end-of-stream')
const pump = require('pump')
const ObjMultiplex = require('../index.js')

test('basic - string', (t) => {
  t.plan(2)

  const {
    inTransport, outTransport,
    inMux, outMux,
    inStream, outStream,
  } = basicTestSetup()

  bufferToEnd(outStream, (err, results) => {
    t.error(err, 'should not error')
    t.deepEqual(results, ['haay', 'wuurl'], 'results should match')
    t.end()
  })

  // pass in messages
  inStream.write('haay')
  inStream.write('wuurl')

  // simulate disconnect
  setTimeout(() => inTransport.destroy())
})

test('basic - obj', (t) => {
  t.plan(2)

  const {
    inTransport, outTransport,
    inMux, outMux,
    inStream, outStream,
  } = basicTestSetup()

  bufferToEnd(outStream, (err, results) => {
    t.error(err, 'should not error')
    t.deepEqual(results, [{ message: 'haay' }, { message: 'wuurl' }], 'results should match')
    t.end()
  })

  // pass in messages
  inStream.write({ message: 'haay' })
  inStream.write({ message: 'wuurl' })

  // simulate disconnect
  setTimeout(() => inTransport.destroy())
})

test('roundtrip', (t) => {
  t.plan(2)

  const {
    inTransport, outTransport,
    inMux, outMux,
    inStream, outStream,
  } = basicTestSetup()

  const doubler = new Transform({
    objectMode: true,
    transform (chunk, end, callback) {
      // console.log('doubler!', chunk)
      const result = chunk * 2
      callback(null, result)
    }
  })

  pump(
    outStream,
    doubler,
    outStream
  )

  bufferToEnd(inStream, (err, results) => {
    t.error(err, 'should not error')
    t.deepEqual(results, [20, 24], 'results should match')
    t.end()
  })

  // pass in messages
  inStream.write(10)
  inStream.write(12)

  // simulate disconnect
  setTimeout(() => outTransport.destroy(), 100)
})

// util

function basicTestSetup() {

  // setup multiplex and Transport
  const inMux = new ObjMultiplex()
  const outMux = new ObjMultiplex()
  const inTransport = new PassThrough({ objectMode: true })
  const outTransport = new PassThrough({ objectMode: true })

  // setup substreams
  const inStream = inMux.createStream('hello')
  const outStream = outMux.createStream('hello')

  pump(
    inMux,
    inTransport,
    outMux,
    outTransport,
    inMux
  )

  return {
    inTransport, outTransport,
    inMux, outMux,
    inStream, outStream,
  }

}

function bufferToEnd(stream, callback) {
  const results = []
  endOfStream(stream, (err) => callback(err, results))
  stream.on('data', (chunk) => results.push(chunk))
}
