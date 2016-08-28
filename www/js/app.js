// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('mybradsprod', ['ionic', 'mybradsprod.controllers', 'mybradsprod.services', 'underscore',  'angular-notification-icons',
                           'monospaced.elastic', 'angularMoment','jett.ionic.filter.bar', 'angular.filter', 'ui.utils.masks', 'angular-md5',
                           'mybradsprod.templatesComponent', 'ngCordova', 'ksSwiper', 'tabSlideBox', 'ngCordova', 'irontec.simpleChat','fcsa-number'])
.run(function($ionicPlatform, $cordovaStatusbar, $cordovaSplashscreen, $ionicPopup, $ionicHistory) {


  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    // setTimeout(function() {
    //     $cordovaSplashscreen.hide()
    // }, 3000);
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    if (window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
           $ionicPopup.show({
            title: "Sem conexão com a Internet ",
            template: '<body>Esse aplicativo funciona quando há conexão com a internet.</body>',
            buttons: [
              { text: 'OK',
                ontap: function(){
                 return null;
                } 
              //close popup and do nothing
            }]
         }).then(function(result){
             ionic.Platform.exitApp();
         })
         }
         
    }  
     ;

  });
})
// fitlers
  .filter('nl2br', ['$filter',
    function($filter) {
      return function(data) {
        if (!data) return data;
        return data.replace(/\n\r?/g, '<br />');
      };
    }
  ])

 .directive('logOut', function() {
  return {
    link: function($scope, element) {
      element.on('click', function() {
      });
    }
  }
})

   .directive('defaultNavBackButton', function ($ionicHistory, $state, $stateParams, $ionicConfig, $ionicViewSwitcher, $ionicPlatform) {

        return {
            link: link,
            restrict: 'EA'
        };

        function link(scope, element, attrs) {

            scope.backTitle = function() {
                var defaultBack = getDefaultBack();
                if ($ionicConfig.backButton.previousTitleText() && defaultBack) {
                    return $ionicHistory.backTitle() || defaultBack.title;
                }
            };

            scope.goBack = function() {
                if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                } else {
                    goDefaultBack();
                }
            };

            scope.$on('$stateChangeSuccess', function() {
                element.toggleClass('hide', !getDefaultBack());
            });

            $ionicPlatform.registerBackButtonAction(function () {
                if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                } else if(getDefaultBack()) {
                    goDefaultBack();
                } else {
                    navigator.app.exitApp();
                }
            }, 100);

        }

        function getDefaultBack() {
            return ($state.current || {}).defaultBack;
        }

        function goDefaultBack() {
            $ionicViewSwitcher.nextDirection('back');
            $ionicHistory.nextViewOptions({
                disableBack: true,
                historyRoot: true
            });

            var params = {};

            if (getDefaultBack().getStateParams) {
                params = getDefaultBack().getStateParams($stateParams);
            }

            $state.go(getDefaultBack().state, params);
        }
    })

.directive('rotate', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(attrs.degrees, function (rotateDegrees) {
                console.log(rotateDegrees);
                var r = 'rotate(' + rotateDegrees + 'deg)';
                element.css({
                    '-moz-transform': r,
                    '-webkit-transform': r,
                    '-o-transform': r,
                    '-ms-transform': r
                });
            });
        }
    }
  })

.directive('select', function($timeout) {
  return {
    restrict: 'E',
    link: function(_, element) {
      element.bind('focus', function(e) {
        $timeout(function() {
          if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
          }
        })
      });
      element.bind('blur', function(e) {
        $timeout(function() {
          if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          }
        });
      });
    }
  }
})

  .directive('autolinker', ['$timeout',
    function($timeout) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          $timeout(function() {
            var eleHtml = element.html();

            if (eleHtml === '') {
              return false;
            }

            var text = Autolinker.link(eleHtml, {
              className: 'autolinker',
              newWindow: false
            });

            element.html(text);

            var autolinks = element[0].getElementsByClassName('autolinker');

            for (var i = 0; i < autolinks.length; i++) {
              angular.element(autolinks[i]).bind('click', function(e) {
                var href = e.target.href;
                console.log('autolinkClick, href: ' + href);

                if (href) {
                  //window.open(href, '_system');
                  window.open(href, '_blank');
                }

                e.preventDefault();
                return false;
              });
            }
          }, 0);
        }
      }
    }
  ])



// .constant('S3URL','mybradsprod.s3-website-us-east-2.amazonaws.com')
// .constant('Amazon', 
//    { baseUrl : 'https://s3.amazonaws.com/mybradsprod', //'https://mybradsprod.s3.amazonaws.com',
//      baseDynamoDB :  'sa-east-1:167819122117',
//      regiao : 'sa-east-1',
//      key : 'AKIAJU4A3Y4E27MDK6SA',
//      keySecret :  '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',
//      bucket: 'mybradsprod'
//    }
//   )

 .constant('S3URL','mybradsprod.s3-website-us-east-2.amazonaws.com')
 .constant('S3Email', 
   { region : 'us-west-2',
     email  : 'contato@mybrads.com',
     ses    : 'ses-smtp-user.mybrads',
     key    : 'AKIAIS3F3CFNVYG2X76A',
     keySecret: 'AqSQA8+EtiQRVjUJIqy6QhfWGTvh0DsQYb3hyxkejYof',
     server : 'http://179.184.44.83:1010'
   }
 )
 .constant('Amazon', 
    { baseUrl : 'https://s3.amazonaws.com/mybradsprod', //'https://mybradsprod.s3.amazonaws.com',
      baseDynamoDB :  'us-west-2:167819122117',
      regiao : 'us-west-2',
      key : 'AKIAJU4A3Y4E27MDK6SA',
      keySecret :  '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',
      bucket: 'mybradsprod'
    }
   )

