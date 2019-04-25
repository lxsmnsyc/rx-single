/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
*
*/
describe('#zip', () => {
  /**
  *
  */
  it('should create a Single', () => {
    const single = Single.zip([Single.just('Hello'), Single.just('World')]);
    assert(single instanceof Single);
  });
  /**
  *
  */
  it('should signal error if sources is not iterable.', (done) => {
    const single = Single.zip();
    single.subscribe(
      () => done(false),
      () => done(),
    );
  });
  /**
  *
  */
  it('should signal error if source is empty iterable.', (done) => {
    const single = Single.zip([]);
    single.subscribe(
      () => done(false),
      () => done(),
    );
  });
  /**
   *
   */
  it('should signal an error if the zipper throws an error', (done) => {
    const single = Single.zip([Single.just('Hello'), Single.just('World')], () => undefined);

    single.subscribe(
      () => done(false),
      () => done(),
    );
  });
  /**
  *
  */
  it('should signal success with an array (no zipper function).', (done) => {
    const single = Single.zip([Single.just('Hello').delay(100), Single.just('World')]);
    single.subscribe(
      x => (x instanceof Array ? done() : done(false)),
      done,
    );
  });
  /**
  *
  */
  it('should signal success with an array with the correct values (no zipper function).', (done) => {
    const single = Single.zip([Single.just('Hello'), Single.just('World')]);
    single.subscribe(
      x => (x[0] === 'Hello' && x[1] === 'World' ? done() : done(false)),
      done,
    );
  });
  /**
  *
  */
  it('should signal error if one of the sources is a non-Single.', (done) => {
    const source = Single.zip(['Hello', Single.just('World')]);
    source.subscribe(
      () => done(false),
      () => done(),
    );
  });
  /**
  *
  */
  it('should signal error if a source throws error.', (done) => {
    const source = Single.zip([Single.error(new Error('Hello')), Single.just('World')]);
    source.subscribe(
      () => done(false),
      () => done(),
    );
  });
  /**
  *
  */
  it('should not signal success if cancelled.', (done) => {
    const source = Single.zip([Single.just('Hello').delay(100), Single.just('World')]);
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
