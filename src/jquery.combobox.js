/**
 * jQuery StreamlineUI v1.0 依赖：parser
 */
(function($) {
	/**
	 * 根据value获取数据索引号
	 */
	function getRowIndex(target, value) {
		var state = $(target).data('combobox');
		var opts = state.options;
		var data = state.data;
		for (var i = 0; i < data.length; i++) {
			if (data[i][opts.valueField] == value) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * 显示指定项位置
	 */
	function scrollTo(target, value) {
		var state = $(target).data('combobox');
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
	/**
	 * 键盘导航
	 */
	function nav(target, dir) {
		var opts = $(target).data('combobox').options;
		var panel = $(target).combobox('panel');
		var item = panel.children('div.combobox-item-hover');
		if (!item.length) {
			item = panel.children('div.combobox-item-selected');
		}
		item.removeClass('combobox-item-hover');
		var firstSelector = 'div.combobox-item:visible:not(.combobox-item-disabled):first';
		var lastSelector = 'div.combobox-item:visible:not(.combobox-item-disabled):last';
		if (!item.length) {
			item = panel.children(dir == 'next' ? firstSelector : lastSelector);
			// item = panel.children('div.combobox-item:visible:' +
			// (dir=='next'?'first':'last'));
		} else {
			if (dir == 'next') {
				item = item.nextAll(firstSelector);
				// item = item.nextAll('div.combobox-item:visible:first');
				if (!item.length) {
					item = panel.children(firstSelector);
					// item = panel.children('div.combobox-item:visible:first');
				}
			} else {
				item = item.prevAll(firstSelector);
				// item = item.prevAll('div.combobox-item:visible:first');
				if (!item.length) {
					item = panel.children(lastSelector);
					// item = panel.children('div.combobox-item:visible:last');
				}
			}
		}
		if (item.length) {
			item.addClass('combobox-item-hover');
			var row = opts.finder.getRow(target, item);
			if (row) {
				scrollTo(target, row[opts.valueField]);
				if (opts.selectOnNavigation) {
					select(target, row[opts.valueField]);
				}
			}
		}
	}

	/**
	 * 选中某一项
	 */
	function select(target, value) {
		var state = $(target).data('combobox');
		var opts = state.options;
		var values = state.values;
		if ($.inArray(value, values)) {
			if (opts.multiple) {
				values.push(value);
			} else {
				values = [ value ];
			}
			state.values = values;
			setValues(target);
			opts.onSelect.call(target, state.data[getRowIndex(target, value)]);
		}
	}

	/**
	 * 取消某一项选中状态
	 */
	function unselect(target, value) {
		var state = $(target).data('combobox');
		var opts = state.options;
		var values = state.values;
		var index = $.inArray(value, values);
		if (index >= 0) {
			values.splice(index, 1);
			state.values = values;
			setValues(target);
			opts.onUnselect.call(target, state.data[getRowIndex(target, value)]);
		}
	}

	/**
	 * 设置组件值
	 */
	function setValues(target) {
		var state = $(target).data('combobox');
		var opts = state.options;
		var panel = state.panel;
		panel.find('div.combobox-item-selected').removeClass('combobox-item-selected');
		if (state.data.length) {
			var vv = [], ss = [];
			for (var i = 0; i < state.values.length; i++) {
				var v = state.values[i];
				var s = v;
				var rowIndex = getRowIndex(target, v);
				panel.children().eq(rowIndex).addClass('combobox-item-selected');
				var row = state.data[rowIndex];
				if (row) {
					s = row[opts.textField];
				}
				vv.push(v);
				ss.push(s);
			}
			$(target).val(ss.join(opts.separator));
		}
	}

	/**
	 * 加载数据
	 */
	function loadData(target, data) {
		var state = $(target).data('combobox');
		var opts = state.options;
		state.data = opts.loadFilter.call(target, data);
		state.groups = [];
		data = state.data;

		var selected = $(target).combobox('getValues');
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
					dd.push('<div class="combobox-group" value="' + v + '">');
					dd.push(opts.groupFormatter ? opts.groupFormatter.call(target, g) : g);
					dd.push('</div>');
				}
			} else {
				group = undefined;
			}

			dd.push('<div class="combobox-item" value="' + v + '">');
			dd.push(opts.formatter ? opts.formatter.call(target, row) : s);
			dd.push('</div>');
		}
		state.panel.html(dd.join(''));
		setValues(target);
		opts.onLoadSuccess.call(target, data);
	}

	/**
	 * 请求远程服务器数据
	 */
	function request(target, url) {
		var state = $(target).data('combobox');
		var opts = state.options;
		if (url) {
			opts.url = url;
		}
		if (opts.onBeforeLoad.call(target, opts.queryParams) == false)
			return;

		opts.loader.call(target, opts.queryParams, function(data) {
			loadData(target, data);
		}, function() {
			opts.onLoadError.apply(this, arguments);
		});
	}

	/**
	 * do the query action
	 */
	function doQuery(target, q) {
		var state = $.data(target, 'combobox');
		var opts = state.options;

		if (opts.multiple && !q) {
			setValues(target, [], true);
		} else {
			setValues(target, [ q ], true);
		}

		if (opts.mode == 'remote') {
			request(target, null, {
				q : q
			}, true);
		} else {
			var panel = $(target).combo('panel');
			panel.find('div.combobox-item-selected,div.combobox-item-hover').removeClass('combobox-item-selected combobox-item-hover');
			panel.find('div.combobox-item,div.combobox-group').hide();
			var data = state.data;
			var vv = [];
			var qq = opts.multiple ? q.split(opts.separator) : [ q ];
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
							item.addClass('combobox-item-selected');
						}
						if (opts.groupField && group != g) {
							$('#' + state.groupIdPrefix + '_' + $.inArray(g, state.groups)).show();
							group = g;
						}
					}
				}
			});
			setValues(target, vv, true);
		}
	}

	function doEnter(target) {
		var t = $(target);
		var opts = t.combobox('options');
		var panel = t.combobox('panel');
		var item = panel.children('div.combobox-item-hover');
		if (item.length) {
			var row = opts.finder.getRow(target, item);
			var value = row[opts.valueField];
			if (opts.multiple) {
				if (item.hasClass('combobox-item-selected')) {
					t.combobox('unselect', value);
				} else {
					t.combobox('select', value);
				}
			} else {
				t.combobox('select', value);
			}
		}
		var vv = [];
		$.map(t.combobox('getValues'), function(v) {
			if (getRowIndex(target, v) >= 0) {
				vv.push(v);
			}
		});
		t.combobox('setValues', vv);
		if (!opts.multiple) {
			t.combobox('hidePanel');
		}
	}

	/**
	 * 创建组件
	 */
	function create(target) {
		var state = $(target).data('combobox');
		var opts = state.options;
		state.values = [];

		$(document).unbind('.combobox').bind('mousedown.combobox mousewheel.combobox', function(e) {
			if ($(e.target).closest('.combobox-panel,.combobox,.combobox-arrow').length) {
				return;
			}
			$('.combobox').combobox('hidePanel');
		});
		$(target).addClass('combobox').css({
			width : opts.width,
			height : opts.height
		}).attr('comboName', $(target).attr('name')).removeAttr('name').addClass('combobox-f');
		if (!state.panel) {
			state.panel = $('<div class="combobox-panel"></div>').appendTo('body');
			state.panel.css({
				position : 'absolute',
				display : 'none',
				zIndex : 10000,
				width : opts.panelWidth ? opts.panelWidth : ($(target).width() + $(target).height() + 1),
				height : opts.panelHeight ? opts.panelHeight : 'auto'
			});
		}
		if (!state.downArrow) {
			state.downArrow = $('<span class="combobox-arrow"><span>').insertAfter(target);
			state.downArrow.css({
				width : opts.height,
				height : opts.height
			}).click(function(e) {
				state.panel.css({
					left : $(e.target).offset().left - $(target).outerWidth(),
					top : $(e.target).offset().top + $(target).outerHeight()
				});
				$(target).combobox('showPanel');
				opts.onShowPanel.call(target);
			});
		}
		state.panel.delegate('div.combobox-item', 'mouseenter', function(e) {
			$(this).addClass('combobox-item-hover');
			e.stopPropagation();
		}).delegate('div.combobox-item', 'mouseleave', function(e) {
			$(this).removeClass('combobox-item-hover');
			e.stopPropagation();
		}).delegate('div.combobox-item', 'click', function(e) {
			var rowIndex = getRowIndex(target, $(this).attr('value'));
			var value = $(this).attr('value');
			if (opts.multiple) {
				if ($(this).hasClass('combobox-item-selected')) {
					unselect(target, value);
				} else {
					select(target, value);
				}
			} else {
				select(target, value);
				$(target).combobox('hidePanel');
			}
			e.stopPropagation();
		});
	}

	$.fn.combobox = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.combobox.methods[options](this, param);
		}

		options = options || {};
		return this.each(function() {
			var state = $(this).data('combobox');
			if (state) {
				$.extend(state.options, options);
			} else {
				$(this).data('combobox', {
					options : $.extend({}, $.fn.combobox.defaults, $.fn.combobox.parseOptions(this), options),
					data : []
				});
				state = $(this).data('combobox');
			}
			create(this);
			if (state.options.data) {
				loadData(this, state.options.data);
			}
			request(this);
		});
	};

	$.fn.combobox.methods = {
		options : function(jq) {
			return $(jq[0]).data('combobox').options;
		},
		panel : function(jq) {
			return $(jq[0]).data('combobox').panel;
		},
		resize : function(jq) {
			return jq.each(function() {

			});
		},
		showPanel : function(jq) {
			return $(jq[0]).data('combobox').panel.show();
		},
		hidePanel : function(jq) {
			return jq.each(function(){
				$(this).data('combobox').panel.hide();
			});
		},
		disable : function(jq) {
			return jq.each(function() {

			});
		},
		enable : function(jq) {
			return jq.each(function() {

			});
		},
		readonly : function(jq) {
			return jq.each(function() {

			});
		},
		clear : function(jq) {
			return jq.each(function() {
				$(this).combo('clear');
				var panel = $(this).combo('panel');
				panel.find('div.combobox-item-selected').removeClass('combobox-item-selected');
			});
		},
		reset : function(jq) {
			return jq.each(function() {
				var opts = $(this).combobox('options');
				if (opts.multiple) {
					$(this).combobox('setValues', opts.originalValue);
				} else {
					$(this).combobox('setValue', opts.originalValue);
				}
			});
		},
		getText : function(jq) {
			return $(jq[0]).data('combobox').panel;
		},
		setText : function(jq) {
			return $(jq[0]).data('combobox').panel;
		},
		getValues : function(jq) {
			return $(jq[0]).data('combobox').values;
		},
		setValues : function(jq, values) {
			return jq.each(function() {
				$(this).data('combobox').values = values;
				setValues(this);
			});
		},
		getData : function(jq) {
			return $.data(jq[0], 'combobox').data;
		},
		loadData : function(jq, data) {
			return jq.each(function() {
				loadData(this, data);
			});
		},
		reload : function(jq, url) {
			return jq.each(function() {
				request(this, url);
			});
		}
	};
	$.fn.combobox.parseOptions = function(target) {
		return $.extend({}, $.parser.parseOptions(target, [ 'valueField', 'textField', 'groupField', 'mode', 'method', 'url' ]));
	};

	$.fn.combobox.defaults = {
		width : 'auto',
		height : 22,
		panelWidth : null,
		panelHeight : '200',
		multiple : false,
		selectOnNavigation : true,
		separator : ',',
		editable : true,
		disabled : false,
		readonly : false,
		value : '',
		delay : 200,
		valueField : 'value',
		textField : 'text',
		groupField : null,
		groupFormatter : function(group) {
			return group;
		},
		mode : 'local', // or 'remote'
		url : null,
		queryParams : {},
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
			left : function(e) {
			},
			right : function(e) {
			},
			enter : function(e) {
				doEnter(this)
			},
			query : function(q, e) {
				doQuery(this, q)
			}
		},
		filter : function(q, row) {
			var opts = $(this).combobox('options');
			return row[opts.textField].toLowerCase().indexOf(q.toLowerCase()) == 0;
		},
		formatter : function(row) {
			var opts = $(this).combobox('options');
			return row[opts.textField];
		},
		loader : function(param, success, error) {
			var opts = $(this).combobox('options');
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
				return $(target).data('combobox').panel.children().eq(index);
			},
			getRow : function(target, p) {
				var index = getRowIndex(target, value);
				return $(target).data('combobox').data[index];
			}
		},
		onShowPanel : function() {
		},
		onHidePanel : function() {
		},
		onChange : function(newValues, oldValues) {
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
