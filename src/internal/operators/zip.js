/* eslint-disable no-restricted-syntax */
import { isIterable } from '../utils';
import error from './error';
import is from '../is';
import zipArray from './zipArray';
/**
 * @ignore
 */
export default (sources, zipper) => {
  if (!isIterable(sources)) {
    return error(new Error('Single.zip: sources is a non-Iterable.'));
  }

  const singles = [];

  for (const source of sources) {
    if (is(source)) {
      singles.push(source);
    } else {
      return error(new Error('Observable.zip: one of the sources is not a Single.'));
    }
  }
  return zipArray(singles, zipper);
};
