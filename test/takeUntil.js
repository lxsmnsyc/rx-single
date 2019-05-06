/* eslint-disable no-undef */
import assert from 'assert';
import Scheduler from 'rx-scheduler';
import Single from '../src/single';

/**
 *
 */
describe('#takeUntil', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.just('Hello').takeUntil(Single.timer(100));

    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should return the same instance if no other Single is provided', () => {
    const source = Single.just('Hello');
    const single = source.takeUntil();

    assert(source === single);
  });
  /**
   *
   */
  it('should signal success if other Single has not emitted a success signal', (done) => {
    const single = Single.just('Hello').takeUntil(Single.timer(100));

    single.subscribe(
      x => (x === 'Hello' ? done() : done(false)),
      done,
    );
  });
  /**
   *
   */
  it('should signal success if other Single has not emitted an error signal', (done) => {
    const single = Single.just('Hello').takeUntil(Single.error(new Error('World')).delay(100, Scheduler.current, true));

    single.subscribe(
      x => (x === 'Hello' ? done() : done(false)),
      done,
    );
  });
  /**
   *
   */
  it('should signal error if other Single has emitted a success signal', (done) => {
    const single = Single.just('Hello').delay(100).takeUntil(Single.just('World'));

    single.subscribe(
      done,
      () => done(),
    );
  });
  /**
   *
   */
  it('should signal error if other Single has emitted an error signal', (done) => {
    const single = Single.just('Hello').delay(100).takeUntil(Single.error(new Error('World')));

    single.subscribe(
      done,
      () => done(),
    );
  });
  /**
   *
   */
  it('should signal error if source signals error, nonetheless', (done) => {
    const single = Single.error(new Error('Hello')).takeUntil(Single.timer(100));

    single.subscribe(
      done,
      () => done(),
    );
  });
});
