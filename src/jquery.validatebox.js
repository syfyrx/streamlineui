/**
 * jQuery StreamlineUI v1.0
 * 依赖：parser、tooltip
 */
 (function($){ 	
 	/**
 	 * 销毁验证
 	 */
 	 function destroy(target){
 	 	var state=$(target).data('validatebox');
 	 	state.validating=false;
 	 	if(state.timer){
 	 		clearTimeout(state.timer);
 	 	}
 	 	$(target).tooltip('destroy');
 	 	$(target).unbind();
 	 	$(target).remove();
 	 };
 	/**
 	 * 绑定验证事件
 	 */
 	 function bindEvent(target){
 	 	var opts=$(target).data('validatebox').options;
 	 	$(target).unbind('.validatebox');
 	 	if(opts.novalidate||$(target).is(':disabled')){
 	 		return;
 	 	}
 	 	for(var e in opts.events){
 	 		$(target).bind(e+'.validatebox',{target:target},opts.events[e]);
 	 	}
 	 };
 	/**
 	 * 显示提示
 	 */
 	 function showTip(target){
 	 	var state=$(target).data('validatebox');
 	 	var opts=state.options;
 	 	$(target).tooltip($.extend({},opts.tipOptions,{content:state.message,position:opts.tipPosition,deltaX:opts.deltaX})).tooltip('show');
 	 	state.tip=true;
 	 };
 	/**
 	 * 重置提示位置
 	 */
 	 function repositionTip(target){
 	 	var state=$(target).data('validatebox');
 	 	if(state&&state.tip){
 	 		$(target).tooltip('reposition');
 	 	}
 	 };
 	/**
 	 * 隐藏提示
 	 */
 	 function hideTip(target){
 	 	var state=$(target).data('validatebox');
 	 	state.tip=false;
 	 	$(target).tooltip('hide');
 	 };
 	/**
 	 * 验证
 	 */
 	 function validate(target){
 	 	var state=$(target).data('validatebox');
 	 	var opts=state.options;
 	 	var box=$(target);
 	 	opts.onBeforeValidate.call(target);
 	 	var result=getValidateResult();
 	 	opts.onValidate.call(target,result);
 	 	return result;
 	 	function setMessage(msg){
 	 		state.message=msg;
 	 	};
 	 	function getValidateResultByValidType(validType){
 	 		var value=box.val();
 	 		var rule=opts.rules[validType];
 	 		if(rule&&value){
 	 			if(!rule['validator'].call(target,value,opts.validParams)){
 	 				box.addClass('validatebox-invalid');
 	 				var msg=rule['message'];
 	 				if(opts.validParams){
 	 					for(var i=0;i<opts.validParams.length;i++){
 	 						msg=msg.replace(new RegExp('\\{'+i+'\\}','g'),opts.validParams[i]);
 	 					}
 	 				}
 	 				setMessage(opts.invalidMessage||msg);
 	 				if(state.validating){
 	 					showTip(target);
 	 				}
 	 				return false;
 	 			}
 	 		}
 	 		return true;
 	 	};
 	 	function getValidateResult(){
 	 		box.removeClass('validatebox-invalid');
 	 		hideTip(target);
 	 		if(opts.novalidate||box.is(':disabled')){
 	 			return true;
 	 		}

 	 		if(opts.required){
 	 			if(box.val()==''){
 	 				box.addClass('validatebox-invalid');
 	 				setMessage(opts.missingMessage);
 	 				if(state.validating){
 	 					showTip(target);
 	 				}
 	 				return false;
 	 			}
 	 		}
 	 		if(opts.validType){
 	 			if($.isArray(opts.validType)){
 	 				for(var i=0;i<opts.validType.length;i++){
 	 					if(!getValidateResultByValidType(opts.validType[i])){
 	 						return false;
 	 					}
 	 				}
 	 			}else if(typeof opts.validType=='string'){
 	 				if(!getValidateResultByValidType(opts.validType)){
 	 					return false;
 	 				}
 	 			}
 	 		}
 	 		return true;
 	 	};
 	 };
 	/**
 	 * 开启或禁用验证
 	 */
 	 function setValidation(target,param){
 	 	var opts=$(target).data('validatebox').options;
 	 	if(param!=undefined){
 	 		opts.novalidate=param;
 	 	}
 	 	if(opts.novalidate){
 	 		$(target).removeClass('validatebox-invalid');
 	 		hideTip(target);
 	 	}
 	 	validate(target);
 	 	bindEvent(target);
 	 };
 	 $.fn.validatebox=function(options,param){
 	 	if(typeof options=='string'){
 	 		return $.fn.validatebox.methods[options](this,param);
 	 	}
 	 	options=options||{};
 	 	return this.each(function(){
 	 		var state=$(this).data('validatebox');
 	 		if(state){
 	 			$.extend(state.options,options);
 	 		}else{
 	 			$(this).addClass('validatebox-text');
 	 			$(this).data('validatebox',{options:$.extend({},$.fn.validatebox.defaults,$.fn.validatebox.parseOptions(this),options)});
 	 		}
 	 		setValidation(this);
 	 		validate(this);
 	 	});
 	 };
 	 $.fn.validatebox.methods={
 	 	options:function(jq){
 	 		return $(jq[0]).data('validatebox').options;
 	 	},
 	 	destroy:function(jq){
 	 		return jq.each(function(){
 	 			destroy(this);
 	 		});
 	 	},
 	 	validate:function(jq){
 	 		return jq.each(function(){
 	 			validate(this);
 	 		});
 	 	},
 	 	isValid:function(jq){
 	 		return validate(jq[0]);
 	 	},
 	 	enableValidation:function(jq){
 	 		return jq.each(function(){
 	 			setValidation(this,false);
 	 		});
 	 	},
 	 	disableValidation:function(jq){
 	 		return jq.each(function(){
 	 			setValidation(this,true);
 	 		});
 	 	}
 	 };
 	 $.fn.validatebox.parseOptions=function(target){
 	 	var t=$(target);
 	 	return $.extend({},$.parser.parseOptions(target,['validType','missingMessage','invalidMessage','tipPosition',{delay:'number',deltaX:'number'}]),{required:(t.attr('required')?true:undefined),novalidate:(t.attr('novalidate')!=undefined?true:undefined)});
 	 };
 	 $.fn.validatebox.defaults={
 	 	required:false,
 	 	validType:null,
 	 	validParams:[],
 	 	delay:200,
 	 	missingMessage:'This field is required.',
 	 	invalidMessage:null,
 	 	tipPosition:'right',
 	 	deltaX:0,
 	 	novalidate:false,
 	 	events:{
 	 		focus:function focus(e){
 	 			var target=e.data.target;
 	 			var state=$(target).data('validatebox');
 	 			if($(target).attr('readonly')){
 	 				return;
 	 			}
 	 			state.validating=true;
 	 			state.value=undefined;
 	 			(function(){
 	 				if(state.validating){
 	 					if(state.value!=$(target).val()){
 	 						state.value=$(target).val();
 	 						if(state.timer){
 	 							clearTimeout(state.timer);
 	 						}
 	 						state.timer=setTimeout(function(){
 	 							$(target).validatebox('validate');
 	 						},state.options.delay);
 	 					}else{
 	 						repositionTip(target);
 	 					}
 	 					setTimeout(arguments.callee,200);
 	 				}
 	 			})();
 	 		},
 	 		blur:function blur(e){
 	 			var target=e.data.target;
 	 			var state=$(target).data('validatebox');
 	 			if(state.timer){
 	 				clearTimeout(state.timer);
 	 				state.timer=undefined;
 	 			}
 	 			state.validating=false;
 	 			hideTip(target);
 	 		},
 	 		mouseenter:function(e){
 	 			var t=$(e.data.target);
 	 			if(t.hasClass('validatebox-invalid')){
 	 				showTip(e.data.target);
 	 			}
 	 		},
 	 		mouseleave:function mouseleave(e){
 	 			var target=e.data.target;
 	 			var state=$(target).data('validatebox');
 	 			if(!state.validating){
 	 				hideTip(target);
 	 			}
 	 		},
 	 		click:function(e){
 	 			var t=$(e.data.target);
 	 			if(!t.is(':focus')){
 	 				t.trigger('focus');
 	 			}
 	 		}
 	 	},
 	 	tipOptions:{
 	 		showEvent:'none',
 	 		hideEvent:'none',
 	 		showDelay:0,
 	 		hideDelay:0,
 	 		zIndex:'',
 	 		onShow:function(){
 	 			$(this).tooltip('tip').css({color:'#000',borderColor:'#CC9933',backgroundColor:'#FFFFCC'});
 	 		},
 	 		onHide:function(){
 	 			$(this).tooltip('destroy');
 	 		}
 	 	},
 	 	rules:{
 	 		email:{
 	 			validator:function(txt){
 	 				return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(txt);
 	 			},
 	 			message:'Please enter a valid email address.'
 	 		},
 	 		url:{
 	 			validator:function(txt){
 	 				return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(txt);
 	 			},
 	 			message:'Please enter a valid URL.'
 	 		},
 	 		length:{
 	 			validator:function(txt,param){
 	 				var len=$.trim(txt).length;
 	 				return len>=param[0]&&len<=param[1];
 	 			},
 	 			message:'Please enter a value between {0} and {1}.'
 	 		},
 	 		remote:{
 	 			validator:function(txt,param){
 	 				var result=$.ajax({
 	 					url:param[0],
 	 					dataType:'json',
 	 					data:param[1],
 	 					async:false,
 	 					cache:false,
 	 					type:'post'
 	 				}).responseText;
 	 				return result=='true';
 	 			},
 	 			message:'Please fix this field.'
 	 		}
 	 	},
 	 	onBeforeValidate:function(){
 	 	},
 	 	onValidate:function(result){
 	 	}
 	 };
 	})(jQuery);

