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
  describe('#fromResolvable', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.fromResolvable(res => res('Hello World'));
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should succeed with the given value.', (done) => {
      const single = Single.fromResolvable(res => res('Hello World'));

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal error if the given value is not a function', (done) => {
      const single = Single.fromResolvable();

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
  });
});
