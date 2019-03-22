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
  describe('#fromCallable', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.fromCallable(() => 'Hello World');
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should succeed with the given value.', (done) => {
      const single = Single.fromCallable(() => 'Hello World');

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal an error if the callable throws an error.', (done) => {
      const single = Single.fromCallable(() => {
        throw new Error('Expected');
      });

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should signal an error if the callable returns a rejected Promise.', (done) => {
      const single = Single.fromCallable(() => new Promise((x, y) => y(new Error('Expected'))));

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should signal an error if the callable is not a function', (done) => {
      const single = Single.fromCallable();

      single.subscribe(
        () => done(false),
        e => (e === 'Single.fromCallable: callable received is not a function.' ? done() : done(false)),
      );
    });
  });
});
