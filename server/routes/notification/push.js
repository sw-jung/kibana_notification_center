import { extend } from 'lodash';
import Joi from 'joi';
import moment from 'moment';
import { constants } from '../../lib/constants';
import { parseWithTimestamp } from '../../lib/parse_index_pattern';

export function push(server) {
  const index = server.config().get('notification_center.index');
  const type = 'notification';
  const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');

  server.route({
    path: `${constants.API_BASE_URL}/notification`,
    method: ['POST', 'PUT'],
    handler(request, reply) {
      const { payload } = request;

      callWithRequest(request, 'index', {
        index: parseWithTimestamp(index, moment(payload.timestamp)),
        type,
        body: payload
      })
      .then(resp => {
        return reply(constants.RESPONSE.OK);
      })
      .catch(reply);

    },
    config: {
      validate: {
        payload: Joi.object({
          type: Joi.string().only('error', 'warning', 'info').default('info'),
          timestamp: Joi.date().default(Date.now, 'Notify at now.'),
          content: Joi.string().required()
        })
      }
    }
  });
};
