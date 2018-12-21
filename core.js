const _ = require('lodash');

function isPromise(func) {
  return func && typeof func.then === 'function';
}

class Tester {
  constructor(id, func, description, silent) {
    this.id = id;
    this.func = func;
    this.description = description;
    this.silent = silent;
    this.failed = true;
    this.error = 'did not succeed';
    this.returnValue = { set: false, value: undefined };
  }

  async try() {
    try {
      const isAsync = this.func.length >= 1;
      if (isAsync) {
        const value = this.func((err, ...args) => {
          this.callbackValues = args;
          if (err !== undefined && err !== null) {
            this.failed = true;
            this.error = `did not succeed, callback got "${err}"`;
          } else {
            this.failed = false;
          }
        });
        this.returnValue = { value, set: true };
      } else {
        this.returnValue = { value: this.func(), set: true };
        if (isPromise(this.returnValue.value)) {
          this.returnValue = await this.returnValue.value
            .then((value) => {
              this.failed = false;
              return { value, set: true };
            })
            .catch((e) => {
              this.error = e.toString();
              this.failed = true;
              return undefined;
            });
          return;
        }

        this.failed = false;
      }
    } catch (e) {
      this.error = `threw exception (${e.toString()})`;
    }
  }

  print() {
    if (this.silent) return;

    if (this.failed) {
      console.log(`not ok ${this.id} ${this.description}: ${this.error}`);
    } else {
      console.log(`ok ${this.id} ${this.description}`);
    }
  }
}

function init(silent) {
  if (silent === undefined) silent = false;

  if (!silent) {
    console.log('TAP version 13');
  }

  let rootPromise = new Promise((resolve) => resolve());
  function queue(func) {
    rootPromise = rootPromise.then(func);
    return rootPromise;
  }

  const tests = [];

  function assert(description, func) {
    const tester = new Tester(tests.length + 1, func, description, silent);
    tests.push(tester);

    function succeeds() {
      return queue(
        () => new Promise(async (resolve) => {
          await tester.try();
          tester.print();
          if (tester.failed) resolve(tester.error);
          else resolve(tester.returnValue.value);
        }));
    }

    function fails() {
      return queue(
        () => new Promise(async (resolve) => {
          await tester.try();
          if (tester.failed) {
            tester.failed = false;
          } else {
            tester.error = 'succeeded';
            tester.failed = true;
          }
          tester.print();
          if (tester.failed) resolve();
          else resolve(tester.error);
        }));
    }

    function equals(val) {
      return queue(
        () => new Promise(async (resolve) => {
          await tester.try();
          if (tester.failed) {
            tester.print();
            resolve(tester.error);
          } else if (_.isEqual(val, tester.returnValue.value)) {
            tester.failed = false;
            tester.print();
            resolve(true);
          } else {
            tester.failed = true;
            const errorLines = [
              'did not match expectation\n',
              ' ---\n',
              ` actual: ${JSON.stringify(tester.returnValue.value)}\n`,
              ` expected: ${JSON.stringify(val)}\n`,
              ' ...\n',
            ];
            tester.error = errorLines.join('');
            tester.print();
            resolve('not equal');
          }
        }));
    }

    return { succeeds, fails, equals };
  }


  function header(text) {
    return queue(
      () => {
        if (!silent) {
          console.log(`# ${text}`);
        }
      });
  }


  if (!silent) {
    process.on('exit', () => console.log(`1..${tests.length}`));
  }

  return { assert, header, queue };
}

module.exports = init;
