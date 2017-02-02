angular.module('projek.event', [])

.controller('EventsCtrl', function($scope, $events) {

  if ($scope.badgeEvents > 0) {
    $scope.$parent.$parent.$parent.$parent.$parent.badgeEvents = 0;
    localStorage.setItem('projek-events', JSON.stringify($scope.eventIDs));
  }
  
  function fetch() {
    return $events.findAll().then(function(res) {
      console.log(res);
      $scope.items = res;
      $scope.$parent.$parent.$parent.$parent.$parent.events = res;
    })
  }
  $scope.refresh = function() {
    $scope.items = [];
    fetch().finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
  fetch();
})

.controller('EventCtrl', function($scope, $state, $stateParams, $auth, $events, regEvent, $filter) {
  function fetch () {
    return $events.findOne($stateParams.id).then(function(res) {
      $scope.item = res;
    })
  }

  $scope.clickGoing = function(){
    $auth.isAllowedAccess({ roles: [{ name: 'agent' }] }).then(function() {
      if ($scope.item.myAttendance) {
        regEvent($scope);
      } else {
        $state.go("event-register", { id: $scope.item.id });
      }
    }, function() {
      regEvent($scope);
    });
  }

  $scope.shareAnywhere = function(name, date, url){
    var isoDate = $filter('date')(date, "MMM dd, yyyy");
    console.log(isoDate);
    window.plugins.socialsharing.share(name + " on " + isoDate, "Check out this event I found on Projek:", null, "http://projek.asia" + url);
  }

  $scope.refresh = function () {
    fetch().finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  fetch();
})

.controller('EventRegistrationCtrl', function($scope, $state, $stateParams, $events, regEvent, regEventForm, $window) {
  $scope.item = null;
  $scope.submitted = false;
  $scope.formLoaded = false;
  $scope.form = new regEventForm($scope);

  function fetch () {
    return $events.findOne($stateParams.id).then(function(res) {
      $scope.item = res;
    });
  }

  $scope.clickGoing = function($id){
    $scope.registrationData = $scope.form.getData();
    regEvent($scope);
  }

  $scope.clickCancel = function() {
    $window.history.back();
  }

  $scope.clickDone = function() {
    $window.history.back();
  }

  $scope.onSoldOut = function() {
    $scope.clickDone();
  }

  $scope.onSubmitted = function(ticketId) {
    // No need to display successful message.
    //$scope.submitted = true;
    $scope.clickDone();
  }

  fetch().then(function(){
    if ($scope.item.registrationFormUrl != null) {
      $scope.form.load($scope.item.id);
    } else {
      $scope.clickGoing($scope.item.id);
    }
  }); 
});
