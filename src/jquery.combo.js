/**
 * jQuery StreamlineUI v1.0
 * 依赖：parser
 */
 (function($){
 	$(function(){
 		$(document).unbind('.combo').bind('mousedown.combo mousewheel.combo',function(e){
 			var p=$(e.target).closest('span.combo,div.combo-p,div.menu');
 			if(p.length){
 				_1(p);
 				return;
 			}
 			$('body>div.combo-p>div.combo-panel:visible').panel('close');
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
 		}).validate();
 		if(!state.panel){
 			state.panel=$('<div class="combo-panel"></div>').insertAfter(target);
 			state.panel.css({
 				width:opts.panelWidth?opts.panelWidth:'auto',
 				height:opts.panelHeight?opts.panelHeight:'auto'
 			});
 		}
 		if(opts.hasDownArrow){
 			state.downArrow=$('<span class="combo-arrow"><span>').insertAfter(target);
 			state.downArrow.css({
 				height:opts.height
 			}).click(function(){
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
 	function getText(target){
 		
 	}
 	function _f(_10){
 		var _11=$.data(_10,'combo').panel;
 		if(_11.is(':visible')){
 			hidePanel(_10);
 		}else{
 			var p=$(_10).closest('div.combo-panel');
 			$('div.combo-panel:visible').not(_11).not(p).panel('close');
 			$(_10).combo('showPanel');
 		}
 		$(_10).combo('textbox').focus();
 	};
 	function _1(_13){
 		$(_13).find('.combo-f').each(function(){
 			var p=$(this).combo('panel');
 			if(p.is(':visible')){
 				p.panel('close');
 			}
 		});
 	};
 	function _14(e){
 		var _15=e.data.target;
 		var _16=$.data(_15,'combo');
 		var _17=_16.options;
 		var _18=_16.panel;
 		if(!_17.editable){
 			_f(_15);
 		}else{
 			var p=$(_15).closest('div.combo-panel');
 			$('div.combo-panel:visible').not(_18).not(p).panel('close');
 		}
 	};
 	function _19(e){
 		var _1a=e.data.target;
 		var t=$(_1a);
 		var _1b=t.data('combo');
 		var _1c=t.combo('options');
 		switch(e.keyCode){
 			case 38:
 			_1c.keyHandler.up.call(_1a,e);
 			break;
 			case 40:
 			_1c.keyHandler.down.call(_1a,e);
 			break;
 			case 37:
 			_1c.keyHandler.left.call(_1a,e);
 			break;
 			case 39:
 			_1c.keyHandler.right.call(_1a,e);
 			break;
 			case 13:
 			e.preventDefault();
 			_1c.keyHandler.enter.call(_1a,e);
 			return false;
 			case 9:
 			case 27:
 			hidePanel(_1a);
 			break;
 			default:
 			if(_1c.editable){
 				if(_1b.timer){
 					clearTimeout(_1b.timer);
 				}
 				_1b.timer=setTimeout(function(){
 					var q=t.combo('getText');
 					if(_1b.previousText!=q){
 						_1b.previousText=q;
 						t.combo('showPanel');
 						_1c.keyHandler.query.call(_1a,q,e);
 						t.combo('validate');
 					}
 				},_1c.delay);
 			}
 		}
 	};
 	/**
 	 * 显示面板
 	 */
 	function showPanel(target){
 		var state=$(target).data('combo');
 		var panel=state.panel;
 		var opts=$(target).combo('options');
 		if(_23.closed){
 			panel.panel('panel').show().css({zIndex:($.fn.menu?$.fn.menu.defaults.zIndex++:$.fn.window.defaults.zIndex++),left:-999999});
 			panel.panel('resize',{width:(opts.panelWidth?opts.panelWidth:_20._outerWidth()),height:opts.panelHeight});
 			panel.panel('panel').hide();
 			panel.panel('open');
 		}
 		(function(){
 			if(panel.is(':visible')){
 				panel.panel('move',{left:_24(),top:_25()});
 				setTimeout(arguments.callee,200);
 			}
 		})();
 		function _24(){
 			var _26=_20.offset().left;
 			if(opts.panelAlign=='right'){
 				_26+=_20._outerWidth()-panel._outerWidth();
 			}
 			if(_26+panel._outerWidth()>$(window)._outerWidth()+$(document).scrollLeft()){
 				_26=$(window)._outerWidth()+$(document).scrollLeft()-panel._outerWidth();
 			}
 			if(_26<0){
 				_26=0;
 			}
 			return _26;
 		};
 		function _25(){
 			var top=_20.offset().top+_20._outerHeight();
 			if(top+panel._outerHeight()>$(window)._outerHeight()+$(document).scrollTop()){
 				top=_20.offset().top-panel._outerHeight();
 			}
 			if(top<$(document).scrollTop()){
 				top=_20.offset().top+_20._outerHeight();
 			}
 			return top;
 		};
 	};
 	function hidePanel(_27){
 		var _28=$.data(_27,'combo').panel;
 		_28.panel('close');
 	};
 	function _29(_2a,_2b){
 		var _2c=$.data(_2a,'combo');
 		var _2d=$(_2a).textbox('getText');
 		if(_2d!=_2b){
 			$(_2a).textbox('setText',_2b);
 			_2c.previousText=_2b;
 		}
 	};
 	/**
 	 * 获取值数组
 	 */
 	function getValues(target){
 		var result=[];
 		var state=$(target).data('combo');
 		$.each(state.values,function(i,n){
 			result.push(n);
 		});
 		return result;
 	};
 	function _32(_33,_34){
 		var _35=$.data(_33,'combo');
 		var _36=_35.options;
 		var _37=_35.combo;
 		if(!$.isArray(_34)){
 			_34=_34.split(_36.separator);
 		}
 		var _38=getValues(_33);
 		_37.find('.textbox-value').remove();
 		var _39=$(_33).attr('textboxName')||'';
 		for(var i=0;i<_34.length;i++){
 			var _3a=$('<input type=\'hidden\' class=\'textbox-value\'>').appendTo(_37);
 			_3a.attr('name',_39);
 			if(_36.disabled){
 				_3a.attr('disabled','disabled');
 			}
 			_3a.val(_34[i]);
 		}
 		var _3b=(function(){
 			if(_38.length!=_34.length){
 				return true;
 			}
 			var a1=$.extend(true,[],_38);
 			var a2=$.extend(true,[],_34);
 			a1.sort();
 			a2.sort();
 			for(var i=0;i<a1.length;i++){
 				if(a1[i]!=a2[i]){
 					return true;
 				}
 			}
 			return false;
 		})();
 		if(_3b){
 			if(_36.multiple){
 				_36.onChange.call(_33,_34,_38);
 			}else{
 				_36.onChange.call(_33,_34[0],_38[0]);
 			}
 			$(_33).closest('form').trigger('_change',[_33]);
 		}
 	};
 	function _3c(_3d){
 		var _3e=getValues(_3d);
 		return _3e[0];
 	};
 	function _3f(_40,_41){
 		_32(_40,[_41]);
 	};
 	function _42(_43){
 		var _44=$.data(_43,'combo').options;
 		var _45=_44.onChange;
 		_44.onChange=function(){
 		};
 		if(_44.multiple){
 			_32(_43,_44.value?_44.value:[]);
 		}else{
 			_3f(_43,_44.value);
 		}
 		_44.onChange=_45;
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
 					options:$.extend({},$.fn.combo.defaults,$.fn.combo.parseOptions(this),options),
 					previousText:''
 				});
 			}
 			state=$(this).data('combo');
 			state.values=[];
 			init(this);
 			_42(this);
 		});
 	};
 	$.fn.combo.methods={
 		options:function(jq){
 			return $(jq[0]).data('combo').options;
 		},
 		cloneFrom:function(jq,_4b){
 			return jq.each(function(){
 				$(this).textbox('cloneFrom',_4b);
 				$.data(this,'combo',{options:$.extend(true,{cloned:true},$(_4b).combo('options')),combo:$(this).next(),panel:$(_4b).combo('panel')});
 				$(this).addClass('combo-f').attr('comboName',$(this).attr('textboxName'));
 			});
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
 				$(this).textbox('setText','');
 				var _4c=$.data(this,'combo').options;
 				if(_4c.multiple){
 					$(this).combo('setValues',[]);
 				}else{
 					$(this).combo('setValue','');
 				}
 			});
 		},
 		reset:function(jq){
 			return jq.each(function(){
 				var _4d=$.data(this,'combo').options;
 				if(_4d.multiple){
 					$(this).combo('setValues',_4d.originalValue);
 				}else{
 					$(this).combo('setValue',_4d.originalValue);
 				}
 			});
 		},
 		getText:function(jq){

 		},
 		setText:function(jq,_4e){
 			return jq.each(function(){
 				_29(this,_4e);
 			});
 		},
 		getValues:function(jq){
 			return getValues(jq[0]);
 		},
 		setValues:function(jq,_4f){
 			return jq.each(function(){
 				_32(this,_4f);
 			});
 		},
 		getValue:function(jq){
 			return _3c(jq[0]);
 		},
 		setValue:function(jq,_50){
 			return jq.each(function(){
 				_3f(this,_50);
 			});
 		}
 	};
 	$.fn.combo.parseOptions=function(target){
 		return $.extend({},$.fn.validate.parseOptions(target),$.parser.parseOptions(target,['separator',{panelWidth:'number',panelHeight:'number',hasDownArrow:'boolean',delay:'number',selectOnNavigation:'boolean',multiple:'boolean'}]));
 	};
 	$.fn.combo.defaults=$.extend({},$.fn.validate.defaults,{
 		inputEvents:{
 			click:_14,
 			keydown:_19,
 			paste:_19,
 			drop:_19
 		},
 		width:'auto',
 		height:22,
 		panelWidth:'auto',
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

