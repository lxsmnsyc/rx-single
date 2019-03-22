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
  describe('#timeout', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').timeout(100);
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the amount is not a number.', () => {
      const source = Single.just('Hello');
      const single = source.timeout();
      assert(source === single);
    });
    /**
     *
     */
    it('should signal success with the given value.', (done) => {
      const single = Single.just('Hello').timeout(100);
      single.subscribe(
        x => (x === 'Hello' ? done() : done(false)),
        x => done(x),
      );
    });
    /**
     *
     */
    it('should signal error with the given value.', (done) => {
      const single = Single.error('Hello').timeout(100);
      single.subscribe(
        x => done(x),
        () => done(),
      );
    });
    /**
     *
     */
    it('should signal error if the Single does not emit item within the given timeout.', (done) => {
      const single = Single.timer(200).delay(100);
      single.subscribe(
        x => done(x),
        () => done(),
      );
    });
    /**
     *
     */
    it('should not signal success if disposed.', (done) => {
      const source = Single.timer(200).timeout(100);
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
      const source = Single.error('Hello').delay(200).timeout(100);
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
