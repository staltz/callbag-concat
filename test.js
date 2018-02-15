const test = require('tape');
const concat = require('./readme');

test('it concats 1 async finite listenable source', t => {
  t.plan(14);
  const downwardsExpectedType = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [1, 'number'],
    [2, 'undefined'],
  ];
  const downwardsExpected = [1, 2, 3];

  function sourceA(type, data) {
    if (type === 0) {
      const sink = data;
      let i = 0;
      const id = setInterval(() => {
        i++;
        sink(1, i);
        if (i === 3) {
          clearInterval(id);
          sink(2);
        }
      }, 100);
      sink(0, sourceA);
    }
  }

  function sink(type, data) {
    const et = downwardsExpectedType.shift();
    t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
    t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
    if (type === 1) {
      const e = downwardsExpected.shift();
      t.deepEquals(data, e, 'downwards data is expected: ' + JSON.stringify(e));
    }
  }

  const source = concat(sourceA);
  source(0, sink);

  setTimeout(() => {
    t.pass('nothing else happens');
    t.end();
  }, 700);
});

test('it concats 2 async finite listenable sources', t => {
  t.plan(20);

  const downwardsExpectedType = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [1, 'number'],
    [1, 'string'],
    [1, 'string'],
    [2, 'undefined'],
  ];
  const downwardsExpected = [1,2,3,'a','b'];

  function sourceA(type, data) {
    if (type === 0) {
      const sink = data;
      let i = 0;
      const id = setInterval(() => {
        i++;
        sink(1, i);
        if (i === 3) {
          clearInterval(id);
          sink(2);
        }
      }, 100);
      sink(0, sourceA);
    }
  }

  function sourceB(type, data) {
    if (type === 0) {
      const sink = data;
      setTimeout(() => {
        sink(1, 'a');
      }, 230);
      setTimeout(() => {
        sink(1, 'b');
      }, 460);
      setTimeout(() => {
        sink(2);
      }, 550);
      sink(0, sourceB);
    }
  }

  function sink(type, data) {
    const et = downwardsExpectedType.shift();
    t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
    t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
    if (type === 1) {
      const e = downwardsExpected.shift();
      t.deepEquals(data, e, 'downwards data is expected: ' + JSON.stringify(e));
    }
  }

  const source = concat(sourceA, sourceB);
  source(0, sink);

  setTimeout(() => {
    t.pass('nothing else happens');
    t.end();
  }, 1200);
});

test('it concats 2 async finite pullable sources', t => {
  t.plan(30);

  const upwardsExpectedA = [1, 1,1,1];
  const upwardsExpectedB = [1,1,1];

  const downwardsExpectedType = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [1, 'number'],
    [1, 'string'],
    [1, 'string'],
    [2, 'undefined'],
  ];
  const downwardsExpected = [10,20,30,'a','b'];

  let sentA = 0;
  let sinkA;
  function sourceA(type, data) {
    if (type === 0) {
      sinkA = data;
      sinkA(0, sourceA);
      return;
    }
    if (sentA === 3) {
      sinkA(2);
      return;
    }
    t.true(upwardsExpectedA.length > 0, 'source can be pulled');
    const e = upwardsExpectedA.shift();
    t.equals(type, e, 'upwards A type is expected: ' + e);
    if (sentA === 0) {
      sentA++;
      sinkA(1, 10);
      return;
    }
    if (sentA === 1) {
      sentA++;
      sinkA(1, 20);
      return;
    }
    if (sentA === 2) {
      sentA++;
      sinkA(1, 30);
      return;
    }
  };

  let sentB = 0;
  let sinkB;
  function sourceB(type, data) {
    if (type === 0) {
      sinkB = data;
      data(0, sourceB);
      return;
    }
    if (sentB === 2) {
      sinkB(2);
      return;
    }
    t.true(upwardsExpectedB.length > 0, 'source can be pulled');
    const e = upwardsExpectedB.shift();
    t.equals(type, e, 'upwards B type is expected: ' + e);
    if (sentB === 0) {
      sentB++;
      sinkB(1, 'a');
      return;
    }
    if (sentB === 1) {
      sentB++;
      sinkB(1, 'b');
      return;
    }
  };

  let talkback;
  function sink(type, data) {
    const et = downwardsExpectedType.shift();
    t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
    t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
    if (type === 0) {
      talkback = data;
      talkback(1);
      return;
    }
    if (type === 1) {
      const e = downwardsExpected.shift();
      t.deepEquals(data, e, 'downwards data is expected: ' + JSON.stringify(e));
      talkback(1);
    }
  }

  const source = concat(sourceA, sourceB);
  source(0, sink);

  setTimeout(() => {
    t.pass('nothing else happens');
    t.end();
  }, 200);
});

test('it returns a source that disposes upon upwards END', t => {
  t.plan(16);
  const upwardsExpected = [[0, 'function'], [2, 'undefined']];
  const downwardsExpectedType = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [1, 'number'],
  ];
  const downwardsExpected = [10, 20, 30];

  function makeSource() {
    let sent = 0;
    let id;
    const source = (type, data) => {
      const e = upwardsExpected.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data is expected: ' + e[1]);
      if (type === 0) {
        const sink = data;
        id = setInterval(() => {
          sink(1, ++sent * 10);
        }, 100);
        sink(0, source);
      } else if (type === 2) {
        clearInterval(id);
      }
    };
    return source;
  }

  function makeSink(type, data) {
    let talkback;
    return (type, data) => {
      const et = downwardsExpectedType.shift();
      t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
      t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
      if (type === 0) {
        talkback = data;
      }
      if (type === 1) {
        const e = downwardsExpected.shift();
        t.deepEquals(
          data,
          e,
          'downwards data is expected: ' + JSON.stringify(e)
        );
      }
      if (downwardsExpected.length === 0) {
        talkback(2);
      }
    };
  }

  const source = concat(makeSource());
  const sink = makeSink();
  source(0, sink);

  setTimeout(() => {
    t.pass('nothing else happens');
    t.end();
  }, 700);
});
