const { assert } = require('..');

assert('throwing string exception',
  () => {
    throw 'bah';
  })
  .succeeds();

