import { readdirSync, lstatSync } from 'fs';
import { resolve } from 'path';

export default function (kibana) {
  const translations = (function getTranslations(translationsPath) {
    readdirSync(translationsPath)
    .map(function toPath(filename) {
      return resolve(translationsPath, filename);
    })
    .filter(function isFile(filepath) {
      return lstatSync(filepath).isFile();
    });
  }(resolve(__dirname, 'translations')));

  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'notification_center',
    uiExports: {

      translations,

      hacks: [
        'plugins/notification_center/hack'
      ]

    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    }

  });
};