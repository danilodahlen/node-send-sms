var Connection = require('../Connections/ConnectionSQL.js');

exports.f_convertParamJson = function(v_Param){
  return queryString.parse(v_Param);
}

exports.f_convertJsonToArray = function(v_Param){
  var keys   = Object.keys(v_Param);
  var v_result = new Array(keys.length * 2);
  var j = 0;
  
  
  for(var i=0; i < keys.length; i++){
      v_result[j]     = keys[i];
      v_result[j + 1] = v_Param[keys[i]];
      j = j + 2;
  }
  
  return v_result;
}

exports.f_convertArrayToXML = function(v_Param){
  var result = '<root><r>';

  for(var i=0; i < v_Param.length; i++)
  {
    result += '<d t="' + v_Param[i] + '" v="' + v_Param[i+1] + '"></d>';
    i++;
  }
  result += '</r></root>';

  return result;
}

function _f_montarQuery(v_Param, v_Proc) {
    
  var retorno = 'EXEC ' + v_Proc + ' ';
  for (var i = 0; i < v_Param.length; i++) {

      if (v_Param[i][0] == "string") {
          retorno += '"' + v_Param[i][1] + '"' + ',';
      }
      if (v_Param[i][0] == "date") {
          retorno += '"' + f_toDate(v_Param[i][1]) + '"' + ',';
      }
      if (v_Param[i][0] == "float") {
          retorno += '' + f_toFloat(v_Param[i][1]) + '' + ',';
      }
      if (v_Param[i][0] == "decimal") {
          retorno += '' + f_toDecimal(v_Param[i][1]) + '' + ',';
      }
      if (v_Param[i][0] == "int") {
          retorno += '' + f_toInt(v_Param[i][1]) + '' + ',';
      }
      if (v_Param[i][0] == "bool") {
          retorno += '' + f_toInt(v_Param[i][1]) + '' + ',';
      }
  }

  retorno = retorno.substring(0, retorno.length - 1);
  return retorno;
}

exports.f_executeProcedure = function(v_Param,v_Proc,f_CallBack){
  Connection.execute(_f_montarQuery(v_Param, v_Proc), function(v_Dados, err) {
      f_CallBack(v_Dados, err);
  });
}

exports.f_converterJsonToString = function(v_Param){
  return JSON.stringify(v_Param);
}

exports.f_resultJson = function(res,v_TypeCallExtern,f_CallBack){
      if(v_TypeCallExtern == 'HTTP'){
        const statusCode = res.statusCode;
        const contentType = res.headers['content-type'];
        
        if (statusCode != 200){
          f_Callback("Erro de conexão com o servidor | " + statusCode.toString());
          return;
        }
      
        res.setEncoding('utf8');
        var rawData = '';
        res.on('data', (dados) => { rawData += dados; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                f_CallBack((parsedData ? parsedData : false));
                
            } catch (e) {
                f_CallBack((parsedData ? parsedData : false));
            }
        });
      }
      else if(v_TypeCallExtern == "SQL"){
          f_CallBack((res.recordset ? res.recordset : false));
      }
}


exports.f_returnError = function(v_Param){  
    return (v_Param.originalError ? true : false);
}

function f_toInt(v_Param) {
    return f_replaceAll(f_replaceAll(v_Param, '.', ''), ',', '');
}

function f_toFloat(v_Param) {
    return f_replaceAll(v_Param, ',', '.');
}

function f_toDecimal(v_Param) {
    return f_replaceAll(v_Param, ',', '.');
}

function f_replaceAll(v_Texto, Substituir_De, Substituir_Por) {
    v_Texto = v_Texto.toString();
    while (v_Texto.indexOf(Substituir_De) > -1) {
        v_Texto = v_Texto.replace(Substituir_De, Substituir_Por);
    }

    return v_Texto;
}

function f_toDate(v_Param) {
    return v_Param.split("/")[2] + '-' + v_Param.split("/")[1] + '-' + v_Param.split("/")[0];
}

function f_zeroEsquerda(v_Valor, v_Tamanho) {
    v_Valor = v_Valor.toString();
    while (v_Valor.length < v_Tamanho)
        v_Valor = 0 + v_Valor;
    return v_Valor;
}

