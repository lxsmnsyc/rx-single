import Single from '../../single';
import { SimpleDisposable } from '../utils';

function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const { source, resumeIfError } = this;

  const disposable = new SimpleDisposable();

  onSubscribe(disposable);

  source.subscribeWith({
    onSubscribe(d) {
      disposable.setDisposable(d);
    },
    onSuccess,
    onError(x) {
      let result;

      if (typeof resumeIfError === 'function') {
        try {
          result = resumeIfError(x);
          if (typeof result === 'undefined') {
            throw new Error('Single.onErrorResumeNext: returned an non-Single.');
          }
        } catch (e) {
          onError([x, e]);
          return;
        }
      } else {
        result = resumeIfError;
      }

      result.subscribeWith({
        onSubscribe(d) {
          disposable.setDisposable(d);
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
const onErrorResumeNext = (source, resumeIfError) => {
  if (!(typeof resumeIfError === 'function' || resumeIfError instanceof Single)) {
    return source;
  }

  const single = new Single();
  single.source = source;
  single.resumeIfError = resumeIfError;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default onErrorResumeNext;
