
import { LinkedCancellable } from 'rx-cancellable';
import Single from '../../single';
import { cleanObserver, isFunction } from '../utils';
import is from '../is';

function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { source, resumeIfError } = this;

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess,
    onError(x) {
      controller.unlink();
      let result;

      if (isFunction(resumeIfError)) {
        try {
          result = resumeIfError(x);
          if (!is(result)) {
            throw new Error('Single.onErrorResumeNext: returned an non-Single.');
          }
        } catch (e) {
          onError(new Error([x, e]));
          controller.cancel();
          return;
        }
      } else {
        result = resumeIfError;
      }

      result.subscribeWith({
        onSubscribe(ac) {
          controller.link(ac);
        },
        onSuccess,
        onError,
      });
    },
  });
}
/**
 * @ignore
 */
export default (source, resumeIfError) => {
  if (!(isFunction(resumeIfError) || is(resumeIfError))) {
    return source;
  }

  const single = new Single(subscribeActual);
  single.source = source;
  single.resumeIfError = resumeIfError;
  return single;
};
