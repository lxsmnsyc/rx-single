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
  describe('#cache', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.just('Hello World').cache();
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should signal cached success value', (done) => {
      let flag;
      const single = Single.just('Hello World').delay(100).cache();

      setTimeout(() => {
        single.subscribe(
          () => { flag = true; },
          done,
        );
        setTimeout(() => {
          single.subscribe(
            x => (flag ? done() : done(x)),
            done,
          );
        }, 100);
      }, 200);
    });
    /**
     *
     */
    it('should signal cached error value', (done) => {
      let flag;
      const single = Single.error(new Error('Hello')).delay(100).cache();

      setTimeout(() => {
        single.subscribe(
          done,
          () => { flag = true; },
        );

        setTimeout(() => {
          single.subscribe(
            done,
            e => (flag && e instanceof Error ? done() : done(e)),
          );
        }, 100);
      }, 200);
    });
  });
});
