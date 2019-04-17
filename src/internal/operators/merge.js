
import { LinkedCancellable } from 'rx-cancellable';
import Single from '../../single';
import error from './error';
import { cleanObserver } from '../utils';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onError, onSuccess } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  this.source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess(x) {
      controller.unlink();
      let result = x;
      if (!is(x)) {
        result = error(new Error('Single.merge: source emitted a non-Single value.'));
      }
      result.subscribeWith({
        onSubscribe(ac) {
          controller.link(ac);
        },
        onSuccess,
        onError,
      });
    },
    onError,
  });
}

/**
 * @ignore
 */
export default (source) => {
  if (!is(source)) {
    return error(new Error('Single.merge: source is not a Single.'));
  }

  const single = new Single(subscribeActual);
  single.source = source;
  return single;
};
