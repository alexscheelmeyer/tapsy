const { assert, header } = require('..');

header('Succeeds');

assert('statement', () => 1+1)
  .succeeds();

assert('calling callback undefined', (cb) => cb())
  .succeeds();

assert('calling callback null', (cb) => cb(null))
  .succeeds();

assert('delayed resolved promise', () => new Promise((resolve, reject) => setTimeout(resolve, 50)))
  .succeeds();
