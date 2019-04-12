/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#doAfterSuccess', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.just('Hello').doAfterSuccess(x => console.log(`after success: ${x}`));
    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should return the same instance if the method received a non-function parameter.', () => {
    const source = Single.just('Hello');
    const single = source.doAfterSuccess();
    assert(source === single);
  });
  /**
   *
   */
  it('should call the given function after success.', (done) => {
    let called;
    const source = Single.just('Hello');
    const single = source.doAfterSuccess(() => called && done());
    single.subscribe(
      () => { called = true; },
      () => done(false),
    );
  });
});
