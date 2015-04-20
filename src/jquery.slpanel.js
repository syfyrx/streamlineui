/**
 * jQuery StreamlineUI v1.0
 * 依赖：slparser
 */
 (function($){
 	/**
 	 * 改变面板大小
 	 */
 	function resize(target,params){
 		var state=$(target).data('slpanel');
 		var opts=state.options;
 		var header=$(target).children('.slpanel-header');
 		var body=$(target).children('.slpanel-body');
 		var footer=$(target).children('.slpanel-footer');
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
 		var opts=$(target).data('slpanel').options;
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
 		$(target).addClass('slpanel');
 		var state=$(target).data('slpanel');
 		var opts=state.options;
 		setBody();
 		var body=$(target).slpanel('body');
 		setHeader();
 		var header=$(target).slpanel('header');
 		setFooter();
 		var footer=$(target).slpanel('footer');
 		if(opts.border){
 			header.removeClass('slpanel-header-noborder');
 			body.removeClass('slpanel-body-noborder');
 			footer.removeClass('slpanel-footer-noborder');
 		}else{
 			header.addClass('slpanel-header-noborder');
 			body.addClass('slpanel-body-noborder');
 			footer.addClass('slpanel-footer-noborder');
 		}
 		$(target).attr('id',opts.id||'');
 		if(opts.content){
 			body.empty();
 			body.html(opts.content);
 		}
 		$.slparser.parse(body);
 		body.outerHeight($(target).outerHeight()-header.outerHeight()-footer.outerHeight());
 		function setHeader(){
 			if(opts.noheader||opts.title==null){
 				$(target).children('.slpanel-header').remove();
 				body.addClass('slpanel-body-noheader');
 			}else{
 				var header=$(target).children('.slpanel-header');
 				header.addClass(opts.headerCls);
				if(header.length==0){
					header=$('<div class="slpanel-header"></div>').prependTo(target);
				}
				if(!$.isArray(opts.tools)){
					header.find('.slpanel-tool .slpanel-tool-a').appendTo(opts.tools);
				}
				header.empty();
				var title=$('<div class="slpanel-title"></div>').html(opts.title).appendTo(header);
				if(opts.iconCls){
					$('<div class="slpanel-icon"></div>').addClass(opts.iconCls).prependTo(header);
					title.addClass('slpanel-with-icon');
				}
				var tool=$('<div class="slpanel-tool"></div>').appendTo(header);
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
							$(this).addClass('slpanel-tool-a').appendTo(tool);
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
 			$('<div class="slpanel-body"></div>').appendTo(target).html(str).addClass(opts.bodyCls);
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
 				$(opts.footer).addClass('slpanel-footer').appendTo(target);
 				body.removeClass('slpanel-body-nofooter');
 			}else{
 				$(target).children('.slpanel-footer').remove();
 				body.addClass('slpanel-body-nofooter');
 			}
 		};
 	};
 	function load(target,queryParams){
 		var state=$(target).data('slpanel');
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
 			$(target).slpanel('clear');
 			if(opts.loadingMessage){
 				$(target).slpanel('body').html($('<div class="slpanel-loading"></div>').html(opts.loadingMessage));
 			}
 			opts.loader.call(target,queryParams,function(data){
 				var filterData=opts.extractor.call(target,data);
 				$(target).slpanel('body').html(filterData);
 				$.slparser.parse($(target).slpanel('body'));
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
 		$(target).children('.slpanel-body').empty();
 	};
 	/**
 	 * 展开slpanel
 	 */
 	function open(target,forceOpen){
 		var opts=$(target).data('slpanel').options;
 		if(forceOpen!=true){
 			if(opts.onBeforeOpen.call(target)==false){
 				return;
 			}
 		}
 		$(target).show();
 		opts.closed=false;
 		if($(target).children('.slpanel-header').find('a.slpanel-tool-restore').length){
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
 		var opts=$(target).data('slpanel').options;
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
 		var opts=$(target).data('slpanel').options;
 		if(opts.collapsed==true){
 			return;
 		}
 		var slpanel=$(target).data('slpanel').slpanel;
 		var body=$(target).children('.slpanel-body');
 		var toolCollapse=$(target).children('.slpanel-header').find('a.slpanel-tool-collapse');
 		body.stop(true,true);
 		if(opts.onBeforeCollapse.call(target)==false){
 			return;
 		}
 		toolCollapse.addClass('slpanel-tool-expand');
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
 		var opts=$(target).data('slpanel').options;
 		var body=$(target).children('.slpanel-body');
 		var toolCollapse=$(target).children('.slpanel-header').find('a.slpanel-tool-collapse');
 		if(opts.collapsed==false){
 			return;
 		}
 		body.stop(true,true);
 		if(opts.onBeforeExpand.call(target)==false){
 			return;
 		}
 		toolCollapse.removeClass('slpanel-tool-expand');
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
 		var opts=$(target).data('slpanel').options;
 		if(opts.maximized==true){
 			return;
 		}
 		var toolMax=$(target).children('.slpanel-header').find('a.slpanel-tool-max');
 		toolMax.addClass('slpanel-tool-restore');
 		if(!$(target).data('slpanel').original){
 			$(target).data('slpanel').original={
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
 		var opts=$(target).data('slpanel').options;
 		if(opts.maximized==false){
 			return;
 		}
 		var toolMax=$(target).children('.slpanel-header').find('a.slpanel-tool-max');
 		toolMax.removeClass('slpanel-tool-restore');
 		var original=$(target).data('slpanel').original;
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
 		$(target).data('slpanel').original=null;
 		opts.onRestore.call(target);
 	};
 	/**
 	 * 设置标题文本
 	 */
 	function setTitle(target,title){
 		$(target).data('slpanel').options.title=title;
 		$(target).slpanel('header').find('div.slpanel-title').html(title);
 	};
 	$.fn.slpanel=function(options,param){
 		if(typeof options=='string'){
 			return $.fn.slpanel.methods[options](this,param);
 		}
 		options=options||{};
 		return this.each(function(){
 			var state=$(this).data('slpanel');
 			if(state){
 				$.extend(state.options,options);
 				state.isLoaded=false;
 			}else{
 				$(this).data('slpanel',{
 					options:$.extend({},$.fn.slpanel.defaults,$.fn.slpanel.parseOptions(this),options),
 					isLoaded:false
 				});
 				state=$(this).data('slpanel');
 			}
 			init(this);
 			if(state.options.closed==true){
 				$(this).hide();
 			}
 		});
 	};
 	$.fn.slpanel.methods={
 		options:function(jq){
 			return $(jq[0]).data('slpanel').options;
	 	},
	 	header:function(jq){
	 		return $(jq[0]).children('.slpanel-header');
	 	},
	 	footer:function(jq){
	 		return $(jq[0]).children('.slpanel-footer');
	 	},
	 	body:function(jq){
	 		return $(jq[0]).children('.slpanel-body');
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
	 			var state=$(this).data('slpanel');
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
 	$.fn.slpanel.parseOptions=function(target){
 		var t=$(target);
 		var ff=t.children('.slpanel-footer,footer');
 		return $.extend({},$.slparser.parseOptions(target,['id','title','iconCls','width','height','left','top','headerCls','bodyCls','tools','href','method','content','footer',{cache:'boolean',fit:'boolean',border:'boolean',noheader:'boolean'},{collapsible:'boolean',maximizable:'boolean'},{closable:'boolean',collapsed:'boolean',maximized:'boolean',closed:'boolean'},'openAnimation','closeAnimation',{openDuration:'number',closeDuration:'number'},]),{loadingMessage:(t.attr('loadingMessage')!=undefined?t.attr('loadingMessage'):undefined),footer:(ff.length?ff.removeClass('slpanel-footer'):undefined)});
 	};
 	$.fn.slpanel.defaults={
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
 			var opts=$(this).slpanel('options');
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
	 			css: "slpanel-tool-max"
	 		}, closeTool: {
	 			text:'',
	 			css: "slpanel-tool-close"
	 		}, collapseTool: {
	 			text:'',
	 			css: "pslpanel-tool-collapse"
	 		}
	 	}
 	};
 })(jQuery);

