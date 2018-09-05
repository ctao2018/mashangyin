/**
 * @下拉刷新
 */

(function(){
	
	var isValid = false,	// 是否生效
  isTouching = false,	// 触摸中标识
  isEfec = false,	// 触摸是否生效
  isDestory = false, 	// 是否销毁
  startX, startY, disY = 0,	// 起始触摸X、y坐标， 移动Y坐标
  loadingH = 0,	// laodingEl高度
  options = {
    $el: $('body'),	// 默认容器
    $loadingEl: null,	// 刷新提示容器
    autoHide: true,	// 自动隐藏
    url: undefined,	// 请求数据地址
    sendData: null,	// 获取下拉刷新发送数据，动态传入，使用function返回数据
    // 触发拖动像素距离(触发灵敏度),
    // 浏览器中下拉默认事件一旦触发后，就不能再通过冒泡阻止此事件。
    // chrome浏览器中大概是15PX左右的下拉后触发默认刷新，微信中大概是6像素左右。
    // 如需在微信中使用，建议设置为6像素
    startPX: 6, 	
    callbacks: {
      pullStart: null,	// 拖动开始
      start: null,	// 开始请求数据
      success: null,	// 用户端传进数据请求的成功
      error: null,	// 下拉流程结束
			end: null,	// 下拉流程结束
			sucefun: null, // 成功回调的方法
    }
	};
	

	var getPos = function(event){

		var pos = {
			x: event.pageX || event.clientX,
			y: event.pageY || event.clientY
		}

		return pos;
	}

	/**
	 * 重置
	 * @param Boolean isAnim 是否需要过度动画
	 */
	var reset = function(isAnim) {
		isValid = false,	// 是否生效
		isEfec = false,	// 触摸是否生效
		startX, startY, disY = 0;
		options.$loadingEl.animate({'margin-top': -loadingH}, (isAnim == false ? 0 : 800), function() {
			isTouching = false;
			runCb('end');
		});
	}
	
	/**
     *下拉刷新
     */
	var touchStart = function(evt) {
		var scrollTop = parseInt(options.$el.scrollTop());
		
		if(scrollTop > 0) return;
		if(isDestory) return;
		if(isTouching) return;
		
		isTouching = true;
		isEfec = true;
		
		//evt.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
		var touch = evt.touches[0], //获取第一个触点
		x = parseInt(touch.pageX), //页面触点X坐标
		y = parseInt(touch.pageY); //页面触点Y坐标

		//记录触点初始位置
		startX = x;
		startY = y;
		console.log(startY)
	}
	
	/**
	 * 触摸移动过程
	 */
	var touchMove = function(evt) {

		if(isDestory) return;
		if(!isTouching) return;
		if(!isEfec) return;

		var $loadingEl = options.$loadingEl,
        	touch = evt.touches[0], //获取第一个触点
        	x = parseInt(touch.pageX), //页面触点X坐标
        	y = parseInt(touch.pageY), //页面触点Y坐标
        	t = y - startY;			// 触摸距离

        //  距离必须大于灵敏距离触摸才生效
        if(!isValid && t > options.startPX) {
        	isValid = true;
        	runCb('pullStart');
        }
        
        if(!isValid) return;

        if(evt.preventDefault) evt.preventDefault();

        // 向上拖动
        if(t < 0){
        	$loadingEl.css('margin-top', -loadingH);
        }

        // 拖动高度未超过刷新显示容器高度
        if(t > 0 && t <= loadingH){
					
        	$loadingEl.css('margin-top', -(loadingH-t));
        	$loadingEl.height(loadingH);	
        } 
        // 拖动高度超过刷新显示容器高度
        else if(t > loadingH){
          $loadingEl.css('margin-top', 0);
          // 限制下拉距离
          if(t>100){
            t = 100
          }
          $loadingEl.height(t);
        } 
        disY = t;
	}

	/**
	 * 执行回调函数
	 */
	var runCb = function(name, data){
		if(options.callbacks[name]) options.callbacks[name].call(null, data);
	}

	/**
	 * 触摸结束，请求数据
	 */
	var touchEnd = function(evt) {

		if(isDestory) return;
		if(!isValid) return;	// 当前已生效
		if(!isTouching) return;
		if(evt.preventDefault) evt.preventDefault();

		isValid = false;
		isEfec = false;
		disY = 0;

		var $loadingEl = options.$loadingEl,
	    	touch = evt.touches[0] || evt.changedTouches[0], 	//获取第一个触点
	    	x = parseInt(touch.pageX), 	//页面触点X坐标
	    	y = parseInt(touch.pageY), 	//页面触点Y坐标
	    	t = y - startY;

			// 拖动高度未超过刷新显示容器高度
			console.log(y, startY)
	    if(t <= loadingH && t > 0){
	    	$loadingEl.css('margin-top', -(loadingH-t));
	    	$loadingEl.height(loadingH);
	    	$loadingEl.animate({'margin-top': -loadingH}, 200, function() {
	    		isTouching = false;
	    	});
	    }
	    // 拖动高度超过刷新显示容器高度
				else if(t > loadingH) {
					if(options.cb) options.cb();
					$loadingEl.animate({'height': loadingH}, 200, function() {});
					console.log(loadingH)

				var sendData = $.isFunction(options.sendData) ? options.sendData() : options.sendData;
				
				if(options.url){
					runCb('start');
					// post方式查询数据
					$.post(options.url, sendData, function(response, textStatus, xhr) {
							runCb('sucefun', response);
							if(options.autoHide) reset();
						}).error(function(){
							runCb('error');
							if(options.autoHide) reset();
						});
				} else {
					if(options.callbacks)
					reset();
				}
			}
	}
	
	/**
	 * 设置是否销毁
	 */
	var setDestroy = function(destroy){
		isDestory = destroy || false;
	}

	/**
	 * 初始化
	 *   定义loading容器高度
	 *   绑定处理事件
	 */
	var initlize = function() {
		loadingH = options.$loadingEl.height();

		$el = options.$el;
	    $el[0].addEventListener('touchstart', touchStart, false);
	   	$el[0].addEventListener('touchmove', touchMove, false);
	    $el[0].addEventListener('touchend', touchEnd, false);
	}

    var pullDown = function(){
    	initlize();

    	return {
    		reset: reset,
    		setDestroy: setDestroy
    	}
    }

    $.pPullRefresh = function(settings){
			$.extend(true, options, (settings || {}));
    	
    	options.$el = options.$el || $('body');

    	return pullDown(settings);
    }

    $.fn.pPullRefresh = function(settings){
    	settings.$el = $(this);
    	
    	return $.pPullRefresh(settings);
		}
		
		// 插入刷新的html代码
	var refreshFun = function(el){
		var htmls = "<div class='show-pulldown-loading'>"+
			"<img src='front/images/icon/reach-loading.png'><span class='text'>正在刷新数据中...</span>"+
		"</div>";
		$(el).before(htmls);
	}
	// 在页面插入刷新顶部提示的html
	refreshFun(".main-index")
	var $statu = $('.show-pulldown-loading .text');
	
	var pullRefresh = $('.body-main').pPullRefresh({
		$el: $('.body-main'),
		$loadingEl: $('.show-pulldown-loading'),
		sendData: null,
		url: options.url,
		callbacks: {
			sucefun: function(response){
				$statu.text('数据刷新成功！');
				runCb('success', response)
				// 取消中间刷新效果
				hideLoading()
			},
			pullStart: function(){
				$statu.text('松开开始刷新');
			},
			start: function(){
				$statu.text('数据刷新中···');
				// 开启中间刷新样式  public.js
				showLoading()
			},
			success: function(response){
				$statu.text('数据刷新失败');
			},
			end: function(){
				$statu.text('下拉刷新结束');
			},
			error: function(){
				$statu.text('找不到请求地址,数据刷新失败');
			}
			
		}
	});

})();