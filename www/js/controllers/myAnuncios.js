angular.module('mybradsprod.controllers')
  .controller('MeusAnunciosCtrl', ['$scope', '$state', '$stateParams', 'S3ServiceAmazon', '$q', '$ionicHistory', 'Utils',  'Item', '_',
     function($scope, $state, $stateParams, S3ServiceAmazon, $q, $ionicHistory, Utils, Item, _) {

       $scope.goBack = function(){
         $ionicHistory.goBack();
         $state.go('app.item');
       };

       $scope.selecionarAnuncio = function(item){
         Utils.LocalStorage.setObject("ItemEdicao", {"id": item.id, "dados" : item});
         //$ionicHistory.goBack();
         //$state.go('app.publish');

         $ionicHistory.clearHistory();
         $ionicHistory.clearCache();          
         Utils.State.go('app.publish');

       }

       $scope.$on('atualizaItens', function(event) {
         var idAnuncio =  Utils.LocalStorage.getObject("ItemEdicao").id;
         item = _.findWhere(items, { id : idAnuncio});
         $scope.anuncios.splice(item, 1);
       })


       $scope.buscarMeusAnuncios = function(){
          var idUser = Utils.LocalStorage.getObject('user').id;
          var where = { "user_anunciante" : Utils.montaQueryAmazon('EQ', idUser)};

          S3ServiceAmazon.AnunciosDynamoDB(where).then(function (result) {
               //arquivo.Success = true;
               $scope.anuncios = result;
          }, function (error) {
              // Ma'rk the error',
              $scope.Error = error;
         }, function (progress) {
          $scope.anuncios = result;
              // Write the progress as a percentage
              //arquivo.Progress = (progress.loaded / progress.total) * 100
         });      

       };

     }


   ]);
