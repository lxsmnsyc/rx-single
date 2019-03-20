/**
 * @license
 * MIT License
 *
 * Copyright (c) 2019 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2019
 */
import {
  create, contains, just, error, defer, delay,
} from './internal/operators';

/**
 *
 */
export default class Single {
  /**
   * Creates a Single with a given subscriber.
   *
   * This subscriber is a function that receives
   * an object that implements the Emitter interface.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.create.png" class="diagram">
   *
   * @example
   * const single = Single.create(e => e.onSuccess('Hello World'));
   * @param {Function} subscriber
   * @returns {Single}
   */
  static create(subscriber) {
    return create(subscriber);
  }

  /**
   * Creates a Single with an error.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.error.c.png" class="diagram">
   *
   * @param {!(Function|any)} err
   * @returns {Single}
   */
  static error(err) {
    return error(err);
  }

  /**
   * Creates a Single with a success value.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.just.png" class="diagram">
   *
   * @param {!any} value
   * @returns {Single}
   */
  static just(value) {
    return just(value);
  }

  /**
   * Calls a Callable for each individual Observer
   * to return the actual Single to be subscribed to.
   *
   * @param {!Function} callable
   * @returns {Single}
   */
  static defer(callable) {
    return defer(callable);
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
   * @param {!Object} observer
   * @returns {undefined}
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
   * @param {?Function} onSuccess
   * @param {?Function} onError
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
   * @param {any} value
   * @param {?Function} comparer
   * @returns {Single}
   */
  contains(value, comparer) {
    return contains(this, value, comparer);
  }

  /**
   * Delays the emission of the success signal from the current Single by the specified amount.
   * @param {Number} amount
   * @param {?Boolean} doDelayError
   */
  delay(amount, doDelayError) {
    return delay(this, amount, doDelayError);
  }
}
