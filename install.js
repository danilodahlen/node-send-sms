var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'IntegracaoSMS',
  description: 'Serviço para envio de SMS.',
  script: 'C:\\Node\\SMS\\executar.js'
});

svc.on('install',function(){
  svc.start();
});

svc.install();