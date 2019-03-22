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
  describe('#map', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').map(x => `${x} World`);
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should succeed with the given value.', (done) => {
      const single = Single.just('Hello').map(x => `${x} World`);

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });
    /**
     *
     */
    it('should signal an error if the mapper throws an error', (done) => {
      const single = Single.just('Hello').map(() => {
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
    it('should signal an error if the mapper throws an error', (done) => {
      const single = Single.just('Hello').map(() => undefined);

      single.subscribe(
        () => done(false),
        e => (e instanceof Error ? done() : done(false)),
      );
    });
    /**
     *
     */
    it('should retain the value if no function is supplied.', (done) => {
      const single = Single.just('Hello').map();

      single.subscribe(
        x => (x === 'Hello' ? done() : done(false)),
        e => done(e),
      );
    });
  });
});
