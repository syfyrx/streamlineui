// jQuery StreamLineUI v1.0 
// 依赖：slparser
(function($) {
	function ajaxSubmit(target, options) {
		var opts = $(target).data('slform').options;
		$.extend(opts, options || {});

		var param = $.extend({}, opts.queryParams);
		if (opts.onSubmit.call(target, param) == false) {
			return;
		}

		var frameId = 'slui_frame_' + (new Date().getTime());
		var frame = $('<iframe id="' + frameId + '" name="' + frameId + '"></iframe>').appendTo('body');

		frame.attr('src', window.ActiveXObject ? 'javascript:false' : 'about:blank').css({
			position : 'absolute',
			top : -1000,
			left : -1000,
			display : 'none'
		});
		frame.bind('load', frameLoad);

		submit(param);

		function submit(param) {
			var t = $(target);
			if (opts.url) {
				t.attr('action', opts.url);
			}
			t.attr('target', frameId);
			for ( var n in param) {
				var field = $('<input type="hidden" name="' + n + '">').val(param[n]).appendTo(t);
			}
			t.submit();
		}
		function frameLoad() {
			frame.unbind();
			var data = '';
			try {
				var body = frame.contents().find('body');
				data = body.html();
				if (data == '') {
					return;
				}
				var ta = body.find('>textarea');
				if (ta.length) {
					data = ta.val();
				} else {
					var pre = body.find('>pre');
					if (pre.length) {
						data = pre.html();
					}
				}
			} catch (e) {
			}
			opts.success(data);
			setTimeout(function() {
				frame.unbind();
				frame.remove();
			}, 100);
		}
	}

	/**
	 * 加载本地数据或远程数据
	 */
	function load(target, data) {
		var opts = $(target).data('slform').options;
		if (typeof data == 'string') {// 加载远程数据
			var param = {};
			if (opts.onBeforeLoad.call(target, param) == false)
				return;
			$.ajax({
				url : data,
				data : param,
				dataType : 'json',
				success : function(data) {
				},
				error : function() {
					opts.onLoadError.apply(target, arguments);
				}
			});
		} else {// 加载本地数据
			_load(data);
		}
		// 加载数据
		function _load(data) {
			var t = $(target);
			for ( var name in data) {
				var val = data[name];
				var rr = _checkField(name, val);
				if (!rr.length) {
					var count = _loadOther(name, val);
					if (!count) {
						$('input[name="' + name + '"]', t).val(val);
						$('textarea[name="' + name + '"]', t).val(val);
						$('select[name="' + name + '"]', t).val(val);
					}
				}
				_loadCombo(name, val);
			}
			opts.onLoadSuccess.call(target, data);
			validate(target);
		}

		/**
		 * 加载 checkbox 和 radio 字段
		 */
		function _checkField(name, val) {
			var rr = $(target).find('input[name="' + name + '"][type=radio], input[name="' + name + '"][type=checkbox]');
			rr.attr('checked', false);
			rr.each(function() {
				var f = $(this);
				if (f.val() == String(val) || $.inArray(f.val(), $.isArray(val) ? val : [ val ]) >= 0) {
					f.attr('checked', true);
				}
			});
			return rr;
		}
		/**
		 * 加载其他字段
		 */
		function _loadOther(name, val) {
			var count = 0;
			var pp = [ 'slider' ];
			for (var i = 0; i < pp.length; i++) {
				var p = pp[i];
				var f = $(target).find('input[' + p + 'Name="' + name + '"]');
				if (f.length) {
					f[p]('setValue', val);
					count += f.length;
				}
			}
			return count;
		}

		function _loadCombo(name, val) {
			var slform = $(target);
			var cc = [ 'combobox', 'combotree', 'combogrid', 'datetimebox', 'datebox', 'combo' ];
			var c = slform.find('[comboName="' + name + '"]');
			if (c.length) {
				for (var i = 0; i < cc.length; i++) {
					var type = cc[i];
					if (c.hasClass(type + '-f')) {
						if ($.isArray(val)) {
							c[type]('setValue', val.join(c[type]('options').separator));
						} else {
							c[type]('setValue', val);
						}
						return;
					}
				}
			}
		}
	}

	/**
	 * 清除表单值
	 */
	function clear(target) {
		$('input,select,textarea', target).each(function() {
			var t = this.type, tag = this.tagName.toLowerCase();
			if (t == 'text' || t == 'hidden' || t == 'password' || tag == 'textarea') {
				this.value = '';
			} else if (t == 'file') {// ???
				var file = $(this);
				var newfile = file.clone().val('');
				newfile.insertAfter(file);
				if (file.data('validate')) {
					file.validate('destroy');
					newfile.validate();
				} else {
					file.remove();
				}
			} else if (t == 'checkbox' || t == 'radio') {
				this.checked = false;
			} else if (tag == 'select') {
				this.selectedIndex = -1;
			}

		});

		var t = $(target);
		var plugins = [ 'textbox', 'combo', 'combobox', 'combotree', 'combogrid', 'slider' ];
		for (var i = 0; i < plugins.length; i++) {
			var plugin = plugins[i];
			var r = t.find('.' + plugin + '-f');
			if (r.length && r[plugin]) {
				r[plugin]('clear');
			}
		}
		validate(target);
	}
	/**
	 * 重置表单数据
	 */
	function reset(target) {
		var t = $(target);
		var plugins = [ 'textbox', 'combo', 'combobox', 'combotree', 'combogrid', 'datebox', 'datetimebox', 'spinner', 'timespinner', 'numberbox', 'numberspinner', 'slider' ];
		for (var i = 0; i < plugins.length; i++) {
			var plugin = plugins[i];
			var r = t.find('.' + plugin + '-f');
			if (r.length && r[plugin]) {
				r[plugin]('reset');
			}
		}
		validate(target);
	}

	/**
	 * 设置表单
	 */
	function setForm(target) {
		var options = $(target).data('slform').options;
		$(target).unbind('.slform');
		if (options.ajax) {
			$(target).bind('submit.slform', function() {
				setTimeout(function() {
					ajaxSubmit(target, options);
				}, 0);
				return false;
			});
		}
		setValidation(target, options.novalidate);
	}
	/**
	 * 初始化表单
	 */
	function initForm(target, options) {
		options = options || {};
		var state = $(target).data('slform');
		if (state) {
			$.extend(state.options, options);
		} else {
			$(target).data('slform', {
				options : $.extend({}, $.fn.slform.defaults, $.fn.slform.parseOptions(target), options)
			});
		}
	}
	// 验证表单
	function validate(target) {
		if ($.fn.slvalidate) {
			var t = $(target);
			t.find('.slvalidate-text:not(:disabled)').slvalidate('validate');
			var invalidbox = t.find('.slvalidate-invalid');
			invalidbox.filter(':not(:disabled):first').focus();
			return invalidbox.length == 0;
		}
		return true;
	}
	/**
	 * 设置是否验证
	 */
	function setValidation(target, novalidate) {
		var opts = $(target).data('slform').options;
		opts.novalidate = novalidate;
		$(target).find('.slvalidate-text:not(:disabled)').slvalidate(novalidate ? 'disableValidation' : 'enableValidation');
	}

	$.fn.slform = function(options, param) {
		if (typeof options == 'string') {
			this.each(function() {
				initForm(this);
			});
			return $.fn.slform.methods[options](this, param);
		}

		return this.each(function() {
			initForm(this, options);
			setForm(this);
		});
	};

	$.fn.slform.methods = {
		options : function(jq) {
			return $(jq[0]).data('slform').options;
		},
		submit : function(jq, options) {
			return jq.each(function() {
				ajaxSubmit(this, options);
			});
		},
		load : function(jq, data) {
			return jq.each(function() {
				load(this, data);
			});
		},
		clear : function(jq) {
			return jq.each(function() {
				clear(this);
			});
		},
		reset : function(jq) {
			return jq.each(function() {
				reset(this);
			});
		},
		validate : function(jq) {
			return validate(jq[0]);
		},
		disableValidation : function(jq) {
			return jq.each(function() {
				setValidation(this, true);
			});
		},
		enableValidation : function(jq) {
			return jq.each(function() {
				setValidation(this, false);
			});
		}
	};

	$.fn.slform.parseOptions = function(target) {
		var t = $(target);
		return $.extend({}, $.slparser.parseOptions(target, [ {
			novalidate : 'boolean',
			ajax : 'boolean'
		} ]), {
			url : (t.attr('action') ? t.attr('action') : undefined)
		});
	};

	$.fn.slform.defaults = {
		novalidate : false,
		ajax : true,
		queryParams : {},
		url : null,
		onSubmit : function(param) {
			return $(this).slform('validate');
		},
		success : function(data) {
		},
		onBeforeLoad : function(param) {
		},
		onLoadSuccess : function(data) {
		},
		onLoadError : function() {
		}
	};
})(jQuery);
