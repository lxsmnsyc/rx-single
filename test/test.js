/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';
import { SimpleDisposable } from '../src/internal/utils';

/**
 *
 */
describe('Single', () => {
  /**
   *
   */
  describe('#create', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.create(e => e.onSuccess('Hello World'));

      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should signal error if the create received a non-function', (done) => {
      const single = Single.create();

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should signal error if the emitter signals success with undefined value.', (done) => {
      const single = Single.create(e => e.onSuccess() || e.onSuccess());

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should signal error if the emitter signals error with undefined value.', (done) => {
      const single = Single.create(e => e.onError() || e.onError());

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should be disposed successfully if emitter is disposed before any signal.', (done) => {
      const single = Single.create((e) => {
        setTimeout(e.onSuccess, 100, true);
        e.setDisposable(new SimpleDisposable());
        e.dispose();
      });

      const disposable = single.subscribe(
        () => done(false),
        () => done(false),
      );
      if (disposable.isDisposed()) {
        done();
      }
    });
    /**
     *
     */
    it('should signal error if subscriber throws an error.', (done) => {
      const single = Single.create(() => {
        throw new Error('Expected');
      });

      single.subscribe(
        () => done(false),
        x => (x === 'Expected' ? done() : done(false)),
      );
    });
  });
  /**
   *
   */
  describe('#contains', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello World').contains('Hello World');
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the compared value is undefined', () => {
      const source = Single.just('Hello');
      const single = source.contains();
      assert(source === single);
    });
    /**
     *
     */
    it('should signal true if the success value and the compared value are both equal.', (done) => {
      const single = Single.just('Hello World').contains('Hello World');
      single.subscribe(
        x => (x ? done() : done(false)),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal false if the success value and the compared value are both equal.', (done) => {
      const single = Single.just('Hello').contains('Hello World');
      single.subscribe(
        x => (x ? done(false) : done()),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal an error if the comparer throws an error.', (done) => {
      const single = Single.just('Hello').contains('Hello World', () => {
        throw new Error('Expected');
      });

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
  });
  /**
   *
   */
  describe('#defer', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.defer(() => Single.just('Hello World'));

      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should succeed with the given value.', (done) => {
      const single = Single.defer(() => Single.just('Hello World'));

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal error if callable returns a non-Single', (done) => {
      const single = Single.defer(() => {});

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should signal error if callable throws an error', (done) => {
      const single = Single.defer(() => {
        throw new Error('Expected');
      });

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
  });
  /**
   *
   */
  describe('#delay', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').delay(100);
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the amount is not a number.', () => {
      const source = Single.just('Hello');
      const single = source.delay();
      assert(source === single);
    });
    /**
     *
     */
    it('should signal success with the given value.', (done) => {
      const single = Single.just('Hello').delay(100);
      single.subscribe(
        x => (x === 'Hello' ? done() : done(false)),
        x => done(x),
      );
    });
    /**
     *
     */
    it('should signal error with the given value.', (done) => {
      const single = Single.error('Hello').delay(100);
      single.subscribe(
        x => done(x),
        x => (x === 'Hello' ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should not signal success if disposed.', (done) => {
      const source = Single.just('Hello').delay(100);
      const disposable = source.subscribe(
        () => done(false),
        () => done(false),
      );

      disposable.dispose();
      if (disposable.isDisposed()) {
        done();
      }
    });
    /**
     *
     */
    it('should not signal error if disposed.', (done) => {
      const source = Single.error('Hello').delay(100);
      const disposable = source.subscribe(
        () => done(false),
        () => done(false),
      );

      disposable.dispose();
      if (disposable.isDisposed()) {
        done();
      }
    });
  });
  /**
   *
   */
  describe('#doAfterSuccess', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').doAfterSuccess(x => console.log(`after success: ${x}`));
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the method received a non-function parameter.', () => {
      const source = Single.just('Hello');
      const single = source.doAfterSuccess();
      assert(source === single);
    });
    /**
     *
     */
    it('should call the given function after success.', (done) => {
      let called;
      const source = Single.just('Hello');
      const single = source.doAfterSuccess(() => called && done());
      single.subscribe(
        () => { called = true; },
        () => done(false),
      );
    });
  });
  /**
   *
   */
  describe('#doFinally', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').doFinally(() => {});
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the method received a non-function parameter.', () => {
      const source = Single.just('Hello');
      const single = source.doFinally();
      assert(source === single);
    });
    /**
     *
     */
    it('should call the given function after success.', (done) => {
      let called;
      const source = Single.just('Hello');
      const single = source.doFinally(() => called && done());
      single.subscribe(
        () => { called = true; },
        () => done(false),
      );
    });
    /**
     *
     */
    it('should call the given function after error.', (done) => {
      let called;
      const source = Single.error('Hello');
      const single = source.doFinally(() => called && done());
      single.subscribe(
        () => done(false),
        () => { called = true; },
      );
    });
    /**
     *
     */
    it('should call the given function on dispose.', (done) => {
      const source = Single.timer(100);
      const single = source.doFinally(() => done());

      const disposable = single.subscribe(
        () => done(false),
        () => done(false),
      );
      disposable.dispose();
    });
  });
  /**
   *
   */
  describe('#doOnDispose', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').doOnDispose(() => {});
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the method received a non-function parameter.', () => {
      const source = Single.just('Hello');
      const single = source.doOnDispose();
      assert(source === single);
    });
    /**
     *
     */
    it('should call the given function on dispose.', (done) => {
      const source = Single.just('Hello');
      const single = source.doOnDispose(() => done());

      const disposable = single.subscribe(
        () => done(false),
        () => done(false),
      );
      disposable.dispose();
    });
  });
  /**
   *
   */
  describe('#doOnError', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').doOnError(() => {});
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the method received a non-function parameter.', () => {
      const source = Single.just('Hello');
      const single = source.doOnError();
      assert(source === single);
    });
    /**
     *
     */
    it('should call the given function on error.', (done) => {
      let called;
      const source = Single.just('Hello');
      const single = source.doOnError(() => { called = true; });
      single.subscribe(
        () => done(false),
        () => called && done(),
      );
    });
  });

  /**
   *
   */
  describe('#doOnEvent', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').doOnEvent(() => {});
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the method received a non-function parameter.', () => {
      const source = Single.just('Hello');
      const single = source.doOnEvent();
      assert(source === single);
    });
    /**
     *
     */
    it('should call the given function on success.', (done) => {
      let called;
      const source = Single.just('Hello');
      const single = source.doOnEvent(() => { called = true; });
      single.subscribe(
        () => called && done(),
        () => done(false),
      );
    });
    /**
     *
     */
    it('should call the given function on error.', (done) => {
      let called;
      const source = Single.just('Hello');
      const single = source.doOnEvent(() => { called = true; });
      single.subscribe(
        () => done(false),
        () => called && done(),
      );
    });
  });
  /**
   *
   */
  describe('#doOnSuccess', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').doAfterSuccess(() => {});
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the method received a non-function parameter.', () => {
      const source = Single.just('Hello');
      const single = source.doOnSuccess();
      assert(source === single);
    });
    /**
     *
     */
    it('should call the given function on success.', (done) => {
      let called;
      const source = Single.just('Hello');
      const single = source.doOnSuccess(() => { called = true; });
      single.subscribe(
        () => called && done(),
        () => done(false),
      );
    });
  });
  /**
   *
   */
  describe('#error', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.error('Hello World');

      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should error with the given value.', (done) => {
      const single = Single.error('Hello World');

      single.subscribe(
        () => done(false),
        e => (typeof e !== 'undefined' ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should error with the a message if the given value is undefined', (done) => {
      const single = Single.error();

      single.subscribe(
        () => done(false),
        e => (e === 'Single.error received an undefined value.' ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should error with the a message if the callable returned undefined', (done) => {
      const single = Single.error(() => {});

      single.subscribe(
        () => done(false),
        e => (e === 'Single.error: Error supplier returned an undefined value.' ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should error if the callable throws an error.', (done) => {
      const single = Single.error(() => {
        throw new Error('Expected');
      });

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
  });
  /**
   *
   */
  describe('#fromCallable', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.fromCallable(() => 'Hello World');
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should succeed with the given value.', (done) => {
      const single = Single.fromCallable(() => 'Hello World');

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal an error if the callable throws an error.', (done) => {
      const single = Single.fromCallable(() => {
        throw new Error('Expected');
      });

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should signal an error if the callable returns a rejected Promise.', (done) => {
      const single = Single.fromCallable(() => new Promise((x, y) => y(new Error('Expected'))));

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should signal an error if the callable is not a function', (done) => {
      const single = Single.fromCallable();

      single.subscribe(
        () => done(false),
        e => (e === 'Single.fromCallable: callable received is not a function.' ? done() : done(false)),
      );
    });
  });
  /**
   *
   */
  describe('#fromPromise', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.fromPromise(new Promise(res => res('Hello World')));
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should succeed with the given value.', (done) => {
      const single = Single.fromPromise(new Promise(res => res('Hello World')));

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });

    /**
     *
     */
    it('should signal error if the given value is not Promise like', (done) => {
      const single = Single.fromPromise();

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
  });
  /**
   *
   */
  describe('#fromResolvable', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.fromResolvable(res => res('Hello World'));
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should succeed with the given value.', (done) => {
      const single = Single.fromResolvable(res => res('Hello World'));

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal error if the given value is not a function', (done) => {
      const single = Single.fromResolvable();

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
  });
  /**
   *
   */
  describe('#just', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello World');

      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should succeed with the given value.', (done) => {
      const single = Single.just('Hello World');

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should emit error if value is undefined.', (done) => {
      const single = Single.just();

      single.subscribe(
        () => done(false),
        e => (typeof e !== 'undefined' ? done() : done(false)),
      );
    });
  });
  /**
   *
   */
  describe('#map', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').map(x => `${x} World`);
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should succeed with the given value.', (done) => {
      const single = Single.just('Hello').map(x => `${x} World`);

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal an error if the mapper throws an error', (done) => {
      const single = Single.just('Hello').map(() => {
        throw new Error('Expected');
      });

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should retain the value if no function is supplied.', (done) => {
      const single = Single.just('Hello').map();

      single.subscribe(
        x => (x === 'Hello' ? done() : done(false)),
        e => done(e),
      );
    });
  });
  /**
   *
   */
  describe('#never', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.never();
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should not signal.', () => {
      const single = Single.never();
      single.subscribe(
        () => done(false),
        () => done(false),
      );
    });
  });
  /**
   *
   */
  describe('#timer', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.timer(100);
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should signal error if amount is not a number.', (done) => {
      const single = Single.timer();

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should signal success 0', (done) => {
      const single = Single.timer(100);
      single.subscribe(
        x => (x === 0 ? done() : done(false)),
        () => done(false),
      );
    });
    /**
     *
     */
    it('should not signal success if disposed.', (done) => {
      const single = Single.timer(100);
      const disposable = single.subscribe(
        () => done(false),
        () => done(false),
      );


      disposable.dispose();
      if (disposable.isDisposed()) {
        done();
      }
    });
  });
  /**
   *
   */
  describe('#toPromise', () => {
    /**
     *
     */
    it('should create a Promise', () => {
      const single = Single.just('Hello').toPromise();
      assert(single instanceof Promise);
    });
  });
  /**
   *
   */
  describe('#then', () => {
    /**
     *
     */
    it('should create a Promise', () => {
      const single = Single.just('Hello').then(x => x, x => x);
      assert(single instanceof Promise);
    });
  });
  /**
   *
   */
  describe('#catch', () => {
    /**
     *
     */
    it('should create a Promise', () => {
      const single = Single.just('Hello').catch(x => x);
      assert(single instanceof Promise);
    });
  });
});
