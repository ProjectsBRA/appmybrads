angular.module('mybradsprod.templatesComponent', [])
.factory('EmailTemplate', function(){
	return {
		confirmPublish : function(scope, item){
			return data = {
							to:       scope.publish.email,
							toname:   scope.publish.email, 
					 		from:     'stambay@stamplay.com',
					 		fromname: 'StamBay',
					 		subject:  'Oferta '+ item.name,
					 		body:     'Favor copiar o código e inserir no aplicativo para completar a publicação</br> '+
					 							'Código : '+item._id
						}
		},
		contactSeller: function(scope, item){
			return data = {
							to:       item.email,
							toname:   item.email, 
					 		from:     scope.contact.email,
					 		fromname: 'StamBay',
					 		subject:  'Oferta '+ item.name,
					 		body:     scope.contact.text
						}
		}
	}				
})
.factory('PopupTemplate', function(){
	return {
		popupEmailPublish : function(){
			return data = {
					     title: 'E-mail enviado',
					     template: 'Confirmação Autorizado',
							 buttons: [{text: '<b>Ok</b>',
							        		type: 'button-energized'}]
							 }
		},
		deleteItem: function(){
			return data = {
		     title: 'Deletar o anúncio',
		     template: 'Você quer deletar esse anúncio?',
				 okText: 'Delete', 
				 okType: 'button-energized'
			}
		},
		confirmItem : function($scope){
			return data = {
		    template: '<input type="text" ng-model="modal.itemId">',
		    title: 'Informe o código',
		    subTitle: 'Código que você recebeu via e-mail',
		    scope: $scope,
		    buttons: [
		      { text: 'Cancelar' },
		      {
		        text: '<b>Salvar</b>',
		        type: 'button-energized',
		        onTap: function(e) {
		          if (!$scope.modal.itemId || $scope.modal.itemId.length != 24) {
		            e.preventDefault();
		          } else {
		          	 return $scope.modal.itemId
		          }
		        }
		      }
	    	]
	  	}
		}
	}				
})

