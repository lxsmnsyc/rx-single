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
  describe('#delay', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').delay(100);
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the amount is not a number.', () => {
      const source = Single.just('Hello');
      const single = source.delay();
      assert(source === single);
    });
    /**
     *
     */
    it('should signal success with the given value.', (done) => {
      const single = Single.just('Hello').delay(100);
      single.subscribe(
        x => (x === 'Hello' ? done() : done(false)),
        x => done(x),
      );
    });
    /**
     *
     */
    it('should signal error with the given value.', (done) => {
      const single = Single.error(new Error('Hello')).delay(100);
      single.subscribe(
        x => done(x),
        x => (x === 'Hello' ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should not signal success if disposed.', (done) => {
      const source = Single.just('Hello').delay(100);
      const disposable = source.subscribe(
        () => done(false),
        () => done(false),
      );

      disposable.dispose();
      if (disposable.isDisposed()) {
        done();
      }
    });
    /**
     *
     */
    it('should not signal error if disposed.', (done) => {
      const source = Single.error(new Error('Hello')).delay(100);
      const disposable = source.subscribe(
        () => done(false),
        () => done(false),
      );

      disposable.dispose();
      if (disposable.isDisposed()) {
        done();
      }
    });
  });
});
