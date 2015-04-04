/**
 * jQuery StreamlineUI v1.0 依赖：parser、tooltip、validate
 */
(function($) {
	/**
	 * 创建组件
	 */
	function create(target) {
		var state = $(target).data('textbox');
		var opts = state.options;
		$(target).attr('type', opts.type).addClass('textbox').addClass('textbox-text');
		var inputWidth = opts.width;// 输入框宽度
		$.each(opts.buttons, function(i, n) {
			var button = $('<a href="javascript:void(0)" class="' + n.css + '">' + n.text + '</a>');
			if (n.align == 'left') {
				button.insertBefore(target);
			} else if (n.align == 'right') {
				button.insertAfter(target);
			}
			if (n.disabled) {
				button.addClass('textbox-button-disabled');
			}
			button.click(function() {
				if (!$(this).hasClass('textbox-button-disabled')) {
					opts.onClickButton.call(target, i);
				}
			});
			button.css({
				height : opts.height
			});
			inputWidth -= button.outerWidth();
			state.buttons.push(button);
		});
		$(target).css({
			width : inputWidth,
			height : opts.height
		});
		setDisabled(target, opts.disabled);
		setReadonly(target, opts.readonly);
	}
	/**
	 * 销毁组件
	 */
	function destroy(target) {
		var state = $(target).data('textbox');
		$(target).validate('destroy');
		$(target).remove();
	}
	/**
	 * 改变组件大小
	 */
	function resize(target, param) {
		var state = $(target).data('textbox');
		var opts = state.options;
		if (param) {
			if (param.width) {
				opts.width = param.width;
			}
			if (param.height) {
				opts.height = param.height;
			}
		}
		var inputWidth = opts.width;
		for (var i = 0; i < state.buttons.length; i++) {
			state.buttons[i].css({
				height : opts.height
			});
			inputWidth -= state.buttons[i].outerWidth();
		}
		$(target).css({
			width : inputWidth,
			height : opts.height
		});
		opts.onResize.call(target, opts.width, opts.height);
	}
	/**
	 * 绑定验证
	 */
	function bindValidate(target) {
		var state = $(target).data('textbox');
		var opts = state.options;
		$(target).validate($.extend({}, opts, {
			deltaX : getTipX(target)
		}));
	}
	/**
	 * 获取tooltip水平偏移
	 */
	function getTipX(target) {
		var state = $(target).data('textbox');
		var opts = state.options;
		var tipX = 0;
		for (var i = 0; i < opts.buttons.length; i++) {
			if (opts.buttons[i].align == 'right') {
				tipX += state.buttons.outerWidth();
			}
		}
		return tipX;
	}
	function changeOptions(target) {
		var t = $(target);
		var state = t.data('textbox');
		var opts = state.options;
		t.attr('placeholder', opts.prompt);
		t.unbind('.textbox');
		if (!opts.disabled && !opts.readonly) {
			t.bind('blur.textbox', function(e) {
				if (t.val() == '') {
					t.val(opts.prompt).addClass('textbox-prompt');
				}
				t.removeClass('textbox-focused');
			}).bind('focus.textbox', function(e) {
				if (t.val() == opts.prompt) {
					t.val('');
				}
				$(this).removeClass('textbox-prompt');
				t.addClass('textbox-focused');
			});
		}
	}
	/**
	 * 启用/禁用组件
	 */
	function setDisabled(target, param) {
		var state = $(target).data('textbox');
		var opts = state.options;
		opts.disabled = param;
		if (param) {
			$(target).attr('disabled', 'disabled').addClass('textbox-disabled');
		} else {
			$(target).removeAttr('disabled').removeClass('textbox-disabled');
		}
		for (var i = 0; i < state.buttons.length; i++) {
			opts.buttons[i].disabled = param;
			if (param) {
				state.buttons[i].addClass('textbox-button-disabled');
			} else {
				state.buttons[i].removeClass('textbox-button-disabled');
			}
		}
	}
	/**
	 * 设置只读模式
	 */
	function setReadonly(target, param) {
		var state = $(target).data('textbox');
		var opts = state.options;
		opts.readonly = param;
		if (param) {
			$(target).attr('readonly', 'readonly').addClass('textbox-readonly');
		} else {
			$(target).removeAttr('readonly').removeClass('textbox-readonly');
		}
	}
	/**
	 * 绑定数据 options：属性对象 buttons：按钮数组
	 */
	$.fn.textbox = function(options, param) {
		if (typeof options == 'string') {
			var method = $.fn.textbox.methods[options];
			if (method) {
				return method(this, param);
			} else {
				return this.each(function() {
					$(this).validate(options, param);
				});
			}
		}
		options = options || {};
		return this.each(function() {
			var state = $(this).data('textbox');
			if (state) {
				$.extend(state.options, options);
			} else {
				$(this).data('textbox', {
					options : $.extend({}, $.fn.validate.defaults, $.fn.textbox.defaults, $.fn.textbox.parseOptions(this), options),
					buttons : []
				});
				state = $(this).data('textbox');
			}

			create(this);
			changeOptions(this);
			resize(this);
			bindValidate(this);
		});
	};
	$.fn.textbox.methods = {
		options : function(jq) {
			return $(jq[0]).data('textbox').options;
		},
		destroy : function(jq) {
			return jq.each(function() {
				destroy(this);
			});
		},
		resize : function(jq, _3b) {
			return jq.each(function() {
				resize(this, _3b);
			});
		},
		disable : function(jq) {
			return jq.each(function() {
				setDisabled(this, true);
				changeOptions(this);
			});
		},
		enable : function(jq) {
			return jq.each(function() {
				setDisabled(this, false);
				changeOptions(this);
			});
		},
		readonly : function(jq, _3c) {
			return jq.each(function() {
				setReadonly(this, _3c);
				changeOptions(this);
			});
		},
		clear : function(jq) {
			return jq.each(function() {
				$(this).val('');
			});
		},
		reset : function(jq) {
			return jq.each(function() {
				var opts = $(this).textbox('options');
				$(this).textbox('setValue', opts.value);
			});
		},
		getValue : function(jq) {
			return $(jq[0]).val();
		},
		setValue : function(jq, value) {
			return jq.each(function() {
				$(this).val(value);
			});
		}
	};
	/**
	 * 将data-options中的属性字符串转换为属性对象
	 */
	$.fn.textbox.parseOptions = function(target) {
		var t = $(target);
		return $.extend({}, $.parser.parseOptions(target), {
			value : (t.val() || undefined),
			type : (t.attr('type') ? t.attr('type') : undefined),
			disabled : (t.attr('disabled') ? true : undefined),
			readonly : (t.attr('readonly') ? true : undefined)
		});
	};
	$.fn.textbox.defaults = {
		width : 150,
		height : 22,
		prompt : '',
		value : '',
		type : 'text',
		disabled : false,
		readonly : false,
		buttons : [],
		onChange : function(newValue, oldValue) {
		},
		onResize : function(width, height) {
		},
		onClickButton : function(index) {

		}
	};
})(jQuery);
