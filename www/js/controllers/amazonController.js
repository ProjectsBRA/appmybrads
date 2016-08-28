angular.module('mybradsprod.controllers')
  .controller('ItemAmazonCtrl', ['$scope', '$stateParams', 'S3ServiceAmazon', '$q', 
     function($scope, $stateParams, S3ServiceAmazon, $q) {

     	// $scope.items = [{
     	// 	id: '1',
     	// 	description: ' Baby Rattles',
     	// 	title: 'Teste',
     	// 	price: 2,
     	// 	userName: 'John Doe'
     	// }, {
     	// 	id: '2',
     	// 	description: ' Baby Rattles Teste 100',
     	// 	title: 'Teste Teste',
     	// 	price: 122,
     	// 	userName: 'John Doe'
     	// }

     	// ]

     	$scope.buscarAnuncio = function(){

	       S3ServiceAmazon.AnunciosDynamoDB().then(function (result) {
	          //arquivo.Success = true;
	          $scope.items = result;
	       }, function (error) {
	         // Mark the error
	         $scope.Error = error;
	       }, function (progress) {
	          $scope.items = result;
	         // Write the progress as a percentage
	         //arquivo.Progress = (progress.loaded / progress.total) * 100
	       });      


     		//$scope.items = S3ServiceAmazon.dadosDynamoDB();
     	};

     }


     	// $scope.buscaDados = function(){
	     //   S3ServiceAmazon.dadosDynamoDB().then(function (result) {
	     //      $scope.items = result;
	     //   }, function (error) {
	     //     // Mark the error
	     //     $scope.Error = error;
	     //   }, function (progress) {
	     //     // Write the progress as a percentage
	     //     arquivo.Progress = (progress.loaded / progress.total) * 100
	     //   });      
     	// }






   ]);
