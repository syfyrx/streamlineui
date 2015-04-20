/**
 * jQuery StreamlineUI v1.0 依赖：slparser、sldraggable、slresizable
 */
(function($) {
	// 创建窗口
	function create(target) {
		var state = $(target).data('slwindow');
		var opts = state.options;
		$(target).addClass('slwindow');
		var body = setBody();
		var header = setHeader();
		var footer = setFooter();
		if (opts.content) {
			body.empty();
			body.html(opts.content);
		}
		$(target).css({
			width : opts.width,
			height : opts.height,
			zIndex : opts.zIndex
		});
		body.css({
			width : opts.width,
			height : opts.height - header.outerHeight() - (footer ? footer.outerHeight() : 0)
		});
		$.slparser.parse(body);
		if (opts.modal) {
			// 创建遮罩层
			var mask = $('<div class="slui-mask"></div>');
			mask.css({
				width : getPageArea().width,
				height : getPageArea().height,
				display : 'none'
			});
			mask.appendTo(document.body);
			state.mask = mask;
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
		// 设置窗口标题栏
		function setHeader() {
			var header = $(target).children('.slwindow-header');
			if (header.length == 0) {
				header = $('<div class="slwindow-header"></div>').prependTo(target);
			}
			header.addClass(opts.headerCls);
			if (!$.isArray(opts.tools)) {
				header.find('.slwindow-tool .slwindow-tool-a').appendTo(opts.tools);
			}
			header.empty();
			var title = $('<div class="slwindow-title"></div>').html(opts.title).appendTo(header);
			if (opts.iconCls) {
				$('<div class="slwindow-icon"></div>').addClass(opts.iconCls).prependTo(header);
				title.addClass('slwindow-with-icon');
			}
			var tool = $('<div class="slwindow-tool"></div>').appendTo(header);
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
						$(this).addClass('slwindow-tool-a').appendTo(tool);
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
		// 设置窗口主体
		function setBody() {
			var body = $(target).children('.slwindow-body');
			if (body.length == 0) {
				var str = $(target).html();
				$(target).empty();
				body = $('<div class="slwindow-body"></div>').appendTo(target).html(str).addClass(opts.bodyCls);
			}
			return body;
		}
		// 添加工具栏按钮
		function addTool(tool, text, css, handler) {
			var a = $('<a href="javascript:void(0)">' + text + '</a>').addClass(css).appendTo(tool);
			a.bind('click', handler);
		}
		// 设置面板底部
		function setFooter() {
			var footer = $(target).children('.slwindow-footer');
			footer.remove();
			if (opts.footer) {
				footer = $(opts.footer).addClass('slwindow-footer').appendTo(target);
				body.removeClass('slwindow-body-nofooter');
			} else {
				body.addClass('slwindow-body-nofooter');
				footer = null;
			}
			return footer;
		}
	}
	// 设置窗口拖动和改变大小属性
	function setProperties(target) {
		var state = $(target).data('slwindow');
		if ($.fn.sldraggable) {
			$(target).sldraggable({
				handle : '.slwindow-header .slwindow-title',
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
		}
		if ($.fn.slresizable) {
			$(target).slresizable({
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
	}
	// 销毁组件
	function destroy(target) {
		var state = $(target).data('slwindow');
		$('.slui-combobox', target).slcombobox('destroy');
		state.mask.remove();
		$(target).remove();
	}
	// 清除组件内容
	function clear(target) {
		var state = $(target).data('slwindow');
		$('.slui-combobox', target).slcombobox('destroy');
		$(target).children('.slwindow-body').empty();
	}
	// 设置标题文本
	function setTitle(target, title) {
		$(target).data('slwindow').options.title = title;
		$(target).find('.slwindow-header .slwindow-title').html(title);
	}
	// 打开窗口
	function open(target, forceOpen) {
		var state = $(target).data('slwindow');
		var opts = state.options;
		if (forceOpen != true) {
			if (opts.onBeforeOpen.call(target) == false) {
				return;
			}
		}
		opts.closed = false;
		$(target).show();
		if ($(target).children('.slwindow-header').find('a.slwindow-tool-restore').length) {
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
		if (!opts.collapsed && !state.isLoaded) {
			load(target);
		}
	}
	// 关闭窗口
	function close(target, forceClose) {
		var state = $(target).data('slwindow');
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
	// 改变窗口大小
	function resize(target, params) {
		var state = $(target).data('slwindow');
		var opts = state.options;
		var header = $(target).children('.slwindow-header');
		var body = $(target).children('.slwindow-body');
		var footer = $(target).children('.slwindow-footer');
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
			width : opts.width,
			height : $(target).outerHeight() - header.outerHeight() - footer.outerHeight()
		});
		opts.onResize.apply(target, [ opts.width, opts.height ]);
	}
	// 移动窗口
	function move(target, params) {
		var opts = $(target).data('slwindow').options;
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
	// 最大化窗口
	function maximize(target) {
		var opts = $(target).data('slwindow').options;
		if (opts.maximized == true) {
			return;
		}
		var toolMax = $(target).children('.slwindow-header').find('a.slwindow-tool-max');
		toolMax.addClass('slwindow-tool-restore');
		if (!$(target).data('slwindow').original) {
			$(target).data('slwindow').original = {
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
	// 恢复窗口
	function restore(target) {
		var opts = $(target).data('slwindow').options;
		if (opts.maximized == false) {
			return;
		}
		var toolMax = $(target).children('.slwindow-header').find('a.slwindow-tool-max');
		toolMax.removeClass('slwindow-tool-restore');
		var original = $(target).data('slwindow').original;
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
		$(target).data('slwindow').original = null;
		opts.onRestore.call(target);
	}
	// 折叠窗口
	function collapse(target) {
		var opts = $(target).data('slwindow').options;
		if (opts.collapsed == true) {
			return;
		}
		var body = $(target).children('.slwindow-body');
		body.stop(true, true);
		if (opts.onBeforeCollapse.call(target) == false) {
			return;
		}
		body.slideUp('normal', function() {
			$(target).children('.slwindow-header').find('a.slwindow-tool-collapse').addClass('slwindow-tool-expand');
			opts.collapsed = true;
			opts.onCollapse.call(target);
		});
	}
	// 展开窗口
	function expand(target) {
		var opts = $(target).data('slwindow').options;
		var body = $(target).children('.slwindow-body');
		if (opts.collapsed == false) {
			return;
		}
		body.stop(true, true);
		if (opts.onBeforeExpand.call(target) == false) {
			return;
		}
		body.slideDown('normal', function() {
			$(target).children('.slwindow-header').find('a.slwindow-tool-collapse').removeClass('slwindow-tool-expand');
			opts.collapsed = false;
			opts.onExpand.call(target);
			load(target);
		});
	}
	function load(target, queryParams) {
		var state = $(target).data('slwindow');
		var opts = state.options;
		var body = $(target).children('.slwindow-body');
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
			clear(target);
			if (opts.loadingMessage) {
				body.html($('<div class="slwindow-loading"></div>').html(opts.loadingMessage));
			}
			opts.loader.call(target, queryParams, function(data) {
				var filterData = opts.extractor.call(target, data);
				body.html(filterData);
				$.slparser.parse(body);
				opts.onLoad.apply(target, arguments);
				state.isLoaded = true;
			}, function() {
				opts.onLoadError.apply(target, arguments);
			});
		}
	}
	// 水平居中
	function hcenter(target) {
		var opts = $(target).data('slwindow').options;
		var parent = $(target).parent();
		opts.left = Math.ceil((getPageArea().width - $(target).outerWidth()) / 2 + parent.scrollLeft());
		move(target, {
			left : opts.left
		});
	}
	// 垂直居中
	function vcenter(target) {
		var opts = $(target).data('slwindow').options;
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

	// 标签上绑定的数据包括：
	// options：属性
	// isLoaded：是否加载结束
	// original：窗口最大化前的尺寸
	$.fn.slwindow = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.slwindow.methods[options](this, param);
		}
		options = options || {};
		return this.each(function() {
			var state = $(this).data('slwindow');
			if (state) {
				$.extend(state.options, options);
			} else {
				$(this).data('slwindow', {
					options : $.extend({}, $.fn.slwindow.defaults, $.fn.slwindow.parseOptions(this), options),
					isLoaded : false,
					original : null
				});
				state = $(this).data('slwindow');
			}
			create(this);
			setProperties(this);
		});
	};

	$.fn.slwindow.methods = {
		options : function(jq) {
			return $(jq[0]).data('slwindow').options;
		},
		header : function(jq) {
			return $(jq[0]).children('.slwindow-header');
		},
		footer : function(jq) {
			return $(jq[0]).children('.slwindow-footer');
		},
		body : function(jq) {
			return $(jq[0]).children('.slwindow-body');
		},
		destroy : function(jq) {
			return jq.each(function() {
				destroy(this);
			});
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
				clear(this);
			});
		},
		refresh : function(jq, param) {
			return jq.each(function() {
				var state = $(this).data('slwindow');
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

	$.fn.slwindow.parseOptions = function(target) {
		return $.extend({}, $.slparser.parseOptions(target));
	};

	$.fn.slwindow.defaults = {
		title : 'New window',
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
			var opts = $(this).slwindow('options');
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
				css : "slwindow-tool-max"
			},
			closeTool : {
				text : '',
				css : "slwindow-tool-close"
			},
			collapseTool : {
				text : '',
				css : "slwindow-tool-collapse"
			}
		}
	};
})(jQuery);
