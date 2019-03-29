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
  describe('#delaySubscription', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').delaySubscription(100);
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the amount is not a number.', () => {
      const source = Single.just('Hello');
      const single = source.delaySubscription();
      assert(source === single);
    });
    /**
     *
     */
    it('should signal success with the given value.', (done) => {
      const single = Single.just('Hello').delaySubscription(100);
      single.subscribe(
        x => (x === 'Hello' ? done() : done(false)),
        x => done(x),
      );
    });
    /**
     *
     */
    it('should signal error with the given value.', (done) => {
      const single = Single.error(new Error('Hello')).delaySubscription(100);
      single.subscribe(
        x => done(x),
        x => (x === 'Hello' ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should not signal success if aborted.', (done) => {
      const source = Single.just('Hello').delaySubscription(100);
      const controller = source.subscribe(
        () => done(false),
        () => done(false),
      );

      controller.abort();
      if (controller.signal.aborted) {
        done();
      }
    });
    /**
     *
     */
    it('should not signal error if aborted.', (done) => {
      const source = Single.error(new Error('Hello')).delaySubscription(100);
      const controller = source.subscribe(
        () => done(false),
        () => done(false),
      );

      controller.abort();
      if (controller.signal.aborted) {
        done();
      }
    });
  });
});
