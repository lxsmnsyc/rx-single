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
          (x) => { flag = x === 'Hello World'; },
          done,
        );
        setTimeout(() => {
          single.subscribe(
            x => (flag && x === 'Hello World' ? done() : done(x)),
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
      const single = Single.error('Hello World').delay(100).cache();

      setTimeout(() => {
        single.subscribe(
          done,
          (x) => { flag = x === 'Hello World'; },
        );

        setTimeout(() => {
          single.subscribe(
            done,
            x => (flag && x === 'Hello World' ? done() : done(x)),
          );
        }, 100);
      }, 200);
    });
  });
});
