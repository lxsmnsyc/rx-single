/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#just', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.just('Hello World');

    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should succeed with the given value.', (done) => {
    const single = Single.just('Hello World');

    single.subscribe(
      x => (x === 'Hello World' ? done() : done(false)),
      done,
    );
  });
  /**
   *
   */
  it('should emit error if value is undefined.', (done) => {
    const single = Single.just();

    single.subscribe(
      () => done(false),
      e => (typeof e !== 'undefined' ? done() : done(false)),
    );
  });
});
