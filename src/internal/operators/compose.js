import Single from '../../single';
import error from './error';
import { isFunction } from '../utils';

/**
 * @ignore
 */
export default (source, transformer) => {
  if (!isFunction(transformer)) {
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
