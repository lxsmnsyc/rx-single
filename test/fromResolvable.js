/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#fromResolvable', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.fromResolvable(res => res('Hello World'));
    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should succeed with the given value.', (done) => {
    const single = Single.fromResolvable(res => res('Hello World'));

    single.subscribe(
      x => (x === 'Hello World' ? done() : done(false)),
      done,
    );
  });
  /**
   *
   */
  it('should error with the given error.', (done) => {
    const single = Single.fromResolvable((res, rej) => rej(new Error('Hello World')));

    single.subscribe(
      done,
      () => done(),
    );
  });
  /**
   *
   */
  it('should signal error if the given value is not a function', (done) => {
    const single = Single.fromResolvable();

    single.subscribe(
      () => done(false),
      () => done(),
    );
  });
});
