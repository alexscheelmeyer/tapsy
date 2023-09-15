const { assert, header } = require('../index.js');

header('Equals');

assert('1 + 1 = 2', () => 1 + 1)
  .equals(2);

assert('promised 1 + 1 = 2', async () => 1 + 1)
  .equals(2);

assert('{ hello: "world" } = { hello: "world" }', () => ({ hello: 'world' }))
  .equals({ hello: 'world' });
