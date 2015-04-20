/**
 * jQuery StreamlineUI v1.0
 * 依赖：slparser
 */
 (function($){
 	/**
 	 * 绑定事件
 	 */
 	function bindEvent(target){
 		var opts=$(target).data('sltooltip').options;
 		$(target).unbind('.sltooltip').bind(opts.showEvent+'.sltooltip',function(e){
 			$(target).sltooltip('show',e);
 		}).bind(opts.hideEvent+'.sltooltip',function(e){
 			$(target).sltooltip('hide',e);
 		}).bind('mousemove.sltooltip',function(e){
 			if(opts.trackMouse){
 				opts.trackMouseX=e.pageX;
 				opts.trackMouseY=e.pageY;
 				$(target).sltooltip('reposition');
 			}
 		});
 	};
 	/**
 	 * 清除延时timer
 	 */
 	function clearTimer(target){
 		var state=$(target).data('sltooltip');
 		if(state.showTimer){
 			clearTimeout(state.showTimer);
 			state.showTimer=null;
 		}
 		if(state.hideTimer){
 			clearTimeout(state.hideTimer);
 			state.hideTimer=null;
 		}
 	};
 	/**
 	 * 重置提示框位置
 	 */
 	function reposition(target){
 		var state=$(target).data('sltooltip');
 		if(!state||!state.tip){
 			return;
 		}
 		var opts=state.options;
 		var tip=state.tip;
 		var positionObj={left:-100000,top:-100000};
 		if($(target).is(':visible')){
 			positionObj=getPosition(opts.position);
 			if(opts.position=='top'&&positionObj.top<0){
 				positionObj=getPosition('bottom');
 			}else{
 				if((opts.position=='bottom')&&(positionObj.top+tip._outerHeight()>$(window)._outerHeight()+$(document).scrollTop())){
 					positionObj=getPosition('top');
 				}
 			}
 			if(positionObj.left<0){
 				if(opts.position=='left'){
 					positionObj=getPosition('right');
 				}else{
 					$(target).sltooltip('arrow').css('left',tip._outerWidth()/2+positionObj.left);
 					positionObj.left=0;
 				}
 			}else{
 				if(positionObj.left+tip._outerWidth()>$(window)._outerWidth()+$(document)._scrollLeft()){
 					if(opts.position=='right'){
 						positionObj=getPosition('left');
 					}else{
 						var left=positionObj.left;
 						positionObj.left=$(window)._outerWidth()+$(document)._scrollLeft()-tip._outerWidth();
 						$(target).sltooltip('arrow').css('left',tip._outerWidth()/2-(positionObj.left-left));
 					}
 				}
 			}
 		}
 		tip.css({left:positionObj.left,top:positionObj.top,zIndex:(opts.zIndex!=undefined?opts.zIndex:($.fn.window?$.fn.window.defaults.zIndex++:''))});
 		opts.onPosition.call(target,positionObj.left,positionObj.top);
 		function getPosition(strPosition){
 			opts.position=strPosition||'bottom';
 			tip.removeClass('sltooltip-top sltooltip-bottom sltooltip-left sltooltip-right').addClass('sltooltip-'+opts.position);
 			var left,top;
 			if(opts.trackMouse){
 				left=opts.trackMouseX+opts.deltaX;
 				top=opts.trackMouseY+opts.deltaY;
 			}else{
 				var t=$(target);
 				left=t.offset().left+opts.deltaX;
 				top=t.offset().top+opts.deltaY;
 			}
 			switch(opts.position){
 				case 'right':
	 				left+=t._outerWidth()+12+(opts.trackMouse?12:0);
	 				top-=(tip._outerHeight()-t._outerHeight())/2;
	 				break;
 				case 'left':
	 				left-=tip._outerWidth()+12+(opts.trackMouse?12:0);
	 				top-=(tip._outerHeight()-t._outerHeight())/2;
	 				break;
 				case 'top':
	 				left-=(tip._outerWidth()-t._outerWidth())/2;
	 				top-=tip._outerHeight()+12+(opts.trackMouse?12:0);
	 				break;
 				case 'bottom':
	 				left-=(tip._outerWidth()-t._outerWidth())/2;
	 				top+=t._outerHeight()+12+(opts.trackMouse?12:0);
	 				break;
 			}
 			return {left:left,top:top};
 		};
 	};
 	/**
 	 * 显示提示框
 	 */
 	function show(target,e){
 		var state=$(target).data('sltooltip');
 		var opts=state.options;
 		var tip=state.tip;
 		if(!tip){
 			tip=$('<div tabindex="-1" class="sltooltip">'+'<div class="sltooltip-content"></div>'+'<div class="sltooltip-arrow-outer"></div>'+'<div class="sltooltip-arrow"></div>'+'</div>').appendTo('body');
 			state.tip=tip;
 			update(target);
 		}
 		clearTimer(target);
 		state.showTimer=setTimeout(function(){
 			$(target).sltooltip('reposition');
 			tip.show();
 			opts.onShow.call(target,e);
 			var arrowOuter=tip.children('.sltooltip-arrow-outer');
 			var arrow=tip.children('.sltooltip-arrow');
 			var bc='border-'+opts.position+'-color';
 			arrowOuter.add(arrow).css({borderTopColor:'',borderBottomColor:'',borderLeftColor:'',borderRightColor:''});
 			arrowOuter.css(bc,tip.css(bc));
 			arrow.css(bc,tip.css('backgroundColor'));
 		},opts.showDelay);
 	};
 	/**
 	 * 隐藏提示框
 	 */
 	function hide(target,e){
 		var state=$(target).data('sltooltip');
 		if(state&&state.tip){
 			clearTimer(target);
 			state.hideTimer=setTimeout(function(){
 				state.tip.hide();
 				state.options.onHide.call(target,e);
 			},state.options.hideDelay);
 		}
 	};
 	/**
 	 * 更新提示框信息
 	 */
 	function update(target,content){
 		var state=$(target).data('sltooltip');
 		var opts=state.options;
 		if(content){
 			opts.content=content;
 		}
 		if(!state.tip){
 			return;
 		}
 		var cc=(typeof opts.content=='function'?opts.content.call(target):opts.content);
 		state.tip.children('.sltooltip-content').html(cc);
 		opts.onUpdate.call(target,cc);
 	};
 	/**
 	 * 销毁提示框
 	 */
 	function destroy(target){
 		var state=$(target).data('sltooltip');
 		if(state){
 			clearTimer(target);
 			var opts=state.options;
 			if(state.tip){
 				state.tip.remove();
 			}
 			if(opts._title){
 				$(target).attr('title',opts._title);
 			}
 			$(target).removeData('sltooltip');
 			$(target).unbind('.sltooltip').removeClass('sltooltip-f');
 			opts.onDestroy.call(target);
 		}
 	};
 	$.fn.sltooltip=function(options,param){
 		if(typeof options=='string'){
 			return $.fn.sltooltip.methods[options](this,param);
 		}
 		options=options||{};
 		return this.each(function(){
 			var state=$(this).data('sltooltip');
 			if(state){
 				$.extend(state.options,options);
 			}else{
 				$(this).data('sltooltip',{options:$.extend({},$.fn.sltooltip.defaults,$.fn.sltooltip.parseOptions(this),options)});
 				$(this).addClass('sltooltip-f');
 			}
 			bindEvent(this);
 			update(this);
 		});
 	};
 	$.fn.sltooltip.methods={
 		options:function(jq){
 			return $(jq[0]).data('sltooltip').options;
 		},
 		tip:function(jq){
 			return $(jq[0]).data('sltooltip').tip;
 		},
 		arrow:function(jq){
 			return jq.sltooltip("tip").children(".sltooltip-arrow-outer,.sltooltip-arrow");
	 	},
	 	show:function(jq,e){
	 		return jq.each(function(){
	 			show(this,e);
	 		});
	 	},
	 	hide:function(jq,e){
	 		return jq.each(function(){
	 			hide(this,e);
	 		});
	 	},
	 	update:function(jq,content){
	 		return jq.each(function(){
	 			update(this,content);
	 		});
	 	},
	 	reposition:function(jq){
	 		return jq.each(function(){
	 			reposition(this);
	 		});
	 	},
	 	destroy:function(jq){
	 		return jq.each(function(){
	 			destroy(this);
	 		});
 		}
	};
 	$.fn.sltooltip.parseOptions=function(target){
 		var t=$(target);
 		var opts=$.extend({},$.slparser.parseOptions(target,['position','showEvent','hideEvent','content',{trackMouse:'boolean',deltaX:'number',deltaY:'number',showDelay:'number',hideDelay:'number'}]));
 		opts._title=t.attr('title');
 		t.attr('title','');
 		if(!opts.content){
 			opts.content=opts._title;
 		}
 		return opts;
 	};
 	$.fn.sltooltip.defaults={
 		position:'bottom',
 		content:null,
 		trackMouse:false,
 		deltaX:0,
 		deltaY:0,
 		showEvent:'mouseenter',
 		hideEvent:'mouseleave',
 		showDelay:200,
 		hideDelay:100,
 		onShow:function(e){
	 	},
	 	onHide:function(e){
	 	},
	 	onUpdate:function(content){
	 	},
	 	onPosition:function(left,top){
	 	},
	 	onDestroy:function(){
	 	}
	};
 })(jQuery);

