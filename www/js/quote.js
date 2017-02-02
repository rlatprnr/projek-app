angular.module('projek.quote', [])

.controller('QuoteCtrl', function($scope, $state, $ionicLoading, $quotes) {
    function fetch() {
      return $quotes.findAll({page: {offset: $scope.quotes.length}}).then(function (items) {
        if (items.length === 0) {
          $scope.canFetch = false;
        }

        Array.prototype.push.apply($scope.quotes, items);
      });
    }

    $scope.quotes = [];
    $scope.canFetch = true;

    $scope.fetchMore = function () {
      fetch().finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }

    $scope.refresh = function() {
      $scope.quotes = [];
      $scope.canFetch = true;
      fetch().finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    fetch();
});
