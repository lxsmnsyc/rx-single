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
    it('should signal the success value then fire dispose callback.', (done) => {
      let called;
      const source = Single.just('Hello');
      const single = source.doOnDispose(() => called && done());

      const disposable = single.subscribe(
        () => { called = true; },
        done,
      );
      disposable.dispose();
    });
    /**
     *
     */
    it('should signal the error value then fire dispose callback.', (done) => {
      let called;
      const source = Single.error(new Error('Hello'));
      const single = source.doOnDispose(() => called && done());

      const disposable = single.subscribe(
        done,
        () => { called = true; },
      );
      disposable.dispose();
    });
    /**
     *
     */
    it('should call the given function on dispose.', (done) => {
      const source = Single.just('Hello').delay(100);
      const single = source.doOnDispose(() => done());

      const disposable = single.subscribe(
        done,
        done,
      );
      disposable.dispose();
    });
  });
});
