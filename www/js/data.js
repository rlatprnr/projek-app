angular.module('projek.data', [])

.factory('JsonApi', function ($http, $injector, $q, API_BASE, JsonApiDataStore, $auth) {
  function JsonApi (type, path) {
    this.type = type;
    this.path = path;
  }

  function fetchIncluded (rels, records) {
    var processing = {};
    var promises = [];

    records.forEach(function (obj) {
      rels.forEach(function (key) {
        if (obj[key] && obj[key]._placeHolder) {
          var processingKey = obj[key]._type + obj[key].id;
          if (!processing[processingKey]) {
            processing[processingKey] = true;
            promises.push($injector.get('$'+obj[key]._type).findOne(obj[key].id));
          }
        }
      });
    });

    return $q.all(promises);
  }

  JsonApi.prototype.findAll = function (params, opts) {
    var params = params || {};
    var opts = opts || {};
    var AUTH_TOKEN_KEY = 'jwtBearerAuth';
    console.log(this.path.substring(1));
    if (this.path.substring(1) == 'events') {
      var token = window.localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        token = 'Bearer ' + token;
      }
      $http.defaults.headers.common.Authorization = token;
    }

    return $http.get(API_BASE + this.path, {
      params: params,
      headers: {
        'Accept': 'application/json'
      }
    })

    .then(function(res) {
      var res = JsonApiDataStore.store.sync(res.data);
      var include = opts.include;

      if (include && include.length > 0) {
        return fetchIncluded(include, res).then(function () {
          return res;
        });
      } else {
        return res;
      }
    });
  }

  JsonApi.prototype.findOne = function (id, opts) {
    var opts = opts || {};

    return $http.get(API_BASE + this.path + '/' + id, null, {
      headers: {
        'Accept': 'application/json'
      }
    })

    .then(function(res) {
      var res = JsonApiDataStore.store.sync(res.data);
      var include = opts.include;

      if (include && include.length > 0) {
        return fetchIncluded(include, [res]).then(function () {
          return res;
        });
      } else {
        return res;
      }
    });
  }

  JsonApi.prototype.create = function (attrs, opts) {
    var opts = opts || {};
    var path = this.path;

    if (opts.pathPrefix) {
      path = opts.pathPrefix + path;
    }

    var body = {
      data: {
        type: this.type,
        attributes: attrs
      }
    }

    return $http.post(API_BASE + path, body).then(function (res) {
      var res = JsonApiDataStore.store.sync(res.data);
      var include = opts.include;

      if (include && include.length > 0) {
        return fetchIncluded(include, [res]).then(function () {
          return res;
        });
      } else {
        return res;
      }
    });
  }

  JsonApi.prototype.update = function (id, attrs, opts) {
    var opts = opts || {};
    var path = this.path + '/' + id;

    if (opts.pathPrefix) {
      path = opts.pathPrefix + path;
    }

    var body = {
      data: {
        id: id,
        type: this.type,
        attributes: attrs
      }
    }

    return $http.patch(API_BASE + path, body).then(function (res) {
      var res = JsonApiDataStore.store.sync(res.data);
      var include = opts.include;

      if (include && include.length > 0) {
        return fetchIncluded(include, [res]).then(function () {
          return res;
        });
      } else {
        return res;
      }
    });
  }

  JsonApi.prototype.peekAll = function () {
    return JsonApiDataStore.store.findAll(this.type);
  }

  JsonApi.prototype.peekOne = function (id) {
    return JsonApiDataStore.store.find(this.type, id);
  }

  return JsonApi;
})

.factory('$projects', function (JsonApi) {
  return new JsonApi('projects', '/projects');
})

.factory('$updates', function (JsonApi) {
  return new JsonApi('updates', '/updates');
})

.factory('$projectItems', function (JsonApi) {
  return new JsonApi('projectItems');
})

.factory('$quotes', function (JsonApi) {
  return new JsonApi('quotes', '/quotes');
})

.factory('$events', function (JsonApi) {
  return new JsonApi('events', '/events');
})

.factory('$news', function (JsonApi) {
  return new JsonApi('news', '/news');
})

