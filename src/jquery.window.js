/**
 * jQuery StreamlineUI v1.0
 * 依赖：parser、panel、draggable、resizable
 */
(function($){
	/**
	 *  水平居中
	 */
	function hcenter(target){
		var opts = $(target).data('window').options;
		var parent=$(target).parent();
		opts.left=Math.ceil((getPageArea().width - $(target).outerWidth()) / 2 + parent.scrollLeft());
		$(target).panel('move',{
			left:opts.left
		});
	}
	
	/**
	 * 垂直居中
	 */
	function vcenter(target){
		var opts = $(target).data('window').options;
		var parent=$(target).parent();
		opts.top = Math.ceil((getPageArea().height - $(target).outerHeight()) / 2 + parent.scrollTop());
		$(target).panel('move',{
			top:opts.top
		});
	}
	/**
	 * 初始化窗口
	 */
	function create(target){
		var state = $(target).data('window');
		var opts = state.options;
		$(target).addClass('window');
		$(target).css({
			zIndex:opts.zIndex
		});
		$(target).panel($.extend({},state.options,{
			headerCls:'window-header',
			bodyCls:'window-body ' + (opts.noheader ? 'window-body-noheader' : ''),
			onOpen:function(){
				if(state.mask){
					state.mask.css({
						display:'block',
						zIndex:opts.zIndex-1
					});
				}
				opts.onOpen.call(target);
			},
			onClose:function(){
				state.mask.hide();
				opts.onClose.call(target);
			},
			onMaximize:function(){
				var header=$(target).children('.panel-header');
 				var body=$(target).children('.panel-body');
 				var footer=$(target).children('.panel-footer');
				opts.width=getPageArea().width;
				opts.height=getPageArea().height;
				opts.left=0;
				opts.top=0;
				$(target).css({
					width:opts.width,
					height:opts.height,
					left:opts.left,
					top:opts.top
				});
				body.outerHeight($(target).outerHeight()-header.outerHeight()-footer.outerHeight());
				opts.onMaximize.call(target);
			}
		}));
		if(opts.modal){
			// 创建遮罩层
			if(!$('.window-mask').length){
				var mask=$('<div class="window-mask"></div>');
				mask.css({
					width:getPageArea().width,
					height:getPageArea().height,
					display:'none'
				});
				mask.appendTo(document.body);
				state.mask=mask;
			}else{
				state.mask=$('.window.mask');
			}
		}
		if (opts.left == null){
			hcenter(target);
		}
		if (opts.top == null){
			vcenter(target);
		}
	}
	/**
	 * 设置窗口拖动和改变大小属性
	 */
	function setProperties(target){
		var state = $(target).data('window');

		$(target).draggable({
			handle: 'div.panel-header div.panel-title',
			disabled: state.options.draggable == false,
			onStartDrag: function(e){
			},
			onDrag: function(e){
				$(target).window('move',{
					left:e.data.left,
					top:e.data.top
				});
			},
			onStopDrag: function(e){

			}
		});
		
		$(target).resizable({
			disabled: state.options.resizable == false,
			onStartResize:function(e){
			},
			onResize: function(e){
				$(target).window('resize',{
					width:e.data.width,
					height:e.data.height
				});
			},
			onStopResize: function(e){
			}
		});
	}
	
	function getPageArea() {
		if (document.compatMode == 'BackCompat') {
			return {
				width: Math.max(document.body.scrollWidth, document.body.clientWidth),
				height: Math.max(document.body.scrollHeight, document.body.clientHeight)
			}
		} else {
			return {
				width: Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth),
				height: Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight)
			}
		}
	}
	
	$.fn.window = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.window.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.panel(options, param);
			}
		}
		options = options || {};
		return this.each(function(){
			var state = $(this).data('window');
			if (state){
				$.extend(state.options, options);
			} else {
				$(this).data('window', {
					options: $.extend({}, $.fn.window.defaults, $.fn.window.parseOptions(this), options)
				});
				state=$(this).data('window');
			}
			create(this);
			setProperties(this);
		});
	};
	
	$.fn.window.methods = {
		options: function(jq){
			return $(jq[0]).data('window').options;
		},
		hcenter: function(jq){
			return jq.each(function(){
				hcenter(this, true);
			});
		},
		vcenter: function(jq){
			return jq.each(function(){
				vcenter(this, true);
			});
		},
		center: function(jq){
			return jq.each(function(){
				hcenter(this);
				vcenter(this);
			});
		}
	};
	
	$.fn.window.parseOptions = function(target){
		return $.extend({}, $.fn.panel.parseOptions(target), $.parser.parseOptions(target, [
			{draggable:'boolean',resizable:'boolean',modal:'boolean'}
		]));
	};
	
	// 默认属性继承自 $.fn.panel.defaults
	$.fn.window.defaults = $.extend({}, $.fn.panel.defaults, {
		zIndex: 9000,
		draggable: true,
		resizable: true,
		modal: true,
		// 这些属性默认值与panel不同
		title: 'New Window',
		collapsible: true,
		minimizable: true,
		maximizable: true,
		closable: true,
		closed: true
	});
})(jQuery);
