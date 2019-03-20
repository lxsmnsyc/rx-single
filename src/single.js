import {
  create, contains, just, error,
} from './internal/operators';


export default class Single {
  /**
   * Creates a Single with a given subscriber.
   *
   * This subscriber is a function that receives
   * an object that implements the Emitter interface.
   *
   * @param {Function} subscriber
   * @returns {Single}
   */
  static create(subscriber) {
    return create(subscriber);
  }

  /**
   * Creates a Single with an error.
   * @param {*} err
   */
  static error(err) {
    return error(err);
  }

  /**
   * Creates a Single with a success value.
   * @param {*} value
   */
  static just(value) {
    return just(value);
  }

  /**
   * @desc
   * Subscribes with an Object that is an Observer.
   *
   * An Object is considered as an Observer if:
   *  - if it has the method onSubscribe
   *  - if it has the method onSuccess (optional)
   *  - if it has the method onError (optional)
   *
   * The onSubscribe method is called when subscribeWith
   * or subscribe is executed. This method receives an
   * object that implements the Disposable interface.
   *
   */
  subscribeWith(observer) {
    this.subscribeActual(observer);
  }

  /**
   * @desc
   * Subscribes to a Single instance with an onSuccess
   * and an onError method.
   *
   * onSuccess receives a non-undefined value.
   * onError receives a string(or an Error object).
   *
   * Both are called once.
   * @param {Function} onSuccess
   * @param {Function} onError
   * @returns {Disposable} returns an object that implements the
   *  Disposable interface.
   */
  subscribe(onSuccess, onError) {
    const disposable = {};
    this.subscribeActual({
      onSubscribe(d) {
        disposable.dispose = d.dispose;
        disposable.isDisposed = d.isDisposed;
      },
      onSuccess,
      onError,
    });
    return disposable;
  }

  /**
   * Converts the Single to a Promise instance.
   * @returns {Promise}
   */
  toPromise() {
    return new Promise((res, rej) => {
      this.subscribe(res, rej);
    });
  }

  /**
   * Compares the success value of the Single to a given
   * value, and emits the boolean result.
   * @param {*} value
   * @param {?Function} comparer
   * @returns {Single}
   */
  contains(value, comparer) {
    return contains(this, value, comparer);
  }
}
