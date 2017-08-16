import { readdirSync, lstatSync } from 'fs';
import { resolve } from 'path';

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
    require: ['elasticsearch'],
    name: 'notification_center',
    uiExports: {

      translations,

      chromeNavControls: [
        'plugins/notification_center/nav_control'
      ]

    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    }

  });
};