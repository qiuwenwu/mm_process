require('mm_expand');

/**
 * 子进程基类
 * @class
 */
class Process_sub {
	/**
	 * 构造函数
	 * @param {Object} ps process进程
	 */
	constructor(config, ps) {
		// 进程
		this.process = ps ? ps : process;
		
		// 进程ID
		this.pid = this.process.pid;
		
		// 函数队列
		this.func_list = {};
		
		// 添加进程消息监听
		this.process.on('message', (data, server) => this.message(data, server));
		
		// 注入配置
		if(config){
			this.set_config(config);
		}
	}
}

/**
 * 追加配置项
 * @param {Object} config 配置参数
 */
Process_sub.prototype.set_config = function(config){
	if(config.data){
		var data = config.data();
		for(var k in data){
			this[k] = data[k];
		}
	}
	var methods = config.methods;
	if(methods){
		for(var k in methods) {
			this[k] = methods[k];
		}
	}
}


/**
 * 测试用函数
 * @param {Object} param 参数
 * @return {Object} 返回响应结果
 */
Process_sub.prototype.test_sub = async function(param) {
	console.log('test_sub', param);
	if(typeof(param) == 'string')
	{
		return '主程序,' + param.replace('好', '也好');
	}
	else {
		return param;
	}
};

/**
 * 发送请求
 * @param {String} method 方法名称
 * @param {Object} param 请求参数
 * @param {Function} func 回调函数
 */
Process_sub.prototype.request = async function(method, param, func) {
	// 随机生成一个ID
	var date = new Date();
	var id = date.getTime() + '' + Math.random();
	
	// 往主程序发送消息, 内容为请求方法和参数
	this.process.send({ pid: this.pid, id, method, param });
	
	// 如果存在回调函数则添加到函数队列
	if(func)
	{
		this.func_list[id] = func;
	}
};

/**
 * 响应服务
 * @param {String} id 消息ID
 * @param {Object} result 响应结果
 */
Process_sub.prototype.response = async function(id, result) {
	// 往主程序发送消息, 内容为执行结果
	this.process.send({ pid: this.pid, id, result });
};

/**
 * 响应回调函数
 * @param {String} id
 * @param {Object} result
 */
Process_sub.prototype.callback = async function(id, result) {
	var func = this.func_list[id];
	// 判断是否有回调函数
	if (func) {
		// 如果有则执行回调函数
		func(result);
		// 执行完后删除回调函数
		delete this.func_list[id];
	}
};

/**
 * 主程序调用当前进程函数
 * @param {String} method 方法名称
 * @param {Object} param 参数
 */
Process_sub.prototype.func = async function(method, param) {
	var fun = this[method];
	if (fun) {
		return await fun(param);
	}
};


/**
 * 监听进程消息
 * @param {Object} data 消息数据
 * @param {Object} server 服务程序
 */
Process_sub.prototype.message = async function(data, server) {
	this.message_handle(data);
};

/**
 * 监听进程消息 json-prc2.0格式
 * @param {Object} json
 */
Process_sub.prototype.message_handle = async function(json) {
	if (json) {
		var { id, method, param, result } = json;
		if (method) {
			var ret = await this.func(method, param);
			if (ret !== undefined) {
				this.response(id, ret);
			}
		} else if (result && id) {
			this.callback(id, result);
		}
	}
};

module.exports = Process_sub;