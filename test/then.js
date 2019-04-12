/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#then', () => {
  /**
   *
   */
  it('should create a Promise', () => {
    const single = Single.just('Hello').then(x => x, x => x);
    assert(single instanceof Promise);
  });
});
