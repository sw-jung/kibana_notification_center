import { resolve } from 'path';
import { init } from './server/init';
import { replaceInjectedVars } from './server/lib/replace_injected_vars';

export default function (kibana) {
  return new kibana.Plugin({
    id: 'notification_center',
    configPrefix: 'notification_center',
    require: ['elasticsearch'],
    name: 'notification_center',
    publicDir: resolve(__dirname, 'public'),
    uiExports: {

      chromeNavControls: [
        'plugins/notification_center/nav_control/nav_control'
      ],

      injectDefaultVars(server) {
        return {
          notificationCenter: {
            supportDarkTheme: server.config().get('notification_center.supportDarkTheme')
          }
        };
      },

      replaceInjectedVars

    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        index: Joi.string().default('notification-%{+YYYY.MM.DD}'),
        template: Joi.object({
          name: Joi.string().default('notification_center_template'),
          overwrite: Joi.boolean().default(false)
        }).default(),
        api: Joi.object({
          enabled: Joi.boolean().default(true),
          pull: Joi.object({
            maxSize: Joi.number().default(100)
          }).default()
        }).default(),
        supportDarkTheme: Joi.boolean().default(true)
      }).default();
    },

    init

  });
};