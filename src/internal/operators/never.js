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
const never = () => {
  const single = new Single();
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default never;
