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
  describe('#doOnSuccess', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').doOnSuccess(() => {});
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
});
