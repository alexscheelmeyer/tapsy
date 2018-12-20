const { assert } = require('..');

assert('adding numbers', () => 1+1)
  .succeeds();

assert('1 + 1 = 2', () => 1+1)
  .equals(2);
