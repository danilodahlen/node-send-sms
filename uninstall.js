var Service = require('node-windows').Service;
 
// Create a new service object 
var svc = new Service({
  name:'IntegracaoSMS',
  script: 'C:\\Node\\SMS\\executar.js'
});

svc.uninstall();