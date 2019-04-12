/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#merge', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.merge(Single.just(Single.just('Hello')));

    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should signal error if no source is provided', (done) => {
    const single = Single.merge();

    single.subscribe(
      () => done(false),
      () => done(),
    );
  });
  /**
   *
   */
  it('should signal error if source emitted a non-Single', (done) => {
    const single = Single.merge(Single.just('Hello'));

    single.subscribe(
      () => done(false),
      () => done(),
    );
  });
  /**
   *
   */
  it('should signal success of the signaled Single', (done) => {
    const single = Single.merge(Single.just(Single.just('Hello')));

    single.subscribe(
      x => (x === 'Hello' ? done() : done(false)),
      () => done(false),
    );
  });
});
