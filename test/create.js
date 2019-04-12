/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#create', () => {
  /**
   *
   */
  it('should create a Single', () => {
    const single = Single.create(e => e.onSuccess('Hello World'));

    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should signal error if the create received a non-function', (done) => {
    const single = Single.create();

    single.subscribe(
      () => done(false),
      () => done(),
    );
  });
  /**
   *
   */
  it('should signal error if the emitter signals success with undefined value.', (done) => {
    const single = Single.create(e => e.onSuccess() || e.onSuccess());

    single.subscribe(
      () => done(false),
      () => done(),
    );
  });
  /**
   *
   */
  it('should signal error if the emitter signals error with undefined value.', (done) => {
    const single = Single.create(e => e.onError() || e.onError());

    single.subscribe(
      () => done(false),
      () => done(),
    );
  });
  /**
   *
   */
  it('should be cancel successfully if emitter is cancel before any signal.', (done) => {
    const single = Single.create((e) => {
      setTimeout(() => e.onSuccess(true), 100);
    });

    const controller = single.subscribe(
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
  it('should signal error if subscriber throws an error.', (done) => {
    const single = Single.create(() => {
      throw new Error('Expected');
    });

    single.subscribe(
      () => done(false),
      e => (e instanceof Error ? done() : done(e)),
    );
  });
});
