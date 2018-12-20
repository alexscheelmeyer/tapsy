const { assert, header } = require('..');

header('Equals');

assert('1 + 1 = 2', () => 1+1)
  .equals(2);
