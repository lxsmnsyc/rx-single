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
  describe('#error', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.error(new Error('Hello World'));

      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should error with the given value.', (done) => {
      const single = Single.error(new Error('Hello World'));

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should error with the a message if the given value is undefined', (done) => {
      const single = Single.error();

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should error with the a message if the callable returned undefined', (done) => {
      const single = Single.error(() => {});

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should error if the callable throws an error.', (done) => {
      const single = Single.error(() => {
        throw new Error('Expected');
      });

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
  });
});
