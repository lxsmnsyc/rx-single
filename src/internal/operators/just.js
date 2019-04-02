import Single from '../../single';
import error from './error';
import { immediateSuccess } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  immediateSuccess(observer, this.value);
}
/**
 * @ignore
 */
export default (value) => {
  if (value == null) {
    return error(new Error('Single.just: received a null value.'));
  }
  const single = new Single();
  single.value = value;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
