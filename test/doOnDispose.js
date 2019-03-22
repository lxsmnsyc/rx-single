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
