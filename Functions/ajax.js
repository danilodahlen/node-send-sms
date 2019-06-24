const http = require('http');


exports.chamarAjax = function(parametros,handler,f_Callback){
	http.get("http://localhost:3001/" + handler + "?" + f_converterJsonToString(parametros), function(res){
		const statusCode = res.statusCode;
		const contentType = res.headers['content-type'];
		
		if (statusCode != 200){
			f_Callback("Erro de conexão com o servidor | " + statusCode.toString(),false);
		}
		else{
			res.setEncoding('utf8');
			var rawData = '';
			res.on('data', (dados) => { rawData += dados; });
				res.on('end', () => {
				try {
					const parsedData = JSON.parse(rawData);
					f_Callback(parsedData,true);
					
				} catch (e) {
					f_Callback(e.message,false);
				}
			});
		}
	});		
}


function f_converterJsonToString(parametros){
  var keys   = Object.keys(parametros);
  var v_result = "";
  
  for(var i=0; i < keys.length; i++){
      v_result += keys[i] + "=" + parametros[keys[i]] + '&&';
  }
  return v_result.substring(0,v_result.length - 2);
}

