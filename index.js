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

  try() {
    try {
      this.returnValue = { value: this.func(), set: true };
      this.failed = false;
    } catch (e) {
      this.error = 'threw exception';
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

function assert(description, func) {
  const tester = new Tester(tests.length + 1, func, description);
  tests.push(tester);

  function succeeds() {
    return new Promise((resolve, reject) => {
      tester.try();
      tester.print();
      if (tester.failed) resolve(tester.error);
      else resolve(null, tester.returnValue.value);
    });
  }

  function equals(val) {
    return new Promise((resolve, reject) => {
      tester.try();
      if (tester.failed) {
        tester.print();
        resolve(tester.error);
      }
      else if (val === tester.returnValue.value) {
        tester.failed = false;
        tester.print();
        resolve(null, true);
      }
      else {
        tester.failed = true;
        const errorLines = [
          'did not match expectation\n',
          ' ---\n',
          ` actual: ${tester.returnValue.value}\n`,
          ` expected: ${val}\n`,
          ' ...\n',
        ];
        tester.error = errorLines.join('');
        tester.print();
        resolve('not equal');
      }
    });
  };

  return { succeeds, equals };
}


process.on('exit', () => console.log(`1..${tests.length}`));

module.exports = { assert };
