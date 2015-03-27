/**
 * jQuery StreamlineUI v1.0
 * 依赖：parser
 */
 (function($){
 	/**
 	 * 改变面板大小
 	 */
 	function resize(target,params){
 		var state=$(target).data('panel');
 		var opts=state.options;
 		var header=$(target).children('.panel-header');
 		var body=$(target).children('.panel-body');
 		var footer=$(target).children('.panel-footer');
 		if(params){
 			if(params.width){
 				opts.width=params.width;
 			}
 			if(params.height){
 				opts.height=params.height;
 			}
 		}
 		$(target).css({width:opts.width,height:opts.height});
 		body.outerHeight($(target).outerHeight()-header.outerHeight()-footer.outerHeight());
 		opts.onResize.apply(target,[opts.width,opts.height]);
 	};
 	function move(target,params){
 		var opts=$(target).data('panel').options;
 		if(params){
 			if(params.left){
 				opts.left=params.left;
 			}
 			if(params.top){
 				opts.top=params.top;
 			}
 		}
 		$(target).css({left:opts.left,top:opts.top});
 		opts.onMove.apply(target,[opts.left,opts.top]);
 	};
 	function init(target){
 		$(target).addClass('panel');
 		var state=$(target).data('panel');
 		var opts=state.options;
 		setBody();
 		var body=$(target).panel('body');
 		setHeader();
 		var header=$(target).panel('header');
 		setFooter();
 		var footer=$(target).panel('footer');
 		if(opts.border){
 			header.removeClass('panel-header-noborder');
 			body.removeClass('panel-body-noborder');
 			footer.removeClass('panel-footer-noborder');
 		}else{
 			header.addClass('panel-header-noborder');
 			body.addClass('panel-body-noborder');
 			footer.addClass('panel-footer-noborder');
 		}
 		$(target).attr('id',opts.id||'');
 		if(opts.content){
 			body.empty();
 			body.html(opts.content);
 		}
 		$.parser.parse(body);
 		body.outerHeight($(target).outerHeight()-header.outerHeight()-footer.outerHeight());
 		function setHeader(){
 			if(opts.noheader||opts.title==null){
 				$(target).children('.panel-header').remove();
 				body.addClass('panel-body-noheader');
 			}else{
 				var header=$(target).children('.panel-header');
 				header.addClass(opts.headerCls);
				if(header.length==0){
					header=$('<div class="panel-header"></div>').prependTo(target);
				}
				if(!$.isArray(opts.tools)){
					header.find('.panel-tool .panel-tool-a').appendTo(opts.tools);
				}
				header.empty();
				var title=$('<div class="panel-title"></div>').html(opts.title).appendTo(header);
				if(opts.iconCls){
					$('<div class="panel-icon"></div>').addClass(opts.iconCls).prependTo(header);
					title.addClass('panel-with-icon');
				}
				var tool=$('<div class="panel-tool"></div>').appendTo(header);
				tool.bind('click',function(e){
					e.stopPropagation();//阻止事件冒泡
				});
				if(opts.tools){
					if($.isArray(opts.tools)){
						$.map(opts.tools,function(t){
							addTool(tool,t.text,t.css,t.handler);
						});
					}else{
						$(opts.tools).children().each(function(){
							$(this).addClass('panel-tool-a').appendTo(tool);
						});
					}
				}
				if(opts.collapsible){
					addTool(tool,opts.defaultTools.collapseTool.text,opts.defaultTools.collapseTool.css,function(){
						if(opts.collapsed==true){
							expand(target,true);
						}else{
							collapse(target,true);
						}
		 			});
				}
				if(opts.maximizable){
					addTool(tool,opts.defaultTools.maxTool.text,opts.defaultTools.maxTool.css,function () {
		 				if(opts.maximized==true){
							restore(target);
						}else{
							maximize(target);
						}
	 				});
				}
				if(opts.closable){
					addTool(tool,opts.defaultTools.closeTool.text,opts.defaultTools.closeTool.css,function(){
						close(target);
					});
				}
 			}
 		};
 		/**
 		 * 设置面板主体
 		 */
 		function setBody(){
 			var str=$(target).html();
 			$(target).empty();
 			$('<div class="panel-body"></div>').appendTo(target).html(str).addClass(opts.bodyCls);
 		}
 		/**
 		 * 添加工具栏按钮
 		 */
 		function addTool(tool,text,css,handler){
 			var a=$('<a href="javascript:void(0)">'+text+'</a>').addClass(css).appendTo(tool);
 			a.bind('click',handler);
 		};
 		/**
 		 * 设置面板底部
 		 */
 		function setFooter(){
 			if(opts.footer){
 				$(opts.footer).addClass('panel-footer').appendTo(target);
 				body.removeClass('panel-body-nofooter');
 			}else{
 				$(target).children('.panel-footer').remove();
 				body.addClass('panel-body-nofooter');
 			}
 		};
 	};
 	function load(target,queryParams){
 		var state=$(target).data('panel');
 		var opts=state.options;
 		if(!opts.href){
 			return;
 		}
 		if(queryParams){
 			opts.queryParams=queryParams;
 		}
 		if(!state.isLoaded||!opts.cache){
 			var queryParams=$.extend({},opts.queryParams);
 			if(opts.onBeforeLoad.call(target,queryParams)==false){
 				return;
 			}
 			state.isLoaded=false;
 			$(target).panel('clear');
 			if(opts.loadingMessage){
 				$(target).panel('body').html($('<div class="panel-loading"></div>').html(opts.loadingMessage));
 			}
 			opts.loader.call(target,queryParams,function(data){
 				var filterData=opts.extractor.call(target,data);
 				$(target).panel('body').html(filterData);
 				$.parser.parse($(target).panel('body'));
 				opts.onLoad.apply(target,arguments);
 				state.isLoaded=true;
 			},function(){
 				opts.onLoadError.apply(target,arguments);
 			});
 		}
 	};
 	/**
 	 * 清除面板内容
 	 */
 	function clear(target){
 		$(target).children('.panel-body').empty();
 	};
 	/**
 	 * 展开panel
 	 */
 	function open(target,forceOpen){
 		var opts=$(target).data('panel').options;
 		if(forceOpen!=true){
 			if(opts.onBeforeOpen.call(target)==false){
 				return;
 			}
 		}
 		$(target).show();
 		opts.closed=false;
 		if($(target).children('.panel-header').find('a.panel-tool-restore').length){
 			opts.maximized=true;
 		}
 		opts.onOpen.call(target);
 		if(opts.maximized){
 			opts.maximized=false;
 			maximize(target);
 		}
 		if(opts.collapsed==true){
 			opts.collapsed=false;
 			collapse(target);
 		}
 		if(!opts.collapsed){
 			load(target);
 		}
 	};
 	/**
 	 * 关闭面板
 	 */
 	function close(target,forceClose){
 		var opts=$(target).data('panel').options;
 		if(forceClose!=true){
 			if(opts.onBeforeClose.call(target)==false){
 				return;
 			}
 		}
 		$(target).hide();
 		opts.closed=true;
 		opts.onClose.call(target);
 	};
 	/**
 	 * 折叠面板
 	 */
 	function collapse(target,animate){
 		var opts=$(target).data('panel').options;
 		if(opts.collapsed==true){
 			return;
 		}
 		var panel=$(target).data('panel').panel;
 		var body=$(target).children('.panel-body');
 		var toolCollapse=$(target).children('.panel-header').find('a.panel-tool-collapse');
 		body.stop(true,true);
 		if(opts.onBeforeCollapse.call(target)==false){
 			return;
 		}
 		toolCollapse.addClass('panel-tool-expand');
 		if(animate==true){
 			body.slideUp('normal',function(){
 				opts.collapsed=true;
 				opts.onCollapse.call(target);
 			});
 		}else{
 			body.hide();
 			opts.collapsed=true;
 			opts.onCollapse.call(target);
 		}
 	};
 	/**
 	 * 展开面板
 	 */
 	function expand(target,animate){
 		var opts=$(target).data('panel').options;
 		var body=$(target).children('.panel-body');
 		var toolCollapse=$(target).children('.panel-header').find('a.panel-tool-collapse');
 		if(opts.collapsed==false){
 			return;
 		}
 		body.stop(true,true);
 		if(opts.onBeforeExpand.call(target)==false){
 			return;
 		}
 		toolCollapse.removeClass('panel-tool-expand');
 		if(animate==true){
 			body.slideDown('normal',function(){
 				opts.collapsed=false;
 				opts.onExpand.call(target);
 				load(target);
 			});
 		}else{
 			body.show();
 			opts.collapsed=false;
 			opts.onExpand.call(target);
 			load(target);
 		}
 	};
 	/**
 	 * 最大化面板
 	 */
 	function maximize(target){
 		var opts=$(target).data('panel').options;
 		if(opts.maximized==true){
 			return;
 		}
 		var toolMax=$(target).children('.panel-header').find('a.panel-tool-max');
 		toolMax.addClass('panel-tool-restore');
 		if(!$(target).data('panel').original){
 			$(target).data('panel').original={
 				width:opts.width,
 				height:opts.height,
 				left:opts.left,
 				top:opts.top,
 				fit:opts.fit
 			};
 		}
 		opts.left=0;
 		opts.top=0;
 		opts.fit=true;
 		if(opts.fit){
 			params={
 				width:$(target).parent().innerWidth(),
 				height:$(target).parent().innerHeight()
 			};
 		}
 		resize(target,params);
 		opts.maximized=true;
 		opts.onMaximize.call(target);
 	};
 	/**
 	 * 恢复面板
 	 */
 	function restore(target){
 		var opts=$(target).data('panel').options;
 		if(opts.maximized==false){
 			return;
 		}
 		var toolMax=$(target).children('.panel-header').find('a.panel-tool-max');
 		toolMax.removeClass('panel-tool-restore');
 		var original=$(target).data('panel').original;
 		opts.fit=false;
 		resize(target,{
 			width:original.width,
 			height:original.height
 		});
 		move(target,{
 			left:original.left,
 			top:original.top
 		});
 		opts.maximized=false;
 		$(target).data('panel').original=null;
 		opts.onRestore.call(target);
 	};
 	/**
 	 * 设置标题文本
 	 */
 	function setTitle(target,title){
 		$(target).data('panel').options.title=title;
 		$(target).panel('header').find('div.panel-title').html(title);
 	};
 	$.fn.panel=function(options,param){
 		if(typeof options=='string'){
 			return $.fn.panel.methods[options](this,param);
 		}
 		options=options||{};
 		return this.each(function(){
 			var state=$(this).data('panel');
 			if(state){
 				$.extend(state.options,options);
 				state.isLoaded=false;
 			}else{
 				$(this).data('panel',{
 					options:$.extend({},$.fn.panel.defaults,$.fn.panel.parseOptions(this),options),
 					isLoaded:false
 				});
 				state=$(this).data('panel');
 			}
 			init(this);
 			if(state.options.closed==true){
 				$(this).hide();
 			}
 		});
 	};
 	$.fn.panel.methods={
 		options:function(jq){
 			return $(jq[0]).data('panel').options;
	 	},
	 	header:function(jq){
	 		return $(jq[0]).children('.panel-header');
	 	},
	 	footer:function(jq){
	 		return $(jq[0]).children('.panel-footer');
	 	},
	 	body:function(jq){
	 		return $(jq[0]).children('.panel-body');
	 	},
	 	setTitle:function(jq,title){
	 		return jq.each(function(){
	 			setTitle(this,title);
	 		});
	 	},
	 	open:function(jq,forceOpen){
	 		return jq.each(function(){
	 			open(this,forceOpen);
	 		});
	 	},
	 	close:function(jq,forceClose){
	 		return jq.each(function(){
	 			close(this,forceClose);
	 		});
	 	},
	 	clear:function(jq){
	 		return jq.each(function(){
	 			clear(this);
	 		});
	 	},
	 	refresh:function(jq,param){
	 		return jq.each(function(){
	 			var state=$(this).data('panel');
	 			state.isLoaded=false;
	 			if(param){
	 				if(typeof param=='string'){
	 					state.options.href=param;
	 				}else{
	 					state.options.queryParams=param;
	 				}
	 			}
	 			load(this);
	 		});
	 	},
	 	resize:function(jq,params){
	 		return jq.each(function(){
	 			resize(this,params);
	 		});
	 	},
	 	move:function(jq,params){
	 		return jq.each(function(){
	 			move(this,params);
	 		});
	 	},
	 	maximize:function(jq){
	 		return jq.each(function(){
	 			maximize(this);
	 		});
	 	},
	 	restore:function(jq){
	 		return jq.each(function(){
	 			restore(this);
	 		});
	 	},
	 	collapse:function(jq,animate){
	 		return jq.each(function(){
	 			collapse(this,animate);
	 		});
	 	},
	 	expand:function(jq,animate){
	 		return jq.each(function(){
	 			expand(this,animate);
	 		});
 		}
 	};
 	$.fn.panel.parseOptions=function(target){
 		var t=$(target);
 		var ff=t.children('.panel-footer,footer');
 		return $.extend({},$.parser.parseOptions(target,['id','title','iconCls','width','height','left','top','headerCls','bodyCls','tools','href','method','content','footer',{cache:'boolean',fit:'boolean',border:'boolean',noheader:'boolean'},{collapsible:'boolean',maximizable:'boolean'},{closable:'boolean',collapsed:'boolean',maximized:'boolean',closed:'boolean'},'openAnimation','closeAnimation',{openDuration:'number',closeDuration:'number'},]),{loadingMessage:(t.attr('loadingMessage')!=undefined?t.attr('loadingMessage'):undefined),footer:(ff.length?ff.removeClass('panel-footer'):undefined)});
 	};
 	$.fn.panel.defaults={
 		id:null,
 		title:null,
 		iconCls:null,
 		width:'auto',
 		height:'auto',
 		left:null,
 		top:null,
 		headerCls:'',
 		bodyCls:'',
 		fit:false,
 		border:true,
 		noheader:false,
 		content:null,
 		collapsible:false,
 		maximizable:false,
 		closable:false,
 		tools:null,
 		collapsed:false,
 		maximized:false,
 		closed:false,
 		href:null,
 		cache:true,
 		loadingMessage:'Loading...',
 		extractor:function(data){
 			var pattern=/<body[^>]*>((.|[\n\r])*)<\/body>/im;
 			var matches=pattern.exec(data);
 			if(matches){
 				return matches[1];
 			}else{
 				return data;
 			}
 		},
 		method:'get',
 		queryParams:{},
 		loader:function(param,success,error){
 			var opts=$(this).panel('options');
 			if(!opts.href){
 				return false;
 			}
 			$.ajax({
 				type:opts.method,
 				url:opts.href,
 				cache:false,
 				data:param,
 				dataType:'html',
 				success:function(data){
 					success(data);
 				},error:function(){
 					error.apply(this,arguments);
 				}
 			});
 		},
 		openAnimation:false,
 		openDuration:400,
 		closeAnimation:false,
 		closeDuration:400,
 		footer:null,
 		onBeforeLoad:function(queryParams){
 		},onLoad:function(){
 		},onLoadError:function(){
 		},onBeforeOpen:function(){
 		},onOpen:function(){
 		},onBeforeClose:function(){
 		},onClose:function(){
 		},onBeforeCollapse:function(){
 		},onCollapse:function(){
 		},onBeforeExpand:function(){
 		},onExpand:function(){
 		},onResize:function(width,height){
 		},onMove:function(left,top){
 		},onMaximize:function(){
 		},onRestore:function(){
 		},
 		defaultTools: {
	 		maxTool: {
	 			text:'',
	 			css: "panel-tool-max"
	 		}, closeTool: {
	 			text:'',
	 			css: "panel-tool-close"
	 		}, collapseTool: {
	 			text:'',
	 			css: "ppanel-tool-collapse"
	 		}
	 	}
 	};
 })(jQuery);