// .constant('S3URL','mybrads.s3-website-sa-east-1.amazonaws.com')
// .constant('Amazon', 
//    { baseUrl : 'mybrads.s3-website-sa-east-1.amazonaws.com',
//      baseDynamoDB :  'sa-east-1:098474835986',
//      regiao : 'sa-east-1',
//      key : 'AKIAIK4HAXEBFAC5JJHQ',
//      keySecret :  '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',
//      bucket: 'mybrads'
//    }
//   )


.config(function($stateProvider, $urlRouterProvider,   $ionicConfigProvider, $ionicFilterBarConfigProvider) {
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $ionicConfigProvider.tabs.position('bottom');

  $stateProvider
    // setup an abstract state for the tabs directive
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'MenuCtrl',
       resolve: {
         categories: function (Category) {
           return Category.getPromise();
         },
         subcategories : function(SubCategory){
           return SubCategory.getPromise();
         },
         items : function(Item){
           var items = Item.all();
           if(items.length==0){
              return Item.getPromise();
           }else{
             return items;
           }
         }
      }

    })
    .state('app.item', {
      url: '/item',
      views: {
        'menuContent' : {
          templateUrl: 'templates/tab-item.html',
          controller: 'PrincipalCtrl'
        }
      }
    })

    .state('app.item-view', {
      url: '/item/:itemId',
      views: {
        'menuContent' : {
          templateUrl: 'templates/item-view.html',
          controller: 'ItemCtrl',
          defaultBack: {
             state: 'app.item'
           }          
        }
      }
    })
    .state('app.amazon', {
      url: '/amazon',
      views: {
        'menuContent' : {
          templateUrl: 'templates/amazon.html',
          controller: 'ItemAmazonCtrl',
          defaultBack: {
             state: 'app.item'
           }          
        }
      }
    })
    .state('app.publish', {
      url: '/publish',
      views: {
        'menuContent' : {
          templateUrl: 'templates/tab-publish.html',
          controller: 'PublishCtrl',
          defaultBack: {
            state: 'app.item'
          }          
        }
      }
    })
    .state('app.filtro', {
      url: '/filtro',
      views: {
        'menuContent' : {
          templateUrl: 'templates/filtro-categoria.html',
          controller: 'FiltroCtrl',
        }
      }
    })
    .state('app.account', {
      url: '/account',
      views: {
        'menuContent' : {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl',
          defaultBack: {
           state: 'app.item'
          }          
        }
      }
    })
    .state('app.anuncios', {
      url: '/anuncios',
      views: {
        'menuContent' : {
          templateUrl: 'templates/meusAnuncios.html',
          controller: 'AnunciosCtrl'
        }
      }
    })
    .state('app.notificacoes', {
      url: '/notificacoes',
      views: {
        'menuContent' : {
          templateUrl: 'templates/notificacoes.html',
          controller: 'MensagemRecebidaCtrl',
          defaultBack: {
            state: 'app.item'
          }          
        }
      }
    })

    .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent' : {
          templateUrl: 'templates/tab-settings.html',
          controller: 'SettingsCtrl'
        }
      }
    })
    .state('app.logout', {
      url: '/logout',
      views: {
        'menuContent' : {
          templateUrl: 'templates/confirmacaoLogoff.html',
          controller: 'SettingsCtrl'
        }
      }
    })
    .state('app.login', {
      url: '/login',
      views: {
        'menuContent' : {
          templateUrl: 'templates/login-view.html',
          controller: 'LoginCtrl'
        }
      }
    })

    .state('app.signup', {
      url: '/signup',
      views: {
        'menuContent' : {
          templateUrl: 'templates/signup-view.html',
          controller: 'LoginCtrl'
        }
      }
    })

    .state('app.contact', {
      url: '/settings/contact',
      views: {
        'menuContent' : {
          templateUrl: 'templates/contact-view.html',
          controller: 'SettingsCtrl'
        }
      }
    })
    .state('app.item-contato', {
      url: '/item/:itemId/contato',
      views: {
        'menuContent' : {
          templateUrl: "templates/contact-view.html",
          controller: 'ItemCtrl'
        }
      }
    })
    .state('app.item-message', {
      url: '/item/:itemId/message',
      views: {
        'menuContent' : {
          templateUrl: "templates/item-message.html",
          controller: 'MensagemCtrl'
        }
      }
    })
    .state('app.password-new', {
      url: '/login/passwordNew',
      views: {
        'menuContent' : {
          templateUrl: "templates/password-update.html",
          controller: 'LoginCtrl'
        }
      }
    })
    .state('app.item-contatos', {
      url: '/item/:itemId/contatos',
      views: {
        'menuContent' : {
          templateUrl: "templates/tab-contatos.html",
          controller: 'MensagemCtrl'
        }
      }
    });


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/item');
});

