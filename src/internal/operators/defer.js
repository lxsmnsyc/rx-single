import Single from '../../single';
import { disposed } from '../utils';

function subscribeActual(observer) {
  let result;

  let err;
  try {
    result = this.supplier();
    if (!(result instanceof Single)) {
      err = 'Single.defer: supplier returned a non-Single.';
    }
  } catch (e) {
    err = e;
  }

  if (typeof err !== 'undefined') {
    observer.onSubscribe(disposed);
    observer.onError(err);
  } else {
    result.subscribe(observer);
  }
}

const defer = (supplier) => {
  const single = new Single();
  single.supplier = supplier;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default defer;
