import is from '../is';
import zipArray from './zipArray';
/**
 * @ignore
 */
export default (source, other, zipper) => {
  if (!is(other)) {
    return source;
  }
  return zipArray([source, other], zipper);
};
