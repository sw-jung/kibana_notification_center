import { chain } from 'lodash';
import { element } from 'angular';
import moment from 'moment-timezone';
import { uiModules } from 'ui/modules';
import { notify } from 'ui/notify';
import { StoredNotifications } from './lib/stored_notifications';
import { StoredConfig } from './lib/stored_config';
import { pollingNotifications } from './lib/polling_notifications';
import { getNotificationClasses } from './lib/get_notification_classes';
import template from './template.html';
import './index.less';

const module = uiModules.get('notification_center', []);

module.run(pollingNotifications);

module.service('NotificationCenter', (clusterUuid) => {
  const notifications = new StoredNotifications(clusterUuid).load();
  const config = new StoredConfig(clusterUuid, {
    pollingInterval: 10000,
    lastPulledAt: Date.now()
  }).load().save();

  return {
    notifications,
    config
  };
});

module.directive('notificationCenter', (config, NotificationCenter, $filter) => {
  return {
    restrict: 'E',
    template,
    scope: {
      notifs: '=list'
    },
    controller: ($scope) => {
      const notifs = $scope.notifs = NotificationCenter.notifications;
      $scope.$watchCollection(() => notify._notifs, change => {
        const timestamp = new Date().valueOf();
        const newNotifs = chain(change)
        .filter(notif => !notif.timestamp)
        .forEach(notif => notif.timestamp = timestamp)
        .value();
        if (newNotifs.length) {
          notifs.merge(...newNotifs);
        }
      });

      config.watch('dateFormat', setDateFormat, $scope);
      config.watch('dateFormat:tz', setDefaultTimezone, $scope);
      config.watch('dateFormat:dow', setStartDayOfWeek, $scope);

      function setDateFormat(format) {
        $scope.dateFormat = format;
      };

      function setDefaultTimezone(tz) {
        moment.tz.setDefault(tz);
      }

      function setStartDayOfWeek(day) {
        const dow = moment.weekdays().indexOf(day);
        moment.updateLocale(moment.locale(), { week: { dow } });
      }

      setDateFormat(config.get('dateFormat'));

      $scope.moment = moment;
      $scope.getNotificationClasses = getNotificationClasses;
    }
  };
});
