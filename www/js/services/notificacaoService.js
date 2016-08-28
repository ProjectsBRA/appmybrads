  angular.module('mybradsprod.services')
  .service('$servicoNotificacao', function($http) {

    this.setToken = function(servidor, token, usuario){
      var dados = {
                    token : '',
                    usuario : '',
                    plataforma : 'Android'
                  };

      dados.token = token;
      dados.usuario = usuario;
      return $http.post(servidor + '/token', dados);
    };

    this.notificar = function(servidor, notificacao){
      return $http.post(servidor + '/notificacao', notificacao);
    };

    return this;

  })
