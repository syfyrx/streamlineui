/**
 * jQuery StreamlineUI v1.0
 * 依赖：parser
 */
 (function($){
 	$(function(){
 		$(document).unbind('.combo').bind('mousedown.combo mousewheel.combo',function(e){
 			$('.combo').combo('hidePanel');
 		});
 	});
 	/**
 	 * 初始化控件
 	 */
 	function init(target){
 		var state=$(target).data('combo');
 		var opts=state.options;
 		$(target).addClass('combo').css({
 			width:opts.width,
 			height:opts.height
 		}).validate(opts);
 		if(!state.panel){
 			state.panel=$('<div class="combo-panel"></div>').insertAfter(target);
 			state.panel.css({
 				position:'absolute',
 				display:'none',
 				width:opts.panelWidth?opts.panelWidth:opts.width,
 				height:opts.panelHeight?opts.panelHeight:'auto'
 			});
 		}
 		if(opts.hasDownArrow){
 			state.downArrow=$('<span class="combo-arrow"><span>').insertAfter(target);
 			state.downArrow.css({
 				width:opts.height,
 				height:opts.height
 			}).click(function(){
 				$(target).combo('showPanel');
 			});
 		}
 	};
 	/**
 	 * 销毁组件
 	 */
 	function destroy(target){
 		var state=$(target).data('combo');
 		var opts=state.options;
 		var panel=state.panel;
 		var downArrow=state.downArrow;
 		panel.remove();
 		downArrow.remove();
 		$(target).remove();
 	};
 	/**
 	 * 改变组件大小
 	 */
 	function resize(target,params){
 		var state=$(target).data('combo');
 		var opts=state.options;
 		var panel=state.panel;
 		if(params.width)
 			opts.width=params.width;
 		if(params.height)
 			opts.height=params.height;
 		if(params.panelWidth)
 			opts.panelWidth=params.panelWidth;
 		if(params.panelHeight)
 			opts.panelHeight=params.panelHeight;
 		$(target).css({
 			width:opts.width,
 			height:opts.height
 		});
 		panel.css({
 			width:opts.width,
 			height:opts.height
 		});
 	}
 	/**
 	 * 启用或禁用组件
 	 */
 	function setDisable(target,param){
 		var state=$(target).data('combo');
 		var opts=state.options;
 		var downArrow=state.downArrow;
 		opts.disabled=param;
 		if(opts.disabled){
 			$(target).addClass('combo-disable').attr('disabled');
 			downArrow.addClass('combo-arrow-disable');
 		}else{
 			$(target).removeClass('combo-disable').removeAttr('disabled');
 			downArrow.removeClass('combo-arrow-disable');
 		}
 	}
 	/**
 	 * 启用或禁用只读
 	 */
 	function readonly(target,param){
 		var state=$(target).data('combo');
 		var opts=state.options;
 		var downArrow=state.downArrow;
 		opts.readonly=param;
 		if(opts.readonly){
 			$(target).addClass('combo-readonly').attr('readonly');
 			downArrow.addClass('combo-arrow-readonly');
 		}else{
 			$(target).removeClass('combo-readonly').removeAttr('readonly');
 			downArrow.removeClass('combo-arrow-readonly');
 		}
 	}
 	/**
 	 * 获取文本
 	 */
 	function getText(target){
 		return $(target).val();
 	}
 	/**
 	 * 显示面板
 	 */
 	function showPanel(target){
 		var state=$(target).data('combo');
 		var panel=state.panel;
 		var opts=$(target).combo('options');
 		panel.css({
 			left:getLeft(),
 			top:getTop()
 		});
 		panel.show();
 		function getLeft(){
 			var left=$(target).offset().left;
 			return left;
 		};
 		function getTop(){
 			var top=$(target).offset().top+$(target).outerHeight();
 			return top;
 		};
 	};
 	/**
 	 * 隐藏面板
 	 */
 	function hidePanel(target){
 		var state=$(target).data('combo');
 		state.panel.hide();
 	};
 	/**
 	 * 设置文本
 	 */
 	function setText(target,text){
 		$(target).val(text);
 	};
 	/**
 	 * 获取值
 	 */
 	function getValue(target){
 		var state=$(target).data('combo');
 		return state.value;
 	};
 	/**
 	 * 设置值
 	 */
 	function setValue(target,value){
 		var state=$(target).data('combo');
 		return state.value=value;
 	};
 	$.fn.combo=function(options,param){
 		if(typeof options=='string'){
 			var method = $.fn.combo.methods[options];
 			if (method){
				return method(this, param);
			} else {
				return this.validate(options, param);
			}
 		}
 		options=options||{};
 		return this.each(function(){
 			var state=$(this).data('combo');
 			if(state){
 				$.extend(state.options,options);
 			}else{
 				$(this).data('combo',{
 					options:$.extend({},$.fn.combo.defaults,$.fn.combo.parseOptions(this),options)
 				});
 			}
 			state=$(this).data('combo');
 			state.value='';
 			init(this);
 		});
 	};
 	$.fn.combo.methods={
 		options:function(jq){
 			return $(jq[0]).data('combo').options;
 		},
 		panel:function(jq){
 			return $(jq[0]).data('combo').panel;
 		},
 		destroy:function(jq){
 			return jq.each(function(){
 				destroy(this);
 			});
 		},
 		resize:function(jq,params){
 			return jq.each(function(){
 				resize(this,params);
 			});
 		},
 		showPanel:function(jq){
 			return jq.each(function(){
 				showPanel(this);
 			});
 		},
 		hidePanel:function(jq){
 			return jq.each(function(){
 				hidePanel(this);
 			});
 		},
 		disable:function(jq){
 			return jq.each(function(){
 				setDisable(this,true);
 			});
 		},
 		enable:function(jq){
			return jq.each(function(){
 				setDisable(this,false);
 			});
 		},
 		readonly:function(jq,param){
 			return jq.each(function(){
 				readonly(this,param);
 			});
 		},
 		clear:function(jq){
 			return jq.each(function(){
 				$(this).val('');
 				var state=$(this).data('combo');
 				state.value='';
 			});
 		},
 		reset:function(jq){
 			return jq.each(function(){
 				var state=$(this).data(this,'combo');
 				var opts=state.options;
 				state.value=opts.value;
 			});
 		},
 		getText:function(jq){
 			return getText(jq[0]);
 		},
 		setText:function(jq,text){
 			return jq.each(function(){
 				setText(this,text);
 			});
 		},
 		getValue:function(jq){
 			return getValue(jq[0]);
 		},
 		setValue:function(jq,value){
 			return jq.each(function(){
 				setValue(this,value);
 			});
 		}
 	};
 	$.fn.combo.parseOptions=function(target){
 		return $.extend({},$.fn.validate.parseOptions(target),$.parser.parseOptions(target,['separator',{panelWidth:'number',panelHeight:'number',hasDownArrow:'boolean',delay:'number',selectOnNavigation:'boolean',multiple:'boolean'}]),{deltaX:20});
 	};
 	$.fn.combo.defaults=$.extend({},$.fn.validate.defaults,{
 		inputEvents:{
 			click:comboClick,
 			keydown:_19,
 			paste:_19,
 			drop:_19
 		},
 		width:'auto',
 		height:22,
 		panelWidth:null,
 		panelHeight:200,
 		multiple:false,
 		selectOnNavigation:true,
 		separator:',',
 		editable:true,
 		disabled:false,
 		readonly:false,
 		hasDownArrow:true,
 		value:'',
 		delay:200,
 		keyHandler:{
 			up:function(e){
 			},
 			down:function(e){
 			},
 			left:function(e){
 			},
 			right:function(e){
 			},
 			enter:function(e){
 			},
 			query:function(q,e){
 			}
 		},
 		onShowPanel:function(){
 		},
 		onHidePanel:function(){
 		},
 		onChange:function(newValue,oldValue){
 		}
 	});
 })(jQuery);

