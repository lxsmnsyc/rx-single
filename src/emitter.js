/**
 * @interface
 * Represents an object that receives notification to
 * an Observer.
 *
 * Emitter is an abstraction layer of the Observer
 */
// eslint-disable-next-line no-unused-vars
export default class Emitter {
  /**
   * Emits a success value.
   * @param {!any} value
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onSuccess(value) {}

  /**
   * Emits an error value.
   * @param {!Error} err
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onError(err) {}

  /**
   * Sets the Disposable for this instance
   * @param {!Disposable} d
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  setDisposable(d) {}

  /**
   * Disposes the instance
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this
  dispose() {}

  /**
   * Checks if the instance is disposed
   * @returns {Boolean}
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this
  isDisposed() {}
}
