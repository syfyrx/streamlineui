/*jQuery StreamLineUI v1.0*/
(function ($) {
	$.fn.resizable = function (options, param) {
		if (typeof options == 'string') {
			return $.fn.resizable.methods[options](this, param);
		}
		return this.each(function () {
			var opts = null;
			var state = $(this).data('resizable');
			if (state) {
				$(this).unbind('.resizable');
				opts = $.extend(state.options, options || {});
			} else {
				opts = $.extend({}, $.fn.resizable.defaults, $.fn.resizable.parseOptions(this), options || {});
				$.data(this, 'resizable', {
					options: opts
				});
			}

			if (opts.disabled == true) {
				return;
			}

			// bind mouse event using namespace resizable
			$(this).bind('mousemove.resizable', { target: this }, function (e) {
				//				if (isResizing) return;
				if ($.fn.resizable.isResizing) { return }
				var dir = getDirection(e);
				if (dir == '') {
					$(e.data.target).css('cursor', '');
				} else {
					$(e.data.target).css('cursor', dir + '-resize');
				}
			}).bind('mouseleave.resizable', { target: this }, function (e) {
				$(e.data.target).css('cursor', '');
			}).bind('mousedown.resizable', { target: this }, function (e) {
				var dir = getDirection(e);
				if (dir == '') return;

				function getCssValue(css) {
					var val = parseInt($(e.data.target).css(css));
					if (isNaN(val)) {
						return 0;
					} else {
						return val;
					}
				}

				var data = {
					target: e.data.target,
					dir: dir,
					startLeft: getCssValue('left'),
					startTop: getCssValue('top'),
					left: getCssValue('left'),
					top: getCssValue('top'),
					startX: e.pageX,
					startY: e.pageY,
					startWidth: $(e.data.target).outerWidth(),
					startHeight: $(e.data.target).outerHeight(),
					width: $(e.data.target).outerWidth(),
					height: $(e.data.target).outerHeight(),
					deltaWidth: $(e.data.target).outerWidth() - $(e.data.target).width(),
					deltaHeight: $(e.data.target).outerHeight() - $(e.data.target).height()
				};
				$(document).bind('mousedown.resizable', data, doDown);
				$(document).bind('mousemove.resizable', data, doMove);
				$(document).bind('mouseup.resizable', data, doUp);
				$('body').css('cursor', dir + '-resize');
			});
		});
	};

	$.fn.resizable.defaults = {
		disabled: false,
		handles: 'n, e, s, w, ne, se, sw, nw, all',
		minWidth: 10,
		minHeight: 10,
		maxWidth: 10000,//$(document).width(),
		maxHeight: 10000,//$(document).height(),
		edge: 5,
		onStartResize: function (e) { },
		onResize: function (e) { },
		onStopResize: function (e) { }
	};
	$.fn.resizable.methods = {
		options: function (jq) {
			return $.data(jq[0], 'resizable').options;
		},
		enable: function (jq) {
			return jq.each(function () {
				$(this).resizable({ disabled: false });
			});
		},
		disable: function (jq) {
			return jq.each(function () {
				$(this).resizable({ disabled: true });
			});
		}
	};
})(jQuery);