.factory('$feed', function (JsonApi) {
  return new JsonApi('feed', '/feed');
})

.factory('$feed_summary', function (JsonApi) {
  return new JsonApi('feed', '/feed/summary');
})

.factory('$agents', function (JsonApi) {
  return new JsonApi('agents', '/agents');
})

.factory('$ads', function (JsonApi) {
  return new JsonApi('ads', '/ads');
})


.factory('attachmentDownload', function($http, $state, $cordovaFileTransfer, browserService, $cordovaFileOpener2, $rootScope, $ionicPlatform, youtube, AppHelper) {
  return function (url) {
    function isPDF () {
      return url.substr(url.lastIndexOf('.') + 1) === 'pdf';
    }

    function isVideo () {
      return new RegExp('^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$').test(url);
    }

    function isViewer(){
      return new RegExp('^(viewer?\:\/\/).+$').test(url);
    }

    function isMap(){
      return new RegExp('^(map?\:\/\/).+$').test(url);
    }

    function isMap(){
      return new RegExp('^(map?\:\/\/).+$').test(url);
    }

    function isMap1(){
      return new RegExp('^(https\:\/\/www\.google[^\/]+\/maps\/)').test(url);
    }

    function downloadPDF () {
      var filePath = url.substr(url.lastIndexOf('/') + 1);
      var targetPath = cordova.file.externalApplicationStorageDirectory + filePath;
      var trustHosts = true;
      var options = {};

      $rootScope.$broadcast('loading:show');

      $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
        .then(function (result) {
          $rootScope.$broadcast('loading:hide');
          $cordovaFileOpener2.open(result.toInternalURL(), 'application/pdf');
        }, function (err) {
          $rootScope.$broadcast('loading:hide');
          alert('Server can not be reached, please contact our customer support.');
        });
    }

    function loadSwiper(result){
      //var paths = JSON.parse($stateParams.photos).data.photos;
      var pswpElement = document.querySelectorAll('.pswp')[0];
      var items = Array();
      for(i in result.data.photos){
        var item = {src: result.data.photos[i].src, w: result.data.photos[i].w, h: result.data.photos[i].h};
        items.push(item);
      }

      var options = {
          index: 0, // start at first slide
          backButtonHideEnabled: false,
          history: false,
          shareEl: false
      };

      AppHelper.galleryView = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
      AppHelper.galleryView.listen('close', function() {
        document.getElementById('idProjectCtrl').style.zIndex = '1';
        AppHelper.galleryView = null;
      });
      AppHelper.galleryView.init();
      //change zIndex of ion-content
      document.getElementById('idProjectCtrl').style.zIndex = '99';
    }

    if (isPDF(url) && $ionicPlatform.is('android')) {
      downloadPDF(url);
    } else if (isVideo(url)) {
      youtube.playVideo(url);
    } else if(isViewer(url)){
      $http.defaults.headers.common.Authorization = '';
      $http.get(url.substring(9)).then(function(result){
        loadSwiper(result);
      })
    } else if(isMap(url)){
      var latlong = url.substr(url.lastIndexOf('/') + 1);
      url = 'https://maps.google.com/maps/place/?q='+latlong+'&t=h&z=17&output=embed';
      browserService.openBrowser1({
        url: url
      });
    } else if(isMap1(url)){
      browserService.openBrowser1({
        url: url
      });
    } else {

      var arr = url.split(':');
      var p = arr[0].trim();
      if (p == 'project') {
        $state.go('project', {id: arr[1]});
      } else if (p == 'event') {
        $state.go('event', {id: arr[1]});
      } else if (p == 'update') {
        $state.go('project-update', {id: arr[1]});
      } else if (p == 'news') {
        $state.go('news-detail', {newsid: arr[1]});
      } else {
        browserService.openBrowser({
          url: url
        });
      }
      
    }
  }
})

