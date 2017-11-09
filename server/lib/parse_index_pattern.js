import moment from 'moment';
import { find } from 'lodash';

const dateExprPattern = /%{\+([^}]+)}/g;

export function parseWithWildcard(index) {
  return parseWithReplacer(index, '*');
};

export function parseWithTimestamp(index, timestamp = moment()) {
  return parseWithReplacer(index, (match, format) => timestamp.format(format));
};

export function parseWithReplacer(index, replacer) {
  return index.replace(dateExprPattern, replacer);
};