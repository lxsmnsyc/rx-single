import { toCallable, immediateError } from '../utils';
import Single from '../../single';

/**
 * @ignore
 */
function subscribeActual(observer) {
  let err;

  try {
    err = this.supplier();

    if (err == null) {
      throw new Error('Single.error: Error supplier returned a null value.');
    }
  } catch (e) {
    err = e;
  }
  immediateError(observer, err);
}
/**
 * @ignore
 */
export default (value) => {
  let report = value;
  if (!(value instanceof Error || typeof value === 'function')) {
    report = new Error('Single.error received a non-Error value.');
  }

  if (typeof value !== 'function') {
    report = toCallable(report);
  }
  const single = new Single(subscribeActual);
  single.supplier = report;
  return single;
};
