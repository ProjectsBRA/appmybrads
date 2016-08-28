angular.module('mybradsprod.controllers')
.controller('NotificacaoCtrl', function ($rootScope, $cordovaToast,$scope, $state,$servicoNotificacao) {

  $scope.servidor = 'http://179.184.44.83:1010';
  $scope.token = undefined;
  var push = undefined;


  $scope.registrarToken = function () {

     push = PushNotification.init({
       android: {
         senderID: "181964917133"
       },
       ios: {
         alert: "true",
         badge: true,
         sound: 'false'
       },
       windows: {}
     });

     push.on('registration', function(data) {
       //console.log("registration event",JSON.stringify(data));
       //alert("registration event " + JSON.stringify(data));
       //alert("registration token " + data.registrationId);
       $scope.token = data.registrationId;
       $scope.$apply();
       $scope.setToken();
     });

     push.on('notification', function(data) {

         var alertaPopUp = $ionicPopup.confirm({
           title: data.title,
           template: data.message,
           buttons: [
             { text: '<b>Abrir Indicador',
                  type: 'button-db1-medio',
                  onTap:function(e){
                      //$indicadorList.selecionaIndicador(data.additionalData.indicador);
                      //$indicadorList.apresentarIndicador($indicadorList.itemSelecionado);
                      //$scope.notificarLida(idIndicador);
                      alertaPopUp.close();
                  }
            },
            { text: '<b>Fechar</b>',
              type: 'button-green',
              onTap:function(e){
                   return false;
              }
            }
           ]
         });

       push.finish(function () {
         console.log('finish successfully called');
       });
     });

     push.on('error', function(e) {
       console.log("push error",JSON.stringify(e));
       //window.plugins.toast.showLongTop(JSON.stringify(e));
       //$cordovaToast.showShortBottom(JSON.stringify(e));
     });

   };

   $scope.desRegistrar = function(){
     if($scope.token !== undefined) {
       push.unregister(function () {
         //window.plugins.toast.showShortBottom('Aplicativo não receberá mais notificação!');
         $scope.token = undefined;
         $scope.$apply();
       }, function (erro) {
         //window.plugins.toast.showShortBottom(erro);
       });
     }
   };

   $scope.setToken = function(){
     //$scope.token = localStorage.getitem('token_service');
     $servicoNotificacao.setToken($scope.servidor, $scope.token).then(function (response) {
       //$cordovaToast.showShortBottom("OK");
       //window.plugins.toast.showLongTop('Aplicativo não receberá mais notificação!');

       //alert("Envio Token",response);

     }).catch(function (erro) {
       //$cordovaToast.showShortBottom("Erro: "+JSON.stringify(erro));
       //alert(JSON.stringify(erro));

     });
   };

   $scope.enviarMensagem = function(mensagem){
     $servicoNotificacao.notificar($scope.servidor, mensagem).then(function (response) {
       //$cordovaToast.showShortBottom("Enviado");
     }).catch(function (erro) {
       //$cordovaToast.showShortBottom("Erro: "+JSON.stringify(erro));
       alert(JSON.stringify(erro));

     });
   }

  $scope.$on('registrarToken', function (event) {
    $scope.registrarToken();
  });

  $scope.$on('setToken', function (event) {
    $scope.setToken();
  });

  $scope.$on('notificacao', function (event) {
    $scope.enviarMensagem();
  });

});
