if (typeof require.addon === 'function') { // if the platform supports native resolving prefer that
  module.exports = require.addon.bind(require)
} else { // else use the runtime version here
  module.exports = require('./node-gyp-build.js')
}
