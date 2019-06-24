var Ajax   = require('./Functions/ajax.js');
var Method = require('./Functions/method.js');
var Log    = require('./Functions/writelog.js');

var FacilitaMovel = require('./Connections/FacilitaMovel.js');

global.config = require("./Config/connection.json");

function f_enviarSMS(v_CodEmpresa,v_CodFilial,v_Empresa){
  
  FacilitaMovel.possuiCreditos(global.config.api.facilitaMovel[v_Empresa].parametros.url,
                               global.config.api.facilitaMovel[v_Empresa].metodos.consulta_creditos,
                               global.config.api.facilitaMovel[v_Empresa].parametros.user,
                               global.config.api.facilitaMovel[v_Empresa].parametros.password,
                               function(v_retorno, Err){

    if(!Err){
      let parametros = new Array();
  
      parametros.push(['string', v_CodEmpresa]);
      parametros.push(['int', '0']);

      Method.f_executeProcedure(parametros,'nsp_FiltrarEnvioSMS',function(v_retorno,Err){

        if(!Err){

          v_retorno.forEach(v_Object => {
            
            FacilitaMovel.enviarSMS(global.config.api.facilitaMovel[v_Empresa].parametros.url,
                                    global.config.api.facilitaMovel[v_Empresa].metodos.enviar_sms_simples,
                                    global.config.api.facilitaMovel[v_Empresa].parametros.user,
                                    global.config.api.facilitaMovel[v_Empresa].parametros.password,
                                    v_Object.idExterno,
                                    v_Object.ddd + v_Object.telefone,
                                    v_Object.msg, function(v_Id,v_Valor,v_Mensagem,Err) {

                                      if(Err){
                                        Log.writeLog(('error',"Erro ao enviar o sms: " + v_Object.idExterno.toString() + " Erro: " + Err));
                                      }
                                      
                                      let parametrosInterno = new Array();

                                      parametrosInterno.push(['string', v_CodEmpresa]);
                                      parametrosInterno.push(['int', v_Object.idExterno]);
                                      parametrosInterno.push(['string', v_Valor]);
                                      parametrosInterno.push(['int', v_Id == 5 || v_Id == 6 ? 1 : 0]);

                                      Method.f_executeProcedure(parametrosInterno,'nsp_GravarStatusSMS',function(v_retorno,Err){
                                        if(Err){
                                          Log.writeLog(('error',"Erro ao salvar o sms: " + v_Object.idExterno.toString() + " Erro: " + Err));
                                        }
                                      });
                                    });
          });

          Log.writeLog('info',"Fim do envio por SMS");
        }
      });
    }
    else{
      Log.writeLog(('error',v_retorno));
    }
  });
}

function f_consultaStatusSMS(v_CodEmpresa,v_CodFilial,v_Empresa){
  
  let parametros = new Array();
  
  parametros.push(['string', v_CodEmpresa]);
  parametros.push(['int', '1']);

  Method.f_executeProcedure(parametros,'nsp_FiltrarEnvioSMS',function(v_retorno,Err){

    if(!Err){
      v_retorno.forEach(v_Object => {
      FacilitaMovel.consultaSMS(global.config.api.facilitaMovel[v_Empresa].parametros.url,
                                global.config.api.facilitaMovel[v_Empresa].metodos.consulta_sms,
                                global.config.api.facilitaMovel[v_Empresa].parametros.user,
                                global.config.api.facilitaMovel[v_Empresa].parametros.password,
                                v_Object.idFacilita,
                                function(v_Id,v_Valor,v_Mensagem,Err){

                                  if(Err){
                                    Log.writeLog(('error',"Erro ao consultar o sms: " + v_Object.idExterno.toString() + " Erro: " + Err));
                                  }
                                   
                                  let parametrosInterno = new Array();

                                  parametrosInterno.push(['string', v_CodEmpresa]);
                                  parametrosInterno.push(['int', v_Object.idExterno]);
                                  parametrosInterno.push(['string', v_Valor]);
                                  parametrosInterno.push(['string', v_Mensagem]);

                                  Method.f_executeProcedure(parametrosInterno,'nsp_GravarStatusSMS_Enviados',function(v_retorno,Err){
                                    if(Err){
                                      Log.writeLog(('error',"Erro ao salvar o sms: " + v_Object.idExterno.toString() + " Erro: " + Err));
                                    }
                                  });
                                }
                              );
      });

      Log.writeLog('info',"Fim da consulta de SMS");
    }
  });
}



function f_processar(){
  f_enviarSMS("001","0001","BASE");
  f_consultaStatusSMS("001","0001","BASE");
}

setInterval(function(){
  Log.writeLog('info',"Iniciou o envio de SMS");
  f_processar();
},global.config.geral.tempo_intervalo); //Milisegundos






  