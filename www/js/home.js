angular.module('projek.home', [])

.controller('HomeCtrl', function($scope, $feed, $projects, $timeout, $ionicSlideBoxDelegate, pushService, $ads, attachmentDownload) {
    function fetch() {
      $scope.fetching = true;
      return $feed.findAll({
        page: {
          limit: 8,
          offset: $scope.items.length
        }
      }, {
        include: ['project']
      }).then(function (items) {
        if (items.length === 0) {
          $scope.canFetch = false;
        }

        var ad_count = Math.floor(($scope.items.length + 4) / 5);
        if (ad_count < $scope.ads.length) {
          var index = ($scope.items.length % 5);
          for (var i=0; i<items.length; i++) {
            if (index == 0 && ad_count<$scope.ads.length) {
              $scope.items.push(breakCyclesInBFS($scope.ads[ad_count]));
              index++;
              ad_count++;
            }
            $scope.items.push(breakCyclesInBFS(items[i]));            
            index = (index + 1) % 5;
          }
        } else  {
          Array.prototype.push.apply($scope.items, items.map(function (item, key) {
            return breakCyclesInBFS(item);
          }));
        }
        
      });
    }

    $scope.hasFeatured = false;
    $scope.fetching = false;
    $scope.projects = [];
    $scope.items = [];
    $scope.canFetch = true;

    $scope.ads = [];

    $scope.fetchMore = function () {
      fetch().finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $timeout(function () {
          $scope.fetching = false;
        });
      });
    }

    $scope.refresh = function() {
      $scope.items = [];
      $scope.ads = [];
      $scope.canFetch = true;

      $ads.findAll().then(function(res) {
        Array.prototype.push.apply($scope.ads, res.map(function (item) {
          var newItem = breakCyclesInBFS(item);
          newItem._type = "ad";
          return newItem;
        }));
        fetch().finally(function() {
          $scope.$broadcast('scroll.refreshComplete');
        });
      });      
    }

    $scope.$on('$ionicView.enter', function () {
      if ($scope.hasFeatured) {
        $ionicSlideBoxDelegate.$getByHandle('hscroll').start();
      }
    });

    pushService.initOnce();

    $projects.findAll({
      filter: {featured: true}
    }).then(function(projects) {
      $scope.projects = _.shuffle(projects);
      $scope.hasFeatured = true;

      // bug with slide box specifically for 2 items
      if ($scope.projects.length === 2) {
        $scope.projects = $scope.projects.concat($scope.projects);
      }

      $timeout(function () {
        var slider = $ionicSlideBoxDelegate.$getByHandle('hscroll');
        slider.update();
      });
    });

    $ads.findAll().then(function(res) {
      Array.prototype.push.apply($scope.ads, res.map(function (item) {
        var newItem = breakCyclesInBFS(item);
        newItem._type = "ad";
        return newItem;
      }));
      fetch();
    });
    
    $scope.goAd = function(url) {
      attachmentDownload(url);
    }
});
