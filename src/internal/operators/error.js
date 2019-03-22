import { toCallable, immediateError } from '../utils';
import Single from '../../single';

/**
 * @ignore
 */
function subscribeActual(observer) {
  let err;

  try {
    err = this.supplier();

    if (typeof err === 'undefined') {
      err = 'Single.error: Error supplier returned an undefined value.';
    }
  } catch (e) {
    err = e;
  }
  immediateError(observer, err);
}
/**
 * @ignore
 */
const error = (value) => {
  let report = value;
  if (typeof value === 'undefined') {
    report = 'Single.error received an undefined value.';
  }

  if (typeof value !== 'function') {
    report = toCallable(report);
  }
  const single = new Single();
  single.supplier = report;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default error;
