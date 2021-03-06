/*jQuery StreamLineUI v1.0*/
(function ($) {
	function drag(e) {
		var state = $(e.data.target).data('sldraggable');
		var opts = state.options;
		var proxy = state.proxy;

		var dragData = e.data;
		var left = dragData.startLeft + e.pageX - dragData.startX;
		var top = dragData.startTop + e.pageY - dragData.startY;

		if (proxy) {
			if (proxy.parent()[0] == document.body) {
				if (opts.deltaX != null && opts.deltaX != undefined) {
					left = e.pageX + opts.deltaX;
				} else {
					left = e.pageX - e.data.offsetWidth;
				}
				if (opts.deltaY != null && opts.deltaY != undefined) {
					top = e.pageY + opts.deltaY;
				} else {
					top = e.pageY - e.data.offsetHeight;
				}
			} else {
				if (opts.deltaX != null && opts.deltaX != undefined) {
					left += e.data.offsetWidth + opts.deltaX;
				}
				if (opts.deltaY != null && opts.deltaY != undefined) {
					top += e.data.offsetHeight + opts.deltaY;
				}
			}
		}
		if (e.data.parent != document.body) {
			left += $(e.data.parent).scrollLeft();
			top += $(e.data.parent).scrollTop();
		}

		if (opts.axis == 'h') {
			dragData.left = left;
		} else if (opts.axis == 'v') {
			dragData.top = top;
		} else {
			dragData.left = left;
			dragData.top = top;
		}
	}

	function applyDrag(e) {
		var state = $(e.data.target).data('sldraggable');
		var opts = state.options;
		var proxy = state.proxy;
		if (!proxy) {
			proxy = $(e.data.target);
		}
		proxy.css({
			left: e.data.left,
			top: e.data.top
		});
		$('body').css('cursor', opts.cursor);
	}

	function doDown(e) {
		$.fn.sldraggable.isDragging = true;
		var state = $(e.data.target).data('sldraggable');
		var opts = state.options;

		var droppables = $('.sldroppable').filter(function () {
			return e.data.target != this;
		}).filter(function () {
			var accept = $(this).data('sldroppable').options.accept;
			if (accept) {
				return $(accept).filter(function () {
					return this == e.data.target;
				}).length > 0;
			} else {
				return true;
			}
		});
		state.droppables = droppables;

		var proxy = state.proxy;
		if (!proxy) {
			if (opts.proxy) {
				if (opts.proxy == 'clone') {
					proxy = $(e.data.target).clone().insertAfter(e.data.target);
				} else {
					proxy = opts.proxy.call(e.data.target, e.data.target);
				}
				state.proxy = proxy;
			} else {
				proxy = $(e.data.target);
			}
		}

		proxy.css('position', 'absolute');
		drag(e);
		applyDrag(e);

		opts.onStartDrag.call(e.data.target, e);
		return false;
	}

	function doMove(e) {
		var state = $(e.data.target).data('sldraggable');
		drag(e);
		if (state.options.onDrag.call(e.data.target, e) != false) {
			applyDrag(e);
		}

		var source = e.data.target;
		state.droppables.each(function () {
			var dropObj = $(this);
			if (dropObj.sldroppable('options').disabled) {
				return;
			}

			var p2 = dropObj.offset();
			if (e.pageX > p2.left && e.pageX < p2.left + dropObj.outerWidth()
					&& e.pageY > p2.top && e.pageY < p2.top + dropObj.outerHeight()) {
				if (!this.entered) {
					$(this).trigger('_dragenter', [source]);
					this.entered = true;
				}
				$(this).trigger('_dragover', [source]);
			} else {
				if (this.entered) {
					$(this).trigger('_dragleave', [source]);
					this.entered = false;
				}
			}
		});

		return false;
	}

	function doUp(e) {
		$.fn.sldraggable.isDragging = false;
		doMove(e);

		var state = $(e.data.target).data('sldraggable');
		var proxy = state.proxy;
		var opts = state.options;
		if (opts.revert) {
			if (checkDrop() == true) {
				$(e.data.target).css({
					position: e.data.startPosition,
					left: e.data.startLeft,
					top: e.data.startTop
				});
			} else {
				if (proxy) {
					var left, top;
					if (proxy.parent()[0] == document.body) {
						left = e.data.startX - e.data.offsetWidth;
						top = e.data.startY - e.data.offsetHeight;
					} else {
						left = e.data.startLeft;
						top = e.data.startTop;
					}
					proxy.animate({
						left: left,
						top: top
					}, function () {
						removeProxy();
					});
				} else {
					$(e.data.target).animate({
						left: e.data.startLeft,
						top: e.data.startTop
					}, function () {
						$(e.data.target).css('position', e.data.startPosition);
					});
				}
			}
		} else {
			$(e.data.target).css({
				position: 'absolute',
				left: e.data.left,
				top: e.data.top
			});
			checkDrop();
		}

		opts.onStopDrag.call(e.data.target, e);

		$(document).unbind('.sldraggable');
		setTimeout(function () {
			$('body').css('cursor', '');
		}, 100);

		function removeProxy() {
			if (proxy) {
				proxy.remove();
			}
			state.proxy = null;
		}

		function checkDrop() {
			var dropped = false;
			state.droppables.each(function () {
				var dropObj = $(this);
				if (dropObj.sldroppable('options').disabled) {
					return;
				}

				var p2 = dropObj.offset();
				if (e.pageX > p2.left && e.pageX < p2.left + dropObj.outerWidth()
						&& e.pageY > p2.top && e.pageY < p2.top + dropObj.outerHeight()) {
					if (opts.revert) {
						$(e.data.target).css({
							position: e.data.startPosition,
							left: e.data.startLeft,
							top: e.data.startTop
						});
					}
					$(this).trigger('_drop', [e.data.target]);
					removeProxy();
					dropped = true;
					this.entered = false;
					return false;
				}
			});
			if (!dropped && !opts.revert) {
				removeProxy();
			}
			return dropped;
		}

		return false;
	}

	$.fn.sldraggable = function (options, param) {
		if (typeof options == 'string') {
			return $.fn.sldraggable.methods[options](this, param);
		}

		return this.each(function () {
			var opts;
			var state = $(this).data('sldraggable');
			if (state) {
				state.handle.unbind('.sldraggable');
				opts = $.extend(state.options, options);
			} else {
				opts = $.extend({}, $.fn.sldraggable.defaults, $.fn.sldraggable.parseOptions(this), options || {});
			}
			var handle = opts.handle ? (typeof opts.handle == 'string' ? $(opts.handle, this) : opts.handle) : $(this);

			$(this).data('sldraggable', {
				options: opts,
				handle: handle
			});

			if (opts.disabled) {
				$(this).css('cursor', '');
				return;
			}

			handle.unbind('.sldraggable').bind('mousemove.sldraggable', { target: this }, function (e) {
				if ($.fn.sldraggable.isDragging) {
					return;
				}
				var opts = $(e.data.target).data('sldraggable').options;
				if (checkArea(e)) {
					$(this).css('cursor', opts.cursor);
				} else {
					$(this).css('cursor', '');
				}
			}).bind('mouseleave.sldraggable', { target: this }, function (e) {
				$(this).css('cursor', '');
			}).bind('mousedown.sldraggable', { target: this }, function (e) {
				if (checkArea(e) == false)
					return;
				$(this).css('cursor', '');

				var position = $(e.data.target).position();
				var offset = $(e.data.target).offset();
				var data = {
					startPosition: $(e.data.target).css('position'),
					startLeft: position.left,
					startTop: position.top,
					left: position.left,
					top: position.top,
					startX: e.pageX,
					startY: e.pageY,
					offsetWidth: (e.pageX - offset.left),
					offsetHeight: (e.pageY - offset.top),
					target: e.data.target,
					parent: $(e.data.target).parent()[0]
				};

				$.extend(e.data, data);
				var opts = $(e.data.target).data('sldraggable').options;
				if (opts.onBeforeDrag.call(e.data.target, e) == false)
					return;

				$(document).bind('mousedown.sldraggable', e.data, doDown);
				$(document).bind('mousemove.sldraggable', e.data, doMove);
				$(document).bind('mouseup.sldraggable', e.data, doUp);
			});

			// check if the handle can be dragged
			function checkArea(e) {
				var state = $(e.data.target).data('sldraggable');
				var handle = state.handle;
				var offset = $(handle).offset();
				var width = $(handle).outerWidth();
				var height = $(handle).outerHeight();
				var t = e.pageY - offset.top;
				var r = offset.left + width - e.pageX;
				var b = offset.top + height - e.pageY;
				var l = e.pageX - offset.left;

				return Math.min(t, r, b, l) > state.options.edge;
			}

		});
	};

	$.fn.sldraggable.methods = {
		options: function (jq) {
			return $(jq[0]).data('sldraggable').options;
		},
		proxy: function (jq) {
			return $(jq[0]).data('sldraggable').proxy;
		},
		enable: function (jq) {
			return jq.each(function () {
				$(this).sldraggable({ disabled: false });
			});
		},
		disable: function (jq) {
			return jq.each(function () {
				$(this).sldraggable({ disabled: true });
			});
		}
	};

	$.fn.sldraggable.parseOptions = function (target) {
		var t = $(target);
		return $.extend({},
				$.slparser.parseOptions(target, ['cursor', 'handle', 'axis',
				       { 'revert': 'boolean', 'deltaX': 'number', 'deltaY': 'number', 'edge': 'number' }]), {
				       	disabled: (t.attr('disabled') ? true : undefined)
				       });
	};

	$.fn.sldraggable.defaults = {
		proxy: null,	// 'clone' or a function that will create the proxy object, the function has the source parameter that indicate the source object dragged.
		revert: false,
		cursor: 'move',
		deltaX: null,
		deltaY: null,
		handle: null,
		disabled: false,
		edge: 0,
		axis: null,	// v or h

		onBeforeDrag: function (e) { },
		onStartDrag: function (e) { },
		onDrag: function (e) { },
		onStopDrag: function (e) { }
	};

	$.fn.sldraggable.isDragging = false;

})(jQuery);
