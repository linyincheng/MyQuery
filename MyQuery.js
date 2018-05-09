/**
 * @param ele， json， callback，执行时间time
 * 多个属性，带有回调函数，样式获取兼容的缓动动画函数
 */
function Animated(ele,json,callback,time){
	clearInterval(ele.timer);
	ele.timer = setInterval(function() {
	var bool = true;
	//缓动，如何缓动？步长越来越小。。。。
	//步长用目标位置-盒子自身位置的十分之一
	//由于offsetLeft是四舍五入取整的。所以最后10像素的时候step是小于0的值
	//最后10像素的时候都是1像素1像素的向目标位置移动
	//引入json字符串代替了多个参数 遍历json对象；
	//attr = 索引（键）             target ==json[k](值)
	for(var k in json) {
		var leader;
		if(k === "opacity"){
			leader = getStyle(ele,k)*100 || 1;
		}else{
			leader = parseInt(getStyle(ele, k)) || 0;
		}
		var step = (json[k] - leader) / 10;
		//每次获取步长都向上取整，这种情况就包含step<0.4的情况
		//当目标位置比当前位置大时向上取整，小时向下取整
		step = step > 0 ? Math.ceil(step) : Math.floor(step);
		leader = leader + step;
		//当属性为opacity或zIndex的时候
		if(k === 'opacity'){
			ele.style[k] = leader/100;
			//兼容IE6，7，8，在这些浏览器中，opacity支持的是0.3*100
			ele.style.filter = "alpha(opacity="+leader+")"; 
		}else if(k === 'zIndex'){
			ele.style.zIndex = json[k];
		}else{
			//动画原理：盒子未来的位置=盒子当前的位置+步长
			ele.style[k] = leader + 'px';
		}
		//跳出定时器 目标位置-当前位置的绝对值小于步长
		//目标位置和当前位置不相等，就不跳出定时器
		if(json[k] !== leader) {
			bool = false;
		}
		if(bool) {
			clearInterval(ele.timer);
			if(callback) {
				callback();
			}
		}
	}
}, time);
}
/**
 *兼容的获取样式的方法
 * @param ele attr
 */
function getStyle(ele,attr){
	if(window.getComputedStyle){
		return window.getComputedStyle(ele,null)[attr];
	}
	return ele.currentStyle(attr);
}



/*获取滚动条滚动的距离//屏幕上边和左侧被卷去的高度,宽度
 *@param  
 * */
function scroll(){
	return {
		"top":window.pageYOffset || document.documentElement.scrollTop ||document.body.scrollTop,
		"left":window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft
	}
}

/*show
 *@param  ele
 * */
function show(ele){
	ele.style.display = "block";
}

/*hide
 *@param ele  
 * */
function hide(ele){
	ele.style.display = "none";
}
/*获取屏幕可视化区域的宽高
 *@param  
 * */
//clientWidth = width +padding;
//clientHeight =height +padding;
//都不包含border和margin
function client(){
	return {
		'width':window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
		'height':window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
	}
}


/**
 *封装字符串去除前后空格的方法 兼容ie678
 * @param str
 */

String.prototype.trims = function(){
	return str.replace(/(^\s+)|(\s+$)/g,'');
}

/**
 *param createXHR()
 * 封装一个兼容ie5，6，7的XmlHttpRequeat的使用函数
 */
function createXHR(){
	if(typeof XMLHttpRequest != "undefined"){//ie7+，Firefox chrome
		return new XMLHttpRequest;
	}else if(typeof ActiveXObject !="undefined"){//ie6以下
		if(typeof arguments.callee.activeXString !="string"){
			var versions = ["MSXML2.XMLHttp.6.0","MSXML2.XMLHttp.3.0","MSXML2.XMLHttp"],i,len;
			for(i=0,len=versions.length;i<len;i++){
				try{
					new ActiveXObject(versions[i]);
					arguments.callee.activeXString = versions[i];
					break;
				}catch(ex){    
					//跳过
				}
			}
		}
		return new ActiveXObject(arguments.callee.activeXString);
	}else{
		throw newError("No XHR object available.");
	}
}

/**
 *@param url(请求的地址) data(请求的数据) method(请求的方式) bool(是否异步)true/false success是一个函数
 * 封装Ajax方法的，get 和post请求方式
 * 
 */
function $ajax(url,data,method,bool,success){
	let xhr=createXHR();//使用到上面封装使用XMLHttpRequest的函数
	if(method === "get"){   //如果请求方式是get判断是否需要传递数据
		if(data){           
			url +="？";
			url +=data;   //如果有数据则拼接url
		}else{}
		xhr.open(method,url,bool);  
		xhr.send();
	}else{
		xhr.open(method,url,bool);
		xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded"); //post请求方式 设置请求头
		if(data){              //判断是否有数据，如果有，则发送数据
			xhr.send(data);
		}else{         //没有则发送请求
			xhr.send();
		}
	}
	xhr.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			//外面传入一个function作为参数success
			//success把里面的值传出去
			success(this.responseText);
		}
	}
}
