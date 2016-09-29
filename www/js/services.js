angular.module('mybradsprod.services', [])
// .factory('Promise',function($http, APPID, APIKEY, BASEURL){
//   return {
//     // resolve : function(data){
//     //   data.url = BASEURL + data.url 
//     //   if(!data.headers)
//     //     data.headers = {'Content-Type': 'application/json'}
//     //   data.headers.Authorization = 'Basic '+ btoa(APPID+":"+APIKEY);
//     //   var call = $http(data)
//     //   return call;
//     // }
//   }
// })
.factory('User', function($q){
  var user = {};
  return {
    login: function(data){
      var def = $q.defer();
      // Promise.resolve({ method: 'POST', data: data,url:  '/auth/v1/local/login'})
      //   .then(function(response){
      //     def.resolve(response.data);
      //   },function(response){
      //     def.reject(response);
      //   })
      return def.promise;
    },
    dadosAnunciante: function(idUser){
      var def = $q.defer();
      var anunciante = [];
       // Promise.resolve({ method: 'GET', url: '/api/user/v1/users/' + idUser})
       //    .then(function(response){
       //      anunciante = response.data;
       //      def.resolve(anunciante);
       //    },function(response){
       //     def.reject(response);
       //   })
      return def.promise;

    }
  }
})
.factory('Category', function($q,  $http, S3ServiceAmazon) {
  var categories = [];
  var getPromise = function () {
      var def = $q.defer();
      if (categories.length > 0) {
        def.resolve();
      } else {
        S3ServiceAmazon.ListaCategoriaDynamoDB().then(function (dadosRetorno) {
          if(dadosRetorno==400){
            def.reject();
          }else{
            categories = dadosRetorno;
            def.resolve();
          }
        })  

        // Promise.resolve({
        //   method: 'GET',
        //   url: '/api/cobject/v1/category'
        //   })
        // .then(function(response){
        //   categories = response.data.data;
        //   def.resolve();
        // },function(){})
      }
      return def.promise;
    }

  return {
    getPromise: getPromise
    ,
    all: function() {
      if(categories.length==0){
        return getPromise;
      }

      categories.sort(function (a, b) {
        if (a.ordem > b.ordem) {
          return 1;
        }
        if (a.ordem < b.ordem) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      return categories;
    },
    setCategoria : function(listaCategoria) {
      categories = listaCategoria;
      return categories;
    },
    get: function(categoryName) {
      // Simple index lookup
       for(var i= 0; i<categories.length; i++){
        if(categories[i].name == categoryName)
        return categories[i];
      }
    },
    getFromId: function(id) {
      // Simple index lookup
      for(var i= 0; i<categories.length; i++){
        if(categories[i].id == id)
        return categories[i];
      }
    }
  }
})
.factory('Estados',function($q){
   var filtrados = [];
   var estados = [{"Sigla": "AL" , "Nome" : "Alabama", "Pais":"EUA"},
                  {"Sigla": "AK" , "Nome" : "Alaska", "Pais":"EUA"},
                  {"Sigla": "AR" , "Nome" : "Arkansas", "Pais":"EUA"},
                  {"Sigla": "AZ" , "Nome" : "Arizona", "Pais":"EUA"},
                  {"Sigla": "CA" , "Nome" : "California", "Pais":"EUA"},
                  {"Sigla": "KS" , "Nome" : "Kansas", "Pais":"EUA"},
                  {"Sigla": "ND" , "Nome" : "North Dakota", "Pais":"EUA"},
                  {"Sigla": "NC" , "Nome" : "North Carolina", "Pais":"EUA"},
                  {"Sigla": "SC" , "Nome" : "South Carolina", "Pais":"EUA"},
                  {"Sigla": "CO" , "Nome" : "Colorado", "Pais":"EUA"},
                  {"Sigla": "CT" , "Nome" : "Connecticut", "Pais":"EUA"},
                  {"Sigla": "SD" , "Nome" : "South Dakota", "Pais":"EUA"},
                  {"Sigla": "DE" , "Nome" : "Delaware", "Pais":"EUA"},
                  {"Sigla": "FL" , "Nome" : "Florida", "Pais":"EUA"},
                  {"Sigla": "GA" , "Nome" : "Georgia", "Pais":"EUA"},
                  {"Sigla": "HI" , "Nome" : "Hawaii", "Pais":"EUA"},
                  {"Sigla": "ID" , "Nome" : "Idaho", "Pais":"EUA"},
                  {"Sigla": "RI" , "Nome" : "Rhode Island", "Pais":"EUA"},
                  {"Sigla": "IL" , "Nome" : "Illinois", "Pais":"EUA"},
                  {"Sigla": "IN" , "Nome" : "Indiana", "Pais":"EUA"},
                  {"Sigla": "IA" , "Nome" : "Iowa", "Pais":"EUA"},
                  {"Sigla": "KY" , "Nome" : "Kentucky", "Pais":"EUA"},
                  {"Sigla": "LA" , "Nome" : "Louisiana", "Pais":"EUA"},
                  {"Sigla": "ME" , "Nome" : "Maine", "Pais":"EUA"},
                  {"Sigla": "MD" , "Nome" : "Maryland", "Pais":"EUA"},
                  {"Sigla": "MA" , "Nome" : "Massachusetts", "Pais":"EUA"},
                  {"Sigla": "MI" , "Nome" : "Michigan", "Pais":"EUA"},
                  {"Sigla": "MN" , "Nome" : "Minnesota", "Pais":"EUA"},
                  {"Sigla": "MS" , "Nome" : "Mississippi", "Pais":"EUA"},
                  {"Sigla": "MO" , "Nome" : "Missouri", "Pais":"EUA"},
                  {"Sigla": "MT" , "Nome" : "Montana", "Pais":"EUA"},
                  {"Sigla": "NE" , "Nome" : "Nebraska", "Pais":"EUA"},
                  {"Sigla": "NV" , "Nome" : "Nevada", "Pais":"EUA"},
                  {"Sigla": "NH" , "Nome" : "New Hampshire", "Pais":"EUA"},
                  {"Sigla": "NJ" , "Nome" : "New Jersey", "Pais":"EUA"},
                  {"Sigla": "NY" , "Nome" : "New York", "Pais":"EUA"},
                  {"Sigla": "NM" , "Nome" : "New Mexico", "Pais":"EUA"},
                  {"Sigla": "OK" , "Nome" : "Oklahoma", "Pais":"EUA"},
                  {"Sigla": "OH" , "Nome" : "Ohio", "Pais":"EUA"},
                  {"Sigla": "OR" , "Nome" : "Oregon", "Pais":"EUA"},
                  {"Sigla": "PA" , "Nome" : "Pensylvania", "Pais":"EUA"},
                  {"Sigla": "TN" , "Nome" : "Tennessee", "Pais":"EUA"},
                  {"Sigla": "TX" , "Nome" : "Texas", "Pais":"EUA"},
                  {"Sigla": "UT" , "Nome" : "Utah", "Pais":"EUA"},
                  {"Sigla": "VT" , "Nome" : "Vermont", "Pais":"EUA"},
                  {"Sigla": "VA" , "Nome" : "Virginia", "Pais":"EUA"},
                  {"Sigla": "WV" , "Nome" : "West Virginia", "Pais":"EUA"},
                  {"Sigla": "WA" , "Nome" : "Washington", "Pais":"EUA"},
                  {"Sigla": "WI" , "Nome" : "Wisconsin", "Pais":"EUA"},
                  {"Sigla": "WY" , "Nome" : "Wyoming", "Pais":"EUA"}
                  ];

   return{
     all : function(){
      return estados;
     },
     filtrado : function(){
       if(filtrados.length==0){
         filtrados : estados;
       }
       return filtrados;
     },
     setEstados : function(estadosFiltrados){
        filtrados : estadosFiltrados;
     }
   }
})


.factory('SubCategory', function($q, $http, S3ServiceAmazon) {

  var subcategories = [];
  var getPromise = function () {

      var def = $q.defer();
      if (subcategories.length > 0) {
        def.resolve();
      } else {

      S3ServiceAmazon.ListaSubCategoriaDynamoDB()
        .then(function (result) {
           subcategories = result;
           def.resolve(subcategories);
         }, function () {});


        // Promise.resolve({
        //   method: 'GET',
        //   url: '/api/cobject/v1/subcategory?per_page=90'
        //   })
        // .then(function(response){
        //   subcategories = response.data.data;
        //   def.resolve();
        // },function(){})
      }
      return def.promise;
    }

  return {
    getPromise: getPromise,
    all: function() {

      var def = $q.defer();

      if(subcategories.length>0){
        return subcategories;
      }

      S3ServiceAmazon.ListaSubCategoriaDynamoDB()
        .then(function (result) {
           subcategories = result;
           def.resolve(subcategories);
         }, function () {});


        // Promise.resolve({
        //   method: 'GET',
        //   url: '/api/cobject/v1/subcategory?per_page=90'
        //   })
        // .then(function(response){
        //   subcategories = response.data.data;
        //   def.resolve();
        // },function(){})
      return subcategories;
    },
    get: function(subcategoryName) {
      // Simple index lookup
      for(var i= 0; i<subcategories.length; i++){
        if(subcategories[i].name ==  subcategoryName.trim())
        return subcategories[i];
      }
    },
    getFromId: function(id) {
      // Simple index lookup

      function isMesmaSubcategory(element, index, array) {
            return (element.category == id);
      }      

      var subcategoryFiltrada = [];
      subcategoryFiltrada = subcategories.filter(isMesmaSubcategory);
      return subcategoryFiltrada;

    },
    setSubCategory: function(dadosRetorno){
      subcategories = dadosRetorno;
      return subcategories;

    },
    getNomeSubCategory: function(id) {
      // Simple index lookup

      function isMesmaSubcategory(element, index, array) {
            return (element.id == id);
      }      

      var subcategoryFiltrada = [];
      subcategoryFiltrada = subcategories.filter(isMesmaSubcategory);
      if(subcategoryFiltrada.length>0){
        return subcategoryFiltrada[0].name;
      }else{
        return "";
      }
    }

  }
})

.factory('Anuncio', function Anuncio($q,  $http, S3ServiceAmazon){
  var anuncios = [];

   Anuncio.getAnunciosUser= function(where){
     // return Promise.resolve({method: 'GET', url: '/api/cobject/v1/item' + where })
     //   .then(function(response){
     //     anuncios = response.data.data;
     //     return anuncios;
     //   }, function (response) {
     //     return response;
     //   })

        var def = $q.defer();
        return S3ServiceAmazon.FiltroAnunciosDynamoDB(where)
           .then(function(dadosRetorno){
             def.resolve(dadosRetorno);
             return dadosRetorno;
           }, function(response){
            def.reject(response);
            return response;
           })

     

   };


   return Anuncio;
})

.factory('Mensagem', function Mensagem($q,  $http, S3ServiceAmazon){
  var mensagens = [];
   Mensagem.getMensagemItem = function(where){
        var def = $q.defer();
        return S3ServiceAmazon.MensagemItem(where)
           .then(function(dadosRetorno){
            if(dadosRetorno.length==0){
              def.reject(dadosRetorno);
              return dadosRetorno;
            }else{
             def.resolve(dadosRetorno);
             return dadosRetorno;
            }
           }, function(response){
            def.reject();
            return response;
           })


     // return Promise.resolve({method: 'GET', url: '/api/cobject/v1/mensagem' + where })
     //   .then(function(response){
     //     mensagens = response.data.data;
     //     return mensagens;
     //   }, function (response) {
     //     return response;
     //   })

   };

   Mensagem.getItem = function(where){
        var def = $q.defer();
        return S3ServiceAmazon.FiltroAnunciosDynamoDB(where)
           .then(function(dadosRetorno){
             def.resolve(dadosRetorno);
             return dadosRetorno;
           }, function(response){
            def.reject(response);
            return response;
           })


     // return Promise.resolve({method: 'GET', url: '/api/cobject/v1/item?where=' + where })
     //   .then(function(response){
     //     mensagens = response.data.data;
     //     return mensagens;
     //   }, function (response) {
     //     return response;
     //   })

   };


    Mensagem.getMensagemUser = function(where){
        var def = $q.defer();
        return S3ServiceAmazon.MensagemUsuario(where)
           .then(function(dadosRetorno){
             def.resolve(dadosRetorno);
             return dadosRetorno;
           }, function(response){
            def.reject(response);
            return response;
           })

      // return Promise.resolve({method: 'GET', url: '/api/cobject/v1/mensagem?where=' + where })
      //   .then(function(response){
      //     mensagens = response.data.data;
      //     return mensagens;
      //   }, function (response) {
      //     return response;
      //   })

    };

    Mensagem.atualizaMensagemLida = function(dados){
        var def = $q.defer();
        var mensagemAntiga = dados;

        return S3ServiceAmazon.AtualizarStatusMensagem(dados)
               .then(function(dados) {
                 if(dados==400){
                   alert("Não foi possível enviar a mensagem.");
                   def.reject(400);
                   return dados;
                 }else{
                   //mensagemAtual = Utils.LocalStorage.getObject('mensagem');
                   //$scope.mensagens.push(mensagemAtual);
                   def.resolve(200);
                   return 200;
                 }  
                }, function(response){
                  def.reject(response);
                  return response;
                })


        // return S3ServiceAmazon.ApagarMensagem(dados)
        //    .then(function(dadosRetorno){
        //      mensagemAntiga.read = true;
        //      Mensagem.enviarMensagem(mensagemAntiga)
        //        .then(function(dados) {
        //          if(dados==400){
        //            alert("Não foi possível enviar a mensagem.");
        //            def.reject(400);
        //            return dados;
        //          }else{
        //            //mensagemAtual = Utils.LocalStorage.getObject('mensagem');
        //            //$scope.mensagens.push(mensagemAtual);
        //            def.resolve(200);
        //            return 200;
        //          }  
        //         }, function(response){
        //           def.reject(response);
        //           return response;
        //         })
        //    })

       // return Promise.resolve({ method: 'PATCH', data: dados, url: '/api/cobject/v1/mensagem/' + idMensagem})
       //   .then(function(response){
       //     return response.data;
       //   }, function(response){
       //     return response;
       //   })
    };


    Mensagem.enviarMensagem = function(dados){
        var def = $q.defer();
        return S3ServiceAmazon.GravarMensagem(dados)
           .then(function(result){
            def.resolve(result);
            return result
           }, function(response){
            def.reject(response);
            return response;
           })

      // return Promise.resolve({url:'/api/cobject/v1/mensagem', method:'POST', data:dados, transformRequest: angular.identity, headers: {'Content-Type': undefined}})
      //   .then(function(response) {
      //     return response.data;
      //   }, function(response){
      //     return response;
      //   })

    };
   return Mensagem;

  })

  .factory('Item', function($q,  _, S3ServiceAmazon){
    var items = [];
    var item =  {};
    var getPromise = function () {
      var def = $q.defer();
      if (items.length > 0) {
        def.resolve();
      } else {

      S3ServiceAmazon.AnunciosDynamoDB()
        .then(function (result) {
           items = result;
           def.resolve();
         }, function () {});


        // Promise.resolve({ method: 'GET', url: '/api/cobject/v1/item'})
        //   .then(function(response){
        //     items = response.data.data;
        //     def.resolve();
        //   },function(){})
      }
      return def.promise;
    }

    return {
      getPromise: getPromise,
      get: function(itemId) {
        // Simple index lookup
        for(var i= 0; i<items.length; i++){
          if(items[i].id == itemId){
            item = items[i];
            return items[i];
          }
        }
      },
      set: function(data){
        items = [];
        for(var i= 0; i<data.length; i++){
          items.push(data[i]);
        }
      },
      getItem : function(view){
        var def = $q.defer();

        if(item.id==undefined){
          idItem = JSON.parse(localStorage.getItem('item')).item;
          idCategoria = JSON.parse(localStorage.getItem('categoria')).id;
          S3ServiceAmazon.BuscarAnuncioDynamoDB(idItem, idCategoria)
          .then(function (result) {
            item = result;
            def.resolve(item);
          });  

        }else{
          def.resolve(item);
        }
        return def.promise;
      },
      setItem : function(itemSelecionado){
        item = itemSelecionado;
      },
      removeItem : function(itemId){
        item = _.findWhere(items, { id : itemId});
        items.splice(item, 1);
      },
      addItens : function(dados){
        for(var i= 0; i<dados.length; i++){
          items.push(dados[i]);
        }
      },
      addItem : function(dados){
        items.push(dados);
      },
      all: function(){
        return items
      }
    }
  })

.factory('YourItems', function(){
  
  var yourItems = [];
  var load = false;

  return {
    set: function(data){
      yourItems = data;
      load = true;
    },
    all: function(){
      return yourItems
    },
    isLoad: function(){
      return load;
    }
  }
})
.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    remove : function(key){
      $window.localStorage.removeItem(key);
    }
  }
}])
//FACTORIES FOR AVOID TOO MANY INJECTION ON SIGNATURE OF CONTROLLERS
.factory('ItemConfig',function(SubCategory, Category, Item, Anuncio, Estados){
  return {
    SubCategory : SubCategory,
    Category: Category,
    Item: Item,
    Anuncio : Anuncio,
    Estados : Estados
  }
})
.factory('IonicComponent',function($ionicModal, $ionicScrollDelegate, $ionicLoading, $ionicPopup){
  return {
    Modal: $ionicModal, 
    ScrollDelegate: $ionicScrollDelegate, 
    Loading: $ionicLoading, 
    Popup: $ionicPopup
  }
})
.factory('ionicReady', function($ionicPlatform) {
  var readyPromise;

  return function () {
    if (!readyPromise) {
      readyPromise = $ionicPlatform.ready();
    }
    return readyPromise;
  };
})
.factory('Utils',  function($state, $stateParams, $localstorage){
  return {
    State: $state,
    Params: $stateParams,
    LocalStorage: $localstorage,
    dataURItoBlob: function(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString = atob(dataURI.split(',')[1]);
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++){
        ia[i] = byteString.charCodeAt(i);
      }
      var bb = new Blob([ab], { "type": mimeString });
      return bb;
    },
    trim : function(texto){
      if(texto==undefined){
        texto = ""
      }else{
        texto = texto.toString().
          replace (/(^\s*)|(\s*$)/gi, ""). // removes leading and trailing spaces
          replace (/[ ]{2,}/gi," ").       // replaces multiple spaces with one space 
          replace (/\n +/,"\n");           // Removes spaces after newlines
      }
    return texto;
    },
    validateAll: function(form ){
      if(Object.keys(form).length >= 8 ){
        return true
      }else
        return false;
    },
    ValidaEhMobile : function(){
      if(ionic.Platform.is("browser")==true){
         return false
      }else{
         if(device.isVirtual === true){
            return false
         }else{
            return ionic.Platform.isWebView() || ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone();
         }
      };

    },
    montaQueryAmazon : function(condicao, tipoCampo, valorFiltro, valorFiltro2){
      var item = {};
      if(tipoCampo=='S'){
        item = {"AttributeValueList" : [{ 'S' : valorFiltro.toString()}],
                  "ComparisonOperator" : condicao.toString()
               }
      }
      if(tipoCampo=='N'){
        item = {"AttributeValueList" : [{ 'N' : valorFiltro.toString()}],
                  "ComparisonOperator" : condicao.toString()
               }
      }
      if(tipoCampo=='NS'){
        item = {"AttributeValueList" : [{ 'N' : valorFiltro.toString()},
                                        { 'N' : valorFiltro2.toString()}
                                       ],
                  "ComparisonOperator" : condicao.toString()
               }
      }
      if(tipoCampo == 'BOOL'){
        item = {"AttributeValueList" : [{ 'BOOL' : valorFiltro}],
                  "ComparisonOperator" : condicao.toString()
               }
      }

      return item;
    },
    montaExpressionAmazon : function(expressao, attributos) {
      var query = {FilterExpression : expressao.toString(),
                   ExpressionAttributeValues : attributos.toString()
      }
      return query;
    }
  };
})
