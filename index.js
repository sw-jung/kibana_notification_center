import { readdirSync, lstatSync } from 'fs';
import { resolve } from 'path';
import { init } from './server/init';
import { replaceInjectedVars } from './server/lib/replace_injected_vars';

export default function (kibana) {
  const translations = (function getTranslations(translationsPath) {
    return readdirSync(translationsPath)
    .map(filename => {
      return resolve(translationsPath, filename);
    })
    .filter(filepath => {
      return lstatSync(filepath).isFile();
    });
  }(resolve(__dirname, 'translations')));

  return new kibana.Plugin({
    id: 'notification_center',
    configPrefix: 'notification_center',
    require: ['elasticsearch'],
    name: 'notification_center',
    uiExports: {

      translations,

      chromeNavControls: [
        'plugins/notification_center/nav_control'
      ],

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
        }).default()
      }).default();
    },

    init

  });
};