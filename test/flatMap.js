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
  describe('#flatMap', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello').flatMap(x => Single.just(`${x} World`));

      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if the method received a non-function parameter.', () => {
      const source = Single.just('Hello');
      const single = source.flatMap();
      assert(source === single);
    });
    /**
     *
     */
    it('should signal error if mapper returns a non-Single', (done) => {
      const single = Single.just('Hello').flatMap(() => {});

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should signal success of the returned Single', (done) => {
      const single = Single.just('Hello').flatMap(x => Single.just(`${x} World`));

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        done,
      );
    });
  });
});
