angular.module('projek.news', [])

.controller('NewsCtrl', function($scope, $state, $ionicLoading, $news) {

    if ($scope.$parent.$parent.badgeNews > 0) {
      $scope.$parent.$parent.$parent.$parent.$parent.badgeNews = 0;
      localStorage.setItem('projek-news', JSON.stringify($scope.$parent.$parent.newsIDs));
    }
    
    function fetch() {
      return $news.findAll({page: {offset: $scope.news.length}}).then(function (items) {
        if (items.length === 0) {
          $scope.canFetch = false;
        }

        Array.prototype.push.apply($scope.news, items);
      });
    }

    $scope.news = [];
    $scope.canFetch = true;

    $scope.fetchMore = function () {
      fetch().finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }

    $scope.refresh = function() {
      $scope.news = [];
      $scope.canFetch = true;
      fetch().finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    fetch();
})

.controller('NewsDetailCtrl', function($scope, $state, $ionicLoading, $http, $news, browserService) {
    var $newsID = $state.params.newsid;

    $news.findOne($newsID).then(function (item) {
      $scope.news = item;
    });

    $scope.openBrowser = function(url_reference) {
      browserService.openBrowser({url:url_reference});
    }
});
