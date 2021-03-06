/**
 * jQuery StreamLineUI v1.0 依赖：slparser
 */
(function($) {
	function setSize(target, param) {
		var opts = $(target).data('sllinkbutton').options;
		if (param) {
			$.extend(opts, param);
		}
		if (opts.width) {
			$(target).css("width", opts.width);
		}
		if (opts.height) {
			$(target).css({
				"height" : opts.height,
				"line-height" : opts.height
			});
		}
	}

	function createButton(target) {
		var opts = $(target).data('sllinkbutton').options;
		var t = $(target).empty();

		t.addClass('l-btn').removeClass('l-btn-plain l-btn-selected l-btn-plain-selected');
		t.removeClass('l-btn-small l-btn-medium l-btn-large').addClass('l-btn-' + opts.size);
		if (opts.plain) {
			t.addClass('l-btn-plain')
		}
		if (opts.selected) {
			t.addClass(opts.plain ? 'l-btn-plain-selected' : 'l-btn-selected');
		}
		t.attr('group', opts.group || '');

		var inner = $('<span class="l-btn-content"></span>').html(opts.text).appendTo(t);
		if (opts.iconCls) {
			inner.addClass(opts.iconCls);
			if (opts.iconAlign == "left" || opts.iconAlign == "right") {
				inner.css("background-position-x", opts.iconAlign);
			} else if (opts.iconAlign == "top" || opts.iconAlign == "bottom") {
				inner.css("background-position-y", opts.iconAlign);
			}
		}
		if (opts.iconAlign) {
			inner.addClass("l-btn-icon-" + opts.iconAlign);
		}
		t.unbind('.sllinkbutton').bind('focus.sllinkbutton', function() {
			if (!opts.disabled) {
				$(this).addClass('l-btn-focus');
			}
		}).bind('blur.sllinkbutton', function() {
			$(this).removeClass('l-btn-focus');
		}).bind('click.sllinkbutton', function() {
			if (!opts.disabled) {
				if (opts.toggle) {
					if (opts.selected) {
						$(this).sllinkbutton('unselect');
					} else {
						$(this).sllinkbutton('select');
					}
				}
				opts.onClick.call(this);
			}
		});

		setSelected(target, opts.selected);
		setDisabled(target, opts.disabled);
	}

	function setSelected(target, selected) {
		var opts = $(target).data('sllinkbutton').options;
		if (selected) {
			if (opts.group) {
				$('a.l-btn[group="' + opts.group + '"]').each(function() {
					var o = $(this).sllinkbutton('options');
					if (o.toggle) {
						$(this).removeClass('l-btn-selected l-btn-plain-selected');
						o.selected = false;
					}
				});
			}
			$(target).addClass(opts.plain ? 'l-btn-plain-selected' : 'l-btn-selected');
			opts.selected = true;
		} else {
			if (!opts.group) {
				$(target).removeClass('l-btn-selected l-btn-plain-selected');
				opts.selected = false;
			}
		}
	}

	function setDisabled(target, disabled) {
		var state = $(target).data('sllinkbutton');
		var opts = state.options;
		$(target).removeClass('l-btn-disabled l-btn-plain-disabled');
		if (disabled) {
			opts.disabled = true;
			var href = $(target).attr('href');
			if (href) {
				state.href = href;
				$(target).attr('href', 'javascript:void(0)');
			}
			if (target.onclick) {
				state.onclick = target.onclick;
				target.onclick = null;
			}
			$(target).addClass(opts.plain ? "l-btn-plain-disabled" : "l-btn-disabled");
		} else {
			opts.disabled = false;
			if (state.href) {
				$(target).attr('href', state.href);
			}
			if (state.onclick) {
				target.onclick = state.onclick;
			}
		}
	}

	$.fn.sllinkbutton = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.sllinkbutton.methods[options](this, param);
		}

		options = options || {};
		return this.each(function() {
			var state = $(this).data('sllinkbutton');
			if (state) {
				$.extend(state.options, options);
			} else {
				$(this).data('sllinkbutton', {
					options : $.extend({}, $.fn.sllinkbutton.defaults, $.fn.sllinkbutton.parseOptions(this), options)
				});
				$(this).removeAttr('disabled');
			}
			createButton(this);
			setSize(this);
		});
	};

	$.fn.sllinkbutton.methods = {
		options : function(jq) {
			return $.data(jq[0], 'sllinkbutton').options;
		},
		resize : function(jq, param) {
			return jq.each(function() {
				setSize(this, param);
			});
		},
		enable : function(jq) {
			return jq.each(function() {
				setDisabled(this, false);
			});
		},
		disable : function(jq) {
			return jq.each(function() {
				setDisabled(this, true);
			});
		},
		select : function(jq) {
			return jq.each(function() {
				setSelected(this, true);
			});
		},
		unselect : function(jq) {
			return jq.each(function() {
				setSelected(this, false);
			});
		}
	};

	$.fn.sllinkbutton.parseOptions = function(target) {
		var t = $(target);
		var options = {};
		var s = $.trim(t.attr('data-options'));
		if (s) {
			if (s.substring(0, 1) != '{') {
				s = '{' + s + '}';
			}
			options = (new Function('return ' + s))();
		}
		return $.extend({}, options, {
			disabled : (t.attr('disabled') ? true : undefined),
			text : $.trim(t.html())
		});
	};

	$.fn.sllinkbutton.defaults = {
		disabled : false,
		toggle : false,
		selected : false,
		group : null,
		plain : false,
		text : '',
		iconCls : null,
		iconAlign : 'left',// left,right,top,bottom
		size : 'small', // small,medium,large
		onClick : function() {
		}
	};

})(jQuery);