.factory('regEvent', function ($auth, $http, $rootScope, $timeout, API_BASE, AppHelper, Popup) {

  return function(scope) {

    $auth.currentUser().then(function (res) {

      var body = {
        data: {
          userId: res.id,
          eventId: scope.item.id,
          registrationData: scope.registrationData
        }
      };

      $http.defaults.headers.common['Content-Type'] = 'application/json';

      if (scope.item.myAttendance == false) {

        $auth.isAllowedAccess({roles:[{name:'agent'}]}).then(function () {

          if (scope.item.attendeesCount == scope.item.maxAttendees) {
            scope.onSoldOut();
            Popup.alert('Projek', '', 'This event has sold out. You can check again later to see if a spot has opened up.', 'Ok');
            return;
          }

          AppHelper.loadingMsg = 'Registering the event...';

          $http.put(API_BASE + '/attendEvent', body, { headers: {
            'Content-Type': 'application/json'
          }}).then(function(response){      

            $rootScope.$broadcast('loading:show');
            $timeout(function(){

              AppHelper.loadingMsg = 'Loading';
              $rootScope.$broadcast('loading:hide');

              scope.item.myAttendance = true;   

              var rootScope = getRootScope();

              for(var key in rootScope.events) {
                if (rootScope.events[key].id == scope.item.id) {
                  rootScope.events[key].myAttendance = true;
                  break;
                }
              }

              var ticketid = res.id + '' + scope.item.id;
              scope.onSubmitted(ticketid);
              rootScope.showTicket(scope.item, ticketid);

            }, 3000);

          });

        }, function () {
          $auth.notifyAgentOnly('This event is only for an agent.');
        });

      } else {
        Popup.confirm('Projek', '', 'Are you sure you want to cancel your registration to this event?', 'Ok', 'Cancel', 
          function() {
            $http.delete(API_BASE + '/attendEvent', {data: body },
              { headers: {'Content-Type': 'application/json'}}
            ).then(function(response){
              scope.item.myAttendance = false;

              var rootScope = getRootScope();
              for(var key in rootScope.events) {
                if (rootScope.events[key].id == scope.item.id) {
                  rootScope.events[key].myAttendance = false;
                  break;
                }
              }
            });
          }
        );        
      }
      
      function getRootScope() {
        var rootScope = scope;
        while(rootScope.showTicket == undefined) {
          rootScope = rootScope.$parent;
        }
        return rootScope;
      }

    });

  };
})

.factory('regEventForm', function($http, $compile, API_BASE){
  function regEventForm(scope) {
    this.scope = scope
  }

  regEventForm.prototype.load = function(id) {
    var scope = this.scope;
    $http.get(API_BASE + "/event/registrationForm/" + id).then(function(res) {
      if (res.data != "") {
        $compile($('#registrationForm').html(res.data).contents())(scope);
        scope.formLoaded = true;
      } else {
        scope.clickGoing(id);
      }
    });
  }

  regEventForm.prototype.getData = function() {
    var registrationData = [];
    $('#registrationForm').find('.question').each(function(index, elm) {
      var $question = $(elm).find('.item-question').eq(0).html();
      var $answer = "";
      var $input = $(elm).find('select,input,textarea');
      $input.each(function(index, element) {
        $element = $(element);
        if (element.type == 'radio') {
          if ($(element).is(":checked")) {
            $answer = $element.val();
          }
        } else {
          $answer = $element.val();
        }
      });
      registrationData.push({
        question: $question,
        answer: $answer
      })
    });

    return JSON.stringify(registrationData);
  }

  return regEventForm;
})

.service('AppHelper', function () {
  this.loadingMsg = 'Loading';
  this.galleryView = null;
})

.service('Popup', function($ionicPopup){

  this.alert = function(title, subTitle, message, okText, callBack) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      subTitle: subTitle,
      template: message,
      okText: okText
    }).then(function(res) {
      if (callBack) {
        callBack();
      }
    });

  };

  this.confirm = function(title, subTitle, message, okText, cancelText, okCallback, cancelCallback) {
    var confirmPopup = $ionicPopup.confirm({
      title: title,
      subTitle: subTitle,
      template: message,
      cancelText: cancelText,
      okText: okText,

    });

    confirmPopup.then(function(res) {
      if(res) {
        if (okCallback) okCallback();
      } else {
        if (cancelCallback) cancelCallback();
      }
    });
  };

})

