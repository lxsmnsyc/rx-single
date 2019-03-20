/* eslint-disable no-undef */
import assert from 'assert';
import Single from '../src/single';

describe('Single', () => {
  describe('#create', () => {
    it('should create a Single', () => {
      const single = Single.create(e => e.onSuccess('Hello World'));

      assert(single instanceof Single);
    });
  });
  describe('#error', () => {
    it('should create a Single', () => {
      const single = Single.error('Hello World');

      assert(single instanceof Single);
    });
    it('should succeed with the given value.', (done) => {
      const single = Single.error('Hello World');

      single.subscribe(
        () => done(false),
        e => (typeof e !== 'undefined' ? done() : done(false)),
      );
    });
  });
  describe('#just', () => {
    it('should create a Single', () => {
      const single = Single.just('Hello World');

      assert(single instanceof Single);
    });
    it('should succeed with the given value.', (done) => {
      const single = Single.just('Hello World');

      single.subscribe(
        x => (x === 'Hello World' ? done() : done(false)),
        e => done(e),
      );
    });
    it('should emit error if value is undefined.', (done) => {
      const single = Single.just();

      single.subscribe(
        () => done(false),
        e => (typeof e !== 'undefined' ? done() : done(false)),
      );
    });
  });
  describe('#contains', () => {
    it('should create a Single', () => {
      const single = Single.just('Hello World').contains('Hello World');
      assert(single instanceof Single);
    });
    it('should return true if the success value and the compared value are both equal.', (done) => {
      const single = Single.just('Hello World').contains('Hello World');
      single.subscribe(
        x => (x ? done() : done(false)),
        e => done(e),
      );
    });
    it('should return false if the success value and the compared value are both equal.', (done) => {
      const single = Single.just('Hello').contains('Hello World');
      single.subscribe(
        x => (x ? done(false) : done()),
        e => done(e),
      );
    });
  });
});
