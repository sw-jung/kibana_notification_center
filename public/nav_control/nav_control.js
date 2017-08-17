import { constant, includes } from 'lodash';
import { element } from 'angular';
import uiModules from 'ui/modules';
import registry from 'ui/registry/chrome_nav_controls';
import '../components/notification_center';
import template from './nav_control.html';
import 'ui/angular-bootstrap';

registry.register(constant({
  name: 'notification_center',
  order: 1000,
  template
}));

const module = uiModules.get('notification_center', []);
module.controller('notificationCenterNavController', ($scope, $compile, $document, NotificationCenter) => {
  function initNotificationCenter() {
    const $elem = $scope.$notificationCenter = $compile('<notification-center/>')($scope).appendTo('.app-wrapper');
    $document.on('click', () => $elem.hide());
    $elem.on('click', e => e.stopPropagation());
  };

  $scope.openNotificationCenter = event => {
    event.preventDefault();
    if (!$scope.$notificationCenter) {
      initNotificationCenter();
    } else {
      $scope.$notificationCenter.toggle();
    }
    event.stopPropagation();
  };

  $scope.formatTooltip = () =>{
    return `${NotificationCenter.notifications.length} new notifications`;
  };
});
