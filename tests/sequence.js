const { assert, header, queue } = require('../index.js');

header('Sequence');

let qVal = 0;
queue(async () => qVal++);
assert('queued value incremented', () => qVal)
  .equals(1);
queue(async () => qVal++);
assert('queued value incremented again', () => qVal)
  .equals(2);

async function sequence() {
  let val = 1;

  await assert('delayed set', () => new Promise((resolve) => setTimeout(() => {
    val = 2;
    resolve();
  }, 25))).succeeds();

  val = 3;

  // the `await` above must ensure that "val = 3" is not executed before
  // "val = 2" is finished in the timeout. This check is 50ms out while
  // the value is set 25ms out, so without the await `val` would be 2.
  assert('val equals 3', () => new Promise((resolve) => setTimeout(() => {
    resolve(val);
  }, 50)))
    .equals(3);
}

sequence();
