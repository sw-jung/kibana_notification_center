import { parseWithWildcard } from './parse_index_pattern';
import { mappings } from './notification_mappings';

const tags = ['register_template', 'notification_center'];
export function registerTemplate(server) {
  const { index, template } = server.config().get('notification_center');
  const { waitUntilReady, getCluster } = server.plugins.elasticsearch;
  const { callWithInternalUser } = getCluster('admin');

  return waitUntilReady()
  .then(() => {
    return !template.overwrite && callWithInternalUser('indices.existsTemplate', {
      name: template.name,
      ignore: 404
    })
    .then(exists => exists);
  })
  .then(skip => {
    return skip || Promise.resolve()
    .then(server.log([...tags, 'info'], `Try to put template '${template.name}'.`))
    .then(() => callWithInternalUser('indices.putTemplate', {
      name: template.name,
      create: !template.overwrite,
      body: {
        template: parseWithWildcard(index),
        mappings
      }
    }))
    .then(resp => server.log([...tags, 'info'], `Success to put template '${template.name}'.`))
    .catch(err => server.log([...tags, 'error'], err));
  });
};
