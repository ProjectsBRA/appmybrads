angular.module('mybradsprod.services')
.service('S3ServiceAmazon', ['$q', 'md5',  'Amazon',  'S3Email', '$http', function ($q, md5, Amazon,  S3Email, $http) {
    //var dynamoConverters = require('dynamo-converters');
    // Us standard region
    AWS.config.region = Amazon.regiao;
    AWS.config.dynamo_db_crc32 = false;
    AWS.config.update({ accessKeyId:  Amazon.key , secretAccessKey: Amazon.keySecret });
    this.keyAmazon = Amazon.key;

    this.Progress = 0;
    this.Upload = function (file, idArquivo) {
        AWS.config.region = ''; //Amazon.regiao;
        AWS.config.update({ accessKeyId:  Amazon.key, secretAccessKey:  Amazon.keySecret });

        var bucket = new AWS.S3({ params: { Bucket: Amazon.bucket, maxRetries: 10 }, httpOptions: { timeout: 360000 } });

        var deferred = $q.defer();
        var params = { Bucket: Amazon.bucket, Key: 'photos/' + idArquivo, ContentType: file.type, Body: file };
        var options = {
            // Part Size of 10mb
            partSize: 10 * 1024 * 1024,
            queueSize: 1,
            // Give the owner of the bucket full control
            ACL: 'bucket-owner-full-control'
        };
        var uploader = bucket.upload(params, options, function (err, data) {
            if (err) {
                deferred.reject(err);
            }
            deferred.resolve();
        });
        uploader.on('httpUploadProgress', function (event) {
            deferred.notify(event);
        });
        AWS.config.region = Amazon.regiao;
        return deferred.promise;
    };

    function ItemAnuncio(){
        var Item = {
            id :  "",
            name : "",
            nameProcura : "",
            description : "",
            category : 0,
            subcategory : 0,
            price : 0,
            email : "",
            telephone : "",
            photo1 : "",
            photo2 : "",
            photo3 : "",
            pais : "",
            estado : "",
            cidade : "",
            nome_anunciante : "",
            user_anunciante : "",
            classificado : false,
            dt_update : "",
            dt_create : ""
        }
        return Item;

    }

    function ItemEnvio(){

        //{id: {S: key}, data: {S: 'data'}}}
        var Item = {
            id : {S :""},
            name : {S :""},
            nameProcura : {S : ""},
            description : {S: ""},
            category : {N: 0},
            subcategory : {N: 0},
            price : {N:0},
            email : {S:""},
            telephone : {S:""},
            photo1 : {S: "null"},
            photo2 : {S: "null"},
            photo3 : {S:"null"},
            pais : {S:""},
            estado : {S:""},
            cidade : {S:""},
            nome_anunciante : {S: ""},
            user_anunciante : {S:""},
            classificado : {BOOL:false},
            dt_update : {N: ""},
            dt_create : {N: ""}
        }
        return Item;
    }

    function Mensagem(){
        var mensagem = {
            id : {S :""},
            item: {S:""},
            message_read : {BOOL : false},
            usuario : {S :""},
            usuario_receive : {S :""},
            usuario_send : {S :""},
            nome_send : {S: ""},
            nome_receive : {S:""},
            mensagem : {S:""},
            dt_update : {N: ""},
            dt_create : {N: ""}
        }
        return mensagem;
    }

    function UserEnvio(){

        //{id: {S: key}, data: {S: 'data'}}}
        var User = {
            id : {S :""},
            firstName : {S :""},
            lastName : {S: ""},
            email : {S:""},
            telephone : {S:""},
            passwordBase: {S:""},
            dt_update : {N: ""},
            dt_create : {N: ""},
            newPassword: {BOOL : false}
        }
        return User;
    }


    function Category(){
      var category = {
          id : {N :""},
          name : {S :""},
          ordem : {N: ""}
      }
      return category;
    }

    function SubCategory(){
      var subcategory = {
          id : {N :""},
          name : {S :""},
          category : {N: ""}
      }
      return subcategory;
    }

    function getListCategory(dados){
        var ListaItems = [];
        var Item = {};

        for (var i = dados.length - 1; i >= 0; i--) {
            Item = new Category();
            Item.id = dados[i].id.N;
            Item.name = dados[i].name.S;
            Item.ordem = Number(dados[i].ordem.N);
            ListaItems.push(Item);
        }
        return ListaItems;
    }

    function getListSubCategory(dados){
        var ListaItems = [];
        var Item = {};

        for (var i = dados.length - 1; i >= 0; i--) {
            Item = new SubCategory();
            Item.id = dados[i].id.N;
            Item.name = dados[i].name.S;
            Item.category = dados[i].category.N;
            ListaItems.push(Item);
        }
        return ListaItems;
    }


    this.criarID = function(){  
       function S4() {  
         return (((1+Math.random())*0x10000)|0).toString(16).substring(1);  
       }   
      return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();  
    }  
  
    function ajustarJsonMensagemEnvio(objeto){
        var MensagemEnvio = {};
        MensagemEnvio                   = new Mensagem();
        MensagemEnvio.id.S              = objeto.id;
        MensagemEnvio.item.S            = objeto.item;
        MensagemEnvio.message_read.BOOL = false;
        MensagemEnvio.usuario.S         = objeto.usuario;
        MensagemEnvio.usuario_receive.S = objeto.usuario_receive;
        MensagemEnvio.nome_receive.S    = objeto.nome_receive;
        MensagemEnvio.usuario_send.S    = objeto.usuario_send;
        MensagemEnvio.nome_send.S       = objeto.nome_send;
        MensagemEnvio.mensagem.S        = objeto.mensagem;
        MensagemEnvio.dt_update.N       = new Date().getTime().toString();
        MensagemEnvio.dt_create.N       = new Date().getTime().toString() ;
        return MensagemEnvio;
    }

    function ajustaJsonItemEnvio(objeto){
       var Item = {};
       Item = new ItemEnvio();
       Item.id.S          = objeto.id;
       Item.name.S        = objeto.name;
       Item.nameProcura.S = objeto.nameProcura;
       Item.description.S = objeto.description;
       Item.category.N    = objeto.category;
       Item.subcategory.N = objeto.subcategory;
       Item.price.N       = objeto.price.toString();
       Item.email.S       = objeto.email;
       Item.telephone.S   = objeto.telephone;
       if(objeto.photo1!==""){
         Item.photo1.S      = objeto.photo1;
       }  
       if(objeto.photo2!==""){
         Item.photo2.S      = objeto.photo2;
       }

       if(objeto.photo3!==""){
         Item.photo3.S      = objeto.photo3;
       }
       Item.pais.S        = 'EUA';
       Item.estado.S      = objeto.estado;
       Item.cidade.S      = objeto.cidade;
       Item.nome_anunciante.S = objeto.nome_anunciante.toString();
       Item.classificado.BOOL = objeto.classificado;
       Item.user_anunciante.S   = objeto.user_anunciante.toString();
       Item.dt_update.N       = new Date().getTime().toString();
       Item.dt_create.N       = new Date().getTime().toString() ;


       return Item;

    }

    function ajustaJsonUserEnvio(objeto){
       var User = {};
       User = new UserEnvio();
       User.id.S        = objeto.id;
       User.firstName.S = objeto.firstName;
       User.lastName.S  = objeto.lastName;
       User.email.S     = objeto.email.toString();
       User.telephone.S = objeto.telephone.toString();
       User.passwordBase.S = objeto.passwordBase.toString();
       User.dt_update.N = new Date().getTime().toString();
       User.dt_create.N = new Date().getTime().toString() ;
       User.newPassword.BOOL = false;

       return User;
    }    

    function ajustarJsonUserRecebido(objeto){
       var User = {};
       User = {
         id : objeto.id.S,
         firstName : objeto.firstName.S,
         lastName  : objeto.lastName.S,
         email     : objeto.email.S.toString(),
         telephone : objeto.telephone.S.toString(),
         passwordBase : objeto.passwordBase.S.toString(),
         dt_update : moment(parseInt(objeto.dt_update.N))._d,
         dt_create : moment(parseInt(objeto.dt_create.N))._d,
         newPassword: objeto.newPassword.BOOL
       }
       return User;

    }

    function ajustaJsonMensagemItems(objeto){
        var ListaMensagens = [];
        var Item = {};

        for (var i = objeto.length - 1; i >= 0; i--) {
            Item = new Mensagem();
            Item.id = objeto[i].id.S;
            Item.item = objeto[i].item.S;
            Item.mensagem = objeto[i].mensagem.S;
            Item.message_read = objeto[i].message_read.BOOL;
            Item.usuario = objeto[i].usuario.S;
            Item.usuario_receive = objeto[i].usuario_receive.S;
            Item.usuario_send = objeto[i].usuario_send.S;
            Item.nome_send = objeto[i].nome_send.S;
            Item.nome_receive = objeto[i].nome_receive.S;
            Item.dt_update = moment(parseInt(objeto[i].dt_update.N))._d;
            Item.dt_create = moment(parseInt(objeto[i].dt_create.N))._d;
            ListaMensagens.push(Item);
        }
        return ListaMensagens;

    }

    function ajustaJsonItemRecebido(objeto){
      var Item = {};
      Item = new ItemAnuncio();
      Item.id = objeto.id.S;
      Item.name = objeto.name.S;
      Item.nameProcura = objeto.nameProcura.S;
      Item.description = objeto.description.S;
      Item.category = objeto.category.N;
      Item.subcategory = objeto.subcategory.N;
      Item.price = objeto.price.N;
      Item.email = objeto.email.S;
      Item.telephone = objeto.telephone.S;
      Item.photo1 = objeto.photo1.S;
      Item.photo2 = objeto.photo2.S;
      Item.photo3 = objeto.photo3.S;
      Item.pais = objeto.pais.S;
      Item.estado = objeto.estado.S;
      Item.cidade = objeto.cidade.S;
      Item.nome_anunciante = objeto.nome_anunciante.S;
      Item.user_anunciante = objeto.user_anunciante.S;
      Item.classificado = objeto.classificado.BOOL;
      Item.dt_update = moment(parseInt(objeto.dt_update.N))._d;
      Item.dt_create = moment(parseInt(objeto.dt_create.N))._d;

      return Item;

    }


    function ajustaJsonItemsRecebidos(objeto){
        var ListaItems = [];
        for (var i = objeto.length - 1; i >= 0; i--) {
            ListaItems.push(ajustaJsonItemRecebido(objeto[i]));
        }
        return ListaItems;
    }

    this.ListaCategoriaDynamoDB = function(){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version: '2012-10-17'
       };
       var dynamodb = new AWS.DynamoDB({dynamoDbCrc32: false});
       var listaDados = $q.defer();
       listaDadosPromise = listaDados.promise;

            dynamodb.scan({
                "TableName": 'category',
                "Limit": 100
            }, function (err, data) {
               if (err) {
                  alert('filtro categoria : ' + err);
                  listaDados.reject(400);
               } else {
                 var dadosDB = getListCategory(data.Items);
                 listaDados.resolve(dadosDB);

               }
        });
        return listaDados.promise;    
      }

    this.ListaSubCategoriaDynamoDB = function(){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version: '2012-10-17'
       };
       var dynamodb = new AWS.DynamoDB({dynamoDbCrc32: false});
       var listaDados = $q.defer();
       listaDadosPromise = listaDados.promise;

            dynamodb.scan({
                "TableName": 'subcategory',
                "Limit": 100
            }, function (err, data) {
               if (err) {
                  alert('filtro subcategoria : ' + err);

                  listaDados.reject(err);
               } else {
                 var dadosDB = getListSubCategory(data.Items);
                 listaDados.resolve(dadosDB);

               }
        });
        return listaDados.promise;    
      }


    this.AnunciosDynamoDB = function(){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version: '2012-10-17'
       };
       var dynamodb = new AWS.DynamoDB({dynamoDbCrc32: false});
       var listaDados = $q.defer();
       listaDadosPromise = listaDados.promise;

            dynamodb.scan({
                "TableName": 'item',
                "Limit": 100
            }, function (err, data) {
               if (err) {
                  alert('Anuncios : ' + err);
                  listaDados.reject(err);
               } else {
                 var dadosDB = ajustaJsonItemsRecebidos(data.Items);
                 listaDados.resolve(dadosDB);

               }
        });
        return listaDados.promise;    
    }

    this.MensagemItem = function(where){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version: '2012-10-17'
       };
       var dynamodb = new AWS.DynamoDB({dynamoDbCrc32: false});
       var listaDados = $q.defer();
       listaDadosPromise = listaDados.promise;

            dynamodb.scan({
                "TableName": 'mensagem',
                "Limit": 100,
                "ScanFilter" : JSON.parse(where)
//                "FilterExpression": JSON.parse(where).FilterExpression,
//                "ExpressionAttributeValues" : JSON.parse(where).ExpressionAttributeValues
            }, function (err, data) {
               var dadosDB = [];
               if (err) {
                  listaDados.reject(dadosDB);
               } else {
                 dadosDB = ajustaJsonMensagemItems(data.Items); 
                 listaDados.resolve(dadosDB);
               }
        });
        return listaDados.promise;    
    }

    this.MensagemUsuario = function(where){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version: '2012-10-17'
       };
       var dynamodb = new AWS.DynamoDB({dynamoDbCrc32: false});
       var listaDados = $q.defer();
       listaDadosPromise = listaDados.promise;

            dynamodb.scan({
                "TableName": 'mensagem',
                "Limit": 100,
                "ScanFilter": JSON.parse(where)
            }, function (err, data) {
               var dadosDB = [];
               if (err) {
                  alert('mensagem timer principal : ' + err)
                  listaDados.reject(dadosDB);
               } else {
                 dadosDB = ajustaJsonMensagemItems(data.Items);
                 listaDados.resolve(dadosDB);

               }
        });
        return listaDados.promise;    
    }

    this.BuscarAnuncioDynamoDB = function(idItem,idCategoria){
       AWS.config.region = Amazon.regiao;
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version: '2012-10-17'
       };
      
       //var doc = require('aws-sdk');
       //var dynamodb = new DOC.DynamoDB();

       var dynamodb = new AWS.DynamoDB({dynamoDbCrc32: false});
       var dadosItem = $q.defer();
       dynamodb.getItem({
          "TableName" : "item",
          "Key" : {"id" : { S : idItem}, "category" : {N : idCategoria}}
       }
        , function (err, data) {
         if (err) {
           dadosItem.reject(400);
         } else {
           var dadosDB = ajustaJsonItemRecebido(data.Item);
           dadosItem.resolve(dadosDB);
         }
       });
       return dadosItem.promise;    
    }

    this.envioEmailConta = function(dadosEmail){
      var url = S3Email.server + '/sendmail';
      var promise = $q.defer();
      $http.post(url , {
        from: 'MyBRads<contato@mybrads.com>',
        to: dadosEmail.email,
        subject: 'Solicitação senha conta MyBrads',
        html: "Envio senha solicitado pelo aplicativo 'MyBrads'.<br />"
             +"Caso não tenha solicitado ignore esse email:<br />" 
             +"</br><p>" +dadosEmail.passwordBase + "</p><br /><br />" 
             +"Atenciosamente<br />"
             +"MyBRads"
      }
      ).success(function(status){ //then(res=>{
          //$scope.loading = false;
          //alert('Email enviado com sucesso.');
          promise.resolve(200);
          
      }).error(function(status){
        promise.reject(400);
      })
      return promise.promise;


     }      

    this.novaSenhaConta = function(dadosConta){
      var promise = $q.defer();
      var params = {
         "TableName": 'user',
         "Key": { 'id': {'S' : dadosConta.id},
                'email' : {'S' : dadosConta.email}
              },
         "UpdateExpression": 'set passwordBase = :senhaNova, newPassword = :status',
         "ExpressionAttributeValues": {':senhaNova': {'S' : dadosConta.senhaCripto}, 
                                       ':status': {'BOOL': dadosConta.status}  },
         "ReturnValues": "UPDATED_OLD"
       };
         var table = new AWS.DynamoDB({dynamoDbCrc32: false});
         table.updateItem(params, function(err, data){
              if(err){
                  promise.reject(400);
                  //alert(err);
              }else{
                promise.resolve(200);
                //alert('conseguiu');
              }
         });

       return promise.promise;
    }

    this.envioEmailConta2 = function(dadosEmail){
      AWS.config.region = S3Email.region;
      AWS.config.update({
        "accessKeyId" : S3Email.accessKeyId,
        "secretAccessKey" : S3Email.secretAccessKey
      });

      var mailOptions = {
         Source: "MyBrads<" + S3Email.email +">", // sender address
         Destination: {ToAddresses : [ dadosEmail.email ]}, // list of receivers
         Message: {
           Subject :{
             Data: "Solicitação senha conta MyBrads"
           },
           Body : {
                Text: {
                    Data: "Envio senha solicitado pelo aplicativo 'MyBrads', caso não tenha solicitado favor desconsiderar esse email." 
                       +  "Favor logar com a senha:" + dadosEmail.passwordBase
                }
                //,
                //Html: {
                //    Data: getHtmlBodyFor("user", userMedia)
                //}
           }
         }
         
      };
      var ses = new AWS.SES({apiVersion: '2010-12-01'});
      var listaDados = $q.defer();

      ses.sendEmail(mailOptions, function(error, response){
          if(error){
              console.log(error);
          }else{
              console.log("Message sent: " + response.message);
          }

        
      });       

    }




    this.ExcluirAnunciosDynamoDB = function(idItem, category){
       AWS.config.region = Amazon.regiao;
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version: '2012-10-17'
       };
      
       //var doc = require('aws-sdk');
       //var dynamodb = new DOC.DynamoDB();

       var dynamodb = new AWS.DynamoDB({dynamoDbCrc32: false});
       var listaDados = $q.defer();
       dynamodb.deleteItem({
          "TableName" : "item",
          "Key" : {"id" : { S : idItem}, "category" : {N : category}}
       }
        , function (err, data) {
         if (err) {
           listaDados.reject(400);
         } else {
           listaDados.resolve(200);
         }
       });
       return listaDados.promise;    
    }


    this.FiltroAnunciosDynamoDB = function(filtro){ 
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version: '2012-10-17'
       };
       var dynamodb = new AWS.DynamoDB({dynamoDbCrc32: false});
       var listaDados = $q.defer();
       listaDadosPromise = listaDados.promise;

            dynamodb.scan({
                "TableName": 'item',
                "Limit": 100,
                "ScanFilter": JSON.parse(filtro)
            }, function (err, data) {
               if (err) {
                  alert('Filtro Anuncios ' + err);
                  listaDados.reject(err);
               } else {
                 var dadosDB = ajustaJsonItemsRecebidos(data.Items);
                 listaDados.resolve(dadosDB);

               }
        });
        return listaDados.promise;    
    }

    this.GravarMensagem = function(formulario){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version:'2012-10-17'
       };
       var table = new AWS.DynamoDB({dynamoDbCrc32: false});
       // Write the item to the table
       var dados = ajustarJsonMensagemEnvio(formulario);
       var promise = $q.defer();

       var itemParams = dados; 
       table.putItem({
          "TableName" : 'mensagem',
          "Item" : dados
        }, function(err, data){
            if(err){
                promise.reject(400);
            }else{
             // promise.resolve(200);
             // Read the item from the table
             promise.resolve(200);
             //table.getItem({Key: {id: {N: dados.id}}}, function(err, data) {
             //  promise.resolve(data);
             //});

            }
        })
       return promise.promise;
   }


   this.ApagarMensagem = function(dados){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version:'2012-10-17'
       };

       var promise = $q.defer();
       var mensagemAntiga = dados;
       var mensagem = ajustarJsonMensagemEnvio(dados);
       var promiseMensagem = $q.defer();
       var table = new AWS.DynamoDB({dynamoDbCrc32: false});

       table.deleteItem({
          "TableName" : "mensagem",
          "Key" : {"id" : { S : dados.id}, "item" : {S : dados.item}}
       }
        , function (err, data) {
         if (err) {
           promiseMensagem.reject(400);
         } else {
           promiseMensagem.resolve(200);
         }
       });

       return promiseMensagem.promise;

   }

   this.AtualizarStatusMensagem = function(dados){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version:'2012-10-17'
       };

       var promise = $q.defer();
       var mensagemAntiga = dados;
       var mensagem = ajustarJsonMensagemEnvio(dados);

       var params = {
         "TableName": 'mensagem',
         "Key": { 'id': {'S' : dados.id},
                'item' : {'S' : dados.item}
              },
         "UpdateExpression": 'set message_read = :var',
         "ExpressionAttributeValues": {':var': {'BOOL' : dados.message_read}  },
         "ReturnValues": "UPDATED_OLD"
       };
         var table = new AWS.DynamoDB({dynamoDbCrc32: false});
         table.updateItem(params, function(err, data){
              if(err){
                  promise.reject(400);
                  //alert(err);
              }else{
                promise.resolve(200);
                //alert('conseguiu');
              }
         });

       return promise.promise;
   }


    this.GravarAnuncioDynamoDB = function(formulario){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version:'2012-10-17'
       };
       var table = new AWS.DynamoDB({dynamoDbCrc32: false});
       // Write the item to the table
       var dados = ajustaJsonItemEnvio(formulario);
       var promise = $q.defer();

       var itemParams = dados; //{Item: {id: {S: key}, data: {S: 'data'}}};
       table.putItem({
          "TableName" : 'item',
          "Item" : dados
        }, function(err, data){
            if(err){
                alert(err);
                promise.reject(400);
            }else{
              promise.resolve(200);
             // Read the item from the table
             //table.getItem({Key: {id: {N: dados.id}}}, function(err, data) {
             //  console.log(data); // print the item data
             //});

            }
        })
       return promise.promise;
   }

   this.EditarAnuncioDynamoDB = function(dadosAnuncio){
     var promise = $q.defer();

     this.ExcluirAnunciosDynamoDB(dadosAnuncio.id, dadosAnuncio.category)
       .then(function(response){
          if(response==400){
            promise.reject(400);
            return 400;
          }
          if(response==200){
            promise.resolve(200);
            return 200;
          }

       },function(err){
          promise.reject(400);
          return 400;
      });

      return promise.promise;

   }

    this.criarContaAmazon = function(formulario){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version:'2012-10-17'
       };
       var table = new AWS.DynamoDB({dynamoDbCrc32: false});
       // Write the item to the table
       var dados = ajustaJsonUserEnvio(formulario);
       var promise = $q.defer();

       var itemParams = dados; //{Item: {id: {S: key}, data: {S: 'data'}}};
       table.putItem({
          "TableName" : 'user',
          "Item" : dados
        }, function(err, data){
            if(err){
                promise.reject(400);
            }else{
              promise.resolve(200);
             // Read the item from the table
             //table.getItem({Key: {id: {N: dados.id}}}, function(err, data) {
             //  console.log(data); // print the item data
             //});

            }
        })
       return promise.promise;
   }

    this.logarContaAmazon = function(formulario){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version:'2012-10-17'
       };
       var table = new AWS.DynamoDB({dynamoDbCrc32: false});
       // Write the item to the table
       var promise = $q.defer();
        table.scan({
          "TableName" : 'user',
          'Limit': 100,
          'ScanFilter': {
            email: {
                AttributeValueList: [{
                    S: formulario.email.toString()
                }],
                ComparisonOperator: 'EQ'
            }
          }
        }, function(err, data){
            if(err){
                promise.reject(400);
            }else{
              if(data.Items[0]!==undefined){
                var User = ajustarJsonUserRecebido(data.Items[0]);
                if(User.passwordBase!==formulario.passwordBase.toString()){
                  promise.reject(400);
                }else{
                  promise.resolve(User);
                }  
              }else{
                promise.reject(400);
              }
            }
             // Read the item from the table
             //table.getItem({Key: {id: {N: dados.id}}}, function(err, data) {
             //  console.log(data); // print the item data
             //});

            //}
        })
       return promise.promise;
   }

    this.retornaUsuario = function(emailCadastro){
       AWS.config.apiVersions = {
         dynamodb: Amazon.baseDynamoDB,
         Version:'2012-10-17'
       };
       var table = new AWS.DynamoDB({dynamoDbCrc32: false});
       // Write the item to the table
       var promise = $q.defer();
        table.scan({
          "TableName" : 'user',
          'Limit': 100,
          'ScanFilter': {
            email: {
                AttributeValueList: [{
                    S: emailCadastro.toString()
                }],
                ComparisonOperator: 'EQ'
            }
          }
        }, function(err, data){
            if(err){
                promise.reject(400);
            }else{
              if(data.Items[0]!==undefined){
                var User = ajustarJsonUserRecebido(data.Items[0]);
                promise.resolve(User);
              }else{
                promise.resolve(400);
              }
            }
        })
       return promise.promise;
   }




}]);