// this.app = webSocket(new Koa());
const Process_sub = require('./sub.js');
var ps = new Process_sub(process);

ps.request('test', [1, 2, 3], function(res){
	console.log('子进程调用主进程函数的执行结果:', res);
});