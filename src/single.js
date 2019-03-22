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
  never, map, fromPromise, fromResolvable, fromCallable,
  timer, doAfterSuccess, doAfterTerminate, doFinally,
  doOnDispose, doOnError, doOnSuccess, doOnEvent,
  onErrorResumeNext, onErrorReturnItem, onErrorReturn, timeout, zipWith, zip,
} from './internal/operators';
import { SimpleDisposable } from './internal/utils';

/**
 * The Single class implements the Reactive Pattern
 * for a single value response.
 *
 * Single behaves similarly to Observable except that
 * it can only emit either a single successful value
 * or an error (there is no "onComplete" notification
 * as there is for an Observable).
 *
 * The Single class default consumer type it interacts
 * with is the Observer via the subscribeWith(Observer)
 * or the subscribe(onSuccess, onError) method.
 *
 * The Single operates with the following sequential protocol:
 * <code>onSubscribe (onSuccess | onError)?</code>
 *
 * Note that onSuccess and onError are mutually exclusive
 * events; unlike Observable, onSuccess is never followed
 * by onError.
 *
 * Like Observable, a running Single can be stopped through
 * the Disposable instance provided to consumers through
 * Observer.onSubscribe(Disposable).
 *
 * Singles are cold by default, but using a toPromise method,
 * you can achieve a hot-like Single.
 *
 * The documentation for this class makes use of marble diagrams.
 * The following legend explains these diagrams:
 *
 * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.legend.png" class="diagram">
 */
export default class Single {
  /**
   * Provides an API (via a cold Single) that bridges
   * the reactive world with the callback-style world.
   *
   * This subscriber is a function that receives
   * an object that implements the Emitter interface.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.create.png" class="diagram">
   *
   * @example
   * const single = Single.create(e => e.onSuccess('Hello World'));
   * @param {!function(e: Emitter):any} subscriber - A function that accepts the Emitter interface.
   * @returns {Single}
   */
  static create(subscriber) {
    return create(subscriber);
  }

  /**
   * Signals true if the current Single signals a success value
   * that is equal or if the comparer returns true
   * with the value provided.
   * @param {!any} value - The value to be compared with.
   * @param {?function(x: any, successValue: any):any} comparer
   * A function that accepts two values to be compared.
   * @returns {Single}
   */
  contains(value, comparer) {
    return contains(this, value, comparer);
  }

  /**
   * Calls a function for each individual Observer
   * to return the actual Single to be subscribed to.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.defer.png" class="diagram">
   *
   * @param {!function():any} callable - A function that returns a Single.
   * @returns {Single}
   */
  static defer(callable) {
    return defer(callable);
  }

  /**
   * Delays the emission of the success signal from the current Single by the specified amount.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.delay.e.png" class="diagram">
   *
   * @param {!Number} amount - the amount of time in milliseconds
   * @param {?Boolean} doDelayError - if true, the error signal is delayed.
   * @returns {Single}
   */
  delay(amount, doDelayError) {
    return delay(this, amount, doDelayError);
  }

  /**
   * Calls the specified callable with the success item
   * after this item has been emitted to the downstream.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doAfterSuccess.png" class="diagram">
   *
   * @param {!function(x: any)} callable
   * @returns {Single}
   */
  doAfterSuccess(callable) {
    return doAfterSuccess(this, callable);
  }

  /**
   * Registers a function to be called after this Single
   * invokes either onSuccess or onError.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doAfterTerminate.png" class="diagram">
   *
   * @param {!function} callable
   * @returns {Single}
   */
  doAfterTerminate(callable) {
    return doAfterTerminate(this, callable);
  }

  /**
   * Registers a function to be called after this Single
   * invokes either onSuccess or onError, or when the Single
   * gets disposed.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doFinally.png" class="diagram">
   *
   * @param {!Function} callable
   * @returns {Single}
   */
  doFinally(callable) {
    return doFinally(this, callable);
  }

  /**
   * Calls the shared function if a Observer subscribed to the
   * current Single disposes the common Disposable it received
   * via onSubscribe.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnDispose.png" class="diagram">
   *
   * @param {!Function} callable
   * @returns {Single}
   */
  doOnDispose(callable) {
    return doOnDispose(this, callable);
  }

  /**
   * Calls the shared function with the error sent via onError
   * for each Observer that subscribes to the current Single.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnError.2.png" class="diagram">
   *
   * @param {!function(x: any)} callable
   * @returns {Single}
   */
  doOnError(callable) {
    return doOnError(this, callable);
  }

  /**
   * Calls the shared consumer with the error sent via onError
   * or the value via onSuccess for each SingleObserver that
   * subscribes to the current Single.
   *
   * @param {!function(onSuccess: any, onError: any)} callable
   * @returns {Single}
   */
  doOnEvent(callable) {
    return doOnEvent(this, callable);
  }

  /**
   * Calls the shared function with the error sent via onSuccess
   * for each Observer that subscribes to the current Single.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnSuccess.2.png" class="diagram">
   *
   * @param {!function(x: any)} callable
   * @returns {Single}
   */
  doOnSuccess(callable) {
    return doOnSuccess(this, callable);
  }

  /**
   * Creates a Single with an error.
   *
   * Signals an error returned by the callback function
   * for each individual Observer or returns a Single that
   * invokes a subscriber's onError method when the subscriber subscribes to it.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.error.png" class="diagram">
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.error.c.png" class="diagram">
   *
   * @param {!(function():any|any)} err - A function or an error value.
   * @returns {Single}
   */
  static error(err) {
    return error(err);
  }

