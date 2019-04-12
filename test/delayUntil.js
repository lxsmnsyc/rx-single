/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#delayUntil', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.just('Hello').delayUntil(Single.timer(100));
    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should return the same instance if the provided value is not a Single.', () => {
    const source = Single.just('Hello');
    const single = source.delayUntil();
    assert(source === single);
  });
  /**
   *
   */
  it('should signal success with the given value.', (done) => {
    const single = Single.just('Hello').delayUntil(Single.timer(100));
    single.subscribe(
      x => (x === 'Hello' ? done() : done(false)),
      done,
    );
  });
  /**
   *
   */
  it('should signal error with the given value.', (done) => {
    const single = Single.error(new Error('Hello')).delayUntil(Single.timer(100));
    single.subscribe(
      done,
      () => done(),
    );
  });
  /**
   *
   */
  it('should signal error if other Single signals error.', (done) => {
    const single = Single.error(new Error('World')).delayUntil(Single.error(new Error('Hello')));
    single.subscribe(
      done,
      () => done(),
    );
  });
  /**
   *
   */
  it('should not signal success if cancelled.', (done) => {
    const source = Single.just('Hello').delayUntil(Single.timer(100));
    const controller = source.subscribe(
      () => done(false),
      () => done(false),
    );

    controller.cancel();
    if (controller.cancelled) {
      done();
    }
  });
  /**
   *
   */
  it('should not signal error if cancelled.', (done) => {
    const source = Single.error(new Error('Hello')).delayUntil(Single.timer(100));
    const controller = source.subscribe(
      () => done(false),
      () => done(false),
    );

    controller.cancel();
    if (controller.cancelled) {
      done();
    }
  });
});
