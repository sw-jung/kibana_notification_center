import { defaults, set, get } from 'lodash';
import Joi from 'joi';
import moment from 'moment';
import 'twix';
import { constants } from '../../lib/constants';
import { parsePartitionUnit, parseWithTimestamp } from '../../lib/parse_index_pattern';

export function pull(server) {
  const index = server.config().get('notification_center.index');
  const type = 'notification';
  const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
  const { maxSize } = server.config().get('notification_center.api.pull');
  const partitionUnit = parsePartitionUnit(index);

  server.route({
    path: `${constants.API_BASE_URL}/notification`,
    method: 'GET',
    handler(request, reply) {
      const { size, from, to } = request.query;

      callWithRequest(request, 'search', {
        index: partitionUnit ? moment(from)
          .twix(moment(to))
          .toArray(partitionUnit)
          .map(time => parseWithTimestamp(index, time)) : index,
        type,
        size,
        ignoreUnavailable: true,
        body: (() => {
          const rangeQueries = [];

          if (from) {
            rangeQueries.push(set({}, 'range.timestamp.gte', moment(from).valueOf()));
          }

          if (to) {
            rangeQueries.push(set({}, 'range.timestamp.lte', moment(to).valueOf()));
          }

          return rangeQueries.length ? set({}, 'query.bool.must', rangeQueries) : undefined;
        })()
      })
      .then(resp => {
        return reply(get(resp, 'hits.hits', []).map(hit => hit._source));
      })
      .catch(reply);
    },
    config: {
      validate: {
        query: Joi.object({
          size: Joi.number().min(1).max(maxSize).default(maxSize),
          from: Joi.date().optional(),
          to: Joi.date().optional()
        }).default()
      }
    }
  });
};
