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
  describe('#onErrorResumeNext', () => {
    /**
     *
     */
    it('should create a Single', () => {
      const single = Single.error('Hello').onErrorResumeNext(Single.just('World'));
      assert(single instanceof Single);
    });
    /**
     *
     */
    it('should return the same instance if parameter passed is not a Single or a function', () => {
      const source = Single.error('Hello');
      const single = source.onErrorResumeNext();
      assert(single === source);
    });
    /**
     *
     */
    it('should subscribe to the given Single', (done) => {
      const single = Single.error('Hello').onErrorResumeNext(Single.just('World'));
      single.subscribe(
        () => done(),
        done,
      );
    });
    /**
     *
     */
    it('should subscribe to the given Single-producing Function', (done) => {
      const single = Single.error('Hello').onErrorResumeNext(() => Single.just('World'));
      single.subscribe(
        () => done(),
        done,
      );
    });
    /**
     *
     */
    it('should emit error if provide function throws error.', (done) => {
      const single = Single.error('Hello').onErrorResumeNext(() => { throw new Error('Ooops'); });
      single.subscribe(
        done,
        () => done(),
      );
    });
    /**
     *
     */
    it('should emit error if provide function returns non-Single.', (done) => {
      const single = Single.error('Hello').onErrorResumeNext(() => {});
      single.subscribe(
        done,
        () => done(),
      );
    });
  });
});
