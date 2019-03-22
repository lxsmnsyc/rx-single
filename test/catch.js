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
  describe('#catch', () => {
    /**
     *
     */
    it('should create a Promise', () => {
      const single = Single.just('Hello').catch(x => x);
      assert(single instanceof Promise);
    });
  });
});
