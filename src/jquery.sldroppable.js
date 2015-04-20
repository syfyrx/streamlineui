/*jQuery StreamLineUI v1.0	依赖：slparser*/
(function($) {
	function init(target) {
		$(target).addClass('sldroppable');
		$(target).bind('_dragenter', function(e, source) {
 			$(target).data('sldroppable').options.onDragEnter.apply(target, [ e, source ]);
		});
		$(target).bind('_dragleave', function(e, source) {
			$(target).data('sldroppable').options.onDragLeave.apply(target, [ e, source ]);
		});
		$(target).bind('_dragover', function(e, source) {
			$(target).data('sldroppable').options.onDragOver.apply(target, [ e, source ]);
		});
		$(target).bind('_drop', function(e, source) {
			$(target).data('sldroppable').options.onDrop.apply(target, [ e, source ]);
		});
	}

	$.fn.sldroppable = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.sldroppable.methods[options](this, param);
		}
		options = options || {};
		return this.each(function() {
			var state = $(this).data('sldroppable');
			if (state) {
				$.extend(state.options, options);
			} else {
				init(this);
				$(this).data('sldroppable', {
					options : $.extend({}, $.fn.sldroppable.defaults, $.fn.sldroppable.parseOptions(this), options)
				});
			}
		});
	};

	$.fn.sldroppable.methods = {
		options : function(jq) {
			return $(jq[0]).data('sldroppable').options;
		},
		enable : function(jq) {
			return jq.each(function() {
				$(this).sldroppable({
					disabled : false
				});
			});
		},
		disable : function(jq) {
			return jq.each(function() {
				$(this).sldroppable({
					disabled : true
				});
			});
		}
	};

	$.fn.sldroppable.parseOptions = function(target) {
		var t = $(target);
		return $.extend({}, $.slparser.parseOptions(target, [ 'accept' ]), {
			disabled : (t.attr('disabled') ? true : undefined)
		});
	};

	$.fn.sldroppable.defaults = {
		accept : null,
		disabled : false,
		onDragEnter : function(e, source) {
		},
		onDragOver : function(e, source) {
		},
		onDragLeave : function(e, source) {
		},
		onDrop : function(e, source) {
		}
	};
})(jQuery);
