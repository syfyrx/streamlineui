/*jQuery StreamLineUI v1.0*/
(function ($) {
	$.fn.slresizable = function (options, param) {
		if (typeof options == 'string') {
			return $.fn.slresizable.methods[options](this, param);
		}
		return this.each(function () {
			var opts = null;
			var state = $(this).data('slresizable');
			if (state) {
				$(this).unbind('.slresizable');
				opts = $.extend(state.options, options || {});
			} else {
				opts = $.extend({}, $.fn.slresizable.defaults, $.fn.slresizable.parseOptions(this), options || {});
				$(this).data('slresizable', {
					options: opts
				});
			}

			if (opts.disabled == true) {
				return;
			}

			// bind mouse event using namespace slresizable
			$(this).bind('mousemove.slresizable', { target: this }, function (e) {
				if ($.fn.slresizable.isResizing) { return; }
				var dir = getDirection(e);
				if (dir == '') {
					$(e.data.target).css('cursor', '');
				} else {
					$(e.data.target).css('cursor', dir + '-resize');
				}
			}).bind('mouseleave.slresizable', { target: this }, function (e) {
				$(e.data.target).css('cursor', '');
			}).bind('mousedown.slresizable', { target: this }, function (e) {
				var dir = getDirection(e);
				if (dir == '')
					return;

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
				$(document).bind('mousedown.slresizable', data, doDown);
				$(document).bind('mousemove.slresizable', data, doMove);
				$(document).bind('mouseup.slresizable', data, doUp);
				$('body').css('cursor', dir + '-resize');
			});
			// get the resize direction
			function getDirection(e) {
				var tt = $(e.data.target);
				var dir = '';
				var offset = tt.offset();
				var width = tt.outerWidth();
				var height = tt.outerHeight();
				var edge = opts.edge;
				if (e.pageY > offset.top && e.pageY < offset.top + edge) {
					dir += 'n';
				} else if (e.pageY < offset.top + height && e.pageY > offset.top + height - edge) {
					dir += 's';
				}
				if (e.pageX > offset.left && e.pageX < offset.left + edge) {
					dir += 'w';
				} else if (e.pageX < offset.left + width && e.pageX > offset.left + width - edge) {
					dir += 'e';
				}

				var handles = opts.handles.split(',');
				for (var i = 0; i < handles.length; i++) {
					var handle = handles[i].replace(/(^\s*)|(\s*$)/g, '');
					if (handle == 'all' || handle == dir) {
						return dir;
					}
				}
				return '';
			}
		});

		function doDown(e) {
			$.fn.slresizable.isResizing = true;
			$(e.data.target).data('slresizable').options.onStartResize.call(e.data.target, e);
			return false;
		}

		function doMove(e) {
			resize(e);
			if ($(e.data.target).data('slresizable').options.onResize.call(e.data.target, e) != false) {
				applySize(e)
			}
			return false;
		}

		function doUp(e) {
			$.fn.slresizable.isResizing = false;
			resize(e, true);
			applySize(e);
			$(e.data.target).data('slresizable').options.onStopResize.call(e.data.target, e);
			$(document).unbind('.slresizable');
			$('body').css('cursor', '');
			return false;
		}

		function applySize(e) {
			var resizeData = e.data;
			var t = $(resizeData.target);
			t.css({
				left: resizeData.left,
				top: resizeData.top
			});
			if (t.outerWidth() != resizeData.width) { t._outerWidth(resizeData.width) }
			if (t.outerHeight() != resizeData.height) { t._outerHeight(resizeData.height) }
		}

		function resize(e) {
			var resizeData = e.data;
			var options = $(resizeData.target).data('slresizable').options;
			if (resizeData.dir.indexOf('e') != -1) {
				var width = resizeData.startWidth + e.pageX - resizeData.startX;
				width = Math.min(
							Math.max(width, options.minWidth),
							options.maxWidth
						);
				resizeData.width = width;
			}
			if (resizeData.dir.indexOf('s') != -1) {
				var height = resizeData.startHeight + e.pageY - resizeData.startY;
				height = Math.min(
						Math.max(height, options.minHeight),
						options.maxHeight
				);
				resizeData.height = height;
			}
			if (resizeData.dir.indexOf('w') != -1) {
				var width = resizeData.startWidth - e.pageX + resizeData.startX;
				width = Math.min(
							Math.max(width, options.minWidth),
							options.maxWidth
						);
				resizeData.width = width;
				resizeData.left = resizeData.startLeft + resizeData.startWidth - resizeData.width;
			}
			if (resizeData.dir.indexOf('n') != -1) {
				var height = resizeData.startHeight - e.pageY + resizeData.startY;
				height = Math.min(
							Math.max(height, options.minHeight),
							options.maxHeight
						);
				resizeData.height = height;
				resizeData.top = resizeData.startTop + resizeData.startHeight - resizeData.height;
			}
		}
	};
	$.fn.slresizable.parseOptions = function (target) {
		var t = $(target);
		return $.extend({},
				$.slparser.parseOptions(target, [
					'handles', { minWidth: 'number', minHeight: 'number', maxWidth: 'number', maxHeight: 'number', edge: 'number' }
				]), {
					disabled: (t.attr('disabled') ? true : undefined)
				})
	};

	$.fn.slresizable.defaults = {
		disabled: false,
		handles: 'n, e, s, w, ne, se, sw, nw, all',
		minWidth: 10,
		minHeight: 10,
		maxWidth: 10000,
		maxHeight: 10000,
		edge: 5,
		onStartResize: function (e) { },
		onResize: function (e) { },
		onStopResize: function (e) { }
	};

	$.fn.slresizable.isResizing = false;

	$.fn.slresizable.methods = {
		options: function (jq) {
			return $(jq[0]).data('slresizable').options;
		},
		enable: function (jq) {
			return jq.each(function () {
				$(this).slresizable({ disabled: false });
			});
		},
		disable: function (jq) {
			return jq.each(function () {
				$(this).slresizable({ disabled: true });
			});
		}
	};
})(jQuery);