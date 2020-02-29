// this.app = webSocket(new Koa());
const Process_sub = require('./sub.js');

var config = {
	methods: {
		async test1(param){
			return '测试追加方法：' + param
		}
	}
};

var ps = new Process_sub(config);

ps.request('test', [1, 2, 3], function(res){
	console.log('子进程调用主进程函数的执行结果:', res);
});