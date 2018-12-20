const { assert, header } = require('..');

header('Succeeds');

assert('statement', () => 1+1)
  .succeeds();

assert('calling callback undefined', (cb) => cb())
  .succeeds();

assert('calling callback null', (cb) => cb(null))
  .succeeds();

