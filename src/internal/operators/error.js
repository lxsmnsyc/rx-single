import {
  toCallable, immediateError, isFunction, isNull, isOf,
} from '../utils';
import Single from '../../single';

/**
 * @ignore
 */
function subscribeActual(observer) {
  let err;

  try {
    err = this.supplier();

    if (isNull(err)) {
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
  if (!(isOf(value, Error) || isFunction(value))) {
    report = new Error('Single.error received a non-Error value.');
  }

  if (!isFunction(value)) {
    report = toCallable(report);
  }
  const single = new Single(subscribeActual);
  single.supplier = report;
  return single;
};
