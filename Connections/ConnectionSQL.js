const sql = require('mssql');

exports.execute = function(v_Param,f_CallBack){
    new sql.ConnectionPool(global.config.database).connect().then(pool => {
            return pool.request()
            .query(v_Param).then(function(v_retorno) {
                    if(f_returnError(v_retorno)){
                        f_CallBack(v_retorno,true);
                    }
                    else{
                        f_resultJson(v_retorno,'SQL',function(v_retorno){
                            f_CallBack(v_retorno,false);
                        });
                    }
                    sql.close();
                });
        }).catch(function(v_retorno) {
            if(f_returnError(v_retorno)){
                f_CallBack(v_retorno,true);
            }
            else{
                
                f_resultJson(v_retorno,'SQL',function(v_retorno){
                    f_CallBack(v_retorno,false);
                });
            }
            sql.close();
        });
}

var f_returnError = function(v_Param){  
    return (v_Param.originalError ? true : false);
}

var f_resultJson = function(res,v_TypeCallExtern,f_CallBack){

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

