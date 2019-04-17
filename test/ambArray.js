/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#ambArray', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.ambArray([Single.just('First'), Single.just('Second')]);
    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should signal success from the earliest source.', (done) => {
    const single = Single.ambArray([Single.just('Hello'), Single.timer(100)]);
    single.subscribe(
      () => done(),
      done,
    );
  });
  /**
   *
   */
  it('should signal error from the earliest source.', (done) => {
    const single = Single.ambArray([Single.error(new Error('Hello')), Single.timer(100)]);
    single.subscribe(
      done,
      () => done(),
    );
  });
  /**
   *
   */
  it('should signal error if one of the source is non-Single.', (done) => {
    const single = Single.ambArray(['Hello', Single.timer(100)]);
    single.subscribe(
      done,
      e => (e instanceof Error ? done() : done(e)),
    );
  });
  /**
   *
   */
  it('should signal error if given argument is not Iterable', (done) => {
    const single = Single.ambArray();
    single.subscribe(
      done,
      e => (e instanceof Error ? done() : done(e)),
    );
  });
});
