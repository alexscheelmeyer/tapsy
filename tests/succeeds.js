const { assert } = require('..');

assert('adding numbers', () => 1+1)
  .succeeds();

assert('throwing string exception',
  () => {
    throw 'bah';
  })
  .succeeds();

