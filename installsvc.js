const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'komubot',
  description: 'The KOMU Discord Bot',
  script: 'sharder.js',
  nodeOptions: ['--harmony', '--max_old_space_size=4096'],
  // , workingDirectory: '...'
  // , allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
// svc.on('install', function(){
//  svc.start();
// });

// svc.install();

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function () {
  console.log('Uninstall complete.');
  console.log('The service exists: ', svc.exists);
});

// Uninstall the service.
svc.uninstall();
