const { assert, header } = require('..');

header('Fails');

assert('calling callback with 0', (cb) => cb(0))
  .fails();

assert('calling callback with error string', (cb) => cb('error'))
  .fails();

assert('throwing string exception', () => { throw 'bah'; }) // eslint-disable-line no-throw-literal
  .fails();

assert('delayed rejected promise', () => new Promise((resolve, reject) => setTimeout(() => reject('not fun'), 50)))
  .fails();

assert('non-function', 42)
  .fails();

assert('non-function promise', (async () => 42)())
  .fails();
