import { neverDisposed } from '../utils';
import Single from '../../single';

/**
 * @ignore
 */
function subscribeActual(observer) {
  observer.onSubscribe(neverDisposed);
}
/**
 * @ignore
 */
let INSTANCE;
/**
 * @ignore
 */
const never = () => {
  if (typeof INSTANCE === 'undefined') {
    INSTANCE = new Single();
    INSTANCE.subscribeActual = subscribeActual.bind(INSTANCE);
  }
  return INSTANCE;
};

export default never;
