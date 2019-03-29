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
  describe('#doOnAbort', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').doOnAbort(() => {});
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the method received a non-function parameter.', () => {
      const source = Single.just('Hello');
      const single = source.doOnAbort();
      assert(source === single);
    });
    /**
     *
     */
    it('should signal the success value then fire abort callback.', (done) => {
      let called;
      const source = Single.just('Hello');
      const single = source.doOnAbort(() => called && done());

      const controller = single.subscribe(
        () => { called = true; },
        done,
      );
      controller.abort();
    });
    /**
     *
     */
    it('should signal the error value then fire abort callback.', (done) => {
      let called;
      const source = Single.error(new Error('Hello'));
      const single = source.doOnAbort(() => called && done());

      const controller = single.subscribe(
        done,
        () => { called = true; },
      );
      controller.abort();
    });
    /**
     *
     */
    it('should call the given function on abort.', (done) => {
      const source = Single.just('Hello').delay(100);
      const single = source.doOnAbort(() => done());

      const controller = single.subscribe(
        done,
        done,
      );
      controller.abort();
    });
  });
});
