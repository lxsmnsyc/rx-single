/**
 * @interface
 * Represents an object that receives notification from
 * an Emitter.
 */
// eslint-disable-next-line no-unused-vars
class Observer {
  /**
   * Receives the disposable subscription.
   * @params {Disposable} d
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onSubscribe(d) {}

  /**
   * Receives a success value.
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onSuccess(value) {}

  /**
   * Receives an error value.
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onError(err) {}
}
