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

/**
 * @external {Iterable} https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 */
/**
 * @external {Thennable} https://promisesaplus.com/
 */
/**
 * @external {PromiseLike} https://promisesaplus.com/
 */
import {
  create, contains, just, error, defer, delay,
  never, map, fromPromise, fromResolvable, fromCallable,
  timer, doAfterSuccess, doAfterTerminate, doFinally,
  doOnDispose, doOnError, doOnSuccess, doOnEvent,
  onErrorResumeNext, onErrorReturnItem, onErrorReturn,
  timeout, zipWith, zip, doOnSubscribe, ambWith, amb,
  doOnTerminate, cache, delaySubscription, delayUntil,
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
   * @param {!function(e: Emitter):any} subscriber
   * A function that accepts the Emitter interface.
   * @returns {Single}
   */
  static create(subscriber) {
    return create(subscriber);
  }

  /**
   * Runs multiple SingleSources and signals the events of
   * the first one that signals (disposing the rest).
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.amb.png" class="diagram">
   *
   * @param {!Iterable} sources
   * the Iterable sequence of sources. A subscription
   * to each source will occur in the same order as in
   * this Iterable.
   * @returns {Single}
   */
  static amb(sources) {
    return amb(sources);
  }

  /**
   * Signals the event of this or the other Single whichever
   * signals first.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.ambWith.png" class="diagram">
   *
   * @param {!Single} other
   * the other Single to race for the first emission
   * of success or error.
   * @returns {Single}
   * A subscription to this provided source will occur
   * after subscribing to the current source.
   */
  ambWith(other) {
    return ambWith(this, other);
  }

  /**
   * Stores the success value or exception from the
   * current Single and replays it to late Observers.
   *
   * The returned Single subscribes to the current Single
   * when the first SingleObserver subscribes.
   *
   * @returns {Single}
   */
  cache() {
    return cache(this);
  }

  /**
   * Signals true if the current Single signals a success
   * value that is equal or if the comparer returns true
   * with the value provided.
   *
   * @param {!any} value
   * the value to compare against the success value of this Single.
   * @param {?function(x: any, successValue: any):any} comparer
   * the function that receives the success value of
   * this Single, the value provided and should return
   * true if they are considered equal.
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
   * @param {!function():any} callable
   * the Callable that is called for each individual
   * Observer and returns a Single instance to subscribe to.
   * @returns {Single}
   */
  static defer(callable) {
    return defer(callable);
  }

  /**
   * Delays the emission of the success signal from
   * the current Single by the specified amount.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.delay.e.png" class="diagram">
   *
   * @param {!Number} amount
   * the amount of time the success signal should be
   * delayed for (in milliseconds).
   * @param {?Boolean} doDelayError
   * if true, both success and error signals are delayed.
   * if false, only success signals are delayed.
   * @returns {Single}
   */
  delay(amount, doDelayError) {
    return delay(this, amount, doDelayError);
  }

  delaySubscription(amount) {
    return delaySubscription(this, amount);
  }

  delayUntil(other) {
    return delayUntil(this, other);
  }

  /**
   * Calls the specified callable with the success
   * item after this item has been emitted to the
   * downstream.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doAfterSuccess.png" class="diagram">
   *
   * @param {!function(x: any)} callable
   * the function that will be called after emitting
   * an item from upstream to the downstream
   * @returns {Single}
   */
  doAfterSuccess(callable) {
    return doAfterSuccess(this, callable);
  }

  /**
   * Registers a function to be called after this
   * Single invokes either onSuccess or onError.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doAfterTerminate.png" class="diagram">
   *
   * @param {!function} callable
   * a function to be invoked when the source Single finishes.
   * @returns {Single}
   * a Single that emits the same items as the source
   * Single, then invokes the function.
   */
  doAfterTerminate(callable) {
    return doAfterTerminate(this, callable);
  }

  /**
   * Calls the specified action after this Single signals
   * onSuccess or onError or gets disposed by the downstream.
   *
   * In case of a race between a terminal event and a dispose
   * call, the provided onFinally action is executed once per
   * subscription.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doFinally.png" class="diagram">
   *
   * @param {!Function} callable
   * the action function when this Single terminates or gets disposed
   * @returns {Single}
   */
  doFinally(callable) {
    return doFinally(this, callable);
  }

  /**
   * Calls the shared function if a Observer
   * subscribed to the current Single disposes
   * the common Disposable it received via
   * onSubscribe.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnDispose.png" class="diagram">
   *
   * @param {!Function} callable
   * the function called when the subscription is disposed
   * @returns {Single}
   */
  doOnDispose(callable) {
    return doOnDispose(this, callable);
  }

  /**
   * Calls the shared function with the error
   * sent via onError for each Observer that
   * subscribes to the current Single.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnError.2.png" class="diagram">
   *
   * @param {!function(x: any)} callable
   * the function called with the success value of onError
   * @returns {Single}
   */
  doOnError(callable) {
    return doOnError(this, callable);
  }

  /**
   * Calls the shared consumer with the error
   * sent via onError or the value via onSuccess
   * for each SingleObserver that subscribes
   * to the current Single.
   *
   * @param {!function(onSuccess: any, onError: any)} callable
   * the function called with the success value of onEvent
   * @returns {Single}
   */
  doOnEvent(callable) {
    return doOnEvent(this, callable);
  }

  /**
   * Calls the shared function with the Disposable
   * sent through the onSubscribe for each Observer
   * that subscribes to the current Single.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnSubscribe.png" class="diagram">
   *
   * @param {!function(x: Disposable)} callable
   * the function called with the Disposable sent via onSubscribe
   * @returns {Single}
   */
  doOnSubscribe(callable) {
    return doOnSubscribe(this, callable);
  }

  /**
   * Calls the shared function with the error sent
   * via onSuccess for each Observer that subscribes
   * to the current Single.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnSuccess.2.png" class="diagram">
   *
   * @param {!function(x: any)} callable
   * the function called with the success value of onSuccess
   * @returns {Single}
   */
  doOnSuccess(callable) {
    return doOnSuccess(this, callable);
  }

  /**
   * Returns a Single instance that calls the given
   * onTerminate callback just before this Single
   * completes normally or with an exception.
   *
   * This differs from doAfterTerminate in that this happens
   * before the onComplete or onError notification.
   *
   * @param {Function} callable
   * the action to invoke when the consumer calls
   * onComplete or onError
   * @returns {Single}
   */
  doOnTerminate(callable) {
    return doOnTerminate(this, callable);
  }

  /**
   * Creates a Single with an error.
   *
   * Signals an error returned by the callback function
   * for each individual Observer or returns a Single
   * that invokes a subscriber's onError method when
   * the subscriber subscribes to it.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.error.png" class="diagram">
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.error.c.png" class="diagram">
   *
   * @param {!(function():any|any)} err
   * - the callable that is called for each individual
   * Observer and returns or throws a value to be emitted.
   * - the particular value to pass to onError
   * @returns {Single}
   * a Single that invokes the subscriber's onError method
   * when the subscriber subscribes to it
   */
  static error(err) {
    return error(err);
  }

  /**
   * Returns a Single that invokes passed function and
   * emits its result for each new SingleObserver that
   * subscribes.
   *
   * Allows you to defer execution of passed function
   * until Observer subscribes to the Single. It makes
   * passed function "lazy".
   *
   * Result of the function invocation will be emitted
   * by the Single.
   *
   * If the result is a Promise-like instance, the
   * Observer is then subscribed to the Promise through
   * the fromPromise operator.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.fromCallable.png" class="diagram">
   *
   * @param {!function():any} callable
   * function which execution should be deferred, it will
   * be invoked when SingleObserver will subscribe to
   * the Single.
   * @returns {Single}
   * a Single whose Observer' subscriptions trigger
   * an invocation of the given function.
   */
  static fromCallable(callable) {
    return fromCallable(callable);
  }

  /**
   * Converts a Promise-like instance into a Single.
   *
   * @param {!(Promise|Thennable|PromiseLike)} promise
   * The promise to be converted into a Single.
   * @returns {Single}
   */
  static fromPromise(promise) {
    return fromPromise(promise);
  }

  /**
   * Provides a Promise-like interface for emitting signals.
   *
   * @param {!function(resolve: function, reject:function))} fulfillable
   * A function that accepts two parameters: resolve and reject,
   * similar to a Promise construct.
   * @returns {Single}
   */
  static fromResolvable(fulfillable) {
    return fromResolvable(fulfillable);
  }

  /**
   * Returns a Single that emits a specified item.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.just.png" class="diagram">
   *
   * @param {!any} value
   * the item to emit
   * @returns {Single}
   * a Single that emits item
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
   * a function to apply to the item emitted by the Single
   * @returns {Single}
   * a Single that emits the item from the source Single,
   * transformed by the specified function
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
   * Instructs a Single to pass control to another
   * Single rather than invoking Observer.onError
   * if it encounters an error.
   *
   * By default, when a Single encounters an error
   * that prevents it from emitting the expected item
   * to its Observer, the Single invokes its Observer's
   * onError method, and then quits without invoking any
   * more of its SingleObserver's methods.
   *
   * The onErrorResumeNext method changes this behavior.
   * If you pass another Single (resumeIfError) or if you
   * pass a function that will return another Single
   * (resumeIfError) to a Single's onErrorResumeNext
   * method, if the original Single encounters an error,
   * instead of invoking its Observer's onError method,
   * it will instead relinquish control to resumeIfError
   * which will invoke the Observer's onSuccess method
   * if it is able to do so. In such a case,
   * because no Single necessarily invokes onError, the
   * Observer may never know that an error happened.
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
   * Instructs a Single to emit an item (returned by
   * a specified function) rather than invoking
   * onError if it encounters an error.
   *
   * By default, when a Single encounters an error that
   * prevents it from emitting the expected item to its
   * subscriber, the Single invokes its subscriber's
   * Observer.onError method, and then quits without
   * invoking any more of its subscriber's methods.
   * The onErrorReturn method changes this behavior.
   * If you pass a function (resumeFunction) to a Single's
   * onErrorReturn method, if the original Single encounters
   * an error, instead of invoking its subscriber's
   * Observer.onError method, it will instead emit the
   * return value of resumeIfError.
   *
   * You can use this to prevent errors from propagating
   * or to supply fallback data should errors be encountered.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.onErrorReturn.png" class="diagram">
   *
   * @param {!Function} resumeFunction
   * a function that returns an item that the new Single
   * will emit if the source Single encounters an error
   * @returns {Single}
   */
  onErrorReturn(resumeFunction) {
    return onErrorReturn(this, resumeFunction);
  }


  /**
   * Signals the specified value as success in case
   * the current Single signals an error.
   *
   * @param {any} item
   * the value to signal if the current Single fails
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
   * the function you have designed to accept the emission
   * from the Single
   * @param {?function(x: any)} onError
   * the function you have designed to accept any error
   * notification from the Single
   * @returns {Disposable}
   * a Disposable reference can request the Single stop work.
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
   * Signals success with 0 value after the given
   * delay for each Observer.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.timer.png" class="diagram">
   *
   * @param {!Number} amount
   * the amount of time in milliseconds.
   * @returns {Single}
   */
  static timer(amount) {
    return timer(amount);
  }

  /**
   * Signals a TimeoutException if the current Single
   * doesn't signal a success value within the specified
   * timeout window.
   * @param {!Number} amount
   * amount of time in milliseconds.
   * @returns {Single}
   */
  timeout(amount) {
    return timeout(this, amount);
  }

  /**
   * Waits until all Single sources provided via an
   * iterable signal a success value and calls a zipper
   * function with an array of these values to return
   * a result to be emitted to downstream.
   *
   * If the Iterable of SingleSources is empty a NoSuchElementException
   * error is signalled after subscription.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.zip.png" class="diagram">
   *
   * @param {Iterable} sources
   * the Iterable sequence of SingleSource instances.
   * An empty sequence will result in an onError signal
   * of NoSuchElementException.
   * @param {?Function} zipper
   * the function that receives an array with values
   * from each Single and should return a value to be
   * emitted to downstream
   * @returns {Single}
   */
  static zip(sources, zipper) {
    return zip(sources, zipper);
  }

  /**
   * Returns a Single that emits the result of applying
   * a specified function to the pair of items emitted
   * by the source Single and another specified Single.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.zip.png" class="diagram">
   *
   * @param {!Single} other
   * the other Single
   * @param {?Function} zipper
   * a function that combines the pairs of items from
   * the two Singles to generate the items to be emitted
   * by the resulting Single
   * @returns {Single}
   * a Single that pairs up values from the source Single
   * and the other Single and emits the results of
   * zipper applied to these pairs
   */
  zipWith(other, zipper) {
    return zipWith(this, other, zipper);
  }

  /**
   * Converts the Single to a Promise instance.
   *
   * @returns {Promise}
   */
  toPromise() {
    return new Promise((res, rej) => {
      this.subscribe(res, rej);
    });
  }

  /**
   * Converts the Single to a Promise instance
   * and attaches callbacks to it.
   *
   * @param {!function(x: any):any} onFulfill
   * @param {?function(x: any):any} onReject
   * @returns {Promise}
   */
  then(onFulfill, onReject) {
    return this.toPromise().then(onFulfill, onReject);
  }

  /**
   * Converts the Single to a Promise instance
   * and attaches an onRejection callback to it.
   *
   * @param {!function(x: any):any} onReject
   * @returns {Promise}
   */
  catch(onReject) {
    return this.toPromise().catch(onReject);
  }
}
