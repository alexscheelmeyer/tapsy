const { assert } = require('..');

assert('1 + 1 = 2', () => 1+1)
  .equals(2);
