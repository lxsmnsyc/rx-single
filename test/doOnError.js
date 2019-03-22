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
      const source = Single.error('Hello');
      const single = source.doOnError(() => { called = true; });
      single.subscribe(
        () => done(false),
        () => called && done(),
      );
    });
  });
});
