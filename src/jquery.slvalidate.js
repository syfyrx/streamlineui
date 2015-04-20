// jQuery StreamlineUI v1.0 
// 依赖：slparser、sltooltip
(function($) {
	// 销毁验证
	function destroy(target) {
		var state = $(target).data('slvalidate');
		state.validating = false;
		if (state.timer) {
			clearTimeout(state.timer);
		}
		if ($.fn.sltooltip) {
			$(target).sltooltip('destroy');
		}
		$(target).unbind();
		$(target).remove();
	}
	// 绑定验证事件
	function bindEvent(target) {
		var opts = $(target).data('slvalidate').options;
		$(target).unbind('.slvalidate');
		if (opts.noslvalidate || $(target).is(':disabled')) {
			return;
		}
		for ( var e in opts.events) {
			$(target).bind(e + '.slvalidate', {
				target : target
			}, opts.events[e]);
		}
	}
	// 显示提示
	function showTip(target) {
		if ($.fn.sltooltip) {
			var state = $(target).data('slvalidate');
			var opts = state.options;
			$(target).sltooltip($.extend({}, opts.tipOptions, {
				content : state.message,
				position : opts.tipPosition,
				deltaX : opts.deltaX
			})).sltooltip('show');
			state.tip = true;
		}
	}
	// 重置提示位置
	function repositionTip(target) {
		if ($.fn.sltooltip) {
			var state = $(target).data('slvalidate');
			if (state && state.tip) {
				$(target).sltooltip('reposition');
			}
		}
	}
	// 隐藏提示
	function hideTip(target) {
		if ($.fn.sltooltip) {
			var state = $(target).data('slvalidate');
			state.tip = false;
			$(target).sltooltip('hide');
		}
	}
	// 验证
	function validate(target) {
		var state = $(target).data('slvalidate');
		var opts = state.options;
		var box = $(target);
		opts.onBeforeslvalidate.call(target);
		var result = getslvalidateResult();
		opts.onslvalidate.call(target, result);
		return result;
		function setMessage(msg) {
			state.message = msg;
		}
		function getslvalidateResultByValidType(validType) {
			var value = box.val();
			var rule = opts.rules[validType];
			if (rule && value) {
				if (!rule['validator'].call(target, value, opts.validParam)) {
					box.addClass('slvalidate-invalid');
					var msg = rule['message'];
					if (opts.validParam) {
						for (var i = 0; i < opts.validParam.length; i++) {
							msg = msg.replace(new RegExp('\\{' + i + '\\}', 'g'), opts.validParam[i]);
						}
					}
					setMessage(opts.invalidMessage || msg);
					if (state.validating) {
						showTip(target);
					}
					return false;
				}
			}
			return true;
		}
		function getslvalidateResult() {
			box.removeClass('slvalidate-invalid');
			hideTip(target);
			if (opts.noslvalidate || box.is(':disabled')) {
				return true;
			}

			if (opts.required) {
				if (box.val() == '') {
					box.addClass('slvalidate-invalid');
					setMessage(opts.missingMessage);
					if (state.validating) {
						showTip(target);
					}
					return false;
				}
			}
			if (opts.validType) {
				if ($.isArray(opts.validType)) {
					for (var i = 0; i < opts.validType.length; i++) {
						if (!getslvalidateResultByValidType(opts.validType[i])) {
							return false;
						}
					}
				} else if (typeof opts.validType == 'string') {
					if (!getslvalidateResultByValidType(opts.validType)) {
						return false;
					}
				}
			}
			return true;
		}
	}
	// 开启或禁用验证
	function setValidation(target, param) {
		var opts = $(target).data('slvalidate').options;
		if (param != undefined) {
			opts.noslvalidate = param;
		}
		if (opts.noslvalidate) {
			$(target).removeClass('slvalidate-invalid');
			hideTip(target);
		}
		validate(target);
		bindEvent(target);
	}
	$.fn.slvalidate = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.slvalidate.methods[options](this, param);
		}
		options = options || {};
		return this.each(function() {
			var state = $(this).data('slvalidate');
			if (state) {
				$.extend(state.options, options);
			} else {
				$(this).addClass('slvalidate-text');
				$(this).data('slvalidate', {
					options : $.extend({}, $.fn.slvalidate.defaults, $.fn.slvalidate.parseOptions(this), options)
				});
			}
			setValidation(this);
			validate(this);
		});
	};
	$.fn.slvalidate.methods = {
		options : function(jq) {
			return $(jq[0]).data('slvalidate').options;
		},
		destroy : function(jq) {
			return jq.each(function() {
				destroy(this);
			});
		},
		validate : function(jq) {
			return jq.each(function() {
				validate(this);
			});
		},
		isValid : function(jq) {
			return validate(jq[0]);
		},
		enableValidation : function(jq) {
			return jq.each(function() {
				setValidation(this, false);
			});
		},
		disableValidation : function(jq) {
			return jq.each(function() {
				setValidation(this, true);
			});
		}
	};
	$.fn.slvalidate.parseOptions = function(target) {
		var t = $(target);
		return $.extend({}, $.slparser.parseOptions(target, [ 'validType', 'missingMessage', 'invalidMessage', 'tipPosition', {
			delay : 'number',
			deltaX : 'number'
		} ]), {
			required : (t.attr('required') ? true : undefined),
			noslvalidate : (t.attr('noslvalidate') != undefined ? true : undefined)
		});
	};
	$.fn.slvalidate.defaults = {
		required : false,
		validType : null,
		validParam : [],
		delay : 200,
		missingMessage : 'This field is required.',
		invalidMessage : null,
		tipPosition : 'right',
		deltaX : 0,
		noslvalidate : false,
		events : {
			focus : function focus(e) {
				var target = e.data.target;
				var state = $(target).data('slvalidate');
				if ($(target).attr('readonly')) {
					return;
				}
				state.validating = true;
				state.value = undefined;
				(function() {
					if (state.validating) {
						if (state.value != $(target).val()) {
							state.value = $(target).val();
							if (state.timer) {
								clearTimeout(state.timer);
							}
							state.timer = setTimeout(function() {
								$(target).slvalidate('validate');
							}, state.options.delay);
						} else {
							repositionTip(target);
						}
						setTimeout(arguments.callee, 200);
					}
				})();
			},
			blur : function blur(e) {
				var target = e.data.target;
				var state = $(target).data('slvalidate');
				if (state.timer) {
					clearTimeout(state.timer);
					state.timer = undefined;
				}
				state.validating = false;
				hideTip(target);
			},
			mouseenter : function(e) {
				var t = $(e.data.target);
				if (t.hasClass('slvalidate-invalid')) {
					showTip(e.data.target);
				}
			},
			mouseleave : function mouseleave(e) {
				var target = e.data.target;
				var state = $(target).data('slvalidate');
				if (!state.validating) {
					hideTip(target);
				}
			},
			click : function(e) {
				var t = $(e.data.target);
				if (!t.is(':focus')) {
					t.trigger('focus');
				}
			}
		},
		tipOptions : {
			showEvent : 'none',
			hideEvent : 'none',
			showDelay : 0,
			hideDelay : 0,
			zIndex : '',
			onShow : function() {
				if ($.fn.sltooltip) {
					$(this).sltooltip('tip').css({
						color : '#000',
						borderColor : '#CC9933',
						backgroundColor : '#FFFFCC'
					});
				}
			},
			onHide : function() {
				if ($.fn.sltooltip) {
					$(this).sltooltip('destroy');
				}
			}
		},
		rules : {
			email : {
				validator : function(txt) {
					return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(txt);
				},
				message : 'Please enter a valid email address.'
			},
			url : {
				validator : function(txt) {
					return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
							.test(txt);
				},
				message : 'Please enter a valid URL.'
			},
			length : {
				validator : function(txt, param) {
					var len = $.trim(txt).length;
					return len >= param[0] && len <= param[1];
				},
				message : 'Please enter a value between {0} and {1}.'
			},
			remote : {
				validator : function(txt, param) {
					var result = $.ajax({
						url : param[0],
						dataType : 'json',
						data : param[1],
						async : false,
						cache : false,
						type : 'post'
					}).responseText;
					return result == 'true';
				},
				message : 'Please fix this field.'
			}
		},
		onBeforeslvalidate : function() {
		},
		onslvalidate : function(result) {
		}
	};
})(jQuery);
