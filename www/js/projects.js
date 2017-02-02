angular.module('projek.projects', [])

.controller('ProjectsCtrl', function($scope, $projects) {

  if ($scope.$parent.$parent.badgeProjects > 0) {  
    $scope.$parent.$parent.$parent.$parent.$parent.badgeProjects = 0;  
    localStorage.setItem('projek-projects', JSON.stringify($scope.$parent.$parent.projectIDs));
  }
  
  function fetch() {
    return $projects.findAll().then(function(res) {
      $scope.items = res;
    })
  }

  $scope.items = [] ;

  $scope.refresh = function() {
    $scope.items = [];
    fetch().finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  fetch();
})

.controller('ProjectCtrl', function($scope, $state, $stateParams, $projects, attachmentDownload, $auth) {
  function fetch () {
    return $projects.findOne($stateParams.id).then(function(res) {
      $scope.item = res;
    })
  }

  $scope.item = null;
  $scope.activeTab = 'info';

  $scope.refresh = function () {
    fetch().finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.showProjectItem = function (item) {
    $auth.isAllowedAccess(item).then(function () {
      if (item.remoteUrl) {
        attachmentDownload(item.remoteUrl);
      } else {
        $state.go('project-item', {id: item.id});
      }
    }, function () {
      $auth.notifyAgentOnly();
    });
  }

  $scope.showAttachment = function (attachment) {
    $auth.isAllowedAccess(attachment).then(function () {
      attachmentDownload(attachment.url);
    }, function () {
      $auth.notifyAgentOnly();
    });
  }

  fetch();
})

.controller('ProjectItemCtrl', function($scope, $stateParams, $projectItems) {
  $scope.item = $projectItems.peekOne($stateParams.id);
})

.controller('ProjectUpdateCtrl', function($scope, $stateParams, $updates) {
  $updates.findOne($stateParams.id, {include: ['project']}).then(function(res) {
    $scope.item = res;
    if ($scope.item.project) {
      $scope.title = 'Update: ' + $scope.item.project.title;
    } else {
      $scope.title = 'Update';
    }
  })
})
