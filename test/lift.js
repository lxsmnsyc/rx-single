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
  describe('#lift', () => {
    /**
     *
     */
    it('should return the same instance if no function is provided', () => {
      const source = Single.just('Hello');
      const single = source.lift();

      assert(source === single);
    });
    /**
     *
     */
    it('should signal an error if the lift operator returned a non-Observer', (done) => {
      const single = Single.just('Hello').lift(() => {});

      single.subscribe(
        () => done(false),
        () => done(),
      );
    });
    /**
     *
     */
    it('should subscribe successfully', (done) => {
      const single = Single.just('Hello').lift(observer => ({ onSubscribe: observer.onSubscribe, onSuccess: observer.onSuccess }));

      single.subscribe(
        () => done(),
      );
    });
  });
});
