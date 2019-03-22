import Single from '../../single';
import { isObserver, immediateError } from '../utils';

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
const lift = (source, operator) => {
  if (typeof operator !== 'function') {
    return source;
  }

  const single = new Single();
  single.source = source;
  single.operator = operator;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default lift;
