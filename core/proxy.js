global.__root = __dirname+"/..";

global.hp = process.env.hp || 3001;
global.wp = process.env.wp || 9998;
global.sp = process.env.sp || 3500;


var ProxyServer = require(__dirname+"/network/Proxy2Client_com.js");


var proxy = new ProxyServer(hp,wp,sp);
