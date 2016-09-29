  angular.module('mybradsprod.services')
  .service('$servicoNotificacao', function($http, Utils, $cordovaDevice, $state, $ionicPopup) {
  var servicoNotificacao = this;

  this.configuracao = {
     servidor : 'http://179.184.44.83:1010',
     token    : '',
     plataforma : '',
     dispositivo : '',
     versao : ''
   }

 this.registro = function () {
  	if(Utils.ValidaEhMobile()==true)
    {
      push = PushNotification.init({
        android: {
          //senderID: "181964917133"
          senderID : "806325933234"
        },
        ios: {
          senderID : "806325933234",
          alert: true,
          badge: true,
          sound: true,
          gcmSandbox: true
        },
        windows: {}
      });

      push.on('registration', function(data) {
        if(servicoNotificacao.configuracao.token!==data.registrationId){
          servicoNotificacao.gravarToken(data.registrationId);
          servicoNotificacao.setToken();
        }
      });

      push.on('notification', function(data) {
         navigator.vibrate(500);
         var alertaPopUp = $ionicPopup.confirm({
           title: data.title,
           template: data.message,
           buttons: [
             { text: '<b>Abrir Mensagens',
                  onTap:function(e){
                    alertaPopUp.close();
  		              $state.go('app.notificacoes', {}, { reload: true });
                  }
            },
            { text: '<b>Fechar</b>',
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
     });
    }else{
        servicoNotificacao.gravarToken('123456');
        servicoNotificacao.setToken();
     
    }
   };


    this.gravarToken = function(token){
      if (ionic.Platform.platform()!=='win32' && ionic.Platform.platform()!=='macintel'){
        servicoNotificacao.configuracao.plataforma = $cordovaDevice.getPlatform();
        servicoNotificacao.configuracao.versao = $cordovaDevice.getVersion();
        servicoNotificacao.configuracao.dispositivo = $cordovaDevice.getUUID();
      }else{
        servicoNotificacao.configuracao.plataforma = ionic.Platform.platform();
        servicoNotificacao.configuracao.versao = ionic.Platform.version();
        servicoNotificacao.configuracao.dispositivo = 'VYE-300';
      }
      servicoNotificacao.configuracao.token = token;
    } 

    this.setToken = function(){
      var dados = {
                    token : '',
                    nomeusuario : '',
                    plataforma : 'Android',
                    usuario : ''
                  };
      usuario = Utils.LocalStorage.getObject('user');

      dados.token = servicoNotificacao.configuracao.token;
      dados.plataforma = servicoNotificacao.configuracao.plataforma;
      dados.usuario     = usuario.id;
      dados.nomeusuario = usuario.firstName;

      var req = {
        method: 'POST',
        url: this.configuracao.servidor + '/notification/token' ,
        headers: {
          'Content-Type': 'application/json'
        },
        data : dados
      };
      return $http(req);

    };

    this.notificar = function(dadosEnvio){
      var req = {
        method: 'POST',
        url: this.configuracao.servidor + '/notification/mensagem' ,
        headers: {
          'Content-Type': 'application/json'
        },
        data : dadosEnvio
      };
      return $http(req);
    };

    return this;

  })
