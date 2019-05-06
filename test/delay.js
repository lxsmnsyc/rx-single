/* eslint-disable no-undef */
import assert from 'assert';
import Scheduler from 'rx-scheduler';
import Single from '../src/single';

/**
 *
 */
describe('#delay', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.just('Hello').delay(100);
    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should return the same instance if the amount is not a number.', () => {
    const source = Single.just('Hello');
    const single = source.delay();
    assert(source === single);
  });
  /**
   *
   */
  it('should signal success with the given value.', (done) => {
    const single = Single.just('Hello').delay(100);
    single.subscribe(
      x => (x === 'Hello' ? done() : done(false)),
      done,
    );
  });
  /**
   *
   */
  it('should signal error with the given value.', (done) => {
    const single = Single.error(new Error('Hello')).delay(100);
    single.subscribe(
      done,
      () => done(),
    );
  });
  /**
   *
   */
  it('should not signal success if cancelled.', (done) => {
    const source = Single.just('Hello').delay(100);
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
    const source = Single.error(new Error('Hello')).delay(100, Scheduler.current, true);
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
