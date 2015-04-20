// jQuery StreamlineUI v1.0 
// 依赖：slparser
(function($) {
	// 创建组件
	function create(target) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		$(target).addClass('slui-slcombobox');
		// 点击组件外部时隐藏组件
		$(document).unbind('.slcombobox').bind('mousedown.slcombobox mousewheel.slcombobox', function(e) {
			if ($(e.target).closest('.slcombobox-panel,.slcombobox,.slcombobox-arrow').length) {
				return;
			}
			$('.slcombobox').slcombobox('hidePanel');
		});
		// 创建弹出面板
		if (!state.panel) {
			state.panel = $('<div class="slcombobox-panel"></div>').appendTo('body');
			state.panel.css({
				position : 'absolute',
				display : 'none',
				zIndex : 10000,
				width : opts.panelWidth ? opts.panelWidth : opts.width,
				height : opts.panelHeight
			});
		}
		// 创建下拉按钮
		if (!state.downArrow) {
			state.downArrow = $('<span class="slcombobox-arrow"></span>').insertAfter(target);
			state.downArrow.css({
				width : opts.height,
				height : opts.height
			}).bind('click.slcombobox', function(e) {
				$(target).focus();
				showPanel(target);
			});
		}
		// 创建存储值的input
		if (!state.textbox) {
			state.textbox = $('<input type="hidden" value=""/>').insertAfter(target);
		}
		$(target).unbind('.slcombobox').bind('focus.slcombobox', function(e) {
			if (!state.values.length) {
				$(target).val('');
			}
		}).bind('click.slcombobox', function(e) {
			showPanel(target);
		}).bind('blur.slcombobox', function(e) {
			if ($(target).val().length == 0) {
				state.values = [];
			}
			if (!state.values.length) {
				$(target).val(opts.prompt);
			}
		}).addClass('slcombobox').css(
				{
					width : opts.width - opts.height - $(target).css('padding-left').replace('px', '')
							- $(target).css('padding-right').replace('px', '')
							- state.downArrow.css('border-right-width').replace('px', ''),
					height : opts.height
				}).attr('comboName', $(target).attr('name')).removeAttr('name').addClass('slcombobox-f').val(opts.prompt);
		if (opts.required) {
			if ($.fn.validate)
				$(target).validate($.extend({}, $.fn.validate.defaults, {
					required : opts.required,
					missingMessage : opts.missingMessage,
					deltaX : opts.height
				}));
		}
		state.textbox.attr('name', $(target).attr('comboName'));
		state.panel.undelegate('div.slcombobox-item', '.slcombobox').delegate('div.slcombobox-item', 'mouseenter.slcombobox',
				function(e) {
					$(this).addClass('slcombobox-item-hover');
					e.stopPropagation();
				}).delegate('div.slcombobox-item', 'mouseleave.slcombobox', function(e) {
			$(this).removeClass('slcombobox-item-hover');
			e.stopPropagation();
		}).delegate('div.slcombobox-item', 'click.slcombobox', function(e) {
			var value = $(this).attr('value');
			if (opts.multiple) {
				if ($(this).hasClass('slcombobox-item-selected')) {
					unselect(target, value);
				} else {
					select(target, value);
				}
			} else {
				select(target, value);
				hidePanel(target);
			}
			e.stopPropagation();
		});

		if (!opts.editable) {
			readonly(target, true);
		}
		if (opts.disabled) {
			setDisable(target, true);
		}
		for ( var e in opts.inputEvents) {
			$(target).bind(e + ".slcombobox", {
				target : target
			}, opts.inputEvents[e]);
		}
		if (opts.value.length > 0) {
			setValue(target, opts.value);
		}
	}
	// 销毁组件
	function destroy(target) {
		var state = $(target).data('slcombobox');
		if (state.panel) {
			state.panel.remove();
		}
		if (state.timer) {
			clearTimeout(state.timer);
		}
		if (state.textbox) {
			state.textbox.remove();
		}
		if (state.downArrow) {
			state.downArrow.remove();
		}
	}
	// 显示面板
	function showPanel(target) {
		$('.slcombobox').slcombobox('hidePanel');
		var state = $(target).data('slcombobox');
		var opts = state.options;
		state.panel.css({
			left : state.downArrow.offset().left - $(target).outerWidth(),
			top : state.downArrow.offset().top + $(target).outerHeight()
		});
		state.panel.show();
		opts.onShowPanel.call(target);
	}
	// 隐藏面板
	function hidePanel(target) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		state.panel.hide();
		opts.onHidePanel.call(target);
	}
	// 根据value获取数据索引号
	function getRowIndex(target, value) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		var data = state.data;
		for (var i = 0; i < data.length; i++) {
			if (data[i][opts.valueField] == value) {
				return i;
			}
		}
		return -1;
	}
	// 显示指定项位置
	function scrollTo(target, value) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		var panel = state.panel;
		var item = opts.finder.getEl(target, value);
		if (item.length) {
			if (item.position().top <= 0) {
				var h = panel.scrollTop() + item.position().top;
				panel.scrollTop(h);
			} else if (item.position().top + item.outerHeight() > panel.height()) {
				var h = panel.scrollTop() + item.position().top + item.outerHeight() - panel.height();
				panel.scrollTop(h);
			}
		}
	}
	// 键盘导航
	function nav(target, dir) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		var panel = state.panel;
		var item = panel.children('div.slcombobox-item-hover');
		if (!item.length) {
			item = panel.children('div.slcombobox-item-selected');
		}
		item.removeClass('slcombobox-item-hover');
		var firstSelector = 'div.slcombobox-item:visible:first';
		var lastSelector = 'div.slcombobox-item:visible:last';
		if (!item.length) {
			item = panel.children(dir == 'next' ? firstSelector : lastSelector);
		} else {
			if (dir == 'next') {
				item = item.nextAll(firstSelector);
				if (!item.length) {
					item = panel.children(firstSelector);
				}
			} else {
				item = item.prevAll(firstSelector);
				if (!item.length) {
					item = panel.children(lastSelector);
				}
			}
		}
		if (item.length) {
			item.addClass('slcombobox-item-hover');
			var row = opts.finder.getRow(target, item.attr('value'));
			if (row) {
				scrollTo(target, item.attr('value'));
			}
		}
	}
	// 选中某一项
	function select(target, value) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		var values = state.values;
		if ($.inArray(value, values) == -1) {
			if (opts.multiple) {
				values.push(value);
			} else {
				values = [ value ];
			}
			setValue(target, values.join(opts.separator));
		}
		opts.onSelect.call(target, opts.finder.getRow(target, value));
	}

	/**
	 * 取消某一项选中状态
	 */
	function unselect(target, value) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		var values = state.values;
		var index = $.inArray(value, values);
		if (index >= 0) {
			values.splice(index, 1);
			setValue(target, values.join(opts.separator));
			opts.onUnselect.call(target, opts.finder.getRow(target, value));
		}
	}

	/**
	 * 设置组件值
	 */
	function setValue(target, newValue) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		var panel = state.panel;
		panel.find('div.slcombobox-item-selected').removeClass('slcombobox-item-selected');
		var vv = [], ss = [];
		var newValues = [];
		if (newValue && newValue.length) {
			newValues = newValue.split(opts.separator);
		}
		if (state.data.length) {
			for (var i = 0; i < newValues.length; i++) {
				var v = newValues[i];
				var s = v;
				var rowIndex = getRowIndex(target, v);
				if (rowIndex > -1) {
					panel.children().eq(rowIndex).addClass('slcombobox-item-selected');
					var row = state.data[rowIndex];
					if (row) {
						s = row[opts.textField];
					}
					ss.push(s);
				}
				vv.push(v);
			}
			if (ss.length) {
				$(target).val(ss.join(opts.separator));
			} else {
				$(target).val(opts.prompt);
			}
			if (newValue != state.textbox.val()) {
				opts.onChange.call(target, newValue, state.textbox.val());
			}
		}
		state.textbox.val(newValue);
		state.values = newValues;
	}

	/**
	 * 加载数据
	 */
	function loadData(target, data) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		opts.data = data;
		state.data = opts.loadFilter.call(target, data);
		data = state.data;

		var selected = $(target).slcombobox('getValue');
		var dd = [];
		var group = undefined;
		for (var i = 0; i < data.length; i++) {
			var row = data[i];
			var v = row[opts.valueField];
			var s = row[opts.textField];
			var g = row[opts.groupField];

			if (g) {
				if (group != g) {
					group = g;
					state.groups.push(g);
					dd.push('<div class="slcombobox-group" value="' + g + '">');
					dd.push(opts.groupFormatter ? opts.groupFormatter.call(target, g) : g);
					dd.push('</div>');
				}
			} else {
				group = undefined;
			}

			dd.push('<div class="slcombobox-item" value="' + v + '">');
			dd.push(opts.formatter ? opts.formatter.call(target, row) : s);
			dd.push('</div>');
		}
		state.panel.html(dd.join(''));
		setValue(target, selected);
		opts.onLoadSuccess.call(target, data);
	}

	/**
	 * 请求远程服务器数据
	 */
	function request(target, url, param) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		if (url) {
			opts.url = url;
		}
		if (opts.onBeforeLoad.call(target, opts.queryParams) == false)
			return;
		opts.loader.call(target, $.extend({}, opts.queryParams, param), function(data) {
			loadData(target, data);
		}, function() {
			opts.onLoadError.apply(this, arguments);
		});
	}
	/**
	 * 启用/禁用组件
	 */
	function setDisable(target, param) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		opts.disabled = param;
		if (param) {
			$(target).addClass('slcombobox-disable').attr('disabled', 'disabled');
			state.downArrow.addClass('slcombobox-arrow-disable');
			state.onclick = state.downArrow.onclick;
			state.downArrow.onclick = null;
		} else {
			$(target).removeClass('slcombobox-disable').removeAttr('disabled');
			state.downArrow.removeClass('slcombobox-arrow-disable');
			state.downArrow.onclick = state.onclick;
			state.onclick = null;
		}
	}
	/**
	 * 启用/禁用只读模式
	 */
	function readonly(target, param) {
		var state = $(target).data('slcombobox');
		var opts = state.options;
		opts.readonly = param;
		if (param) {
			$(target).addClass('slcombobox-readonly').attr('readonly', 'readonly');
			state.downArrow.addClass('slcombobox-arrow-readonly');
			state.onclick = state.downArrow.onclick;
			state.downArrow.onclick = null;
		} else {
			$(target).removeClass('slcombobox-readonly').removeAttr('readonly');
			state.downArrow.removeClass('slcombobox-arrow-readonly');
			state.downArrow.onclick = state.onclick;
			state.onclick = null;
		}
	}
	/**
	 * 组件输入框内容改变
	 */
	function inputChange(e) {
		var target = e.data.target;
		var t = $(target);
		var state = t.data("slcombobox");
		var opts = state.options;
		switch (e.keyCode) {
		case 38:
			opts.keyHandler.up.call(target, e);
			break;
		case 40:
			opts.keyHandler.down.call(target, e);
			break;
		case 37:
			break;
		case 39:
			break;
		case 13:
			e.preventDefault();
			opts.keyHandler.enter.call(target, e);
			return false;
		case 9:
		case 27:
			hidePanel(target);
			break;
		default:
			if (opts.editable) {
				if (state.timer) {
					clearTimeout(state.timer);
				}
				state.timer = setTimeout(function() {
					var q = t.slcombobox("getText");
					if (state.previousText != q) {
						state.previousText = q;
						t.slcombobox("showPanel");
						opts.keyHandler.query.call(target, q, e);
					}
				}, opts.delay);
			}
		}
	}
	;
	/**
	 * 查询数据
	 */
	function doQuery(target, q) {
		var state = $(target).data('slcombobox');
		var opts = state.options;

		if (opts.mode == 'remote') {
			request(target, null, {
				q : q
			});
		} else {
			var panel = state.panel;
			panel.find('div.slcombobox-item-selected,div.slcombobox-item-hover').removeClass(
					'slcombobox-item-selected slcombobox-item-hover');
			panel.find('div.slcombobox-item,div.slcombobox-group').hide();
			var data = state.data;
			var vv = [];
			var qq = q.split(opts.separator);
			$.map(qq, function(q) {
				q = $.trim(q);
				var group = undefined;
				for (var i = 0; i < data.length; i++) {
					var row = data[i];
					if (opts.filter.call(target, q, row)) {
						var v = row[opts.valueField];
						var s = row[opts.textField];
						var g = row[opts.groupField];
						var item = opts.finder.getEl(target, v).show();
						if (s.toLowerCase() == q.toLowerCase()) {
							vv.push(v);
							item.addClass('slcombobox-item-selected');
						}
						if (opts.groupField && group != g) {
							if ($.inArray(g, state.groups)) {
								$('.slcombobox-group[value="' + g + '"]').show();
							}
							group = g;
						}
					}
				}
			});
			if (vv.length > 0) {
				setValue(target, vv.join(opts.seperator));
			}
		}
	}

	function doEnter(target) {
		var t = $(target);
		var state = t.data('slcombobox');
		var opts = state.options;
		var panel = state.panel;
		var item = panel.children('div.slcombobox-item-hover');
		if (item.length) {
			var row = opts.finder.getRow(target, item.attr('value'));
			var value = row[opts.valueField];
			if (opts.multiple) {
				if (item.hasClass('slcombobox-item-selected')) {
					unselect(target, value);
				} else {
					select(target, value);
				}
			} else {
				select(target, value);
			}
		}
		if (!opts.multiple) {
			t.slcombobox('hidePanel');
		}
	}
	// 绑定数据：
	// options：属性
	// textbox：存储值的input
	// values：值的数组
	// panel：弹出面板
	// downArrow：组件下拉按钮
	// data：绑定到组件的数据
	// groups：分组值
	// onclick：点击下拉按钮事件
	// timer：
	// previousText：
	$.fn.slcombobox = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.slcombobox.methods[options](this, param);
		}
		options = options || {};
		return this.each(function() {
			var state = $(this).data('slcombobox');
			if (state) {
				$.extend(state.options, options);
			} else {
				$(this).data('slcombobox', {
					options : $.extend({}, $.fn.slcombobox.defaults, $.fn.slcombobox.parseOptions(this), options),
					data : [],
					values : [],
					groups : [],
					previousText : ''
				});
				state = $(this).data('slcombobox');
			}

			create(this);
			if (state.options.data) {
				loadData(this, state.options.data);
			}
			request(this);
		});
	};

	$.fn.slcombobox.methods = {
		options : function(jq) {
			return $(jq[0]).data('slcombobox').options;
		},
		destroy : function(jq) {
			return jq.each(function() {
				destroy(this);
			});
		},
		panel : function(jq) {
			return $(jq[0]).data('slcombobox').panel;
		},
		textbox : function(jq) {
			return $(jq[0]).data('slcombobox').textbox;
		},
		showPanel : function(jq) {
			return jq.each(function() {
				showPanel(this);
			});
		},
		hidePanel : function(jq) {
			return jq.each(function() {
				hidePanel(this);
			});
		},
		disable : function(jq) {
			return jq.each(function() {
				setDisable(this, true);
			});
		},
		enable : function(jq) {
			return jq.each(function() {
				setDisable(this, false);
			});
		},
		readonly : function(jq, param) {
			return jq.each(function() {
				readonly(this, param);
			});
		},
		clear : function(jq) {
			return jq.each(function() {
				setValue(this, '');
			});
		},
		reset : function(jq) {
			return jq.each(function() {
				var opts = $(this).slcombobox('options');
				$(this).slcombobox('setValue', opts.value);
			});
		},
		getText : function(jq) {
			return $(jq[0]).val();
		},
		getValue : function(jq) {
			return $(jq[0]).data('slcombobox').textbox.val();
		},
		setValue : function(jq, value) {
			return jq.each(function() {
				setValue(this, value);
			});
		},
		getData : function(jq) {
			return $(jq[0]).data('slcombobox').data;
		},
		loadData : function(jq, data) {
			return jq.each(function() {
				loadData(this, data);
			});
		},
		reload : function(jq) {
			return jq.each(function() {
				request(this);
			});
		}
	};
	$.fn.slcombobox.parseOptions = function(target) {
		return $.extend({}, $.slparser.parseOptions(target));
	};

	$.fn.slcombobox.defaults = {
		width : 150,
		height : 22,
		panelWidth : null,
		panelHeight : '200',
		multiple : false,
		selectOnNavigation : true,
		separator : ',',
		editable : false,
		disabled : false,
		readonly : false,
		value : '',
		prompt : '',
		required : false,
		missingMessage : 'This field is required.',
		delay : 200,
		valueField : 'value',
		textField : 'text',
		groupField : null,
		groupFormatter : function(group) {
			return group;
		},
		mode : 'local', // or 'remote'
		url : null,
		queryParams : null,
		method : 'post', // or 'get'
		data : null,
		keyHandler : {
			up : function(e) {
				nav(this, 'prev');
				e.preventDefault()
			},
			down : function(e) {
				nav(this, 'next');
				e.preventDefault()
			},
			enter : function(e) {
				doEnter(this)
			},
			query : function(q, e) {
				doQuery(this, q)
			}
		},
		filter : function(q, row) {
			var opts = $(this).slcombobox('options');
			return row[opts.textField].toLowerCase().indexOf(q.toLowerCase()) == 0;
		},
		formatter : function(row) {
			var opts = $(this).slcombobox('options');
			return row[opts.textField];
		},
		loader : function(param, success, error) {
			var opts = $(this).slcombobox('options');
			if (!opts.url)
				return false;
			$.ajax({
				type : opts.method,
				url : opts.url,
				data : param,
				dataType : 'json',
				success : function(data) {
					success(data);
				},
				error : function() {
					error.apply(this, arguments);
				}
			});
		},
		loadFilter : function(data) {
			return data;
		},
		finder : {
			getEl : function(target, value) {
				var index = getRowIndex(target, value);
				return $(target).data('slcombobox').panel.children().eq(index);
			},
			getRow : function(target, value) {
				var index = getRowIndex(target, value);
				return $(target).data('slcombobox').data[index];
			}
		},
		inputEvents : {
			keydown : inputChange,
			paste : inputChange,
			drop : inputChange
		},
		onShowPanel : function() {
		},
		onHidePanel : function() {
		},
		onChange : function(newValue, oldValue) {
		},
		onBeforeLoad : function(param) {
		},
		onLoadSuccess : function() {
		},
		onLoadError : function() {
		},
		onSelect : function(record) {
		},
		onUnselect : function(record) {
		}
	};
})(jQuery);
