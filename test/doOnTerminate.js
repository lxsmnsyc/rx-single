/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#doOnTerminate', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.just('Hello').doOnTerminate(() => {});
    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should return the same instance if the method received a non-function parameter.', () => {
    const source = Single.just('Hello');
    const single = source.doOnTerminate();
    assert(source === single);
  });
  /**
   *
   */
  it('should call the given function on success.', (done) => {
    let called;
    const source = Single.just('Hello');
    const single = source.doOnTerminate(() => { called = true; });
    single.subscribe(
      () => called && done(),
      () => done(false),
    );
  });
  /**
   *
   */
  it('should call the given function on error.', (done) => {
    let called;
    const source = Single.error(new Error('Hello'));
    const single = source.doOnTerminate(() => { called = true; });
    single.subscribe(
      () => done(false),
      () => called && done(),
    );
  });
});
