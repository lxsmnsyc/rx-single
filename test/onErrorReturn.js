/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#onErrorReturn', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.error(new Error('Hello')).onErrorReturn(() => 'World');
    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should return the same instance if parameter passed is not a Single or a function', () => {
    const source = Single.error(new Error('Hello'));
    const single = source.onErrorReturn();
    assert(single === source);
  });
  /**
   *
   */
  it('should emit the supplied item by the given function in case of error', (done) => {
    const single = Single.error(new Error('Hello')).onErrorReturn(() => 'World');

    single.subscribe(
      () => done(),
      done,
    );
  });
  /**
   *
   */
  it('should emit error if provide function throws error.', (done) => {
    const single = Single.error(new Error('Hello')).onErrorReturn(() => { throw new Error('Ooops'); });
    single.subscribe(
      done,
      () => done(),
    );
  });
  /**
   *
   */
  it('should emit error if provide function returns undefined.', (done) => {
    const single = Single.error(new Error('Hello')).onErrorReturn(() => {});
    single.subscribe(
      done,
      () => done(),
    );
  });
});
