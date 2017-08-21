import { chain } from 'lodash';
import { getVisible, addBasePath } from 'ui/chrome';

export function pollingNotifications($timeout, $http, NotificationCenter, Notifier) {
  if (!getVisible()) {
    return;
  }

  const { config } = NotificationCenter;
  const notify = new Notifier();
  $timeout(function pullNotifications() {
    return $http.get(addBasePath('/api/notification_center/notification'), {
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
      .maxBy('timestamp')
      .get('timestamp')
      .value();

      if (lastPulledAt) {
        config.set('lastPulledAt', lastPulledAt);
        config.save();
      }
    })
    .then(() => $timeout(pullNotifications, config.get('pollingInterval')));
  }, config.get('pollingInterval'));
};