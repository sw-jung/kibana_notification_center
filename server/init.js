import { constants } from './lib/constants';
import { registerTemplate } from './lib/register_template';
import { routes } from './routes';

export function init(server) {
  if (!!server.config().get('notification_center.api.enabled')) {
    registerTemplate(server);
    routes(server);
  }
};
