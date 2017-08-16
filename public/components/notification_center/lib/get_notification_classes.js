export function getNotificationClasses(notif = {}) {
  const color = ((type) => {
    switch (type) {
      case 'banner':
        return 'success';
      case 'danger':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    };
  })(notif.type);

  const icon = notif.icon || 'info-circle';
  return `kuiIcon--${color} fa-${icon}`;
};