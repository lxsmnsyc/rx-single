/**
 * @interface
 * Represents an object that receives notification from
 * an Emitter.
 */
// eslint-disable-next-line no-unused-vars
export default class Observer {
  /**
   * Receives the disposable subscription.
   * @param {!Disposable} d
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
   * @param {!any} err
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onError(err) {}
}
