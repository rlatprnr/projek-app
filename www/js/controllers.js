angular.module('projek.controllers', [])

.controller('MainCtrl', function($scope, $state, $auth, $feed_summary) {
  $scope.logout = function() {
    $auth.logout();
    console.log(">>>");
    $state.go('intro');
  }

  $scope.badgeProjects = 0;
  $scope.badgeEvents = 0;
  $scope.badgeUpdates = 0;
  $scope.badgeNews = 0;

  $scope.projectIDs = [];
  $scope.eventIDs = [];
  $scope.updateIDs = [];
  $scope.newsIDs = [];

  $scope.events = [];

  // localStorage.setItem('projek-projects', '[]');
  // localStorage.setItem('projek-events', '[]');
  // localStorage.setItem('projek-updates', '[]');
  // localStorage.setItem('projek-news', '[]');

  loadFeedSummary();

  function loadFeedSummary(init) {
    $feed_summary.findAll().then(function(items) {
      $scope.badgeProjects = checNewItems('projects', items, $scope.projectIDs);
      $scope.badgeEvents = checNewItems('events', items, $scope.eventIDs);
      $scope.badgeUpdates = checNewItems('updates', items, $scope.updateIDs);
      $scope.badgeNews = checNewItems('news', items, $scope.newsIDs);
      setTimeout(function(){
        loadFeedSummary(true);
      }, 3*60*1000);
    });
    console.log('loadFeedSummary');
  }

  function checNewItems(name, items, ids) {
    while (ids.length) ids.pop();
    var isCurrentState = $state.current.name == 'tab.' + name;
    var key = 'projek-' + name;
    var str = localStorage.getItem(key);
    Array.prototype.push.apply(ids, JSON.parse(str));
    if (str == null) {
      isCurrentState = true;
    }
    var badge = 0;
    for (var i=0; i<items.length; i++) {
      var item = items[i];
      if (item._type == name) {
        if (ids.indexOf(item.id) == -1) {
          ids.push(item.id);
          if (!isCurrentState) {
            badge++;
          }
        }
      }
    }

    if (isCurrentState) {
      localStorage.setItem(key, JSON.stringify(ids));
    }
    return badge;
  }

  $scope.showTicket = false;

  $scope.showTicket = function(event, ticketid) {
    $scope.ticket = {
      barcode:'http://ticket.projek.asia/qr.php?tid=' + ticketid,
      event: event
    }
  }

  $scope.hideTicket = function() {
    $scope.ticket = false;
  }

  $scope.regEventForm = false;

  $scope.showRegEventForm = function(event, regData) {
    $scope.regEventForm = {
      data: regData,
      event: event
    }
  }

  $scope.hideRegEventForm = function() {
    $scope.regEventForm = false;
  }


  $scope.loadingMsg = "Loading";

})
