/* eslint-disable class-methods-use-this */
import Single from '../../single';

const SIGNAL = {
  aborted: false,
  addEventListener: () => {},
  removeEventListener: () => {},
  onabort: () => {},
};


const CONTROLLER = {
  signal: SIGNAL,
  abort: () => {},
};

/**
 * @ignore
 */
function subscribeActual(observer) {
  observer.onSubscribe(CONTROLLER);
}
/**
 * @ignore
 */
let INSTANCE;
/**
 * @ignore
 */
export default () => {
  if (typeof INSTANCE === 'undefined') {
    INSTANCE = new Single(subscribeActual);
    INSTANCE.subscribeActual = subscribeActual.bind(INSTANCE);
  }
  return INSTANCE;
};
