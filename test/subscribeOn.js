/* eslint-disable no-undef */
import assert from 'assert';
import Scheduler from 'rx-scheduler';
import Single from '../src/single';

describe('#subscribeOn', () => {
  it('should return a Single', () => {
    assert(Single.just('Hello World').subscribeOn(Scheduler.current));
  });
  it('should be synchronous with non-Scheduler', (done) => {
    let flag = false;

    const single = Single.just('Hello World').subscribeOn();

    single.subscribe(
      () => { flag = true; },
      done,
    );

    if (flag) {
      done();
    } else {
      done(false);
    }
  });
  it('should be synchronous with Scheduler.current', (done) => {
    let flag = false;

    const single = Single.just('Hello World').subscribeOn(Scheduler.current);

    single.subscribe(
      () => { flag = true; },
      done,
    );

    if (flag) {
      done();
    } else {
      done(false);
    }
  });
  it('should be asynchronous with Scheduler.tick', (done) => {
    let flag = false;

    const single = Single.just('Hello World').subscribeOn(Scheduler.tick);

    single.subscribe(
      () => { flag = true; },
      done,
    );

    process.nextTick(() => {
      if (flag) {
        done();
      } else {
        done(false);
      }
    });

    if (flag) {
      done(false);
    }
  });
  it('should be asynchronous with Scheduler.async', (done) => {
    let flag = false;

    const single = Single.just('Hello World').subscribeOn(Scheduler.async);

    single.subscribe(
      () => { flag = true; },
      done,
    );

    Promise.resolve().then(() => {
      if (flag) {
        done();
      } else {
        done(false);
      }
    });

    if (flag) {
      done(false);
    }
  });
  it('should be asynchronous with Scheduler.immediate', (done) => {
    let flag = false;

    const single = Single.just('Hello World').subscribeOn(Scheduler.immediate);

    single.subscribe(
      () => { flag = true; },
      done,
    );

    setImmediate(() => {
      if (flag) {
        done();
      } else {
        done(false);
      }
    });

    if (flag) {
      done(false);
    }
  });
  it('should be asynchronous with Scheduler.timeout', (done) => {
    let flag = false;

    const single = Single.error(new Error('Hello World')).subscribeOn(Scheduler.timeout);

    single.subscribe(
      done,
      () => { flag = true; },
    );

    setTimeout(() => {
      if (flag) {
        done();
      } else {
        done(false);
      }
    });

    if (flag) {
      done(false);
    }
  });
});
