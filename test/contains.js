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
  describe('#contains', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello World').contains('Hello World');
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the compared value is undefined', () => {
      const source = Single.just('Hello');
      const single = source.contains();
      assert(source === single);
    });
    /**
     *
     */
    it('should signal true if the success value and the compared value are both equal.', (done) => {
      const single = Single.just('Hello World').contains('Hello World');
      single.subscribe(
        x => (x ? done() : done(false)),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal false if the success value and the compared value are both equal.', (done) => {
      const single = Single.just('Hello').contains('Hello World');
      single.subscribe(
        x => (x ? done(false) : done()),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal an error if the comparer throws an error.', (done) => {
      const single = Single.just('Hello').contains('Hello World', () => {
        throw new Error('Expected');
      });

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
  });
});
