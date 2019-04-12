/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#retry', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.error(new Error('Hello')).retry(x => x === 3);

    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should signal a success if no error', (done) => {
    const single = Single.just('Hello').retry(x => x === 3);

    single.subscribe(
      () => done(),
      () => done(false),
    );
  });
  /**
   *
   */
  it('should retry if there is an error and if it passes the predicate', (done) => {
    let retried;
    const single = Single.error(new Error('Hello')).retry((x) => {
      if (x === 2) {
        retried = true;
      }
      return x < 3;
    });

    single.subscribe(
      () => done(false),
      () => retried && done(),
    );
  });
  /**
   *
   */
  it('should signal an error if predicate is false', (done) => {
    const single = Single.error(new Error('Hello')).retry(x => x === 3);

    single.subscribe(
      () => done(false),
      () => done(),
    );
  });
});
