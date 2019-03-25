/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('Single', () => {
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
      const source = Single.error(new Error('Hello'));
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
});
