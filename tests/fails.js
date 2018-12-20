const { assert, header } = require('..');

header('Fails');

assert('calling callback with 0', (cb) => cb(0))
  .fails();

assert('calling callback with error string', (cb) => cb('error'))
  .fails();

assert('throwing string exception', () => { throw 'bah'; })
  .fails();

