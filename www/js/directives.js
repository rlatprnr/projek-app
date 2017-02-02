angular.module('projek.directives', [])

.directive('slideButton', function($state) {
  return {
    restrict: 'A',
    link: function($scope, $el, $attrs,  ctrl) {
      $scope.$on('slider-change.button', function(e, $index) {
        if ($index === 0) {
          $el.removeClass($attrs.slideButtonDark);
          $el.addClass($attrs.slideButtonLight);
        } else {
          $el.removeClass($attrs.slideButtonLight);
          
        }
      })
    }
  }
})

.directive('slideButtons', function($state) {
  return {
    restrict: 'E',
    transclude: true,
    template: '<ng-transclude/>',
    link: function($scope, $el, $attrs) {
      var slideIndex = 0;

      $scope.slideChanged = function($index) {
        slideIndex = $index;
        $scope.$broadcast('slider-change.button', slideIndex);
      }
    }
  }
})

.directive('newsFeedItem', function($state) {
  return {
    restrict: 'E',
    scope: {
      item: '=',
    },
    templateUrl: 'templates/directives/news-feed-item.html'
  }
})

.directive('adItem', function($state) {
  return {
    restrict: 'E',
    scope: {
      item: '=',
    },
    templateUrl: 'templates/directives/ad-item.html'
  }
})

.directive('eventsFeedItem', function($state, $filter, $auth, regEvent) {
  return {
    restrict: 'E',
    scope: {
      item: '=',
    },
    templateUrl: 'templates/directives/events-feed-item.html',
    link: function ($scope, $el, $attrs) {
      $scope.clickGoing = function() {
        $auth.isAllowedAccess({roles:[{name:'agent'}]}).then(function(){
          if ($scope.item.myAttendance) {
            regEvent($scope);
          } else {
            $state.go("event-register", { id: $scope.item.id });
          }
        }, function(){
          regEvent($scope);
        });
      }
      $scope.shareAnywhere = function(name, date, url){
        var isoDate = $filter('date')(date, "MMM dd, yyyy");
        console.log(isoDate);
        window.plugins.socialsharing.share(name + " on " + isoDate, "Check out this event I found on Projek:", null, "http://projek.asia" + url);
      }
    }
  }
})

.directive('projectsFeedItem', function() {
  return {
    restrict: 'E',
    scope: {
      item: '=',
    },
    templateUrl: 'templates/directives/projects-feed-item.html'
  }
})

.directive('quotesFeedItem', function() {
  return {
    restrict: 'E',
    scope: {
      item: '=',
    },
    templateUrl: 'templates/directives/quotes-feed-item.html'
  }
})

.directive('updatesFeedItem', function() {
  return {
    restrict: 'E',
    scope: {
      item: '=',
      project: '='
    },
    templateUrl: 'templates/directives/updates-feed-item.html'
  }
})

.directive('introSlide', function() {
  var template = '';
  template += "<div class='row row-center text-center'>";
  template += "  <div class='col'>";
  template += "    <div class='row message'>";
  template += "      <div class='col col-80 col-offset-10'>";
  template += "        <div ng-transclude></div>";
  template += "       </div>";
  template += "    </div>";
  template += "  </div>";
  template += "</div>";

  return {
    restrict: 'E',
    require: '^ionSlideBox',
    template: template,
    transclude: true,
    compile: function(element) {
      element.addClass('screen');
      element.addClass('slider-slide');
    }
  }
})

.directive('hasRemoteLinks', function(browserService, $timeout) {
  return {
    restrict: 'A',
    link: function ($scope, $el, $attrs) {
      $timeout(function () {
        $el.find('a').on('click', function (e) {
          e.preventDefault();
          var url = e.currentTarget.getAttribute('href');
          browserService.openBrowser({url: url});
        });
      });
    }
  }
})

.directive('attachmentDownload', function($parse, attachmentDownload) {
  return {
    restrict: 'A',
    link: function($scope, $el, $attrs) {
      $el.bind('click', function(e) {
        var url = $parse($attrs.attachmentDownload)($scope);
        if (url) {
          e.preventDefault();
          attachmentDownload(url);
        }
      });
    }
  }
})

.directive('goToUpdateOnClick', function($state, $parse, $auth) {
  return {
    restrict: 'A',
    link: function($scope, $el, $attrs) {
      const update = $parse($attrs.goToUpdateOnClick)($scope);

      function handleClick(e) {
        if (update.body) {
          $auth.isAllowedAccess(update).then(function () {
            $state.go('project-update', {id: update.id});
          }, function () {
            $auth.notifyAgentOnly();
          });
        } else {
          e.preventDefault();
        }
      }

      $el.bind('click', handleClick);
    }
  }
})

.directive('passwordMatches', function($parse) {
  return {
    restrict: 'A',
    require: '^ngModel',
    link: function($scope, $el, $attrs, $ctrl) {
      function compareValue () {
        return $parse($attrs.passwordMatches)($scope).$viewValue;
      }

      $ctrl.$parsers.unshift(function (viewValue) {
        var match = viewValue === compareValue();
        $ctrl.$setValidity('passwordMatch', match);
        return viewValue;
      });
    }
  }
})

.directive('paNavBar', function($ionicHistory, $auth) {
  // the ion-cover-header plugin requires this html to be present immediately.
  // Loading from templateUrl does not satisfy this.
  var tmpl="";
  tmpl += "<ion-header-bar class=\"bar-positive\">";
  tmpl += "  <div class=\"buttons\">";
  tmpl += "    <button class='button button-clear' ng-if=\"hasBackView\" ng-click=\"goBack()\">";
  tmpl += "      <i class=\"fa fa-arrow-left\"><\/i> ";
  tmpl += "    <\/button>";
  tmpl += "  <\/div>";
  tmpl += "  <span class='title' ng-bind-html='title'></span>";
  tmpl += "  <div ng-if=\"showRight\" class=\"buttons\">";
  tmpl += "    <button ui-sref=\"account\" class='button button-clear'>";
  tmpl += "     <i class='icon ion-android-more-vertical'></i>";
  tmpl += "    </button>";
  tmpl += "  <\/div>";
  tmpl += "<\/ion-header-bar>";
  tmpl += "";

  var logoHtml = "<img class='junti-logo-small' src='img/logo.png' height='40px'>";

  return {
    restrict: 'E',
    template: tmpl,
    link: function($scope, $el, $attrs) {
      $scope.showRight = $auth.isAuthenticated();
      $scope.title = $attrs.title || logoHtml;
      $scope.hasBackView = !$attrs.disableBack && $ionicHistory.backView();
      $scope.goBack = $ionicHistory.goBack;
    }
  }
})

.directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value, 10);
      });
    }
  };
});
