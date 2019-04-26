import is from '../is';
import zipArray from './zipArray';
/**
 * @ignore
 */
export default (source, other, zipper) => (
  !is(other)
    ? source
    : zipArray([source, other], zipper)
);
