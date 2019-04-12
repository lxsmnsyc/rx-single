/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#timer', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.timer(100);
    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should signal error if amount is not a number.', (done) => {
    const single = Single.timer();

    single.subscribe(
      () => done(false),
      () => done(),
    );
  });
  /**
   *
   */
  it('should signal success 0', (done) => {
    const single = Single.timer(100);
    single.subscribe(
      x => (x === 0 ? done() : done(false)),
      () => done(false),
    );
  });
  /**
   *
   */
  it('should not signal success if cancelled.', (done) => {
    const single = Single.timer(100);
    const controller = single.subscribe(
      () => done(false),
      () => done(false),
    );


    controller.cancel();
    if (controller.cancelled) {
      done();
    }
  });
});
