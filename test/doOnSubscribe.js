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
  describe('#doOnSubscribe', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').doOnSubscribe(() => {});
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if no function is passed', () => {
      const source = Single.just('Hello');
      const single = source.doOnSubscribe();
      assert(source === single);
    });
    /**
     *
     */
    it('should be called before actual subscription.', (done) => {
      let called;
      const single = Single.just('Hello').doOnSubscribe(() => { called = true; });
      single.subscribeWith({
        onSubscribe() {
          if (called) {
            done();
          } else {
            done(false);
          }
        },
      });
    });
  });
});
