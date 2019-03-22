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
  describe('#toPromise', () => {
    /**
     *
     */
    it('should create a Promise', () => {
      const single = Single.just('Hello').toPromise();
      assert(single instanceof Promise);
    });
  });
});
