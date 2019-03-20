import { disposed } from '../utils';
import Single from '../../single';
import { error } from '../operators';

function subscribeActual(observer) {
  observer.onSubscribe(disposed);
  observer.onSuccess(this.value);
}

const just = (value) => {
  if (typeof value === 'undefined') {
    return error('Single.just: received an undefined value.');
  }
  const single = new Single();
  single.value = value;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default just;
