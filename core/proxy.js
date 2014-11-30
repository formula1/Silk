global.__root = __dirname+"/..";


var ProxyServer = require(__dirname+"/network/Proxy2Client_com.js");


var proxy = new ProxyServer(3001,9998,3500);
