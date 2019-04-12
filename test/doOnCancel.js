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
  describe('#doOnCancel', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').doOnCancel(() => {});
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the method received a non-function parameter.', () => {
      const source = Single.just('Hello');
      const single = source.doOnCancel();
      assert(source === single);
    });
    /**
     *
     */
    it('should signal the success value then fire cancel callback.', (done) => {
      let called;
      const source = Single.just('Hello');
      const single = source.doOnCancel(() => called && done());

      const controller = single.subscribe(
        () => { called = true; },
        done,
      );
      controller.cancel();
    });
    /**
     *
     */
    it('should signal the error value then fire cancel callback.', (done) => {
      let called;
      const source = Single.error(new Error('Hello'));
      const single = source.doOnCancel(() => called && done());

      const controller = single.subscribe(
        done,
        () => { called = true; },
      );
      controller.cancel();
    });
    /**
     *
     */
    it('should call the given function on cancel.', (done) => {
      const source = Single.just('Hello').delay(100);
      const single = source.doOnCancel(() => done());

      const controller = single.subscribe(
        done,
        done,
      );
      controller.cancel();
    });
  });
});
