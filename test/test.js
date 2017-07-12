const compose = require('..');
const assert = require('assert');
const test = require('test');
const co = require('coroutine');

test.setup();

describe('Compose', () => {
  it('should work', () => {
    var arr = [];
    var stack = [];

    stack.push((context, next) => {
      arr.push(1)
      co.sleep(1);
      next();
      co.sleep(1);
      arr.push(6)
    });

    stack.push((context, next) => {
      arr.push(2)
      co.sleep(1);
      next();
      co.sleep(1);
      arr.push(5)
    });

    stack.push((context, next) => {
      arr.push(3)
      co.sleep(1);
      next();
      co.sleep(1);
      arr.push(4)
    });

    compose(stack)({});
    assert.deepEqual(arr, [1, 2, 3, 4, 5, 6]);
  });

  it('should be able to be called twice', () => {
    var stack = [];

    stack.push((context, next) => {
      context.arr.push(1);
      co.sleep(1);
      next();
      co.sleep(1);
      context.arr.push(6);
    });

    stack.push((context, next) => {
      context.arr.push(2);
      co.sleep(1);
      next();
      co.sleep(1);
      context.arr.push(5);
    });

    stack.push((context, next) => {
      context.arr.push(3);
      co.sleep(1);
      next();
      co.sleep(1);
      context.arr.push(4);
    });

    const fn = compose(stack);
    const ctx1 = { arr: [] };
    const ctx2 = { arr: [] };
    const out = [1, 2, 3, 4, 5, 6];

    fn(ctx1);
    assert.deepEqual(out, ctx1.arr);

    fn(ctx2);
    assert.deepEqual(out, ctx2.arr);
  });

  it('should only accept an array', () => {
    let err;
    try {
      assert.throws(() => compose());
      compose();
    } catch (e) {
      err = e;
    }
    assert.isTrue(err instanceof TypeError);
  });

  it('should work with 0 middleware', () => {
    compose([])({});
  });

  it('should only accept middleware as functions', () => {
    var err;
    try {
      assert.throws(() => compose([{}]));
      compose([{}]);
    } catch (e) {
      err = e;
    }
    assert.isTrue(err instanceof TypeError);
  });

  it('should work when yielding at the end of the stack', () => {
    var stack = [];
    var called = false;

    stack.push((ctx, next) => {
      next();
      called = true;
    });

    compose(stack)({});
    assert(called);
  });

  it('should reject on errors in middleware', () => {
    var stack = [];
    stack.push(() => { throw new Error() });
    var err;
    try {
      compose(stack)({});
    } catch (e) {
      err = e;
    }
    assert.isTrue(err instanceof Error);
  });

  it('should work when call at the end of the stack', () => {
    var stack = []

    stack.push((ctx, next) => {
      next();
    });

    compose(stack)({});
  })

  it('should keep the context', () => {
    var ctx = {};

    var stack = [];

    stack.push((ctx2, next) => {
      next();
      assert.deepEqual(ctx, ctx2);
    });

    stack.push((ctx2, next) => {
      next();
      assert.deepEqual(ctx, ctx2);
    });

    stack.push((ctx2, next) => {
      next();
      assert.deepEqual(ctx, ctx2);
    });

    compose(stack)(ctx);
  });

  it('should catch downstream errors', () => {
    var arr = [];
    var stack = [];

    stack.push((ctx, next) => {
      arr.push(1);
      try {
        arr.push(6);
        next();
        arr.push(7);
      } catch (err) {
        arr.push(2);
      }
      arr.push(3);
    });

    stack.push((ctx, next) => {
      arr.push(4);
      throw new Error();
      // arr.push(5)
    });

    compose(stack)({});
    assert.deepEqual(arr, [1, 6, 4, 2, 3]);
  })

  it('should compose w/ next', () => {
    var called = false
    compose([])({}, () => called = true);
    assert(called);
  })

  // https://github.com/koajs/compose/pull/27#issuecomment-143109739
  it('should compose w/ other compositions', () => {
    var called = [];

    compose([
      compose([
        (ctx, next) => {
          called.push(1)
          return next()
        },
        (ctx, next) => {
          called.push(2)
          return next()
        }
      ]),
      (ctx, next) => {
        called.push(3)
        return next()
      }
    ])({});

    assert.deepEqual(called, [1, 2, 3])
  });

  it('should throw if next() is called multiple times', () => {
    var err;
    try {
      compose([
        (ctx, next) => {
          next();
          next();
        }
      ])({});
    } catch (e) {
      err = e;
    }
    assert(/multiple times/.test(err.message));
  });

  it('should return a valid middleware', () => {
    var val = 0
    compose([
      compose([
        (ctx, next) => {
          val++
          return next()
        },
        (ctx, next) => {
          val++
          return next()
        }
      ]),
      (ctx, next) => {
        val++
        return next()
      }
    ])({});
    assert.equal(val, 3);
  });

  it('should return last return value', () => {
    var stack = [];

    stack.push((context, next) => {
      var val = next();
      assert.equal(val, 2);
      return 1;
    });

    stack.push((context, next) => {
      var val = next();
      assert.equal(val, 0);
      return 2;
    });
    var next = () => 0;
    var val = compose(stack)({}, next);
    assert.equal(val, 1);
  });

  it('should not affect the original middleware array', () => {
    const middleware = [];
    const fn1 = (ctx, next) => {
      next();
    };
    middleware.push(fn1);

    for (const fn of middleware) {
      assert.equal(fn, fn1);
    }

    compose(middleware);

    for (const fn of middleware) {
      assert.equal(fn, fn1);
    }
  });

  it('should not get stuck on the passed in next', () => {
    const middleware = [(ctx, next) => {
      ctx.middleware++;
      return next();
    }];
    const ctx = {
      middleware: 0,
      next: 0
    };

    compose(middleware)(ctx, (ctx, next) => {
      ctx.next++;
      return next();
    });
    assert.deepEqual(ctx, { middleware: 1, next: 1 });
  });
});

process.exit(test.run(console.DEBUG));
