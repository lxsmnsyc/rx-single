import Single from '../../single';
import { SimpleDisposable } from '../utils';

function subscribeActual(observer) {
  const { onSubscribe, onError, onSuccess } = observer;

  const disposable = new SimpleDisposable();

  onSubscribe(disposable);

  const { mapper, source } = this;

  source.subscribeWith({
    onSubscribe(d) {
      disposable.setDisposable(d);
    },
    onSuccess(x) {
      let result;
      try {
        result = mapper(x);

        if (!(result instanceof Single)) {
          throw new Error('Single.flatMap: mapper returned a non-Single');
        }
      } catch (e) {
        onError(e);
        return;
      }
      result.subscribeWith({
        onSubscribe(d) {
          disposable.setDisposable(d);
        },
        onSuccess,
        onError,
      });
    },
    onError,
  });
}

const flatMap = (source, mapper) => {
  if (typeof mapper !== 'function') {
    return source;
  }

  const single = new Single();
  single.source = source;
  single.mapper = mapper;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default flatMap;
