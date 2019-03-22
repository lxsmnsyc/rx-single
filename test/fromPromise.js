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
  describe('#fromPromise', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.fromPromise(new Promise(res => res('Hello World')));
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should succeed with the given value.', (done) => {
      const single = Single.fromPromise(new Promise(res => res('Hello World')));

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });

    /**
     *
     */
    it('should signal error if the given value is not Promise like', (done) => {
      const single = Single.fromPromise();

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
  });
});
