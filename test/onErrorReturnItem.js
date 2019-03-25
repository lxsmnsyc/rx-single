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
  describe('#onErrorReturnItem', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.error(new Error('Hello')).onErrorReturnItem('World');
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if parameter passed is not a Single or a function', () => {
      const source = Single.error(new Error('Hello'));
      const single = source.onErrorReturnItem();
      assert(single === source);
    });
    /**
     *
     */
    it('should emit the given item in case of error', (done) => {
      const single = Single.error(new Error('Hello')).onErrorReturnItem('World');

      single.subscribe(
        x => (x === 'World' ? done() : done(false)),
        done,
      );
    });
  });
});
