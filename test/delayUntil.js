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
  describe('#delayUntil', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').delayUntil(Single.timer(100));
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the provided value is not a Single.', () => {
      const source = Single.just('Hello');
      const single = source.delayUntil();
      assert(source === single);
    });
    /**
     *
     */
    it('should signal success with the given value.', (done) => {
      const single = Single.just('Hello').delayUntil(Single.timer(100));
      single.subscribe(
        x => (x === 'Hello' ? done() : done(false)),
        x => done(x),
      );
    });
    /**
     *
     */
    it('should signal error with the given value.', (done) => {
      const single = Single.error('Hello').delayUntil(Single.timer(100));
      single.subscribe(
        x => done(x),
        x => (x === 'Hello' ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should signal error if other Single signals error.', (done) => {
      const single = Single.error('World').delayUntil(Single.error('Hello'));
      single.subscribe(
        x => done(x),
        x => (x === 'Hello' ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should not signal success if disposed.', (done) => {
      const source = Single.just('Hello').delayUntil(Single.timer(100));
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
      const source = Single.error('Hello').delayUntil(Single.timer(100));
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
