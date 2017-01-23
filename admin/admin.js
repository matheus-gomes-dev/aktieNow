var myApp = angular.module('aknApp', []);

myApp.controller('adminController', ['$scope', '$http', function($scope, $http){
	
	$scope.modalMessage="";
	$scope.registros="";

	//variavel para identificar motivo selecionado
	var optionID;
	//variavel para identificar acao do admin
	var acao="";
	//variavel para armazenar nomes das collections como registrado no DB
	var collectionsDB=[];


	//---requisicao da lista de motivos de contato ao servico Rest---
		$scope.options = [];
		$http.get('/api/contato').then(function(response){
			console.log(response.data)
			for (var i=0; i<response.data.length; i++){
				//armazena listas de motivos para exibir ao usuario, e para possiveis acessos ao DB
				if(response.data[i].name != "admins"){
					$scope.options.push(response.data[i].name.replace(/_/g ," "));
					collectionsDB.push(response.data[i].name);
				}
			}
			console.log($scope.options);
			console.log(collectionsDB);
		}, function(error){
			console.log(error);
		});
	//------


	//---Checka se usuario eh administrador---
		$scope.loginFunc = function(){
			if($scope.admin != undefined && $scope.admin.name != undefined && $scope.admin.password != undefined){
				console.log($scope.admin.name);
				console.log($scope.admin.password);

				var loginObj = {
					name : $scope.admin.name,
					password : $scope.admin.password
				}

				$http.post('/api/admin/login', loginObj).then(function(response){
					if (response.data == "Registered User!")
						renderAdminSection();
					else{
						$scope.message = "Administrador não cadastrado!"
						document.getElementById("messageBox").style.display = "block";
					}
				});
			}
		}
	//------


	//---inicia secao de administrador---
		function renderAdminSection(){
			document.getElementById("messageBox").style.display = "none";
			document.getElementById("nameLogin").style.display = "none";
			document.getElementById("pswdLogin").style.display = "none";
			document.getElementById("crudTable").style.display = "block";
			document.getElementById("scrollDiv").style.display = "block";

			
		}
	//------


	//---exibe modal para confirmar acao do admin---
		$scope.acaoAdmin = function(index, operacao){
			//atualiza variaveis de identificacao do motivo
			//e acao do admin
			optionID=index;
			acao=operacao;
			console.log(optionID);
			console.log(acao);

			//define mensagem a ser exibida no modal
			//de acordo com operacao desejada
			switch (acao){
				case 'remover':
					document.getElementById('inputMotivo').style.display = "none";
					$scope.modalMessage = "Deseja excluir este motivo de contato e todos seus registros salvos?";
					break;
				case 'adicionar':
					$scope.modalMessage = "Insira novo motivo de contato e confirme para concluir";
					document.getElementById('inputMotivo').style.display = "block";
					break;
				default:
					document.getElementById('inputMotivo').style.display = "none";
					$scope.modalMessage = "Opção desconhecida";
			}

			// abre modal
			var modal = document.getElementById('myModal');
			modal.style.display = "block";

			//tag <span> para fechar modal
			var span = document.getElementsByClassName("close")[0];
			span.onclick = function() {
			    modal.style.display = "none";
			}

			//fecha modal quando clica na tela
			window.onclick = function(event) {
			    if (event.target == modal) {
			        modal.style.display = "none";
			    }
			}


		}
	//------


	//---exibe registros de motivo de contato selecionado---
		$scope.exibirRegistros = function(index){
			var dbCollection = {
				collectionName : collectionsDB[index]
			};
			$http.post('/api/consulta', dbCollection).then(function(response){
				$scope.registros=""
				for (var i=0; i<response.data.length; i++){
					console.log(JSON.stringify(response.data[i]));
					$scope.registros+=JSON.stringify(response.data[i]);
				}

			});
		}
	//------


	//---Fecha modal, cancelando operacao---
		$scope.closeModal = function(){
			var modal = document.getElementById('myModal');
			modal.style.display = "none";
		}
	//------


	//---Confirma e executa operacao do admin---
		$scope.confirmOperation = function(){
			$scope.closeModal();
			if(acao == "remover"){
				var collectionName = {
					name: $scope.options[optionID]
				}
				$http.post('/api/admin/remover',collectionName).then(function(response){
					console.log(response);
					$scope.message = "Operação realizada com sucesso. Atualize sua seção!";
					document.getElementById("messageBox").className = "alert alert-success col-xs-10 col-md-6 col-md-offset-3 col-xs-offset-1 text-center";
					document.getElementById("messageBox").style.display = "block";
				},function(error){
					$scope.message = "Erro na operação!";
					document.getElementById("messageBox").className = "alert alert-danger col-xs-10 col-md-6 col-md-offset-3 col-xs-offset-1 text-center";
					document.getElementById("messageBox").style.display = "block";
					console.log(error);
				});
			}
			else if(acao == "adicionar" && $scope.novoMotivo != undefined){
				var collectionName = {
					name: $scope.novoMotivo
				}
				$http.post('/api/admin/adicionar',collectionName).then(function(response){
					console.log(response);
					$scope.message = "Operação realizada com sucesso. Atualize sua seção!";
					document.getElementById("messageBox").className = "alert alert-success col-xs-10 col-md-6 col-md-offset-3 col-xs-offset-1 text-center";
					document.getElementById("messageBox").style.display = "block";
				},function(error){
					console.log(error);
					$scope.message = "Erro na operação!";
					document.getElementById("messageBox").className = "alert alert-danger col-xs-10 col-md-6 col-md-offset-3 col-xs-offset-1 text-center";
					document.getElementById("messageBox").style.display = "block";
				});
			}
		}
	//--- ---

}]);
