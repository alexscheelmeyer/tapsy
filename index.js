const _ = require('lodash');

function isPromise(func) {
  return func && typeof func.then === 'function';
}

const tests = [];

class Tester {
  constructor(id, func, description) {
    this.id = id;
    this.func = func;
    this.description = description;
    this.failed = true;
    this.error = 'did not succeed';
    this.returnValue = { set: false, value: undefined };
  }

  async try() {
    try {
      const isAsync = this.func.length >= 1;
      if (isAsync) {
        this.returnValue = { value: this.func((err, ...args) => {
          this.callbackValues = args;
          if (err !== undefined && err !== null) {
            this.failed = true;
            this.error = `did not succeed, callback got "${err}"`;
          } else {
            this.failed = false;
          }
        }), set: true };
      } else {
        this.returnValue = { value: this.func(), set: true };
        if (isPromise(this.returnValue.value)) {
          this.returnValue = { value: await this.func(), set: true };
        }

        this.failed = false;
      }
    } catch (e) {
      this.error = `threw exception (${e.toString()})`;
    }
  }

  print() {
    if (this.failed) {
      console.log(`not ok ${this.id} ${this.description}: ${this.error}`);
    } else {
      console.log(`ok ${this.id} ${this.description}`);
    }
  }
}

let rootPromise = new Promise((resolve, reject) => resolve());

function assert(description, func) {
  const tester = new Tester(tests.length + 1, func, description);
  tests.push(tester);

  function succeeds() {
    rootPromise = rootPromise
      .then(() => {
        return new Promise(async (resolve, reject) => {
          await tester.try();
          tester.print();
          if (tester.failed) resolve(tester.error);
          else resolve(tester.returnValue.value);
        });
      });
    return rootPromise;
  }

  function fails() {
    rootPromise = rootPromise
      .then(() => {
        return new Promise(async (resolve, reject) => {
          await tester.try();
          if (tester.failed) {
            tester.failed = false;
          } else {
            tester.error = 'succeeded';
            tester.failed = true;
          }
          tester.print();
          if (tester.failed) resolve(tester.error);
          else resolve(tester.returnValue.value);
        });
      });
    return rootPromise;
  }

  function equals(val) {
    rootPromise = rootPromise
      .then(() => {
        return new Promise(async (resolve, reject) => {
          await tester.try();
          if (tester.failed) {
            tester.print();
            resolve(tester.error);
          }
          else if (_.isEqual(val, tester.returnValue.value)) {
            tester.failed = false;
            tester.print();
            resolve(true);
          }
          else {
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
        });
      });
    return rootPromise;
  };

  return { succeeds, fails, equals };
}


function header(text) {
  rootPromise = rootPromise
    .then(() => {
      console.log(`# ${text}`);
    });
  return rootPromise;
}


process.on('exit', () => console.log(`1..${tests.length}`));

module.exports = { assert, header };
