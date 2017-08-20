import { constants } from './lib/constants';
import { registerTemplate } from './lib/register_template';
import { routes } from './routes';

export function init(server) {
  registerTemplate(server);
  if (!!server.config().get('notification_center.api.enabled')) {
    routes(server);
  }
};
