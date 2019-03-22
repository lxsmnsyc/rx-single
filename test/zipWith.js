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
  describe('#zipWith', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').zipWith(Single.just('World'));
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the other parameter is non-Single', () => {
      const source = Single.just('Hello');
      const single = source.zipWith();
      assert(source === single);
    });
    /**
     *
     */
    it('should signal an error if the zipper returns undefined', (done) => {
      const single = Single.just('Hello').zipWith(Single.just('World'), () => undefined);

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should signal an error if the zipper returns undefined', (done) => {
      const single = Single.just('Hello').delay(100).zipWith(Single.just('World'), () => undefined);

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should signal success with an array (no zipper function).', (done) => {
      const single = Single.just('Hello').delay(100).zipWith(Single.just('World'));
      single.subscribe(
        x => (x instanceof Array ? done() : done(false)),
        done,
      );
    });
    /**
     *
     */
    it('should signal success with an array with the correct values (no zipper function).', (done) => {
      const single = Single.just('Hello').zipWith(Single.just('World'));
      single.subscribe(
        x => (x[0] === 'Hello' && x[1] === 'World' ? done() : done(false)),
        done,
      );
    });
    /**
     *
     */
    it('should signal error if source throws error.', (done) => {
      const source = Single.error('Hello').zipWith(Single.just('World'));
      source.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should signal error if other Single throws error.', (done) => {
      const source = Single.just('Hello').zipWith(Single.error('World'));
      source.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should not signal success if disposed.', (done) => {
      const source = Single.just('Hello').delay(100).zipWith(Single.just('World'));
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