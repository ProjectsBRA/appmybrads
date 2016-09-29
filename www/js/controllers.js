angular.module('mybradsprod.controllers', ['ionic', 'underscore', 'ngCordova'])
  .controller('PrincipalCtrl', function($scope,  $ionicPopover, $state, $ionicLoading, IonicComponent, ItemConfig, 
  	                                     $timeout, $ionicHistory, User, Utils, $ionicFilterBar, $ionicGesture, $rootScope, 
  	                                    S3ServiceAmazon,   $ionicPlatform, $ionicPopup, $interval, $ionicModal, Mensagem, _,
																				$servicoNotificacao) {

	 var messageCheckTimer;
	 var desabilitaBuscaNotificacoes = false;
	 //var servidorAmazon = Utils.LocalStorage.getObject('Servidor');
	 var isLogin = Utils.LocalStorage.getObject('user').id != undefined;
	if($scope.categories==undefined){
       $scope.categories = ItemConfig.Category.all();
   	  preencheIconsCategoria();
	}

  $scope.photoExiste = function(itemAnuncio){
		return itemAnuncio.photo1!==undefined && itemAnuncio.photo1 !=='null';
	}

	$scope.toggleMenu = function() {
	  if($ionicSideMenuDelegate.isOpenLeft()) {
		$ionicSideMenuDelegmessaate.toggleLeft(false);
	  } else {
		$ionicSideMenuDelegate.toggleLeft(true);
	  }
	};

	$scope.categoriaServico = function(itemAnuncio){
	  var sNomeCategoria =  ItemConfig.Category.getFromId(itemAnuncio.category).name;
		return _.contains (['Serviços', 'Relacionamento', 'Empregos e Negócios', 'Doações'], sNomeCategoria);
	} 
	
	$scope.regraPreco = function(itemAnuncio){
  	//alert('regrapreco');
    return itemAnuncio.price>0;
	}

	$scope.$on('desabilitarTimerNotificacao', function(){
      desabilitaBuscaNotificacoes = true;
	});

	$scope.$on('habilitarTimerNotificacao', function(){
      desabilitaBuscaNotificacoes = false;
	});

	$scope.$on('recarregarItems', function(events, boolCarregar){
      recarregarItems(boolCarregar);
	});

  $scope.mostrarFiltroCategoria = function(){
	  //$rootScope.$broadcast('openModalFiltro', { index : 1});
		$scope.openModal(2);
	}	

	$scope.mostrarFiltroEstado = function(){
		$scope.openModal(4);
	}

  $scope.mostrarFiltroSubCategoria = function(){
    if($scope.filtro.category==undefined || $scope.filtro.category==0 || $scope.filtro.category == ""){
		  $timeout(function() {
 		       $ionicLoading.show({
               duration: 1500,            	
               noBackdrop: true,
               template: '<p>Selecione uma Categoria.</b >'
               });
			})
		}else{
  	  $scope.openModal(3);
		}
	}	

	function recarregarItems(boolCarregar){
	  $scope.load = boolCarregar;	
	}

	function statusCarregarItens(){
       if($scope.load==undefined){
       	  $scope.load = false;
       }
   	   var fluxo = Utils.LocalStorage.getObject('fluxo').fluxo;
   	   if(fluxo=="publicado"){
   	   	Utils.LocalStorage.setObject('fluxo', {"fluxo" : ""});
   	   	$scope.load = true;
   	   }

	   return $scope.load;
	}

    function buscarCategorias(){
      S3ServiceAmazon.ListaCategoriaDynamoDB().then(function(dadosCategoria){
      	ItemConfig.Category.setCategoria(dadosCategoria);
      	preencheCategoria();

      	buscarSubCategorias();
      }) 
    }

    function buscarSubCategorias(){
      S3ServiceAmazon.ListaSubCategoriaDynamoDB().then(function(dadosSubCategoria){
      	ItemConfig.SubCategory.setSubCategory(dadosSubCategoria);
      	preencheSubCategoria();
      }) 
    }

    $scope.carregarMenu = function(){
	  isLogin = Utils.LocalStorage.getObject('user').id != undefined;

    }

	$scope.iniciar = function(){
	  //$scope.isLoading = true;	
    //$rootScope.$broadcast('setToken');
 	  $scope.slideAtual = -1;
	  isLogin = Utils.LocalStorage.getObject('user').id != undefined;
	  $scope.user = Utils.LocalStorage.getObject('user');
		if(isLogin){
			//$rootScope.registrarToken();
      //$rootScope.$broadcast('registrarToken');

			//if(Utils.ValidaEhMobile()==true){
			//	alert('confirmado mobile');
			  $servicoNotificacao.registro();			
			//}
		}

	  desabilitaBuscaNotificacoes = false;
	  $scope.slideAtual = -1;
      if(Utils.LocalStorage.getObject('categoriaAtual').slide!==undefined){
   	    $scope.slideAtual = Utils.LocalStorage.getObject('categoriaAtual').slide;
      }

      if($scope.slideAtual==-1 && statusCarregarItens() == false ){
        $scope.items = $scope.buscarAnunciosAmazon();
      }else{
      	$scope.items = ItemConfig.Item.all();
      }
      

  	  $scope.item = {};
	  $scope.filtroItem = '';

	  $scope.visible = true;
	  recarregarItems(true);

	};	

   


	$scope.buscarAnunciosAmazon = function(){
		S3ServiceAmazon.AnunciosDynamoDB().then(function (result) {
        	ItemConfig.Item.set(result);
			$scope.items = result;
			return result;

		}, function (error) {
	         // Mark the error
	         $scope.Error = error;
	     }, function (progress) {
	     	$scope.items = result;
	     	return result;
	         // Write the progress as a percentage
	         //arquivo.Progress = (progress.loaded / progress.total) * 100
	     });      

	}

    $ionicPlatform.registerBackButtonAction(function (event) {
      //if specified state matches else go back
      if ($ionicHistory.currentStateName() === 'app.item'){

         event.preventDefault();
         event.stopPropagation();
         if (true) { // your check here
           $ionicPopup.show({
            title: 'Sair',
            template: 'Deseja sair do aplicativo?',
            buttons: [
              { text: 'Cancelar',
                ontap: function(e){
                  $ionicHistory.clearHistory();
                  $ionicHistory.clearCache();		
                } 
              //close popup and do nothing
              },
              { text: 'Confirmar',
                type: 'button-assertive',
                onTap: function(e) {  
                  $ionicHistory.clearHistory();
                  $ionicHistory.clearCache();		
                 ionic.Platform.exitApp();
                 return null;
              }
            }]
         })
       }
      } else {
         $ionicHistory.goBack();
      }
    }, 100);

    messageCheckTimer = $interval(function() {
	  if(isLogin==false){
	  	$scope.totalNotificacoes = 0;
	  }else{
	  	if(desabilitaBuscaNotificacoes==false){
	  	   desabilitaBuscaNotificacoes = true;
           $scope.contadorMensagens();
	  	}
        if($scope.totalNotificacoes==undefined){
          $scope.totalNotificacoes = 0;
        }	 
	  }

	}, 15000);

	$scope.contadorMensagens =function(){
	  whereSend = { "usuario_receive" : Utils.montaQueryAmazon('EQ', 'S', $scope.user.id),
	                "message_read" : Utils.montaQueryAmazon('EQ', 'BOOL', false)};

	  where = JSON.stringify(whereSend);
	  Mensagem.getMensagemUser(where).then(function(dados){
	  	$scope.totalNotificacoes =  dados.length;
	  	desabilitaBuscaNotificacoes = false;
	  })
	  
	};

  $scope.validaConexao = function(){
      if (window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
           $ionicPopup.show({
            title: "Sem conexão com a Internet ",
            template: '<body>Esse aplicativo necessita que esteja conectado na internet.</body>',
            buttons: [
              { text: 'OK',
                ontap: function(){
                 return null;
                } 
              //close popup and do nothing
            }]
         }).then(function(result){
             //ionic.Platform.exitApp();
         })
         }
      }    
  }	

  function preencheIconsCategoria(){
  	    $scope.iconsCategoria = [
		    {"id":1, "img": 'img/house-white.png'},
		    {"id":2, "img": 'img/veiculos-white.png'},
		    {"id":3, "img": 'img/eletronicos-white.png'},
		    {"id":4, "img": 'img/esportes-white.png'},
		    {"id":5, "img": 'img/empregos-white.png'},
		    {"id":6, "img": 'img/moda e beleza-white.png'},
		    {"id":7, "img": 'img/home-delivery-service.png'},
		    {"id":8, "img": 'img/couple.png'},
		    {"id":9, "img": 'img/para-casa-white.png'},
		    {"id":10, "img": 'img/hobbies-white.png'},
		    {"id":11, "img": 'img/criancas-white.png'},
		    {"id":12, "img": 'img/donation.png'}
		                        ];

  }

  function preencheSubCategoria(){
	  $scope.subcategories = ItemConfig.SubCategory.all();
  }



	$scope.user = Utils.LocalStorage.getObject('user');
	

	var filterBarInstance;
	var buscaDataMaxima = false;
	$scope.filtrando = false;


	isLogin = $scope.user.id != undefined;

	$scope.toggleLeft = function() {
	  $ionicSideMenuDelegate.toggleLeft();
	};

	$scope.login = function(){
	  Utils.LocalStorage.setObject('fluxo', {"fluxo" : "item"});
	  Utils.State.go('app.login');	
	};

  $ionicLoading.show({
      duration: 1000,
      //noBackdrop: false,
      template: '<ion-spinner pg spinner-light icon="circles"></ion-spinner>'
  });

	$scope.$on('$stateChangeSuccess',
	  function onStateSuccess(event, toState, toParams, fromState) {
		//stuff

	  }
	);


  $scope.hide = function(){
      $ionicLoading.hide();
  };	

	$scope.$on('$ionicView.enter', function() {
	  console.log('UserMessages $ionicView.enter');
	  $scope.user =  Utils.LocalStorage.getObject('user');
	  isLogin = Utils.LocalStorage.getObject('user').id != undefined;
       if(statusCarregarItens()==false){
	     $scope.iniciar();
	   }

	});

  $scope.$on('$viewContentLoaded', function() {
    $ionicLoading.hide();
  });	

	$scope.openPopover = function($event, templateName) {
	  // Init popover on load
	  console.log('teste');
	  $ionicPopover.fromTemplateUrl('templates/popover.html', {
		scope: $scope
	  }).then(function(popover) {
		$scope.popover = popover;
		$scope.popover.show($event);
	  });
	};

	$scope.closePopover = function() {
	  $scope.popover.hide();
	};


	$scope.visualizarItem = function(idItem){
	  if($scope.filtrando==false){
 	    Utils.LocalStorage.setObject('item', {"item" : idItem});
	    Utils.State.go('app.item-view', {itemId: idItem});	  
	  }
	}


	$scope.filtro= {
	  descricao: '',	
	  min:'0',
	  max:'20000',
	  value:'0',
	  value2:'0',
	  category: 0,
	  subcategory: 0,
	  filtrar: false,
	  estado: '',
	  cidade:''
	}

	$scope.filtroCategoria = function(nomeCategoria){
		if($scope.filtro.category!==nomeCategoria){
			$scope.filtro.subcategory = "";
	  }	
		$scope.filtro.category = nomeCategoria;

	}

	$scope.filtroSubCategoria = function(){
	  var idCategoria = ItemConfig.Category.get($scope.filtro.category).id;
	  $scope.subcategories = ItemConfig.SubCategory.getFromId(idCategoria);
		
	}

	$scope.atualizafiltroSubCategoria = function(nomeCategoria){
    $scope.filtro.subcategory = nomeCategoria;
	}

	$scope.atualizafiltroEstado = function(nomeEstado){
		$scope.filtro.estado = nomeEstado;
	}


  $scope.selecionaEstado = function(){
		if($scope.estadoSelecionado==undefined){
		  $timeout(function() {
 		       $ionicLoading.show({
               duration: 1500,            	
               noBackdrop: true,
               template: '<p>Selecione um estado.</b >'
               });
			})

		}else{
			$scope.atualizafiltroEstado($scope.estadoSelecionado);
			$scope.closeModal(4);
		}
	} 

	$scope.selecionaSubCategoria = function(){
		if($scope.subcategoriaSelecionada==undefined){
		  $timeout(function() {
 		       $ionicLoading.show({
               duration: 1500,            	
               noBackdrop: true,
               template: '<p>Selecione uma subcategoria.</b >'
               });
			})
		}else{
  		$scope.atualizafiltroSubCategoria($scope.subcategoriaSelecionada);
	  	$scope.closeModal(3);
		}
	}

	$scope.selecionaCategoria = function(){
		if($scope.categoriaSelecionada==undefined){
		  $timeout(function() {
 		       $ionicLoading.show({
               duration: 300,            	
               noBackdrop: true,
               template: '<p>Selecione uma categoria.</b >'
               });
			})

		}else{
  		$scope.filtroCategoria($scope.categoriaSelecionada);
	  	$scope.closeModal(2);
		}
	}

	$scope.filtroEstado = function(){
	  $scope.estados = ItemConfig.Estados.all();
    }


	$scope.setarValorMaximo = function(valor){
	  if(Number(valor) >= Number($scope.filtro.value2)){
		$scope.filtro.value2 = valor;
	  }
	};

	IonicComponent.Modal.fromTemplateUrl('filtroSubCategoria.html', {
	   scope: $scope,
	   animation: 'slide-in-up'
	  }).then(function(modal) {
	   console.log($scope.categoria);
	   $scope.modalsubCategoria = modal;
	});

	$scope.openModal = function(index) {
    if(index == 1){
			//$scope.modalFiltroCategoria.show();
			$ionicModal.fromTemplateUrl('filtroSubCategoria.html', {
        scope: $scope
        //animation: animation
      }).then(function(modal) {
        $scope.modal1 = modal;
        $scope.modal1.show();
      });
			
    }
    else if(index == 2){
			$ionicModal.fromTemplateUrl('templates/filtro-categoria.html', {
        scope: $scope
        //animation: animation
      }).then(function(modal) {
        $scope.modal2 = modal;
        $scope.modal2.show();
      });
      //$scope.modalFiltroCategoria.show();
    }
    else if(index == 3){
			$ionicModal.fromTemplateUrl('templates/filtro-subcategoria.html', {
        scope: $scope
        //animation: animation
      }).then(function(modal) {
				$scope.filtroSubCategoria();
        $scope.modal3 = modal;
        $scope.modal3.show();
      });
      //$scope.modalFiltroCategoria.show();
    }	
    else if(index == 4){
			$ionicModal.fromTemplateUrl('templates/filtro-estado.html', {
        scope: $scope
        //animation: animation
      }).then(function(modal) {
        $scope.modal4 = modal;
        $scope.modal4.show();
      });
      //$scope.modalFiltroCategoria.show();
    }	
	};

	$scope.itemFiltroCategoria = function(category){
		$scope.idCategoria = category.id;
		$scope.categoriaSelecionada = category.name;
	}

	$scope.itemFiltroSubCategoria = function(subcategory){
		$scope.idCategoria = subcategory.id;
		$scope.subcategoriaSelecionada = subcategory.name;
	}

	$scope.itemFiltroEstado = function(estado){
		$scope.estadoSelecionado = estado.Nome;
	}

	$scope.filtrarClassificados = function(nomeCategoria) {
	  $scope.configuraPais();

	  $scope.filtroEstado();
		$scope.openModal(1);
	};

    $scope.configuraPais = function(){
      var descPais =  Utils.LocalStorage.getObject('tipoPais').Origem;
     	descPais = 'Estados Unidos';
//      if(descPais==undefined){
//      }

      $scope.estados = ItemConfig.Estados.all();
      $scope.selecionados = $scope.estados;


      ItemConfig.Estados.setEstados($scope.selecionados);
      Utils.LocalStorage.setObject("Estados", $scope.selecionados);
      Utils.LocalStorage.setObject('tipoPais', {"Origem" : descPais});
	}




	$scope.abrirPublicacao = function(){
	  Utils.LocalStorage.setObject('fluxo', {"fluxo" : "publicacao"});
	  if($scope.user.id==undefined)	{
	    Utils.State.go('app.login', {});	

	  }else{
	  	$state.go('app.publish');
	    //Utils.State.go('app.publish', {});
	  }  
	}


	$scope.mudarcategoria = function(nomeCategoria, indice){
//	  Utils.LocalStorage.setObject('categoria', $scope.categories[indice])
//	  $scope.nomecategoria = nomeCategoria;
//	  $scope.slideAtual = indice;
//	  slideAtual = indice;

	};

	$scope.cancelarFiltro = function(){
		$scope.closeModal(2);
	}

	$scope.alert = function(){
	};

	$scope.closeModal = function(index) {
		switch (index) {
		  case 1:
	      //$scope.modalsubCategoria.hide();
				$scope.modal1.hide();
		    break;
      case 2:
			  $rootScope.$broadcast('atualizaFiltroCategoria', { category : $scope.filtro.category});
	      $scope.modal2.hide();
				break;
      case 3:
			  $rootScope.$broadcast('atualizaFiltroSubCategoria', { subcategory : $scope.filtro.subcategory});
	      $scope.modal3.hide();
				break;
      case 4:
			  $rootScope.$broadcast('atualizaFiltroEstado', { estado : $scope.filtro.estado});
	      $scope.modal4.hide();
				break;
			 
		}
	  
	};
	$scope.$on('$destroy', function() {
	  //$scope.modalsubCategoria.remove();
	});
	
	$scope.$on('atualizaFiltroCategoria', function(event, args) {
	  //$scope.modalsubCategoria.remove();
		if($scope.filtro.category!==args.category){
  		$scope.filtro.subcategory = "";
		}
		$scope.filtro.category = args.category;
		$scope.filtroCategoria(args.category);
	});

	$scope.$on('atualizaFiltroSubCategoria', function(event, args) {
	  //$scope.modalsubCategoria.remove();
		$scope.filtro.subcategory = args.subcategory;
		//$scope.filtroSubCategoria(args.category);
	});

	$scope.$on('atualizaFiltroEstado', function(event, args) {
	  //$scope.modalsubCategoria.remove();
		$scope.filtro.estado = args.estado;
		//$scope.filtroSubCategoria(args.category);
	});


	$scope.$on('modalsubCategoria.removed', function() {
	  // Execute action
	});

	function getItems () {
	  $scope.items = ItemConfig.Item.all();

	}

	$scope.showFilterBar = function () {
	  filterBarInstance = $ionicFilterBar.show({
		items: $scope.items,
		update: function (filteredItems, filterText) {
		  $scope.items = filteredItems;
		  if (filterText) {
			console.log(filterText);
			$scope.filtroItem = filterText;
		    //$scope.items = {};
			//$scope.filtrarItem();
			//setTimeout(function(){
			//  $scope.$apply(function() {
				//$scope.refreshItems();
			//  });
			//}, 1000);

			//$scope.filtrarItem(filterText);
		  }
		},
		filterProperties: 'name'
	  });
	};

	$scope.refreshItems = function () {
	  if (filterBarInstance) {
		filterBarInstance();
		filterBarInstance = null;
	  }
	  // $ionicLoading.show({
   //      //noBackdrop: false,
   //      template: '<ion-spinner icon="circles"></ion-spinner>'
   //    });

	  $scope.filtrando = true;

	  buscaDataMaxima  = true;
	  $scope.filtrarItem();
	};
     

	$scope.reiniciarFiltro = function(){
	   if(statusCarregarItens()==false){
	   	  IonicComponent.Loading.show({template: '<ion-spinner pg spinner-light icon="circles"></ion-spinner>'});

	   	  $scope.limparFiltro();

	   	  $scope.filtrarItem();
	   }
	}


    $scope.$on('reiniciarFiltro', function (event) {
	  if(statusCarregarItens()==true){
	  	recarregarItems(false);
	    $scope.reiniciarFiltro();	
	  }
      
    });

    $scope.removerFiltro = function(){
      $scope.load = false;
	  $scope.reiniciarFiltro();	
	  $scope.closeModal();	

    }



	$scope.limparFiltro = function(){
      $scope.filtroItem = '';
      //$scope.slideAtual = -1;
      $scope.filtro.category = '';
      $scope.filtro.subcategory = ''
      $scope.filtro.value = 0;
      $scope.filtro.value2 = 0;
	  $scope.filtro.filtrar =false;
	  $scope.filtro.descricao = "";
	  $scope.filtro.cidade = '';
	  $scope.filtro.estado = '';
	  $scope.slideAtual = -1;
	  Utils.LocalStorage.setObject('categoriaAtual', {"slide" : -1});
	}

	$scope.filtrarDadosItem = function(){
      if($scope.filtro.value2<$scope.filtro.value){
	    alert("Valor Máximo deve ser maior que o Valor Mínimo.");
	    return;
      }

      IonicComponent.Loading.show({
	  	  template: '<ion-spinner pg spinner-light icon="circles"></ion-spinner>'});
	    $scope.closeModal(1);	
	    $scope.filtro.filtrar = true;
	    var indice = $scope.categories.indexOf($scope.filtro.category);

	    if(indice!==undefined && indice!==$scope.slideAtual){
	      Utils.LocalStorage.setObject('categoriaAtual', {"slide" : indice});
	      $scope.slideAtual = indice;
	    }

      $scope.filtrarItem();
	}

	$scope.dataMaxima = function(){
	   var todosItens = ItemConfig.Item.all();	
	   var data       = new Date(Math.max.apply(Math, todosItens.map(function(o) { return new Date(o.dt_update); })));

	   return data;

	}


	$scope.filtrarItem = function(){
	  $scope.validaConexao();	
	  $scope.visible = true;
	  $scope.items = {};
	  $scope.dadoscategoria = $scope.filtro.category;
	  $scope.dadossubcategoria = $scope.filtro.subcategory;

    if($scope.dadoscategoria==undefined){
			$scope.dadoscategoria = "";
		}

	  if($scope.filtroItem == undefined)
		$scope.filtroItem = '';

	  if($scope.filtro.category == 0)
		$scope.dadoscategoria = '';

	  if($scope.filtro.subcategory == 0)
		$scope.dadossubcategoria = '';

	  var where  = {};

	  if($scope.filtro.descricao!==""){
		where.descricao = { "nameProcura" : Utils.montaQueryAmazon('CONTAINS', 'S', $scope.filtro.descricao.toLowerCase() )};
	  }
	    //else{
	    //if($scope.slideAtual >=0){
	  	//  var Categoria =  Utils.LocalStorage.getObject('categoria');
		//  where.tags = { "$regex" : ".*" + Categoria.id + ".*", $options: "i"  }
	    //}
	  //}

	  if($scope.dadoscategoria!==''){
 	    var idCategoria = ItemConfig.Category.get($scope.filtro.category).id;
		where.category = { "category" : Utils.montaQueryAmazon('EQ', 'N', idCategoria)};
	    //$scope.subcategory = ItemConfig.SubCategory.getFromId(idCategoria);
	  }

	  if($scope.dadossubcategoria!==''){
 	    var idcategory = ItemConfig.SubCategory.get($scope.dadossubcategoria).id;
		where.subcategory = { "subcategory" : Utils.montaQueryAmazon('EQ', 'N', idcategory)};
	  }

	  if($scope.filtro.value2>0){
        where.price = {"price" : Utils.montaQueryAmazon('BETWEEN', 'NS', Number($scope.filtro.value), Number($scope.filtro.value2))};
	  }

      if($scope.filtro.cidade!==''){
        where.cidade = {"cidade" : Utils.montaQueryAmazon('CONTAINS', 'S', $scope.filtro.cidade)};
  	  }

      if($scope.filtro.estado!==''){
        where.estado = {"estado" : Utils.montaQueryAmazon('EQ', 'S', $scope.filtro.estado)};
  	  }

  	  if(buscaDataMaxima==true){
        var max_dtupdate = $scope.dataMaxima();
        where.dt_update = {"dt_update" : Utils.montaQueryAmazon('GT', 'S',  max_dtupdate)};

  	  }


  	  //wherePesquisa = where.category ;

	  wherePesquisa = tratarFiltro(where);

  	  if(wherePesquisa==undefined){
  	  	$scope.buscarAnunciosAmazon();
        IonicComponent.Loading.hide();
  	  	return;
  	  }

  	  wherePesquisa = JSON.stringify(wherePesquisa);


	  S3ServiceAmazon.FiltroAnunciosDynamoDB(wherePesquisa).then(function (dadosRetorno) {
          if(dadosRetorno.length>0){
		    $timeout(function () {
          	  if(buscaDataMaxima==true){
		        ItemConfig.Item.addItens(dadosRetorno);
	            buscaDataMaxima  = false;
          	  }else{
          	  	ItemConfig.Item.set(dadosRetorno);
          	  }
          	  getItems();
			  $scope.filtrando = false;
			  $scope.$broadcast('scroll.refreshComplete');
   	          $scope.load = true;
   	          IonicComponent.Loading.hide();

		    }, 100);
          }else{
          	if(buscaDataMaxima==false){
          		$scope.items = dadosRetorno;
          	}
	        buscaDataMaxima  = false;

 		    $timeout(function() {
 		       $ionicLoading.show({
               duration: 3000,
               noBackdrop: true,
               template: '<p>Não há anúncios.</br>Por favor, busque novamente.</p >'
               });
    	       //IonicComponent.Loading.hide();
			   $scope.$broadcast('scroll.refreshComplete');
		    }, 100);
          }

	  }, function (error) {
		   $scope.load = false;
   	       IonicComponent.Loading.hide();
		   console.log(error)
      });      


	};

    function tratarFiltro(pesquisa){
    	
    	var where = {};
    	if(pesquisa.descricao!==undefined){
    		where.nameProcura = pesquisa.descricao.nameProcura;
    	}

    	if(pesquisa.category!==undefined){
  			where.category = pesquisa.category.category; 
    	}
    	if(pesquisa.subcategory!==undefined){
  			where.subcategory = pesquisa.subcategory.subcategory; 
    	}
    	if(pesquisa.price!==undefined){
  			where.price = pesquisa.price.price; 
    	}
    	if(pesquisa.cidade!==undefined){
  			where.cidade = pesquisa.cidade.cidade; 
    	}
    	if(pesquisa.estado!==undefined){
  			where.estado = pesquisa.estado.estado; 
    	}
    	if(pesquisa.dt_update!==undefined){
    		where.dt_update = pesquisa.dt_update.dt_update;
    	}

    	
    	return where;
    }


	$scope.filtrarCategoria = function(nomeCategoria, indice){
      IonicComponent.Loading.show({
	  	template: '<ion-spinner pg spinner-light icon="circles"></ion-spinner>'});

      setTimeout(function() {
		  $scope.limparFiltro();
		  Utils.LocalStorage.setObject('categoria', $scope.categories[indice])
		  Utils.LocalStorage.setObject('categoriaAtual', {"slide" : indice});
		  $scope.nomecategoria = nomeCategoria;
		  $scope.filtroCategoria(nomeCategoria);
		  $scope.slideAtual = indice;
		  $scope.filtrarItem();

	      IonicComponent.Loading.hide();
	  }, 100);
	};
  }
)

  .controller('CategsCtrl', function($scope,  ItemConfig) {
	$scope.Categories = [];
	$scope.items= [];
	$scope.items = ItemConfig.Item.all();

	$scope.Categories =  ItemConfig.Category.all();
	for (var i = 0; i < $scope.Categories.length; i++) {
	  $scope.Categories.push({
		name: $scope.Categories[i].get('name'),
		icon: $scope.Categories[i].get('photo'),
		id: $scope.Categories[i].id
	  })
	};
  })

  .controller('ItemCtrl', ['$scope', 'Mensagem', 'ItemConfig', 'Utils', '$ionicHistory','$ionicModal', 'IonicComponent', '$ionicPopover', '$state', '$location', 'EmailTemplate', '$rootScope', 'User', '$timeout', '$ionicPlatform',
	function($scope, Mensagem, ItemConfig, Utils, $ionicHistory, $ionicModal, IonicComponent,  $ionicPopover, $state, $location, EmailTemplate, $rootScope, User, $timeout, ionicPlatform) {


	 $scope.login = function(){
	   $state.go('app.login');
	 };


	$scope.sair = function(){
	  $scope.user = {};
	  Utils.LocalStorage.remove('user')
	}

	$scope.$on('$ionicView.enter', function() {
	  $scope.inicioItem();	
	});	

  $scope.photoExiste = function(itemAnuncio){
		if(itemAnuncio!==undefined){
  		return itemAnuncio.photo1!==undefined && itemAnuncio.photo1 !=='null';
		}else{
			return false;
		}
	}


	  $scope.operadoras = [
		{nome: "Oi", codigo: 14, categoria: "Celular"},
		{nome: "Vivo", codigo: 15, categoria: "Celular"},
		{nome: "Tim", codigo: 41, categoria: "Celular"},
		{nome: "Claro", codigo: 51, categoria: "Celular"},
		{nome: "GVT", codigo: 25, categoria: "Fixo"},
		{nome: "Embratel", codigo: 21, categoria: "Fixo"}
	  ];


	  $scope.dialNumber = function(number) {
	    if(typeof($scope.user.id) == "undefined"){
	      Utils.State.go('app.login');	
		}else{
		  window.open('tel:' + number, '_system');
		}
	  };

	  $scope.onReadySwiper = function (swiper) {

		swiper.on('slideChangeStart', function () {
		  console.log('slide start');
		});

		swiper.on('onSlideChangeEnd', function () {
		  console.log('slide end');
		});
	  };


	  $scope.inicioItem = function(){
        $rootScope.$broadcast('desabilitarTimerNotificacao');

	    $scope.swiper = {};
	    $scope.load = true;
  	    $scope.user = Utils.LocalStorage.getObject('user');
  	    $scope.photos = {};

  	    $scope.item = ItemConfig.Item.get(Utils.Params.itemId);

		if($scope.item.photo1!== undefined){
			photos = [{"photo":$scope.item.photo1}];
		}
		if($scope.item.photo2!=="undefined" &&($scope.item.photo2!=="null")){
			photos.push({"photo":$scope.item.photo2});
		}
		if($scope.item.photo3!=="undefined" &&($scope.item.photo3!=="null")){
			photos.push({"photo":$scope.item.photo3});
		}

		var category = $scope.item.category[0];
		var subcategory     = $scope.item.subcategory;
		if(category !== undefined){
		  $scope.item.categoryName = ItemConfig.Category.getFromId(category).name;  
		}
		if(subcategory !== undefined){
	  	  $scope.item.subcategoryName = ItemConfig.SubCategory.getNomeSubCategory(subcategory);
		}
	    $scope.$apply(function($scope) {
 		  $scope.photos = photos;
 		  $scope.slide
	    });
	  }


	  $scope.marcarFavorito = function(idItem){
		alert('Opção desabilitada');

	  };

	  $scope.goBack = function(){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
		Utils.State.go('app.item');
        $rootScope.$broadcast('habilitarTimerNotificacao');
	  };

      $scope.clearHistory = function() {
         $ionicHistory.nextViewOptions({
           disableBack: true,
           historyRoot: true
         });
      }	 


	  $ionicModal.fromTemplateUrl('templates/listaUsuarios.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modal = modal;
	  });


	  $ionicPopover.fromTemplateUrl('templates/popover.html', function(popover) {
		$scope.popover = popover;
	  });

	  $scope.openPopover = function($event, templateName) {
		// Init popover on load
		console.log('teste');
		$ionicPopover.fromTemplateUrl('templates/popover.html', {
		  scope: $scope
		}).then(function(popover) {
		  $scope.popover = popover;
		  $scope.popover.show($event);
		});
	  };

	  $scope.closePopover = function() {
		$scope.popover.hide();
	  };

	  $scope.mostrarMensagens = function(item){
		console.log(item);
	  };

	  $scope.mostrarMenu = function() {
		var botoes,
		  atualizarBotao = '<span class="button button-light"><i class="icon ion-android-refresh"></i> Filtrar Categoria</span>',
		  salvarImagemBotao ='<span class="button button-light"><i class="icon ion-images"></i> Salvar imagem</span>',
		  zoomBotao = '<span class="button button-light"><i class="icon ion-arrow-expand"></i> Zoom</span>',
		  cancelarBotao = '<span class="button button-light"><i class="icon ion-close"></i> Cancelar</span>';

		botoes = [{
		  text: atualizarBotao
		}];

		if ($scope.podeSalvar()) {
		  botoes.push({
			text: salvarImagemBotao
		  });
		}


		if ($scope.podeRealizarZoom()) {
		  botoes.push({
			text: zoomBotao
		  });
		}

		var MostraMenu =  $ionicActionSheet.show({
		  titleText: '',
		  buttons: botoes,
		  cancelText: cancelarBotao,
		  buttonClicked: function (index) {
			if (index == 0) {
			  $scope.recarregarGrafico();
			} else if (index == 1) {
			  $scope.abrirGaleria();
			} else if (index == 2) {
			  $scope.habilitaDesabilitaScroll();
			}
			return true;
		  }
		});
	  };

	  $scope.openMensagem = function(){
	    $scope.user = Utils.LocalStorage.getObject('user');
	    if(typeof($scope.user.id) == "undefined"){
   	      Utils.LocalStorage.setObject('fluxo', {"fluxo" : "mensagem", "item": $scope.item.id});
	      Utils.State.go('app.login');	
		}else{
   	      Utils.LocalStorage.setObject('item', {"item" : $scope.item.id  });
   	      Utils.LocalStorage.setObject('usuario', {"usuario" : $scope.user.id});

   	      if($scope.item.user_anunciante == $scope.user.id){
 		    setTimeout(function() {
			  $scope.mostrarCompradores();
  		      //Utils.State.go('app.item-message', {});	
		    }, 100);
 		  }else{
           IonicComponent.Loading.show({template: '<ion-spinner icon="circles"></ion-spinner>'});
		   Utils.State.go('app.item-message', {itemId: $scope.item.id});	
 		  }
		}  

	  };

      $scope.mostrarCompradores = function(){
	    var where = { "item" : Utils.montaQueryAmazon('EQ', 'S', $scope.item.id)}

	    where =  JSON.stringify(where);
      	Mensagem.getMensagemUser(where).then(function(dados){
      		$scope.usuarios = [];
      		var listaUsuarios = [];

      		if(dados.length>0){
              for(i = 0; i< dados.length; i++){    
               if(listaUsuarios.indexOf(dados[i].usuario_send) === -1 && dados[i].usuario_send !== $scope.user.id){
                  listaUsuarios.push(dados[i].usuario_send );        
                  $scope.usuarios.push({"usuario": dados[i].usuario_send, "nome_usuario": dados[i].nome_send});
               }        
              }
    		  $scope.openModal();
      		}else{
              IonicComponent.Loading.show({template: '<ion-spinner icon="circles"></ion-spinner>'});
		      Utils.State.go('app.item-message', {itemId: $scope.item.id});	
      		}
      	})

   	  };

   	  $scope.selecionarUsuario = function(idUsuario){
  	    Utils.LocalStorage.setObject('usuario', {"usuario" : idUsuario});
   	  	$scope.closeModal();
        IonicComponent.Loading.show({template: '<ion-spinner icon="circles"></ion-spinner>'});
  	    Utils.State.go('app.item-message', {itemId: $scope.item.id});	
   	  };

      

	  IonicComponent.Modal.fromTemplateUrl('listaUsuarios.html', {
	    scope: $scope,
	    animation: 'slide.Item.all();-in-up'
	  }).then(function(modal) {
	    $scope.modalListaUsuarios = modal;
	  });


	  $scope.openModal = function() {
	  $timeout(function(){
		$scope.modal.show();
	  },0)
	  };


	  $scope.closeModal = function() {
		$scope.modal.hide();
	  };
	  $scope.$on('$destroy', function() {
		//$scope.modal.remove();
	  });

	  $scope.$on('modal.removed', function() {
		// Execute action
	  });

	  $scope.$on('menuDataChange', function (event, data) {
		//refresh menu items data
		$scope.items = data;

		//clear the state
		$state.go($state.current, {}, { reload: true });
	  });

	  $scope.toggleGroup = function(group) {
		if ($scope.isGroupShown(group)) {
		  $scope.shownGroup = null;
		} else {
		  $scope.shownGroup = group;
		}
	  };

	  $scope.contact = function(item){
		if($scope.contact.email && $scope.contact.text){

		  var data = EmailTemplate.contactSeller($scope, item)
		  IonicComponent.Loading.show({template: 'Enviando E-mail...'});
		  //SEND EMAIL
		//   Promise.resolve({ url: '/api/email/v1/send',method:'POST',data: data})
		// 	.then(function(response){
		// 	  IonicComponent.Loading.hide();
		// 	  $scope.closeModal();

		// 	}, function(error){
		// 	  //TO-DO
		// 	  console.log(error)
		// 	})

		// }else{
		//   IonicComponent.Loading.show({template: 'Complete todos os campos!'});
		//   setTimeout(function() {
		// 	IonicComponent.Loading.hide();
		//   }, 500);
		}
	  }
	}])

  .controller('PublishCtrl', ['$scope', '$state', '$timeout',  '$cordovaCamera', 'Utils', 'IonicComponent', 'EmailTemplate', 'PopupTemplate', 'ItemConfig',  '$ionicHistory', '$ionicModal', 'S3ServiceAmazon', '$rootScope', 'Amazon', '$ionicLoading',
   function($scope, $state, $timeout,  $cordovaCamera, Utils, IonicComponent, EmailTemplate, PopupTemplate, ItemConfig,  $ionicHistory, $ionicModal, S3ServiceAmazon, $rootScope, Amazon, $ionicLoading) {
    var nameImageDefault = 'add-photo.png';

    atualizaCategorias();

	function camposDefault(){

  	  $scope.user = {};
	  $scope.onlyNumbers = /^\d+$/;
	  $scope.user = Utils.LocalStorage.getObject('user');
	  $scope.indexPhoto = [];
      if($scope.isEdicao()==false){
        $scope.publish = {};
        $scope.publish.nomeCategoria = "";
      }
	  $scope.publish.email = $scope.user.email;
 	  $scope.publish.telephone = $scope.user.telephone;
      $scope.publish.anuncio = "G";
      $scope.publish.pais = Utils.LocalStorage.getObject('tipoPais').Origem;
      $scope.angle = 0;
	}

  $scope.mostrarFiltroCategoria = function(){
	  $scope.openModal(2);
	}	

  $scope.mostrarFiltroSubCategoria = function(){
    if($scope.publish.nomecategory==undefined || $scope.publish.nomecategory==0 || $scope.publish.nomecategory == ""){
		  $timeout(function() {
 		       $ionicLoading.show({
               duration: 1500,            	
               noBackdrop: true,
               template: '<p>Selecione uma Categoria.</b >'
               });
			})
		}else{
  	  $scope.openModal(3);
		}
	}	
	$scope.mostrarFiltroEstado = function(){
		$scope.openModal(4);
	}



	function somenteNomeArquivo(caminho){
        var path = Amazon.baseUrl + '/photos/'; 
		return caminho.replace(path,'');
	}

	$scope.atualizafiltroEstado = function(nomeEstado){
		$scope.publish.estado = nomeEstado;
	}

	function atualizaCategorias(){
	  setTimeout(function() {
         //$rootScope.$broadcast('buscarCategorias');
	     setTimeout(function() {
	       $scope.categories = ItemConfig.Category.all();
	       $scope.subcategories = ItemConfig.SubCategory.all();  
	       preencheCategoria($scope.publish.category);
	     }, 100);

	   }, 100);
	}

	function preencheCategoria(idCategoria){
	  if(idCategoria !== undefined){

	    $scope.$apply(function() {
	      $scope.publish.nomecategory = ItemConfig.Category.getFromId(idCategoria).name;
	      $scope.subcategories            = ItemConfig.SubCategory.getFromId(idCategoria);
	      $scope.publish.nomeSubCategoria = ItemConfig.SubCategory.getNomeSubCategory($scope.publish.subcategory);
	    })	
	  }
	}


    $scope.inicioPublicacao = function(){
      $rootScope.$broadcast('desabilitarTimerNotificacao');
      $scope.estados = ItemConfig.Estados.all();
      var dadosEdicao  = Utils.LocalStorage.getObject("ItemEdicao").dados;
      if(dadosEdicao!==undefined && dadosEdicao.id!==undefined){
        $scope.publish = dadosEdicao;
      }else{
      	$scope.publish = {};
      	$scope.publish.photo1 = "";
      	$scope.publish.photo2 = "";
      	$scope.publish.photo3 = "";
      }

      camposDefault();	

      $scope.publish.nomePhoto1 = "";
      $scope.publish.nomePhoto2 = "";
      $scope.publish.nomePhoto3 = "";
      $scope.publish.photoAtual = "";

      if($scope.catagories==undefined){
         atualizaCategorias();
      }else{
      	preencheCategoria($scope.publish.category);
      }


      if($scope.publish.id!==undefined) {
 		    if($scope.publish.photo1=='null'){
			    $scope.publish.photo1 = '';
		    }
 		    if($scope.publish.photo2=='null'){
			    $scope.publish.photo2 = '';
		    }
		    if($scope.publish.photo3=='null'){
			    $scope.publish.photo3 = '';
		    }

		   $scope.publish.nomePhoto1 = somenteNomeArquivo($scope.publish.photo1);
		   $scope.publish.nomePhoto2 = somenteNomeArquivo($scope.publish.photo2);
		   $scope.publish.nomePhoto3 = somenteNomeArquivo($scope.publish.photo3);

       $scope.PhotoSelect(1);
       $scope.photoAtual = $scope.publish.photo1;
       $scope.lastPhoto = $scope.publish.photo1;

      }
      if($scope.publish.pais==undefined){
        $scope.publish.pais = 'EUA';
      }

	  $scope.photos = [{"Indice": 1, "photo": $scope.publish.photo1},
	                   {"Indice": 2, "photo": $scope.publish.photo2},
                       {"Indice": 3, "photo": $scope.publish.photo3}];

  	var $gallerly = document.querySelector("#gallerly");
	  var gallerly = new Gallerly($gallerly);
	  var gallerly = $scope.photos;

    }

	$scope.$on('$ionicView.beforeEnter', function() {
	  $scope.inicioPublicacao();	
	});



    function previewFile(nomeArquivo, photo) {
      if(nomeArquivo==""){
      	return
      }	
      var arrayBuffer = nomeArquivo;
      var bytes = new Uint8Array(arrayBuffer);
      var blob  = new Blob([bytes.buffer]);

      var image = document.getElementById(photo);

      var reader = new FileReader();
      reader.onload = function(e) {
      	//image.src = nomeArquivo;
        image.src = Utils.dataURItoBlob(imagem);
      };

      //canvas.toBlob(function(nomeArquivo){
      //  var myBlob = (nomeArquivo);
      //})
      //var image = URL.createObjectURL(blob);

      reader.readAsDataURL(blob);

    }


	$scope.isEdicao = function (){
	  return $scope.publish.id !==undefined;
	}


    $scope.excluirItem	= function(){
      S3ServiceAmazon.ExcluirAnunciosDynamoDB($scope.publish.id, $scope.publish.category).then(function(response){
  	  	if(response==400){

		  $timeout(function() {
 		       $ionicLoading.show({
               duration: 300,            	
               noBackdrop: true,
               template: '<p>Não foi possível remover o anúncio. Tente novamente.</b >'
               });
			   $scope.$broadcast('scroll.refreshComplete');
		  }, 100);
  	  	}
  	  	if(response==200){
	  	  IonicComponent.Loading.hide();
	  	  Utils.LocalStorage.setObject("ItemEdicao", "");

		  $timeout(function() {
 		       $ionicLoading.show({
               duration: 300,            	
               noBackdrop: true,
               template: '<p>Anúncio foi removido com sucesso.</b >'
               });
               $rootScope.$broadcast('atualizaItens');
               $state.go('app.anuncios');
		  }, 100);


  	  	}
	  },function(err){
		IonicComponent.Loading.hide();
		console.log(err)
  	  })

    }

	$scope.PhotoSelect = function(indice){
	  $scope.indexPhoto = indice;

	  photo = document.querySelector('#photo' + indice);
	  var cleanup = /\"|\'|\)/g;
	  var nomeImg = photo.src.split('/').pop().replace(cleanup, '');
	  if(nomeImg == nameImageDefault || nomeImg ==='%7B%7D'){
		$scope.getPhoto();
	  }else{
    	photoAtual = document.querySelector('#photoAtual');
    	photoAtual.src = photo.src;
	  }
	};

	$scope.filtroCategoria = function(nomeCategoria){
    if(nomeCategoria==""){
			$scope.publish.nomecategory = "";
			$scope.publish.nomeSubCategoria = "";
			$scope.subcategories = "";
			return;
		}

	  var idCategoria = ItemConfig.Category.get(nomeCategoria).id;
		if($scope.publish.nomecategoria!==nomeCategoria){
			$scope.publish.nomeSubCategoria = "";
		}
		$scope.publish.nomecategory = nomeCategoria;
		
	  $scope.subcategories = ItemConfig.SubCategory.getFromId(idCategoria);
	}

	$scope.atualizafiltroSubCategoria = function(nomeSubCategoria){
		$scope.publish.nomeSubCategoria =nomeSubCategoria;
	}

	$scope.rotacionarImagem = function(){
      if($scope.angle==90){
      	$scope.angle = 0;
      }else{
        $scope.angle = 90;
      }
      $scope.closeModal(1);	
	}


	$scope.goBack = function(){
	  if($scope.isEdicao()==true){
   	      $timeout(function(){
   	      Utils.LocalStorage.setObject("ItemEdicao", {dados : ""});	
          $state.go('app.anuncios');
   	      }, 100);
		}else{
   	      $timeout(function(){
   	      	$ionicHistory.goBack();
      	    $state.go('app.item');
            $rootScope.$broadcast('habilitarTimerNotificacao');

   	      }, 100);
		}

	};



	$scope.secondModel = null;
	$scope.opcaoPhoto =  ['Trocar imagem', 'Limpar Imagem'];

	$scope.opcoesAnuncio = [{"descricao":"Sem anúncio"},
	                        {"descricao":"Anúncio 7 dias"},
	                        {"descricao":"Anúncio 10 dias"},
	                        {"descricao":"Anúncio 30 dias"}];

	$ionicModal.fromTemplateUrl('templates/photomodal.html', {
	  scope: $scope,
	  animation: 'slide-in-up'
	}).then(function(modal) {
	  $scope.modal = modal;
	});


	$scope.openModal = function(index) {
		if(index==1){
			//$scope.modalFiltroCategoria.show();
			$ionicModal.fromTemplateUrl('templates/photomodal.html', {
        scope: $scope
        //animation: animation
      }).then(function(modal) {
        $scope.modal1 = modal;
        $scope.modal1.show();
      });
		}else if(index==2){
			$ionicModal.fromTemplateUrl('templates/filtro-categoria.html', {
        scope: $scope
        //animation: animation
      }).then(function(modal) {
        $scope.modal2 = modal;
        $scope.modal2.show();
      });
      //$scope.modalFiltroCategoria.show();
    }
    else if(index == 3){
			$ionicModal.fromTemplateUrl('templates/filtro-subcategoria.html', {
        scope: $scope
        //animation: animation
      }).then(function(modal) {
        $scope.modal3 = modal;
        $scope.modal3.show();
      });
      //$scope.modalFiltroCategoria.show();
    }	
    else if(index == 4){
			$ionicModal.fromTemplateUrl('templates/filtro-estado.html', {
        scope: $scope
        //animation: animation
      }).then(function(modal) {
        $scope.modal4 = modal;
        $scope.modal4.show();
      });
      //$scope.modalFiltroCategoria.show();
    }	
		


	};

	$scope.closeModal = function(index) {
		switch (index) {
		  case 1:
	      //$scope.modalsubCategoria.hide();
				$scope.modal1.hide();
		    break;
      case 2:
			  //$rootScope.$broadcast('atualizaFiltroCategoria', { category : $scope.filtro.category});
	      //$scope.modal2.hide();
				//break;
      case 3:
			  $rootScope.$broadcast('atualizaFiltroSubCategoria', { subcategory : $scope.filtro.subcategory});
	      $scope.modal3.hide();
				break;
      case 4:
			  $rootScope.$broadcast('atualizaFiltroEstado', { estado : $scope.filtro.estado});
	      $scope.modal4.hide();
				break;
			 
		}
	};


	$scope.$on('modal.removed', function() {
	  // Execute action
	});

	$scope.mudarImagem = function(){
	  console.log('mudar imagem');
	  $scope.closeModal(1);
	  $scope.removernomeImagem();
	  $scope.getPhoto();
	};

	$scope.removernomeImagem = function(){
		if($scope.indexPhoto==1){
			$scope.publish.nomePhoto1 = "";
		}
		if($scope.indexPhoto==2){
			$scope.publish.nomePhoto2 = "";
		}
		if($scope.indexPhoto==3){
			$scope.publish.nomePhoto3 = "";
		}
	}

    $scope.limparImagem = function(){
	  console.log('limpar imagem');
	  $scope.removernomeImagem();
	  $scope.closeModal(1);
	  var preview = document.querySelector('#photoAtual');
	  preview.src = "";
	  $scope.preenchePhoto("img/add-photo.png");


	};


	$scope.getPhoto = function() {
	  if($scope.isMobile()){

		var options = {
		  quality: 50,
		  destinationType: Camera.DestinationType.DATA_URL,
		  sourceType: Camera.PictureSourceType.PHOTOLIBRARY, //  Camera.PictureSourceType.CAMERA,
		  allowEdit: true,
		  encodingType: Camera.EncodingType.JPEG,
		  popoverOptions: CameraPopoverOptions,
		  saveToPhotoAlbum: false,
		  correctOrientation : true
		};

//		navigator.camera.getpicture(onSucess, onFail, options);



		$cordovaCamera.getPicture(options).then(function (imageData) {
		  var image = document.querySelector('#photoAtual');
		  image.src = "data:image/jpeg;base64," + imageData;

		  $scope.lastPhoto = Utils.dataURItoBlob("data:image/jpeg;base64,"+imageData);
		  $scope.preenchePhoto("data:image/jpeg;base64," + imageData);

		}, function (err) {
		  //IonicComponent.Loading.show({template: 'Não foi possível buscar a imagem'});
		  setTimeout(function() {
			IonicComponent.Loading.hide();
		  }, 300);

		  // An error occured. Show a message to the user
		});


		function onSuccess(imageData) {
		  //var image = document.getElementById('#photoAtual');
		  //image.src = "data:image/jpeg;base64," + imageData;
		  //$scope.lastPhoto = Utils.dataURItoBlob("data:image/jpeg;base64,"+imageData);
		  //$scope.PreenchePhoto("data:image/jpeg;base64," + imageData);
		}

		function onFail(message) {
		  //TO-DO
		  console.log('Failed because: ' + message);
		}

	  }else{
		setTimeout(function () {
		  //$scope.setFile();
		  document.getElementById('idImagem').click();
		}, 0);
	  }

	};

	$scope.setFile = function(element) {
	  $scope.$apply(function($scope) {
		$scope.theFile = element.files[0];
		$scope.buscaPhotoPC( element.files[0]);
	  });
	};

	$scope.click = function(){
	  setTimeout(function() {
		document.getElementById('idImagem').onclick =function() {
		  alert("Hello");
		};
		$scope.clicked = true;
	  }, 200);
	};

	$scope.preenchePhoto = function(imagem){
	  IonicComponent.Loading.show({template: 'Carregando foto.'});
	  setTimeout(function() {
		IonicComponent.Loading.hide();
	  }, 100);

	  if($scope.indexPhoto==1){
 	    var preview = document.querySelector('#photo1');
 	    //preview.src = reader.result;

		preview.src = imagem;
		if(imagem!== 'img/'+nameImageDefault){
	  	  $scope.publish.photo1 = Utils.dataURItoBlob(imagem);

		}

		//$scope.publish.photo1 = $scope.lastPhoto;
		//preview = document.querySelector('#photo1');

	  }
	  if($scope.indexPhoto==2){
 	    var preview = document.querySelector('#photo2');
		preview.src = imagem;

		//$scope.publish.photo2 = $scope.lastPhoto;
		if(imagem!== 'img/'+nameImageDefault){		
		  $scope.publish.photo2 = Utils.dataURItoBlob(imagem);
		}

		//preview = document.querySelector('#photo2');
		//preview.src = imagem;

	  }
	  if($scope.indexPhoto==3){

 	    var preview = document.querySelector('#photo3');
		preview.src = imagem;

		//$scope.publish.photo3 = $scope.lastPhoto;
		if(imagem!== 'img/'+nameImageDefault){		
		  $scope.publish.photo3 = Utils.dataURItoBlob(imagem);
		}
		//preview = document.querySelector('#photo3');
		//preview.src = imagem;
	  }
     
	};

    $scope.fullRotate = function(element) {
    	//
    };	

	$scope.buscaPhotoPC = function(file){
	  var preview = document.querySelector('#photoAtual');
	  var reader  = new FileReader();

	  reader.onloadend = function () {

		preview.src = reader.result;
		$scope.lastPhoto = Utils.dataURItoBlob(reader.result);

 	    //preview = document.querySelector('#photo1');
 	    //preview.src = reader.result;


		$scope.preenchePhoto(reader.result);
	  }

	  if (file) {
		reader.readAsDataURL(file);
	  } else {
		preview.src = "";
	  }
	}

	$scope.isMobile = function (){
	  return ionic.Platform.isWebView() || ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone();
	}

	$scope.gravarPhotoS3 = function(){
	   if($scope.publish.photo1.type!==undefined){
	   	 var image =  document.querySelector('#photo1');
	   	 if(image.src!==undefined){
	   	   $scope.rotinaPhotoS3($scope.publish.photo1, $scope.publish.nomePhoto1, 1);
	     };
	   }	
	   if($scope.publish.photo2!==undefined){
	   	 if($scope.publish.photo2.type!==undefined){
	   	   var image =  document.querySelector('#photo2');
	   	   if(image.src!==undefined){
  	   	     $scope.rotinaPhotoS3($scope.publish.photo2, $scope.publish.nomePhoto2, 2);
	       };
	     }
	   }	
	   if($scope.publish.photo3!==undefined){
	   	 if($scope.publish.photo3.type!==undefined){
	   	   var image =  document.querySelector('#photo3');
	   	   if(image.src
	   	   	!==undefined){
   	   	     $scope.rotinaPhotoS3($scope.publish.photo3, $scope.publish.nomePhoto3, 3);
	       };
	     }
	   };
	   
 	} ;

 	$scope.atualizarItemInserido = function(){
       var itemInserido = Utils.LocalStorage.getObject('NovoAnuncio');
       ItemConfig.Item.addItem(itemInserido);
  	   Utils.LocalStorage.setObject('NovoAnuncio', '');
 	}

 	$scope.rotinaPhotoS3 = function(arquivo, nomeArquivo, indice){
       S3ServiceAmazon.Upload(arquivo,nomeArquivo).then(function (result) {
          arquivo.Success = true;
          if(indice==1){
          	$scope.atualizarItemInserido();
          }
       }, function (error) {
         // Mark the error
         $scope.Error = error;
       }, function (progress) {
         // Write the progress as a percentage
         arquivo.Progress = (progress.loaded / progress.total) * 100
       });      

 	};


 	$scope.idArquivo = function(idPhoto){
      // Math.random should be unique because of its seeding algorithm.
      // Convert it to base 36 (numbers + letters), and grab the first 9 characters
      // after the decimal.
      return idPhoto + '_' + Math.random().toString(36).substr(2, 20);        
    };

    $scope.publicar = function(){
       dadosEnvio = $scope.publishItem();
       if(dadosEnvio !== 400 && dadosEnvio!== undefined){
       if($scope.publish.nomePhoto1!==""){
	       dadosEnvio.photo1 = Amazon.baseUrl + '/photos/' + $scope.publish.nomePhoto1;
	       dadosEnvio.nomePhoto1 = $scope.publish.nomePhoto1;
			 }	 
       if($scope.publish.nomePhoto2!==""){
 		     dadosEnvio.photo2 = Amazon.baseUrl + '/photos/' + $scope.publish.nomePhoto2;
 		     dadosEnvio.nomePhoto2 = $scope.publish.nomePhoto2;
       }
       if($scope.publish.nomePhoto3!==""){
		     dadosEnvio.photo3 = Amazon.baseUrl + '/photos/' + $scope.publish.nomePhoto3;
		     dadosEnvio.nomePhoto3 = $scope.publish.nomePhoto3;
       }

 	     Utils.LocalStorage.setObject('NovoAnuncio', dadosEnvio);
		 IonicComponent.Loading.show({template: 'Publicando...'});
 
  	     $scope.gravarAnuncioS3(dadosEnvio);
	  }
    }

    $scope.editar = function(){
       var caminhoS3 = 	Amazon.baseUrl + '/photos/';
       dadosEnvio = $scope.publishItem();
       if(dadosEnvio!==undefined && dadosEnvio!==400){
         dadosEnvio.id = $scope.publish.id;
         if($scope.publish.nomePhoto1!==""){
           if($scope.publish.nomePhoto1.indexOf(caminhoS3) >-1){
             dadosEnvio.photo1 = $scope.publish.nomePhoto1;	
           }else{
             dadosEnvio.photo1 =  caminhoS3 + $scope.publish.nomePhoto1;	
           }
           dadosEnvio.nomePhoto1 = $scope.publish.nomePhoto1;
         }
	     if($scope.publish.nomePhoto2!==""){
	         if($scope.publish.nomePhoto2.indexOf(caminhoS3) >-1){
	           dadosEnvio.photo2 = $scope.publish.nomePhoto2;	
	         }else{
	           dadosEnvio.photo2 =  caminhoS3 + $scope.publish.nomePhoto2;	
	         }
	         dadosEnvio.nomePhoto2 = $scope.publish.nomePhoto2;
	     }
	     if($scope.publish.nomePhoto3!==""){
	         if($scope.publish.nomePhoto3.indexOf(caminhoS3) >-1){
	           dadosEnvio.photo3 = $scope.publish.nomePhoto3;	
	         }else{
	           dadosEnvio.photo3 =  caminhoS3 + $scope.publish.nomePhoto3;	
	         }
	         dadosEnvio.nomePhoto3 = $scope.publish.nomePhoto3;
	     }

	     Utils.LocalStorage.setObject('NovoAnuncio', dadosEnvio);
	     IonicComponent.Loading.show({template: 'Estamos salvando sua publicação...'});
	 
	   	 $scope.editarAnuncioS3(dadosEnvio);

	   }   
    }

    function camposObrigatoriosNaoPreenchidos(){
    	var erro = false;
			var mensagemErro = "";

     if(Utils.trim($scope.publish.name) == ""){
         mensagemErro =  'Informe o Título do anúncio!';
       erro = true;
           }
                              
     if(Utils.trim($scope.publish.description) == ""){
            mensagemErro =  'Informe a descrição do anúncio!';
            erro = true;
        }
                              
     if(Utils.trim($scope.publish.estado)==""){
         mensagemErro =  'Informe o estado do anúncio!';
       erro = true;
           }
                              
      if(Utils.trim($scope.publish.cidade)==""){
	  	  mensagemErro =  'Informe a cidade do anúncio!';
        erro = true;
			}	

       if(Utils.trim($scope.publish.nomecategory) ==""){
            mensagemErro =  'Informe a categoria do anúncio!';
          erro = true;
            }
                              
      if(Utils.trim($scope.publish.nomeSubCategoria) == ""){
		    mensagemErro = 'Informe a SubCategoria do anúncio!';
   	    erro = true;
			}	 
 


			if(erro==true){
		    IonicComponent.Loading.show({
		  	   template: mensagemErro
		  	});
			}

  	  return erro;
    }



	$scope.publishItem = function(){
	  //validate all field before

      if(camposObrigatoriosNaoPreenchidos()){
	  	$timeout(function(){
	  		IonicComponent.Loading.hide();
      	    return 400;
        },1500)      	    
      }else{
	      $scope.publish.category    = ItemConfig.Category.get($scope.publish.nomecategory).id;
   	    $scope.publish.subcategory = ItemConfig.SubCategory.get($scope.publish.nomeSubCategoria).id;

	  	  var validate = Utils.validateAll($scope.publish)
		  if(validate==false){
		  	IonicComponent.Loading.show({
		  		template: 'Preencha todos campos para inserir um anúncio corretamente'
		  	});
		  	$timeout(function(){IonicComponent.Loading.hide();},500)
		  	return 400;
		  }	

		  if($scope.publish.photo1==undefined){
		  	if($scope.publish.photo2!==undefined){
		  		$scope.publish.photo1 = $scope.publish.photo2;
		  		$scope.publish.photo2 = undefined;
		  	}else{
		  		$scope.publish.photo1 = $scope.publish.photo3;
		  	}
		  }	
		  if($scope.publish.photo2==undefined){
		  	if($scope.publish.photo3!==undefined){
		  		$scope.publish.photo2 = $scope.publish.photo3;
		  		$scope.publish.photo3 = undefined;
		  	}
		  }	
//		  if($scope.publish.photo1==undefined){
//		  	IonicComponent.Loading.show({
//		  		template: 'Selecione ao menos uma foto para o anúncio.'
//		  	});
//		  	$timeout(function(){IonicComponent.Loading.hide();},500)
//		  	return 400;
//		  }


	      if($scope.publish.photo1!==undefined){
	         if($scope.publish.nomePhoto1==""){
	  	       if($scope.publish.photo1!==""){
		           $scope.publish.nomePhoto1 = $scope.idArquivo('Photo1');
						 }
					 }	 	 
	      }
	      if($scope.publish.photo2!==undefined){
	         if($scope.publish.nomePhoto2==""){
	  	       if($scope.publish.photo2!==""){
	  	         $scope.publish.nomePhoto2 = $scope.idArquivo('Photo2');
		       }  
		     }  
  		  }

	      if($scope.publish.photo3!==undefined){
	        if($scope.publish.nomePhoto3==""){
	 	       if($scope.publish.photo3!==""){
			     $scope.publish.nomePhoto3 = $scope.idArquivo('Photo3');
		       }	
		    }    

		  }


		  var DadosAnuncio = {
			id : S3ServiceAmazon.criarID(),
			name : $scope.publish.name,
			description :  $scope.publish.description,
			nameProcura :  Utils.trim($scope.publish.description.toLowerCase()),
			category :  $scope.publish.category,
            subcategory:   $scope.publish.subcategory,
            price: $scope.publish.price,
            email: $scope.publish.email,
            telephone : $scope.publish.telephone,
            address:  $scope.publish.address,
            photo1 :  '',
            photo2 :  '',
            photo3 :  '',
            pais   :  $scope.publish.pais,
            cidade :  $scope.publish.cidade,
            estado : $scope.publish.estado,
            nome_anunciante :  $scope.user.firstName + " " + $scope.user.lastName,
            user_anunciante : $scope.user.id,
            classificado: false,
            user : $scope.user.id
         }

         if($scope.publish.price == undefined){
         	DadosAnuncio.price = 0;
         }
       
		 if($scope.publish.anuncio == "D"){
			DadosAnuncio.classificado = true;
		 }

         return DadosAnuncio;
     }

	}

	$scope.gravarAnuncioS3 =function(dados){
  	  S3ServiceAmazon.GravarAnuncioDynamoDB(dados).then(function(response){
  	  	if(response==400){
  	  	  alert("Não foi possível gravar o anúncio. Tente novamente");
   	      IonicComponent.Loading.hide();
  	  	}
  	  	if(response==200){
          IonicComponent.Loading.hide();
					if($scope.publish.photo1!==undefined){
            $scope.gravarPhotoS3();
					}

          IonicComponent.Loading.show({template: 'Seu anúncio foi publicado!'});
	      $timeout(function() {
   	         IonicComponent.Loading.hide();
		     $ionicHistory.goBack();
       	     Utils.LocalStorage.setObject('fluxo', {"fluxo" : "publicado"});
		     $state.go('app.item');
             $rootScope.$broadcast('habilitarTimerNotificacao');
		  }, 2000);
  	  	}
	  },function(err){
		IonicComponent.Loading.hide();
		console.log(err)
  	  })
	}

	$scope.apagarPhotosS3 = function(){
		//
	}

	$scope.editarAnuncioS3 =function(dados){
      S3ServiceAmazon.ExcluirAnunciosDynamoDB($scope.publish.id, Utils.LocalStorage.getObject("ItemEdicao").dados.category).then(function(response){
  	  	if(response==400){
  	  	  alert("Não foi possível gravar o anúncio. Tente novamente");
   	      IonicComponent.Loading.hide();
  	  	}
  	  	if(response==200){
  	      S3ServiceAmazon.GravarAnuncioDynamoDB(dados).then(function(response){
  	  	     if(response==400){
  	           IonicComponent.Loading.show({template: 'Não foi possível salvar o anúncio. Tente novamente.'});
 		           setTimeout(function() {
   	             IonicComponent.Loading.hide();
  		         }, 300);
  	  	     }
  	  	     if(response==200){
    	  	     $scope.apagarPhotosS3();
							 if($scope.publish.photo1!==undefined){
                 $scope.gravarPhotoS3();
							 }
  	           IonicComponent.Loading.show({template: 'Seu anúncio foi publicado!'});
			         $timeout(function() {
   	               IonicComponent.Loading.hide();
                   $scope.goBack();
			         }, 2000);

     	  	   }
	        },function(err){
		        IonicComponent.Loading.hide();
		        console.log(err)
  	      })

  	  	}
	  },function(err){
		IonicComponent.Loading.hide();
		console.log(err)
  	  })
	}


  }])
  .controller('MensagemCtrl', function($scope, $state, Utils, IonicComponent, Mensagem, ItemConfig,  PopupTemplate,  User, $timeout, $interval, $q, $ionicScrollDelegate, $ionicHistory, S3ServiceAmazon, $rootScope, $servicoNotificacao) {
	$scope.user = Utils.LocalStorage.getObject('user');
	$scope.user.pic_receive = 'img/Person-receive.png';
	$scope.user.pic_send = 'img/Person-send.png';

	$scope.load = false;
	$scope.mensagens = [];

	buscarItem();

	function buscarItem(){
      ItemConfig.Item.getItem().then(function(dadosItem){
      	$scope.anuncio = dadosItem;
				if($scope.anuncio.photo1=="null"){
					$scope.anuncio.photo1 = 'img/foto-naodisponivel.jpg';
				}	
      })
	}

  //ItemConfig.Item.getItem().then(function(dadosItem){
  //  $scope.item = dadosItem;
  //  if($scope.item.photo1=='null'){
	//		$scope.item.photo1 = 'img/foto-naodisponivel.jpg';
	//	} 
  //})


	var messageCheckTimer;

	var footerBar; 
	var scroller;
	var txtInput; 

  $scope.photoExiste = function(itemAnuncio){
		if(itemAnuncio!==undefined){
  		return itemAnuncio.photo1!==undefined && itemAnuncio.photo1 !=='null';
		}else{
			return false;
		}
	}

	$scope.goBack = function(){
	  //$ionicHistory.goBack();
		if($scope.item !==undefined){
	    $state.go('app.item-view' , {itemId: $scope.item.id});	
		}
	  //Utils.State.go('app.item-view', {itemId: $scope.item.id});	
	};

    messageCheckTimer = $interval(function() {
		  // here you could check for new messages if your app doesn't use push notifications or user disabled them
	  $scope.buscarMensagem(false);
	}, 10000);

	var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');

	$scope.$on('$ionicView.enter', function() {
	  console.log('UserMessages $ionicView.enter');

	  if($scope.user.id==undefined){
	    Utils.State.go('app.login');	

	  }else{
 	    $scope.buscarMensagem();	  	
 	    $timeout(function() {
		  footerBar = document.body.querySelector('#userMessagesView .bar-footer');
		  scroller = document.body.querySelector('#userMessagesView .scroll-content');
		  txtInput = angular.element(footerBar.querySelector('textarea'));
	    }, 0);
	  }



	});

	$scope.$on('$ionicView.leave', function() {
	  console.log('leaving UserMessages view, destroying interval');
	  // Make sure that the interval is destroyed
	  if (angular.isDefined(messageCheckTimer)) {
		$interval.cancel(messageCheckTimer);
		messageCheckTimer = undefined;
	  }
	});

	$scope.$on('$ionicView.beforeLeave', function() {
	  //if (!$scope.input.message || $scope.input.message === '') {
		//localStorage.removeItem('userMessage-' + $scope.user.id);
	  //}
	});

	$scope.getUrl = function(idUser){
//	  result = user.id == idUser ? '#/tab/item/"/message"
//	  {{user.id !== item.user ? '#/tab/item/'"{{item.id}}''/message':'#/tab/item/{{item.id}}/contatos'}}
	}

	$scope.onMessageHold = function(e, itemIndex, message) {
	  console.log('onMessageHold');
	  console.log('message: ' + JSON.stringify(message, null, 2));
	  $ionicActionSheet.show({
		buttons: [{
		  text: 'Copy Text'
		}, {
		  text: 'Delete Message'
		}],
		buttonClicked: function(index) {
		  switch (index) {
			case 0: // Copy Text
			  //cordova.plugins.clipboard.copy(message.text);

			  break;
			case 1: // Delete
			  // no server side secrets here :~)
			  $scope.messages.splice(itemIndex, 1);
			  $timeout(function() {
				viewScroll.resize();
			  }, 0);

			  break;
		  }

		  return true;
		}
	  });
	};


	$scope.$watch('$stateChangeSuccess', function($currentRoute, $previousRoute){
	  // do something
	  //$scope.buscarMensagem();
	});


	var settingWhereSend = function(idItem, idUsuario){
	  var whereSend  = {"item": idItem};

	  if(idUsuario!==undefined) {
	  	whereSend =  {"item": idItem , "usuario_send" : idUsuario};
	  }
	  //var whereReceive  = {"usuario_receive": $scope.user.id, "item": idItem};

	  where = '?where=' + JSON.stringify(whereSend);
	  return where
	};

	var settingWhereReceive = function(idItem, idUsuario){
	  var whereReceive  = {"usuario_receive": idUsuario, "item": idItem};

	  where = '?where=' + JSON.stringify(whereReceive);
	  return where
	};

	$scope.atualizaMensagemNaoLida = function(){
      for (var i = 0; i < $scope.mensagens.length; i++){
       	  if($scope.mensagens[i].message_read==undefined || $scope.mensagens[i].message_read==false){
             if($scope.mensagens[i].usuario_receive==$scope.user.id){
	       	  	 //var where = '?where={"id": "' + $scope.mensagens[i].id + '"}';
           	    $scope.mensagens[i].message_read = true;
	       	  	var dadosAtualizar = {"id": $scope.mensagens[i].id, "item": $scope.mensagens[i].item, "message_read": true};
	       	  	 //dadosAtualizar = JSON.stringify(dadosAtualizar);

	             //var dadosAtualizar = $scope.mensagens[i];//{"item": $scope.mensagens[i].item[0], "mensagem": $scope.mensagens[i].mensagem, "usuario": $scope.user.id  ,"read": true}; //{"replace" : "/read", "value" : true};

		         Mensagem.atualizaMensagemLida($scope.mensagens[i]).then(function(dados){
		         	//alert(dados);
			     }, function(err){
				   alert(err);
			     });
             }
       	  };
      };
	};

	$scope.buscarMensagem = function(mostrarMensagem) {
  

      ItemConfig.Item.getItem().then(function(dadosItem){
      	$scope.item = dadosItem;
      })

//    KeyConditionExpression : "#k = :val and key2 >= :val2",
//    ExpressionAttributeValues : {":val" : "A", ":val2" : "Q"},
//    ExpressionAttributeNames  : {"#k" : "key"}
      //var expressaoAmazon = "(item = :idItem )"; //and (usuario_send = :idUsuario or usuario_receive = :idUsuario))";
      //var attributos      = JSON.stringify({":idItem" : {'S' : Utils.LocalStorage.getObject('item').item}});// , ":idUsuario" : {'S' :Utils.LocalStorage.getObject('usuario').usuario}});
      //var where = Utils.montaExpressionAmazon(expressaoAmazon, attributos);


	  var where  = { "usuario_send" : Utils.montaQueryAmazon('EQ', 'S',  Utils.LocalStorage.getObject('usuario').usuario),
	                "item" : Utils.montaQueryAmazon('EQ',  'S', Utils.LocalStorage.getObject('item').item)};

	  if(mostrarMensagem==true){
 	    IonicComponent.Loading.show({template: '<ion-spinner icon="circles"></ion-spinner>'});
	  }
      where = JSON.stringify(where);	  

	  Mensagem.getMensagemItem(where).then(function(dados){
		//$scope.doneLoading = true;
		var tempMensagens = [];
		tempMensagens = dados;
        
        //var idItem    = Utils.LocalStorage.getObject('item');
		//var where = settingWhereReceive(idItem.item, idUsuario.usuario);

 	    var where  = { "usuario_receive" : Utils.montaQueryAmazon('EQ', 'S', Utils.LocalStorage.getObject('usuario').usuario),
	                   "item" : Utils.montaQueryAmazon('EQ', 'S', Utils.LocalStorage.getObject('item').item)};
        where = JSON.stringify(where);
		Mensagem.getMensagemItem(where).then(function(dados){
		  if (dados.length>0) {
			for (var i = 0; i < dados.length; i++)
			  tempMensagens.push(dados[i]);
		  }
		  $scope.mensagens = tempMensagens;

		  $scope.atualizaMensagemNaoLida();


		  IonicComponent.Loading.hide();
		  $timeout(function() {
			viewScroll.scrollBottom();
		  }, 0);
		  }, function(err){
			IonicComponent.Loading.hide();
            $scope.load = true;

		  })
		},function(err){
		  IonicComponent.Loading.hide();
          $scope.load = true;
	  })

	};

	// I emit this event from the monospaced.elastic directive, read line 480
	$scope.$on('taResize', function(e, ta) {
	  console.log('taResize');
	  if (!ta) return;

	  var taHeight = ta[0].offsetHeight;
	  console.log('taHeight: ' + taHeight);

	  if (!footerBar) return;

	  var newFooterHeight = taHeight + 10;
	  newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

	  footerBar.style.height = newFooterHeight + 'px';
	  scroller.style.bottom = newFooterHeight + 'px';
	});

	$scope.enviarMensagem = function(sendMessageForm){
	  var boolContinua = true;
      var idUsuario = Utils.LocalStorage.getObject('usuario');

      if($scope.user.id == $scope.item.user_anunciante){
	    //if (idUsuario.usuario == $scope.user.id || idUsuario.usuario == undefined) {
		  if( $scope.mensagens.length==0) {
		    alert("Não há usuários para enviar mensagens.");
		    boolContinua = false;
		  }
	    //}
      }

	  if(boolContinua==true){
		var idUser = $scope.item.user_anunciante;
		var nomeUser = $scope.item.nome_anunciante;

		if ($scope.item.user_anunciante == $scope.user.id) {
			mensagem = _.find($scope.mensagens, function(mensagem){ if(mensagem.usuario !== $scope.item.user_anunciante){
				                                                     return mensagem}; });

			idUser   = mensagem.usuario;
			nomeUser = mensagem.nome_send;
		}	

		keepKeyboardOpen();
		var mensagemAtual = {
			id : S3ServiceAmazon.criarID(),
			item : $scope.item.id,
			mensagem : $scope.input.message,
			usuario_send : $scope.user.id,
      nome_send: $scope.user.firstName + " " + $scope.user.lastName,
      usuario_receive: idUser,
      nome_receive : nomeUser,
      message_read:  false,
      usuario   :  $scope.user.id
     }
		$scope.input.message = "";
        Utils.LocalStorage.setObject('mensagem', mensagemAtual);
		Mensagem.enviarMensagem(mensagemAtual)
		  .then(function(dados) {
		  	if(dados==400){
		  		alert("Não foi possível enviar a mensagem.");
		  	}else{
					$scope.enviarNotificacao(mensagemAtual);
		  	  mensagemAtual = Utils.LocalStorage.getObject('mensagem');
		  	  $scope.mensagens.push(mensagemAtual);
		  	}
			$timeout(function() {
			  keepKeyboardOpen();
			  viewScroll.scrollBottom(true);
			  //$scope.notificacao(mensagemAtual);
			}, 0);
		  }, function(err){
			console.log(err);
		  });
	  }
	};

	$scope.enviarNotificacao = function(Mensagem){
		var Dados = {
			"usersend" : '',
			"nameuser": '',
			"userreceive": '',
			"mensagem": '',
			"item" : ''
		}
    Dados.usersend = Mensagem.usuario_send;
		Dados.nameuser = Mensagem.nome_send;
		Dados.userreceive = Mensagem.usuario_receive;
		Dados.mensagem = Mensagem.mensagem;
		Dados.item = Mensagem.item;
		$servicoNotificacao.notificar(Dados);
	}

	$scope.notificacao = function(mensagem){
      var dados = {
                    mensagem: '',
                    usuario_emitente : '',
                    usuario_nomeemitente : '',
                    usuario_receber : '',
                    item: ''
                  };
      dados.mensagem = mensagem.mensagem;
      dados.usuario_emitente = mensagem.usuario_send;
      dados.usuario_nomeemitente = mensagem.nome_send;
      dados.usuario_receber = mensagem.usuario_receive;
      dados.item = mensagem.item;
      Utils.LocalStorage.setObject('mensagem', dados);
      $rootScope.$broadcast('notificacao');



	}

	function keepKeyboardOpen() {
	  console.log('keepKeyboardOpen');
	  //txtInput.one('blur', function() {
	//	console.log('textarea blur, focus back on it');
	//	txtInput[0].focus();
	//  });
	}
  })

  .controller('AccountCtrl', function($scope, Utils, IonicComponent, YourItems, PopupTemplate,  User) {

	$scope.user = Utils.LocalStorage.getObject('user')
	$scope.load = false;
	$scope.items = YourItems.all();

	var settingWhere = function(){
	  var where  = {"user": $scope.user.id, "publish": true}
	  where = JSON.stringify(where)
	  return where
	}

	if($scope.user.id && !YourItems.isLoad()){
	  $scope.load = true;
	  var where = settingWhere()
	 //  Promise.resolve({method: 'GET',url:  '/api/cobject/v1/item?where='+where})
		// .then(function(response){
		//   $scope.load = false;
		//   $scope.items = response.data.data
		//   YourItems.set(response.data.data)
		// }, function(err){
		//   $scope.load = false;
		// })
	}

	$scope.doRefresh = function(){
	  var where = settingWhere()

	 //  Promise.resolve({method: 'GET',url:  '/api/cobject/v1/item?where='+where})
		// .then(function(response){
		//   $scope.items = response.data.data
		//   YourItems.set(response.data.data)
		// },function(err){
		//   console.log(err)
		//   //TO-DO
		// }).finally(function(){
		//   $scope.$broadcast('scroll.refreshComplete');
		// })

	}

	$scope.delete = function(obj){
	  var popup = PopupTemplate.deleteItem()
	  var confirmPopup = IonicComponent.Popup.confirm(popup)
	  confirmPopup.then(function(res) {
		if(res) {
		//   Promise.resolve({method: 'DELETE',url:  '/api/cobject/v1/item/'+obj.id})
		// 	.then(function(response){
		// 	  var index = $scope.items.indexOf(obj)
		// 	  $scope.items.splice(index, 1);
		// 	  YourItems.set($scope.items)
		// 	},function(err){
		// 	  console.log(err)
		// 	})
		}
	  });
	}

	$scope.goToLogin = function(){
	  Utils.State.go('tab.settings', {})
	}
  })

  .controller('FiltroCtrl', ['$scope', '$timeout', '$ionicModal', '$rootScope', '$ionicLoading', function($scope, $timeout, $ionicModal, $rootScope, $ionicLoading){

	$scope.$on('openModalFiltro', function(event, args) {
		if(args.index == 1){
			$ionicModal.fromTemplateUrl('templates/filtro-categoria.html', {
        scope: $scope
        //animation: animation
      }).then(function(modal) {
        $scope.modal1 = modal;
        $scope.modal1.show();
      });
    }
    else if(index == 2){
			$ionicModal.fromTemplateUrl('templates/filtro-subcategoria.html', {
        scope: $scope
        //animation: animation
      }).then(function(modal) {
				//$scope.filtroSubCategoria();
        $scope.modal2 = modal;
        $scope.modal2.show();
      });
    }	
    else if(index == 3){
			$ionicModal.fromTemplateUrl('templates/filtro-estado.html', {
        scope: $scope
        //animation: animation
      }).then(function(modal) {
        $scope.modal3 = modal;
        $scope.modal3.show();
      });
    }	
	});

  $scope.limparCategoria = function(){
		$scope.categoriaSelecionada = "";
		$scope.selecionaCategoria();
	} 

  $scope.limparSubCategoria = function(){
		$scope.subcategoriaSelecionada= "";
		$scope.selecionaSubCategoria();
	} 

  $scope.limparEstado = function(){
		$scope.estadoSelecionado = "";
		$scope.selecionaEstado();
	}	

	$scope.itemFiltroCategoria = function(category){
		$scope.idCategoria = category.id;
		$scope.categoriaSelecionada = category.name;
	}

	$scope.itemFiltroSubCategoria = function(subcategory){
		$scope.idCategoria = subcategory.id;
		$scope.subcategoriaSelecionada = subcategory.name;
	}

	$scope.itemFiltroEstado = function(estado){
		$scope.estadoSelecionado = estado.Nome;
	}


  $scope.selecionaEstado = function(){
		if($scope.estadoSelecionado==undefined){
		  $timeout(function() {
 		       $ionicLoading.show({
               duration: 1500,            	
               noBackdrop: true,
               template: '<p>Selecione um estado.</b >'
               });
			})
		}else{
			$scope.atualizafiltroEstado($scope.estadoSelecionado);
			$scope.closeModal(4);
		}
	} 

	$scope.selecionaSubCategoria = function(){
		if($scope.subcategoriaSelecionada==undefined){
		  $timeout(function() {
 		       $ionicLoading.show({
               duration: 1500,            	
               noBackdrop: true,
               template: '<p>Selecione uma subcategoria.</b >'
               });
			})
			
		}else{
  		//$scope.atualizafiltroSubCategoria($scope.subcategoriaSelecionada);
  		$scope.atualizafiltroSubCategoria($scope.subcategoriaSelecionada);
	  	$scope.closeModal(3);
		}
	}

	$scope.selecionaCategoria = function(){
		if($scope.categoriaSelecionada==undefined){
		  $timeout(function() {
 		       $ionicLoading.show({
               duration: 1500,            	
               noBackdrop: true,
               template: '<p>Selecione uma categoria.</b >'
               });
			})

		}else{
  		$scope.filtroCategoria($scope.categoriaSelecionada);
	  	$scope.closeModal(2);
		}
	}

	$scope.closeModal = function(index) {
		switch (index) {
		  case 1:
				$scope.modal1.hide();
		    break;
      case 2:
			  //$rootScope.$broadcast('atualizaFiltroCategoria', { category : $scope.filtro.category});
	      $scope.modal2.hide();
				break;
      case 3:
			  //$rootScope.$broadcast('atualizaFiltroSubCategoria', { subcategory : $scope.filtro.subcategory});
	      $scope.modal3.hide();
				break;
      case 4:
			  //$rootScope.$broadcast('atualizaFiltroEstado', { estado : $scope.filtro.estado});
	      $scope.modal4.hide();
				break;
			 
		}
	};
	
	

	}]) 
  .controller('SettingsCtrl', function($scope, $timeout, Utils, User, IonicComponent, PopupTemplate,  $ionicHistory, $state, ItemConfig) {

	$scope.user = Utils.LocalStorage.getObject('user')
	$scope.modal = {}
	$scope.configura = {
		servidor : "",
        pais : "Estados Unidos"  
	}

    $scope.inicio = function(){
      $scope.configura.servidor = Utils.LocalStorage.getObject('Servidor').Amazon;
      $scope.configura.pais = Utils.LocalStorage.getObject('tipoPais').Origem;

    };

    $scope.configuraPais = function(descPais){
      $scope.estados = ItemConfig.Estados.all();
      $scope.selecionados = $scope.estados;

      ItemConfig.Estados.setEstados($scope.selecionados);
      Utils.LocalStorage.setObject("Estados", $scope.selecionados);
      Utils.LocalStorage.setObject('tipoPais', {"Origem" : descPais});
	}

	$scope.configuraServidor = function(servidor){
      Utils.LocalStorage.setObject('Servidor', {"Amazon" : servidor});
	}

    
	$scope.goBack = function(){
	  $ionicHistory.goBack();
	  $state.go('app.item');
      $rootScope.$broadcast('habilitarTimerNotificacao');

	};

  })
  .controller('AnunciosCtrl', function($scope, $timeout, ItemConfig, Utils, User, IonicComponent, PopupTemplate,  $ionicHistory, $state, S3ServiceAmazon, Anuncio, $rootScope) {
	$scope.user     = Utils.LocalStorage.getObject('user');
	$scope.anuncios = Utils.LocalStorage.getObject('anuncios');

  $scope.photoExiste = function(itemAnuncio){
		return itemAnuncio.photo1!==undefined && itemAnuncio.photo1 !=='null';
	}


	$scope.$on('$ionicView.enter', function() {
      $rootScope.$broadcast('desabilitarTimerNotificacao');
    	$scope.user     = Utils.LocalStorage.getObject('user');
			$scope.anuncios = []
	    $scope.buscarAnuncios();	
	});	


	$scope.goBack = function(){
	  $ionicHistory.goBack();
	  $state.go('app.item');
      $rootScope.$broadcast('habilitarTimerNotificacao');
	};

	$scope.selecionarAnuncio = function(item){
      Utils.LocalStorage.setObject("ItemEdicao", {dados : item});
      Utils.State.go('app.publish');	
	};


	$scope.buscarAnuncios = function() {
	  //$scope.item = ItemConfig.Anuncio.getAnunciosUser();
	  var where = {"user_anunciante" : Utils.montaQueryAmazon('EQ', 'S', $scope.user.id)};
	  where = JSON.stringify(where);


	  IonicComponent.Loading.show({template: '<ion-spinner icon="circles"></ion-spinner>'});

	  Anuncio.getAnunciosUser(where).then(function(dados){
		//$scope.doneLoading = true;
		var tempMensagens = [];
		$scope.anuncios = dados;
		IonicComponent.Loading.hide();
	  })

	};


  })
  .controller('MensagemRecebidaCtrl', function($scope, $timeout, ItemConfig, Mensagem, Utils, User, IonicComponent, PopupTemplate,  $ionicHistory, $state,  $sce, $rootScope) {
	$scope.user     = Utils.LocalStorage.getObject('user');
	$scope.mensagens = [];

	$scope.$on('$iniciarBusca', function() {
	  $scope.iniciarBusca();	
	})

  $scope.photoExiste = function(itemAnuncio){
		if(itemAnuncio!==undefined){
  		return itemAnuncio.photo1!==undefined && itemAnuncio.photo1 !=='null';
		}else{
			return false;
		}
	}

	$scope.iniciarBusca = function(){
	  $scope.informacao ="";
	  $timeout(function(){
        $scope.buscarNotificacao(); 
        $scope.buscarInteresses();
	  }, 100)
	}

	$scope.$on('$ionicView.beforeEnter', function() {
	  //if (!$scope.input.message || $scope.input.message === '') {
		//localStorage.removeItem('userMessage-' + $scope.user.id);
	  //}
	  $scope.iniciarBusca();
	});




    $scope.toggleGroup = function(grupo) {
      if ($scope.isGroupShown(grupo)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = grupo;
      }
    };


	$scope.goBack = function(){
	  $ionicHistory.goBack();
	  Utils.State.go('app.item');
      $rootScope.$broadcast('habilitarTimerNotificacao');
	};

    $scope.isGroupShown = function(grupo) {
      return $scope.shownGroup === grupo;
    };	


	$scope.buscarNotificacao = function() {
	  IonicComponent.Loading.show({template: '<ion-spinner icon="circles"></ion-spinner>'});

	  var anuncios = [];
	  var mensagens = [];
	  var whereSend  = {"usuario_receive": $scope.user.id, "message_read" : false};

	  whereUser = Utils.montaQueryAmazon('EQ', 'S', $scope.user.id);
	  whereRead = Utils.montaQueryAmazon('EQ', 'BOOL', false);
	  where = {"usuario_receive" : whereUser, "message_read": whereRead};

	  where = JSON.stringify(where);

	  Mensagem.getMensagemUser(where).then(function(dados){
	    $scope.mensagens = dados;
		if(dados.length>0){
           var itensUnicos = [];
           for(var iPosicao= 0; iPosicao<$scope.mensagens.length; iPosicao++){
               var indiceUnicos = itensUnicos.indexOf($scope.mensagens[iPosicao].item[0]);

               if(indiceUnicos==-1){
               	 $scope.mensagens[iPosicao].indiceMensagens = [iPosicao];
               	 itensUnicos.push($scope.mensagens[iPosicao]);
               }else{
                 itensUnicos[indiceUnicos].indiceMensagens.push(iPosicao);
               };
           };

           for(var iPosicao= 0; iPosicao<itensUnicos.length; iPosicao++){
	           var whereSend  = {"id": Utils.montaQueryAmazon('EQ', 'S', itensUnicos[iPosicao].item)};
	           where = JSON.stringify(whereSend);
	           Mensagem.getItem(where).then(function(item){
	           	  var itemTerceiro = item[0].user_anunciante;
	           	  for(var indice = 0; indice<itensUnicos.length; indice++){
	           	  	if(itensUnicos[indice].item ==item[0].id){

		           	  for(var iLoop = 0; iLoop<itensUnicos[indice].indiceMensagens.length; iLoop++){
		           	  	$scope.mensagens[itensUnicos[indice].indiceMensagens[iLoop]].descricao = item[0].name;
		           	  	$scope.mensagens[itensUnicos[indice].indiceMensagens[iLoop]].photo1 =  item[0].photo1;
		           	  	if(item[0].user_anunciante==$scope.user.id){
		           	  	  $scope.mensagens[itensUnicos[indice].indiceMensagens[iLoop]].proprio = true;

		           	  	}else{
		           	  	  $scope.mensagens[itensUnicos[indice].indiceMensagens[iLoop]].proprio = false;
		           	  	}
		           	  };	


	           	  	}
	           	  }	
 	           });	  
           }
        }else{
	      $scope.informacao = "Sem notificações";
	    }   

		IonicComponent.Loading.hide();
	  },function(err){
	    IonicComponent.Loading.hide();
	  })

    };

    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    };

	$scope.buscarInteresses = function() {
	  $scope.anuncios = [];
	  	
	  var where  = {};
	  where = { "usuario_receive" : Utils.montaQueryAmazon('EQ', 'S', $scope.user.id),
	            "usuario" : Utils.montaQueryAmazon('NE', 'S', $scope.user.id)};
	  where = JSON.stringify(where);
	  IonicComponent.Loading.show({template: '<ion-spinner icon="circles"></ion-spinner>'});
      Mensagem.getMensagemUser(where).then(function(dados){
        var anuncios = [];
	    var mensagem = dados;
	    IonicComponent.Loading.hide();
	  },function(err){
	  })
	};




	$scope.selecionaItemMensagem = function(mensagemusuario){
   	    Utils.LocalStorage.setObject('item', {"item" : mensagemusuario.item});
   	    Utils.LocalStorage.setObject('usuario', {"usuario" : mensagemusuario.usuario_send});
  	    var item = ItemConfig.Item.get(mensagemusuario.item);
		Utils.State.go('app.item-message', {itemId: mensagemusuario.item});	
	};


  })

  .controller('MenuCtrl', function($scope, $ionicSideMenuDelegate, $ionicHistory, $state, Utils, IonicComponent, $ionicPlatform, $timeout, $location, $rootScope) {

    $scope.initialize =function(){
      var iniciado = false; 
 	    $rootScope.$broadcast('registrarToken');
      $rootScope.$broadcast('setToken');
    }


	$scope.toggleMenu = function() {
	  if($ionicSideMenuDelegate.isOpenLeft()) {
		$ionicSideMenuDelegate.toggleLeft(false);
	  } else {
		$ionicSideMenuDelegate.toggleLeft(true);
	  }
	};

	$scope.$on('$stateChangeSuccess',
	   function onStateSuccess(event, toState, toParams, fromState) {
	 	  $scope.isLogin = Utils.LocalStorage.getObject('user').id != undefined;
	   }
	);

	$scope.$on('$ionicView.enter', function() {
	  $scope.isLogin = Utils.LocalStorage.getObject('user').id != undefined;
	});


	$scope.init = function(){

      //$rootScope.$broadcast('registrarToken');

	}

    $scope.enviarToken = function(){
      //if($util.isMobile==true){
      //   $rootScope.$broadcast('setToken');
      // }
    }


	$scope.inicio = function(){
	  $ionicHistory.goBack();
	  IonicComponent.Loading.show({template: 'Iniciando MyBRAds'});
	  $timeout(function() {
		IonicComponent.Loading.hide();
		Utils.LocalStorage.setObject('categoriaAtual', {"slide" : -1});
		$scope.load = false;
		$state.go('app.item', {}, { reload: true });
        $rootScope.$broadcast('habilitarTimerNotificacao');
		$rootScope.$broadcast('reiniciarFiltro');

	  }, 300)
	};

	$scope.notificacoes = function(){
		$scope.load = false;
		$state.go('app.notificacoes', {}, { reload: true });
		$rootScope.$broadcast('iniciarBusca');
	  // $timeout(function() {

	  // }, 100)
	};

	$scope.publicarAnuncio = function(){
		if($scope.isLogin==false){
   	      Utils.LocalStorage.setObject('fluxo', {"fluxo" : "publicacao"});
   	      $timeout(function(){
   	        window.location.href = '#/app/login';
   	      }, 100);
		}else{
   	      $timeout(function(){
    	    window.location.href = '#/app/publish';
   	      }, 100);
		}
	};



	$scope.logout = function(){
	  $scope.user = {};
	  Utils.LocalStorage.remove('user');
   	  Utils.LocalStorage.setObject('fluxo', {"fluxo" : ""});
	  $ionicHistory.goBack();
	  IonicComponent.Loading.show({template: 'Sessão encerrada com sucesso'});
	  $timeout(function() {
		IonicComponent.Loading.hide();
		$state.go('app.item', {}, { reload: true });
        $rootScope.$broadcast('habilitarTimerNotificacao');

	  }, 1500)
	}

  })

  .controller('LoginCtrl', function($scope, $timeout, Utils, User, $ionicHistory, $state, IonicComponent,md5, S3ServiceAmazon) {

	$scope.loginUser = {}
	$scope.signupUser = {}

	$scope.init = function(){
       //
	};

	$scope.goBack = function(){
   	  var fluxo = Utils.LocalStorage.getObject('fluxo');

	  $ionicHistory.nextViewOptions({
		disableBack: true
	  });
	  $ionicHistory.goBack();
	  if(fluxo.fluxo=="mensagem"){
	    Utils.State.go('app.item-view', {itemId: fluxo.item});	
  	    Utils.LocalStorage.setObject('fluxo', {});
	  }else{
	    $state.go('app.item', {}, { reload: true });	
	  }
	  //$state.go('app.item', {}, { reload: true });
	};

	$scope.criarConta = function(){
	  $ionicHistory.nextViewOptions({
		disableBack: true
	  });
	  $ionicHistory.goBack();
	  $state.go('app.signup', {}, { reload: true });
	}

	var emailValido = function(){
		if($scope.loginUser.email == undefined){
			return false;
		}
		if(Utils.trim($scope.loginUser.email) == ""){
			return false;
		}
		return true;

	} 

	$scope.alterarSenha = function(){
		if(Utils.trim($scope.loginUser.password)==""){
		  IonicComponent.Loading.show({template: 'Senha e Confirmação de senha obrigatória.'});
		  $timeout(function() {
			 	IonicComponent.Loading.hide();
		  }, 1500);
			return;
		}
		if(Utils.trim($scope.loginUser.password2)==""){
		  IonicComponent.Loading.show({template: 'Senha e Confirmação de senha obrigatória.'});
		  $timeout(function() {
			 	IonicComponent.Loading.hide();
		  }, 1500);
			return;
		}
		if(Utils.trim($scope.loginUser.password)!==Utils.trim($scope.loginUser.password2)){
		  IonicComponent.Loading.show({template: 'Senha e Confirmação de senha não são idênticas.'});
		  $timeout(function() {
			 	IonicComponent.Loading.hide();
		  }, 1500);
			return;
		}
		var dados = {};
	  dados = {id : Utils.LocalStorage.getObject('user').id,
		         email : Utils.LocalStorage.getObject('user').email, 
						 senhaCripto :  md5.createHash($scope.loginUser.password),
						 status : false
						};
    S3ServiceAmazon.novaSenhaConta(dados).then(function (result) {
			if(result==200){
        $scope.fluxoApp();
				
        IonicComponent.Loading.show({template: 'Senha alterada! Entre com a senha cadastrada.'});
        $timeout(function() {
	        IonicComponent.Loading.hide();
        }, 2000)
			}else{
        IonicComponent.Loading.show({template: 'Serviço indisponível no momento.'});
        $timeout(function() {
	        IonicComponent.Loading.hide();
        }, 2000)
			}
		}, function (error) {
      IonicComponent.Loading.show({template: 'Serviço indisponível no momento.'});
      $timeout(function() {
	      IonicComponent.Loading.hide();
      }, 2000)
		 
	  });      
	}


	$scope.gerarSenhaConta = function(){
		if(emailValido() == false){
		 IonicComponent.Loading.show({template: 'Informe seu e-mail.'});
		 $timeout(function() {
				IonicComponent.Loading.hide();
		 }, 1000)
     return;
		}
    S3ServiceAmazon.retornaUsuario($scope.loginUser.email.toLowerCase()).then(function(dadosRetorno){
			if(dadosRetorno==400){
	      IonicComponent.Loading.show({template: 'E-mail não cadastrado.'});
	      $timeout(function() {
		      IonicComponent.Loading.hide();
        }, 2000);
				return;
			}
	  	dados = {id : dadosRetorno.id, 
				      email : $scope.loginUser.email, 
							passwordBase : S3ServiceAmazon.criarID().substr(0,10),
							status : true
						};
			dados.senhaCripto =  md5.createHash(dados.passwordBase);

		  S3ServiceAmazon.novaSenhaConta(dados).then(function (result) {
		    if(result==400){
  	      IonicComponent.Loading.show({template: 'E-mail não cadastrado.'});
	        $timeout(function() {
		        IonicComponent.Loading.hide();
          }, 2000)
		    }else{
					S3ServiceAmazon.envioEmailConta(dados).then(function(result){
						if(result==200){
		 	        IonicComponent.Loading.show({template: 'Sua nova senha foi enviada em seu e-mail.'});
   		  	    $timeout(function() {IonicComponent.Loading.hide();}, 1500)
						}else{
                IonicComponent.Loading.show({template: 'Não foi possível reenviar a senha. Entre em contato pelo e-mail: contato@mybrads.com!'});
		 		  	  $timeout(function() {IonicComponent.Loading.hide();}, 1500)
						}
					})
			  }

			}, function (error) {
	      // Mark the error
        $scope.Error = error;
	      IonicComponent.Loading.show({template: 'Serviço indisponível no momento.'});
	      $timeout(function() {
	         IonicComponent.Loading.hide();
        }, 2000)
		 
	    } );      
		})
	};

	var loginOrSignUp = function(type){
	  if(type=='signup'){
        if($scope[type+'User'].lastName=="" || $scope[type+'User'].lastName==undefined){
	      IonicComponent.Loading.show({template: 'Informe seu sobrenome'});
	      $timeout(function() {
		    IonicComponent.Loading.hide();
       	  }, 2000)
       	  return;
        }	
      }	  	


      if($scope[type+'User'].email==undefined){
		    IonicComponent.Loading.show({template: 'Informe seu e-mail'});
		    $timeout(function() {IonicComponent.Loading.hide();}, 1000)
	    }else{
	      $scope[type+'User'].email = $scope[type+'User'].email.toLowerCase();
        if($scope[type+'User'].password=="" || $scope[type+'User'].password ==undefined){
  		    IonicComponent.Loading.show({template: 'Informe sua senha'});
	  	    $timeout(function() {IonicComponent.Loading.hide();}, 1000)
          return;
				}

	      $scope[type+'User'].passwordBase =  md5.createHash($scope[type+'User'].password);
          
        if(type=='signup'){
   	        $scope[type+'User'].id = S3ServiceAmazon.criarID();
   	        var dados = $scope[type+'User'];
						S3ServiceAmazon.retornaUsuario($scope[type+'User'].email.toLowerCase()).then(function(result){
						  if(result==400){
			          S3ServiceAmazon.criarContaAmazon($scope[type+'User']).then(function (result) {
				          if(result==400){
	                  IonicComponent.Loading.show({template: 'Senha ou Usuário inválido.'});
	                  $timeout(function() {
 		                  IonicComponent.Loading.hide();
        	          }, 2000)

				          }else{
			              Utils.LocalStorage.setObject('user', dados);
			              $scope.fluxoApp();
			              IonicComponent.Loading.show({template: 'Conta criada com sucesso!'});
			              $timeout(function() {IonicComponent.Loading.hide();}, 1000)
				          }

			          }, function (error) {
		              $scope.Error = error;
		            } );      

							}else{
	                IonicComponent.Loading.show({template: 'E-mail já cadastrado!'});
	                $timeout(function() {
		              IonicComponent.Loading.hide();
        	        }, 2000)
							}	
						}) 
        }else{
			      S3ServiceAmazon.logarContaAmazon($scope[type+'User']).then(function (result) {
			        if(result==400)	{
	              IonicComponent.Loading.show({template: 'Senha ou Usuário inválido.'});
	              $timeout(function() {
		              IonicComponent.Loading.hide();
        	      }, 2000)
			        }else{
      		      Utils.LocalStorage.setObject('user', result);
								if(result.newPassword==true){
			            Utils.State.go('app.password-new');	
								}else{
                  $scope.fluxoApp();
								}

			        }
			      }, function (error) {
		           // Mark the error
		           $scope.Error = error;
	            IonicComponent.Loading.show({template: 'Senha ou Usuário inválido.'});
	             $timeout(function() {
		             IonicComponent.Loading.hide();
        	     }, 2000)
 
		        } );      
        }

	  }    
	}

	$scope.fluxoApp = function(){
		var fluxo = Utils.LocalStorage.getObject('fluxo');
		if(fluxo.fluxo=="mensagem"){
	        $scope.user = Utils.LocalStorage.getObject('user');
			Utils.State.go('app.item-message', {itemId: fluxo.item});	
			Utils.LocalStorage.setObject('fluxo', {});

		}else{
			if(fluxo.fluxo=="publicacao"){
				Utils.State.go('app.publish', {});	
				Utils.LocalStorage.setObject('fluxo', {});
			}else{
				$state.go('app.item', {}, { reload: true });
			}
		}

	}


	$scope.login = function(){
	  loginOrSignUp('login')
	}
	$scope.signup = function(){
	  loginOrSignUp('signup')
	}

  })
