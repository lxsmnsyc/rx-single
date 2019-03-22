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
  describe('#never', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.never();
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should not signal.', () => {
      const single = Single.never();
      single.subscribe(
        () => done(false),
        () => done(false),
      );
    });
    /**
     *
     */
    it('should never be disposable.', () => {
      const single = Single.never();
      const disposable = single.subscribe();
      disposable.dispose();
      assert(!disposable.isDisposed());
    });
  });
});
