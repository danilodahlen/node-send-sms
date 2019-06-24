var http = require('http');

exports.enviarSMS = function(v_Url,v_Method,v_User,v_Password,v_idExternal,v_Number,v_Msg, f_CallBack){

	function f_montarUrl(){
		const retorno = (v_Url + 
						 v_Method + "?" + 
						 "user=" + v_User + "&" + 
						 "password=" + v_Password + "&" +
						 "destinatario=" + v_Number + "&" +
						 "externalKey=" + v_idExternal + "&" + 
						 "msg=" + encodeURI(v_Msg)).toString();
		
		return retorno; 
	}

    http.get(f_montarUrl(), function(res){
        const statusCode = res.statusCode;
		const contentType = res.headers['content-type'];
		
		if (statusCode != 200){
			f_CallBack("Erro de conexão com o servidor | " + statusCode.toString(),false);
		}
		else{
			res.setEncoding('utf8');
			var rawData = '';
			res.on('data', (dados) => { rawData += dados; });
				res.on('end', () => {
				try {
					f_StatusRetorno(rawData,"ENVIAR",function(v_Id,v_Valor,v_Mensagem,v_Erro){
						if(v_Erro)
							f_CallBack("Erro ao retornar o status",null,null,true);			
						
						f_CallBack(v_Id,v_Valor,v_Mensagem,false);
					});
				} catch (e) {
					f_CallBack(e.message,null,null,true);
				}
			});
        }
    });
}

exports.consultaSMS = function(v_Url,v_Method,v_User,v_Password,v_idExternal, f_CallBack){
	
	function f_montarUrl(){
		const retorno = (v_Url + 
						 v_Method + "?" + 
						 "user=" + v_User + "&" + 
						 "password=" + v_Password + "&" +
						 "id=" + v_idExternal).toString();
		
		return retorno; 
	}

    http.get(f_montarUrl(), function(res){
        const statusCode = res.statusCode;
		const contentType = res.headers['content-type'];
		
		if (statusCode != 200){
			f_CallBack("Erro de conexão com o servidor | " + statusCode.toString(),false);
		}
		else{
			res.setEncoding('utf8');
			var rawData = '';
			res.on('data', (dados) => { rawData += dados; });
				res.on('end', () => {
					try {
						f_StatusRetorno(rawData,"CONSULTAR",function(v_Id,v_Valor,v_Mensagem,v_Erro){
							if(v_Erro)
								f_CallBack("Erro ao retornar o status",null,null,true);			
							
							f_CallBack(v_Id,v_Valor,v_Mensagem,false);
						});
					} catch (e) {
						f_CallBack(e.message,null,null,true);
					}
			});
        }
    });
}

exports.possuiCreditos = function(v_Url,v_Method,v_User,v_Password,f_CallBack){

	function f_montarUrl(){
		const retorno = (v_Url + 
						 v_Method + "?" + 
						 "user=" + v_User + "&" + 
						 "password=" + v_Password).toString()
		
		return retorno; 
	}

    http.get(f_montarUrl(), function(res){
        const statusCode = res.statusCode;
		const contentType = res.headers['content-type'];
		
		if (statusCode != 200){
			f_CallBack("Erro de conexão com o servidor | " + statusCode.toString(),false);
		}
		else{
			res.setEncoding('utf8');
			var rawData = '';
			res.on('data', (dados) => { rawData += dados; });
				res.on('end', () => {
				try {
					if (rawData.indexOf(";") > 0){
						if(parseInt(rawData.split(";")[1]) >= 0)
							f_CallBack(parseInt(rawData.split(";")[1]),false);
						else{
							f_CallBack("A empresa está sem creditos, favor efetuar a recarga",true);
						}
					}
					else{
						f_CallBack("Sem resultado",true);
					}
				} catch (e) {
					f_CallBack(e.message,true);
				}
			});
        }
    });
}

function f_StatusRetorno(v_Valor,v_Tipo,f_CallBack){
	Id = v_Valor.substring(0,1);

	
	if(v_Tipo == "ENVIAR"){

		const Mensagem = {
			1:"Login Invalido Usuário ou Senha enviados na URL",
			2:"Usuario sem Creditos",
			3:"Celular Invalido Número de Celular",
			4:"Campo Mensagem Invalida",
			5:"Mensagem Agendada",
			6:"Mensagem enviada"
		}

		if(parseInt(Id) == 5 || parseInt(Id) == 6){
			v_Valor = v_Valor.substring(2,v_Valor.length);
		}
		else{
			v_Valor = "";	
		}
		
		f_CallBack(parseInt(Id),v_Valor,Mensagem[parseInt(Id)],false)
		
	}
	else if(v_Tipo == "CONSULTAR"){
		
		const Mensagem = {
			0:"Login Invalido Usuário ou Senha enviados na URL",
			1:"Mensagem enfileirada Mensagem na fila para envio",
			2:"Agendada Mensagem Agendada",
			3:"Enviando Mensagem sendo entregue na operadora",
			4:"Mensagem enviada Mensagem entregue na operadora",
			5:"Erro Mensagem nao enviada devido a erros",
			9:"Destinatário confirmou o recebimento da mensagem"
		}
		
		f_CallBack(parseInt(Id),v_Valor,Mensagem[parseInt(Id)],false);
	}
}


