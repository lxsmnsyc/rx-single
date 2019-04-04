import AbortController from 'abort-controller';
import Single from '../../single';
import { cleanObserver, isFunction } from '../utils';

function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { source, resumeIfError } = this;

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onSuccess(x) {
      onSuccess(x);
      controller.abort();
    },
    onError(x) {
      let result;

      if (isFunction(resumeIfError)) {
        try {
          result = resumeIfError(x);
          if (!(result instanceof Single)) {
            throw new Error('Single.onErrorResumeNext: returned an non-Single.');
          }
        } catch (e) {
          onError(new Error([x, e]));
          return;
        }
      } else {
        result = resumeIfError;
      }

      result.subscribeWith({
        onSubscribe(ac) {
          signal.addEventListener('abort', () => ac.abort());
        },
        onSuccess(v) {
          onSuccess(v);
          controller.abort();
        },
        onError(v) {
          onError(v);
          controller.abort();
        },
      });
    },
  });
}
/**
 * @ignore
 */
export default (source, resumeIfError) => {
  if (!(isFunction(resumeIfError) || resumeIfError instanceof Single)) {
    return source;
  }

  const single = new Single(subscribeActual);
  single.source = source;
  single.resumeIfError = resumeIfError;
  return single;
};
