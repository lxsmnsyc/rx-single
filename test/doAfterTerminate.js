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
  describe('#doAfterTerminate', () => {
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
      const single = source.doAfterTerminate();
      assert(source === single);
    });
    /**
     *
     */
    it('should call the given function after success.', (done) => {
      let called;
      const source = Single.just('Hello');
      const single = source.doAfterTerminate(() => called && done());
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
      const single = source.doAfterTerminate(() => called && done());
      single.subscribe(
        () => done(false),
        () => { called = true; },
      );
    });
  });
});
