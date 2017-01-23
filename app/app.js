var myApp = angular.module('aknApp', ['ui.utils.masks']);

myApp.controller('aknController', ['$scope', '$http', function($scope, $http){

	currentDay();


	
	//---requisicao da lista de motivos de contato ao servico Rest---
		$scope.options = [];
		$http.get('/api/contato').then(function(response){
			for (var i=0; i<response.data.length; i++){
				if(response.data[i].name != "admins")
					$scope.options.push(response.data[i].name.replace(/_/g ," "));
			}
		}, function(error){
			console.log(error);
		});
	//------



	//---exibe campo de validade para opcao de boleto---
		$scope.formOption = function(){
			if ($scope.userOption == "Re emissão de boleto bancário")
				document.getElementById("dateField").style.display = "block";
			else
				document.getElementById("dateField").style.display = "none";
		}
	//------


	//---verifica campos de registro e envia---
		$scope.enviarRegistro = function(){
			//---verifica se campos estao preenchidos de forma correta---
				console.log($scope.userMessage);
				if($scope.clientName==undefined){
					$scope.message = "Nome inválido!"
					document.getElementById("messageBox").style.display = "block";
				}
				else if($scope.clientEmail == undefined || validator.isEmail($scope.clientEmail)==false){
					$scope.message = "Email inválido!"
					document.getElementById("messageBox").style.display = "block";
				}
				else if($scope.clientCPF == undefined || $scope.clientCPF.length != 11){
					//CPF validator: https://www.npmjs.com/package/cpf_cnpj
					$scope.message = "CPF inválido!"
					document.getElementById("messageBox").style.display = "block";
				}
				else if($scope.userOption == "Re emissão de boleto bancário" && !(getWorkdays(currentDay(),brDate($scope.vencimento)))){
					$scope.message = "Data de vencimento inválida!"
					document.getElementById("messageBox").style.display = "block";
				}
			//------

			//---faz envio de registro para o motivo de contato selecionado pelo usuario---
				else{

					//prepara informacoes para envio de registro
					var registro = {
						clientName : $scope.clientName,
						clientEmail : $scope.clientEmail,
						clientCPF : $scope.clientCPF,
						motivo : $scope.userOption.replace(/ /g ,'_'), //mongoDb nao admite collections com caractere ' '
						vencimento: $scope.vencimento, //undefined, se motivo nao for boleto
						mensagem: $scope.userMessage
					}

					//---calcula valor a ser emitido para o boleto, e verifica prazo---
						if($scope.userOption == "Re emissão de boleto bancário"){
							var diasUteis=getWorkdays(currentDay(),brDate($scope.vencimento));
							var prazoDias=diasCorridos(currentDay(),brDate($scope.vencimento));
							console.log("dias corridos:")
							console.log(prazoDias);
							if(prazoDias > 15){
								$scope.boletoMessage = "Prazo máximo de 15 dias corridos!"
								document.getElementById("messageBox2").style.display = "block";
								document.getElementById("messageBox2").className = "alert alert-danger col-xs-10 col-md-6 col-md-offset-3 col-xs-offset-1 text-center";
								console.log("Prazo excedido");
							}
							else{
								var valorEmReais = calculaJuros(diasUteis);
								document.getElementById("messageBox2").style.display = "block";
								document.getElementById("messageBox2").className = "alert alert-success col-xs-10 col-md-6 col-md-offset-3 col-xs-offset-1 text-center";
								$scope.boletoMessage = "Boleto gerado para o valor de " + valorEmReais + " (" + diasUteis + " dias úteis)"; 
								console.log(valorEmReais);

							}
							
						}
					//------

					//---envia registro (padrão para todas as opcoes)---
						$http.post('/api/registro', registro).then(function(response){
							console.log(response);
							if($scope.userOption != "Re emissão de boleto bancário"){
								$scope.message = "Seu contato foi registrado com sucesso!";
								document.getElementById("messageBox").className = "alert alert-success col-xs-10 col-md-6 col-md-offset-3 col-xs-offset-1 text-center";
								document.getElementById("messageBox").style.display = "block";
							}
						},function(error){
							console.log(error);
						});
					//------
				}
			//------
		}
	//------



	//---Calcula dias uteis---
		function getWorkdays(startDate, endDate){
		    var count = 0;
		    var curDate = startDate;
		    while (curDate <= endDate) {
		        var dayOfWeek = curDate.getDay();
		        if(!((dayOfWeek == 6) || (dayOfWeek == 0)))
		           count++;
		        curDate.setDate(curDate.getDate() + 1);
		    }
		    return count;
		}
	//------



	//---define string com dia atual---
		function currentDay(){
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();

			if(dd<10) {
			    dd='0'+dd
			} 

			if(mm<10) {
				mm='0'+mm
			} 
			today = mm+'/'+dd+'/'+yyyy;
			return (new Date(today));
		}
	//------



	//---converte data do formato dd/mm/aaaa para mm/dd/aaaa
		function brDate(date){
			var aux;
			aux=date.substring(3,5)+'/'+date.substring(0,2)+'/'+date.substring(6,10);
			return (new Date(aux));
		}
	//------



	//---filtro para input de data---
		$scope.parseDate = function(){
			var str=$scope.vencimento;
			//---impede input de caracteres que nao sejam numeros---
				if(isNaN(str.charAt(str.length-1)))
					$scope.vencimento=str.substring(0,str.length-1);
			//------

			//---insere caracteres '/' de forma automatica---
				if(str.length>10)
					$scope.vencimento=str.substring(0,str.length-1);
				if(str.length>2 && str.charAt(2)!='/' && (str.split('/').length-1<1)){
					$scope.vencimento=str.substring(0,2)+'/'+str.substring(2,str.length);
				}
				if(str.length>5 && str.charAt(5)!='/' && (str.split('/').length-1<2)){
					$scope.vencimento=str.substring(0,5)+'/'+str.substring(5,str.length);
				}
			//------
		}
	//------



	//---funcao para calculo dos juros---
		function calculaJuros(diasUteis){
			if (diasUteis <= 3)
				return "R$1010,00";
			else if(diasUteis>3){
				var juros = (diasUteis-3)*2.5;
				var valor = (1000+10+juros);
				valor = valor.toFixed(2);
				return ("R$" + valor.toString());
			}
		}
	//------



	//---calculo de dias corridos---
		function diasCorridos(inicio,fim){
			var oneDay = 24*60*60*1000; // horas*minutos*segundos*milisegundos
			var diffDays = Math.round(Math.abs((inicio.getTime() - fim.getTime())/(oneDay)));
			return diffDays;
		}
	//------

}]);
