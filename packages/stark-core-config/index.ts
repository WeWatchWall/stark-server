module.exports = function(arg) {
  let fs = require('fs-extra');
  
  setInterval(() => {
    console.log(process.cwd());
    console.log(JSON.stringify(arg));
  }, 5000);
  
  // TODO: Last task is set Init status on the Node!
}