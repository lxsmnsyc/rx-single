/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

/**
 *
 */
describe('#compose', () => {
  /**
   *
   */
  it('should return the same instance if no function is provided', () => {
    const source = Single.just('Hello');
    const single = source.compose();

    assert(source === single);
  });
  /**
   *
   */
  it('should return a Single from the transformer', () => {
    const single = Single.just('Hello').compose(source => source.map(x => `${x} World`));

    assert(single instanceof Single);
  });
  /**
   *
   */
  it('should correctly signal the composed Single', (done) => {
    const single = Single.just('Hello').compose(source => source.map(x => `${x} World`));

    single.subscribe(
      x => (x === 'Hello World' ? done() : done(x)),
      done,
    );
  });
  /**
   *
   */
  it('should signal error if the transformer function returned a non-Single', (done) => {
    const single = Single.just('Hello').compose(() => undefined);

    single.subscribe(
      done,
      () => done(),
    );
  });
});
