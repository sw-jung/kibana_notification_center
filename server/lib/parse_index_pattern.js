import moment from 'moment';
import 'twix';
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

export function hasDateExpression(index) {
  return dateExprPattern.test(index);
};

const testUnits = [
  'milliseconds',
  'seconds',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'quarters',
  'years'
];
export function parsePartitionUnit(index) {
  if (!hasDateExpression(index)) {
    return;
  }

  const now = moment();
  return find(testUnits, unit => {
    return parseWithTimestamp(index, now) !== parseWithTimestamp(index, now.add(1, unit));
  });
};