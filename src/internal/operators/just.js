import Single from '../../single';
import { error } from '../operators';
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
const just = (value) => {
  if (typeof value === 'undefined') {
    return error(new Error('Single.just: received an undefined value.'));
  }
  const single = new Single();
  single.value = value;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default just;
