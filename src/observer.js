/**
 * @interface
 * Provides a mechanism for receiving push-based notification
 * of a single value or an error.
 *
 * When a SingleObserver is subscribed to a Single through
 * the Single.subscribe(SingleObserver) method, the Single
 * calls onSubscribe(Cancellable) with a Cancellable that
 * allows cancelling the sequence at any time. A well-behaved
 * Single will call a SingleObserver's onSuccess(Object) method
 * exactly once or the SingleObserver's onError(Error) method
 * exactly once as they are considered mutually exclusive
 * terminal signals.
 *
 * the invocation pattern must adhere to the following protocol:
 *
 * <code>onSubscribe (onSuccess | onError)?</code>
 *
 * Subscribing a SingleObserver to multiple Singles is not recommended.
 * If such reuse happens, it is the duty of the SingleObserver
 * implementation to be ready to receive multiple calls to its methods
 * and ensure proper concurrent behavior of its business logic.
 *
 * Calling onSubscribe(Cancellable), onSuccess(Object) or onError(Error)
 * with a null argument is forbidden.
 */
// eslint-disable-next-line no-unused-vars
export default class SingleObserver {
  /**
   * Receives the Cancellable subscription.
   * @param {!Cancellable} d
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onSubscribe(d) {}

  /**
   * Receives a success value.
   * @param {!any} value
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onSuccess(value) {}

  /**
   * Receives an error value.
   * @param {!Error} err
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onError(err) {}
}
