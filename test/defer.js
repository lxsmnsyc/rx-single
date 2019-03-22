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
  describe('#defer', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.defer(() => Single.just('Hello World'));

      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should succeed with the given value.', (done) => {
      const single = Single.defer(() => Single.just('Hello World'));

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal error if callable returns a non-Single', (done) => {
      const single = Single.defer(() => {});

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should signal error if callable throws an error', (done) => {
      const single = Single.defer(() => {
        throw new Error('Expected');
      });

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
  });
});
