const tests = [];

class Tester {
  constructor(id, func, description) {
    this.id = id;
    this.func = func;
    this.description = description;
    this.failed = true;
    this.error = 'could not complete';
    this.value = undefined;
  }

  try() {
    try {
      this.value = this.func();
      this.failed = false;
    } catch (e) {
      this.error = `${this.description} threw exception`;
    }
  }

  print() {
    if (this.failed) {
      console.log(`not ok ${this.id} ${this.description}`);
      console.log(' ---');
      console.log(' actual:');
      console.log('   hostname: \'peebles.example.com\'');
      console.log('   address: ~');
      console.log(' expected:');
      console.log('   hostname: \'peebles.example.com\'');
      console.log('   address: \'85.193.201.85\'');
      console.log(' ...');
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
      else resolve(null, tester.value);
    });
  }

  function equals(val) {
    return new Promise((resolve, reject) => {
      tester.try();
      if (tester.failed) {
        tester.print();
        resolve(tester.error);
      }
      else if (val === tester.value) {
        tester.failed = false;
        tester.print();
        resolve(null, true);
      }
      else {
        tester.failed = true;
        tester.print();
        resolve('not equal');
      }
    });
  };

  return { succeeds, equals };
}


process.on('exit', () => console.log(`1..${tests.length}`));

module.exports = { assert };