  /**
   * Returns a Single that invokes passed function and emits its result
   * for each new SingleObserver that subscribes.
   *
   * Allows you to defer execution of passed function until Observer subscribes
   * to the Single. It makes passed function "lazy".
   *
   * Result of the function invocation will be emitted by the Single.
   *
   * If the result is a Promise-like instance, the Observer is then
   * subscribed to the Promise through the fromPromise operator.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.fromCallable.png" class="diagram">
   *
   * @param {!function():any} callable - a function that returns a value.
   * The value returned becomes the success value
   * of the returned Single, otherwise if the function throws an error,
   * the Single sends an error signal.
   * @returns {Single}
   */
  static fromCallable(callable) {
    return fromCallable(callable);
  }

  /**
   * Converts a Promise-like instance into a Single.
   * @param {!(Promise|Thennable|PromiseLike)} promise - The promise to be converted into a Single.
   * @returns {Single}
   */
  static fromPromise(promise) {
    return fromPromise(promise);
  }

  /**
   * Provides a Promise-like interface for emitting signals.
   * @param {!function(resolve: function, reject:function))} fulfillable
   * A function that accepts two parameters: resolve and reject,
   * similar to a Promise construct.
   * @returns {Single}
   */
  static fromResolvable(fulfillable) {
    return fromResolvable(fulfillable);
  }

  /**
   * Creates a Single with a success value.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.just.png" class="diagram">
   *
   * @param {!any} value - A non-undefined value.
   * @returns {Single}
   */
  static just(value) {
    return just(value);
  }

  /**
   * Returns a Single that applies a specified function
   * to the item emitted by the source Single and emits
   * the result of this function application.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.map.png" class="diagram">
   *
   * @param {?function(x: any):any} mapper
   * A function that accepts the success value and transforms it.
   * @returns {Single}
   */
  map(mapper) {
    return map(this, mapper);
  }

  /**
   * Returns a singleton instance of a never-signalling
   * Single (only calls onSubscribe).
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.never.png" class="diagram">
   *
   * @returns {Single}
   */
  static never() {
    return never();
  }

  /**
   * Instructs a Single to pass control to another Single
   * rather than invoking Observer.onError if it encounters
   * an error.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.onErrorResumeNext.f.png" class="diagram">
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.onErrorResumeNext.png" class="diagram">
   *
   * @param {!(function(x: any):Single|Single)} resumeIfError
   * @returns {Single}
   */
  onErrorResumeNext(resumeIfError) {
    return onErrorResumeNext(this, resumeIfError);
  }

  /**
   * Instructs a Single to emit an item (returned by a specified function)
   * rather than invoking onError if it encounters an error.
   * @param {!Function} supplier
   * @returns {Single}
   */
  onErrorReturn(supplier) {
    return onErrorReturn(this, supplier);
  }


  /**
   * Signals the specified value as success in case the current Single signals an error.
   * @param {any} item
   * @returns {Single}
   */
  onErrorReturnItem(item) {
    return onErrorReturnItem(this, item);
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
   * @param {?function(x: any)} onSuccess
   * @param {?function(x: any)} onError
   * @returns {Disposable} returns an object that implements the
   *  Disposable interface.
   */
  subscribe(onSuccess, onError) {
    const disposable = new SimpleDisposable();
    this.subscribeActual({
      onSubscribe(d) {
        disposable.setDisposable(d);
      },
      onSuccess,
      onError,
    });
    return disposable;
  }

  /**
   * Signals success with 0 value after the given delay for each Observer.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.timer.png" class="diagram">
   *
   * @param {!Number} amount - amount of time in milliseconds.
   * @returns {Single}
   */
  static timer(amount) {
    return timer(amount);
  }

  /**
   * Signals a TimeoutException if the current Single doesn't signal
   * a success value within the specified timeout window.
   * @param {!Number} amount - amount of time in milliseconds.
   * @returns {Single}
   */
  timeout(amount) {
    return timeout(this, amount);
  }

  /**
   * Waits until all Single sources provided via an iterable signal a
   * success value and calls a zipper function with an array of these
   * values to return a result to be emitted to downstream.
   * @param {Iterable} sources
   * @param {?Function} zipper
   * @returns {Single}
   */
  static zip(sources, zipper) {
    return zip(sources, zipper);
  }

  /**
   * Returns a Single that emits the result of applying a specified
   * function to the pair of items emitted by the source Single and
   * another specified Single.
   * @param {!Single} other
   * @param {?Function} zipper
   * @returns {Single}
   */
  zipWith(other, zipper) {
    return zipWith(this, other, zipper);
  }

  /**
   * Converts the Single to a Promise instance.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.toMaybe.png" class="diagram">
   *
   * @returns {Promise}
   */
  toPromise() {
    return new Promise((res, rej) => {
      this.subscribe(res, rej);
    });
  }

  /**
   * Converts the Single to a Promise instance and attaches callbacks
   * to it.
   * @param {!function(x: any):any} onFulfill
   * @param {?function(x: any):any} onReject
   * @returns {Promise}
   */
  then(onFulfill, onReject) {
    return this.toPromise().then(onFulfill, onReject);
  }

  /**
   * Converts the Single to a Promise instance and attaches an onRejection
   * callback to it.
   * @param {!function(x: any):any} onReject
   * @returns {Promise}
   */
  catch(onReject) {
    return this.toPromise().catch(onReject);
  }
}
