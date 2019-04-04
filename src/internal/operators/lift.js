import Single from '../../single';
import { isObserver, immediateError, isFunction } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  let result;

  try {
    result = this.operator(observer);

    if (!isObserver(result)) {
      throw new Error('Single.lift: operator returned a non-Observer.');
    }
  } catch (e) {
    immediateError(observer, e);
    return;
  }

  this.source.subscribeWith(result);
}

/**
 * @ignore
 */
export default (source, operator) => {
  if (!isFunction(operator)) {
    return source;
  }

  const single = new Single(subscribeActual);
  single.source = source;
  single.operator = operator;
  return single;
};
