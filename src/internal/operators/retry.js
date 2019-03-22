import Single from '../../single';
import { SimpleDisposable } from '../utils';

function subscribeActual(observer) {
  const { onSubscribe, onSuccess, onError } = observer;

  const disposable = new SimpleDisposable();

  onSubscribe(disposable);

  const { source, bipredicate } = this;

  let retries = 0;

  const sub = () => {
    if (!disposable.isDisposed()) {
      retries += 1;

      source.subscribeWith({
        onSubscribe(d) {
          disposable.setDisposable(d);
        },
        onSuccess,
        onError(x) {
          if (typeof bipredicate === 'function') {
            const result = bipredicate(retries, x);

            if (result) {
              sub();
            } else {
              onError(x);
            }
          } else {
            sub();
          }
        },
      });
    }
  };

  sub();
}

const retry = (source, bipredicate) => {
  const single = new Single();
  single.source = source;
  single.bipredicate = bipredicate;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default retry;
