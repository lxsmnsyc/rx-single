/**
 * @interface
 * Represents a disposable/cancellable state.
 */
// eslint-disable-next-line no-unused-vars
export default class Disposable {
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
