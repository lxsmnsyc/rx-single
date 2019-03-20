import { DISPOSED, isDisposable } from '../utils';
import Single from '../../single';
/**
 * @ignore
 */
function subscribeActual(observer) {
  let disposable;
  const emitter = {
    onSuccess(value) {
      if (disposable === DISPOSED) {
        return;
      }
      const d = disposable;
      disposable = DISPOSED;

      try {
        if (typeof value === 'undefined') {
          observer.onError('onSuccess called with undefined.');
        } else {
          observer.onSuccess(value);
        }
      } finally {
        if (isDisposable(d)) {
          d.dispose();
        }
      }
    },
    onError(err) {
      let report = err;
      if (typeof err === 'undefined') {
        report = 'onError called with undefined value.';
      }
      if (disposable === DISPOSED) {
        return;
      }

      const d = disposable;
      disposable = DISPOSED;
      try {
        observer.onError(report);
      } finally {
        if (isDisposable(d)) {
          d.dispose();
        }
      }
    },
    setDisposable(d) {
      if (isDisposable(d)) {
        disposable = d;
      }
    },
    dispose() {
      if (isDisposable(disposable)) {
        disposable.dispose();
      }
      disposable = DISPOSED;
    },
    isDisposed() {
      return disposable === DISPOSED;
    },
  };
  observer.onSubscribe(emitter);
  try {
    this.subscriber(emitter);
  } catch (ex) {
    emitter.onError(ex);
  }
}
/**
 * @ignore
 */
const create = (subscriber) => {
  const single = new Single();
  single.subscriber = subscriber;
  /**
   * @ignore
   */
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default create;
