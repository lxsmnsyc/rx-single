import Single from '../../single';
import { error } from '../operators';

const compose = (source, transformer) => {
  if (typeof transformer !== 'function') {
    return source;
  }

  let result;

  try {
    result = transformer(source);

    if (!(result instanceof Single)) {
      throw new Error('Single.compose: transformer returned a non-Single.');
    }
  } catch (e) {
    result = error(e);
  }

  return result;
};

export default compose;
