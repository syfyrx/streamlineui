/**
 * jQuery StreamlineUI v1.0 
 * 依赖：parser、draggable、resizable
 */
(function($) {
	/**
	 * 创建窗口
	 */
	function create(target) {
		var state = $(target).data('window');
		var opts = state.options;
		$(target).addClass('window');
		var body = setBody();
		var header = setHeader();
		var footer = setFooter();
		if (opts.content) {
			body.empty();
			body.html(opts.content);
		}
		$(target).css({
			width:opts.width,
			height:opts.height,
			zIndex : opts.zIndex
		});
		body.css({
			width:opts.width,
			height:opts.height-header.outerHeight()-footer.outerHeight()
		});
		$.parser.parse(body);
		/**
		 * 设置窗口标题栏
		 */
		function setHeader() {
			var header = $(target).children('.window-header');
			if (header.length == 0) {
				header = $('<div class="window-header"></div>').prependTo(target);
			}
			header.addClass(opts.headerCls);
			if (!$.isArray(opts.tools)) {
				header.find('.window-tool .window-tool-a').appendTo(opts.tools);
			}
			header.empty();
			var title = $('<div class="window-title"></div>').html(opts.title).appendTo(header);
			if (opts.iconCls) {
				$('<div class="window-icon"></div>').addClass(opts.iconCls).prependTo(header);
				title.addClass('window-with-icon');
			}
			var tool = $('<div class="window-tool"></div>').appendTo(header);
			tool.bind('click', function(e) {
				e.stopPropagation();// 阻止事件冒泡
			});
			if (opts.tools) {
				if ($.isArray(opts.tools)) {
					$.map(opts.tools, function(t) {
						addTool(tool, t.text, t.css, t.handler);
					});
				} else {
					$(opts.tools).children().each(function() {
						$(this).addClass('window-tool-a').appendTo(tool);
					});
				}
			}
			if (opts.collapsible) {
				addTool(tool, opts.defaultTools.collapseTool.text, opts.defaultTools.collapseTool.css, function() {
					if (opts.collapsed == true) {
						expand(target, true);
					} else {
						collapse(target, true);
					}
				});
			}
			if (opts.maximizable) {
				addTool(tool, opts.defaultTools.maxTool.text, opts.defaultTools.maxTool.css, function() {
					if (opts.maximized == true) {
						restore(target);
					} else {
						maximize(target);
					}
				});
			}
			if (opts.closable) {
				addTool(tool, opts.defaultTools.closeTool.text, opts.defaultTools.closeTool.css, function() {
					close(target);
				});
			}
			return header;
		}
		/**
		 * 设置窗口主体
		 */
		function setBody() {
			var str = $(target).html();
			$(target).empty();
			return $('<div class="window-body"></div>').appendTo(target).html(str).addClass(opts.bodyCls);
		}
		/**
		 * 添加工具栏按钮
		 */
		function addTool(tool, text, css, handler) {
			var a = $('<a href="javascript:void(0)">' + text + '</a>').addClass(css).appendTo(tool);
			a.bind('click', handler);
		}
		/**
		 * 设置面板底部
		 */
		function setFooter() {
			if (opts.footer) {
				$(opts.footer).addClass('window-footer').appendTo(target);
				body.removeClass('window-body-nofooter');
			} else {
				$(target).children('.window-footer').remove();
				body.addClass('window-body-nofooter');
			}
			return $(opts.footer);
		}
		if (opts.modal) {
			// 创建遮罩层
			if (!$('.slui-mask').length) {
				var mask = $('<div class="slui-mask"></div>');
				mask.css({
					width : getPageArea().width,
					height : getPageArea().height,
					display : 'none'
				});
				mask.appendTo(document.body);
				state.mask = mask;
			} else {
				state.mask = $('.window.mask');
			}
		}
		if (opts.left == null) {
			hcenter(target);
		}
		if (opts.top == null) {
			vcenter(target);
		}
		if (opts.closed) {
			close(target);
		} else {
			if (opts.modal) {
				state.mask.show();
			}
		}
	}
	/**
	 * 设置窗口拖动和改变大小属性
	 */
	function setProperties(target) {
		var state = $(target).data('window');
		$(target).draggable({
			handle : '.window-header .window-title',
			disabled : state.options.draggable == false,
			onStartDrag : function(e) {
			},
			onDrag : function(e) {
				move(target, {
					left : e.data.left,
					top : e.data.top
				});
			},
			onStopDrag : function(e) {

			}
		});
		$(target).resizable({
			disabled : state.options.resizable == false,
			onStartResize : function(e) {
			},
			onResize : function(e) {
				resize(target, {
					width : e.data.width,
					height : e.data.height
				});
			},
			onStopResize : function(e) {
			}
		});
	}
	/**
	 * 设置标题文本
	 */
	function setTitle(target, title) {
		$(target).data('window').options.title = title;
		$(target).find('.window-header .window-title').html(title);
	}
	/**
	 * 打开窗口
	 */
	function open(target, forceOpen) {
		var state = $(target).data('window');
		var opts = state.options;
		if (forceOpen != true) {
			if (opts.onBeforeOpen.call(target) == false) {
				return;
			}
		}
		opts.closed = false;
		$(target).show();
		if ($(target).children('.window-header').find('a.window-tool-restore').length) {
			opts.maximized = true;
		}
		if (state.mask) {
			state.mask.css({
				display : 'block',
				zIndex : opts.zIndex - 1
			});
		}
		opts.onOpen.call(target);
		if (opts.maximized) {
			opts.maximized = false;
			maximize(target);
		}
		if (opts.collapsed == true) {
			opts.collapsed = false;
			collapse(target);
		}
		if (!opts.collapsed) {
			load(target);
		}
	}
	/**
	 * 关闭窗口
	 */
	function close(target, forceClose) {
		var state = $(target).data('window');
		var opts = state.options;
		if (forceClose != true) {
			if (opts.onBeforeClose.call(target) == false) {
				return;
			}
		}
		$(target).hide();
		opts.closed = true;
		if (state.mask) {
			state.mask.hide();
		}
		opts.onClose.call(target);
	}
	/**
	 * 改变窗口大小
	 */
	function resize(target, params) {
		var state = $(target).data('window');
		var opts = state.options;
		var header = $(target).children('.window-header');
		var body = $(target).children('.window-body');
		var footer = $(target).children('.window-footer');
		if (params) {
			if (params.width != null && params.width != undefined) {
				opts.width = params.width;
			}
			if (params.height != null && params.height != undefined) {
				opts.height = params.height;
			}
		}
		$(target).css({
			width : opts.width,
			height : opts.height
		});
		body.css({
			width:opts.width,
			height:$(target).outerHeight() - header.outerHeight() - footer.outerHeight()
		});
		opts.onResize.apply(target, [ opts.width, opts.height ]);
	}
	/**
	 * 移动窗口
	 */
	function move(target, params) {
		var opts = $(target).data('window').options;
		if (params) {
			if (params.left != null && params.left != undefined) {
				opts.left = params.left;
			}
			if (params.top != null && params.top != undefined) {
				opts.top = params.top;
			}
		}
		$(target).css({
			left : opts.left,
			top : opts.top
		});
		opts.onMove.apply(target, [ opts.left, opts.top ]);
	}
	/**
	 * 最大化窗口
	 */
	function maximize(target) {
		var opts = $(target).data('window').options;
		if (opts.maximized == true) {
			return;
		}
		var toolMax = $(target).children('.window-header').find('a.window-tool-max');
		toolMax.addClass('window-tool-restore');
		if (!$(target).data('window').original) {
			$(target).data('window').original = {
				width : opts.width,
				height : opts.height,
				left : opts.left,
				top : opts.top,
				fit : opts.fit
			};
		}
		opts.fit = true;
		if (opts.fit) {
			params = {
				width : getPageArea().width,
				height : getPageArea().height
			};
		}
		resize(target, params);
		params = {
			left : 0,
			top : 0
		};
		move(target, params);
		opts.maximized = true;
		opts.onMaximize.call(target);
	}
	/**
	 * 恢复窗口
	 */
	function restore(target) {
		var opts = $(target).data('window').options;
		if (opts.maximized == false) {
			return;
		}
		var toolMax = $(target).children('.window-header').find('a.window-tool-max');
		toolMax.removeClass('window-tool-restore');
		var original = $(target).data('window').original;
		opts.fit = false;
		resize(target, {
			width : original.width,
			height : original.height
		});
		move(target, {
			left : original.left,
			top : original.top
		});
		opts.maximized = false;
		$(target).data('window').original = null;
		opts.onRestore.call(target);
	}
	/**
	 * 折叠窗口
	 */
	function collapse(target) {
		var opts = $(target).data('window').options;
		if (opts.collapsed == true) {
			return;
		}
		var body = $(target).children('.window-body');
		body.stop(true, true);
		if (opts.onBeforeCollapse.call(target) == false) {
			return;
		}
		body.slideUp('normal', function() {
			$(target).children('.window-header').find('a.window-tool-collapse').addClass('window-tool-expand');
			opts.collapsed = true;
			opts.onCollapse.call(target);
		});
	}
	/**
	 * 展开窗口
	 */
	function expand(target) {
		var opts = $(target).data('window').options;
		var body = $(target).children('.window-body');
		if (opts.collapsed == false) {
			return;
		}
		body.stop(true, true);
		if (opts.onBeforeExpand.call(target) == false) {
			return;
		}
		body.slideDown('normal', function() {
			$(target).children('.window-header').find('a.window-tool-collapse').removeClass('window-tool-expand');
			opts.collapsed = false;
			opts.onExpand.call(target);
			load(target);
		});
	}
	function load(target, queryParams) {
		var state = $(target).data('window');
		var opts = state.options;
		var body=$(target).children('.window-body');
		if (!opts.href) {
			return;
		}
		if (queryParams) {
			opts.queryParams = queryParams;
		}
		if (!state.isLoaded || !opts.cache) {
			var queryParams = $.extend({}, opts.queryParams);
			if (opts.onBeforeLoad.call(target, queryParams) == false) {
				return;
			}
			state.isLoaded = false;
			body.empty();
			if (opts.loadingMessage) {
				body.html($('<div class="window-loading"></div>').html(opts.loadingMessage));
			}
			opts.loader.call(target, queryParams, function(data) {
				var filterData = opts.extractor.call(target, data);
				body.html(filterData);
				$.parser.parse(body);
				opts.onLoad.apply(target, arguments);
				state.isLoaded = true;
			}, function() {
				opts.onLoadError.apply(target, arguments);
			});
		}
	}
	/**
	 * 水平居中
	 */
	function hcenter(target) {
		var opts = $(target).data('window').options;
		var parent = $(target).parent();
		opts.left = Math.ceil((getPageArea().width - $(target).outerWidth()) / 2 + parent.scrollLeft());
		move(target, {
			left : opts.left
		});
	}
	/**
	 * 垂直居中
	 */
	function vcenter(target) {
		var opts = $(target).data('window').options;
		var parent = $(target).parent();
		opts.top = Math.ceil((getPageArea().height - $(target).outerHeight()) / 2 + parent.scrollTop());
		move(target, {
			top : opts.top
		});
	}

	function getPageArea() {
		if (document.compatMode == 'BackCompat') {
			return {
				width : Math.max(document.body.scrollWidth, document.body.clientWidth),
				height : Math.max(document.body.scrollHeight, document.body.clientHeight)
			}
		} else {
			return {
				width : Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth),
				height : Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight)
			}
		}
	}
	/**
	 * 标签上绑定的数据包括：
	 * options：属性
	 * isLoaded：是否加载结束
	 * original：窗口最大化前的尺寸
	 */
	$.fn.window = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.window.methods[options](this, param);
		}
		options = options || {};
		return this.each(function() {
			var state = $(this).data('window');
			if (state) {
				$.extend(state.options, options);
			} else {
				$(this).data('window', {
					options : $.extend({}, $.fn.window.defaults, $.fn.window.parseOptions(this), options)
				});
				state = $(this).data('window');
			}
			state.isLoaded = false;
			create(this);
			setProperties(this);
		});
	};

	$.fn.window.methods = {
		options : function(jq) {
			return $(jq[0]).data('window').options;
		},
		header : function(jq) {
			return $(jq[0]).children('.window-header');
		},
		footer : function(jq) {
			return $(jq[0]).children('.window-footer');
		},
		body : function(jq) {
			return $(jq[0]).children('.window-body');
		},
		setTitle : function(jq, title) {
			return jq.each(function() {
				setTitle(this, title);
			});
		},
		open : function(jq, forceOpen) {
			return jq.each(function() {
				open(this, forceOpen);
			});
		},
		close : function(jq, forceClose) {
			return jq.each(function() {
				close(this, forceClose);
			});
		},
		clear : function(jq) {
			return jq.each(function() {
				$(this).children('.window-body').empty();
			});
		},
		refresh : function(jq, param) {
			return jq.each(function() {
				var state = $(this).data('window');
				state.isLoaded = false;
				if (param) {
					if (typeof param == 'string') {
						state.options.href = param;
					} else {
						state.options.queryParams = param;
					}
				}
				load(this);
			});
		},
		resize : function(jq, params) {
			return jq.each(function() {
				resize(this, params);
			});
		},
		move : function(jq, params) {
			return jq.each(function() {
				move(this, params);
			});
		},
		maximize : function(jq) {
			return jq.each(function() {
				maximize(this);
			});
		},
		restore : function(jq) {
			return jq.each(function() {
				restore(this);
			});
		},
		collapse : function(jq) {
			return jq.each(function() {
				collapse(this);
			});
		},
		expand : function(jq) {
			return jq.each(function() {
				expand(this);
			});
		},
		hcenter : function(jq) {
			return jq.each(function() {
				hcenter(this, true);
			});
		},
		vcenter : function(jq) {
			return jq.each(function() {
				vcenter(this, true);
			});
		},
		center : function(jq) {
			return jq.each(function() {
				hcenter(this);
				vcenter(this);
			});
		}
	};

	$.fn.window.parseOptions = function(target) {
		return $.extend({}, $.parser.parseOptions(target));
	};

	$.fn.window.defaults = {
		title : 'New Window',
		iconCls : null,
		width : 400,
		height : 300,
		left : null,
		top : null,
		headerCls : '',
		bodyCls : '',
		fit : false,
		noheader : false,
		content : null,
		collapsible : false,
		maximizable : false,
		closable : true,
		tools : null,
		collapsed : false,
		maximized : false,
		closed : true,
		href : null,
		cache : true,
		loadingMessage : 'Loading...',
		extractor : function(data) {
			var pattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
			var matches = pattern.exec(data);
			if (matches) {
				return matches[1];
			} else {
				return data;
			}
		},
		method : 'get',
		queryParams : null,
		loader : function(param, success, error) {
			var opts = $(this).window('options');
			if (!opts.href) {
				return false;
			}
			$.ajax({
				type : opts.method,
				url : opts.href,
				cache : false,
				data : param,
				dataType : 'html',
				success : function(data) {
					success(data);
				},
				error : function() {
					error.apply(this, arguments);
				}
			});
		},
		footer : null,
		zIndex : 9000,
		draggable : false,
		resizable : false,
		modal : true,
		onBeforeLoad : function(queryParams) {
		},
		onLoad : function() {
		},
		onLoadError : function() {
		},
		onBeforeOpen : function() {
		},
		onOpen : function() {
		},
		onBeforeClose : function() {
		},
		onClose : function() {
		},
		onBeforeCollapse : function() {
		},
		onCollapse : function() {
		},
		onBeforeExpand : function() {
		},
		onExpand : function() {
		},
		onResize : function(width, height) {
		},
		onMove : function(left, top) {
		},
		onMaximize : function() {
		},
		onRestore : function() {
		},
		defaultTools : {
			maxTool : {
				text : '',
				css : "window-tool-max"
			},
			closeTool : {
				text : '',
				css : "window-tool-close"
			},
			collapseTool : {
				text : '',
				css : "window-tool-collapse"
			}
		}
	};
})(jQuery);
