import { chain } from 'lodash';
import { getVisible, addBasePath } from 'ui/chrome';
import { addSystemApiHeader } from 'ui/system_api';

export function pollingNotifications($timeout, $http, NotificationCenter, Notifier) {
  if (!getVisible()) {
    return;
  }

  const { config } = NotificationCenter;
  const notify = new Notifier();
  $timeout(function pullNotifications() {
    return $http.get(addBasePath('/api/notification_center/notification'), {
      headers: addSystemApiHeader({}),
      params: {
        from: config.get('lastPulledAt'),
        size: config.get('maxSize')
      }
    })
    .then(({ data }) => {
      const notifications = data || [];
      const lastPulledAt = chain(notifications)
      .forEach(notification => {
        notify[notification.type || 'info'](notification.content);
      })
      .map('timestamp')
      .max()
      .value();

      if (lastPulledAt > 0) {
        config.set('lastPulledAt', lastPulledAt);
        config.save();
      }
    })
    .then(() => $timeout(pullNotifications, config.get('pollingInterval')));
  }, config.get('pollingInterval'));
};