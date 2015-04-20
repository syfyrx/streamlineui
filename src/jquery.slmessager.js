// jQuery StreamlineUI v1.0
(function($) {
	function getPageArea() {
		if (document.compatMode == 'BackCompat') {
			return {
				width : Math.max(document.body.scrollWidth, document.body.clientWidth),
				height : Math.max(document.body.scrollHeight, document.body.clientHeight)
			}
		} else {
			return {
				width : Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth),
				height : Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight)
			}
		}
	}
	$.slmessager = {
		alert : function(title, msg, icon, fn) {
			var mask = $('<div class="slui-mask"></div>');
			mask.css({
				width : getPageArea().width,
				height : getPageArea().height,
				display : 'none'
			});
			mask.appendTo(document.body);
			var messagerObj = $('<div class="slui-messager"></div>').appendTo('body').addClass('slmessager');
			var headerObj = $('<div class="slmessager-header"></div>').prependTo(messagerObj);
			var titleObj = $('<div class="slmessager-title"></div>').html(title).appendTo(headerObj);
			var aObj = $('<a href="javascript:void(0)"></a>').addClass('slmessager-close').appendTo(headerObj);
			aObj.bind('click.slmessager', function() {
				messagerObj.hide();
				messagerObj.remove();
				mask.remove();
				if (fn) {
					fn();
				}
			});
			var bodyObj = $('<div class="slmessager-body"></div>').appendTo(messagerObj);
			var iconObj = $('<div class="slmessager-icon"></div>').appendTo(bodyObj);
			if (icon) {
				iconObj.addClass('slmessager-icon-' + icon);
			}
			var contentObj = $('<div class="slmessager-content"></div>').appendTo(bodyObj);
			var msgObj = $('<div class="slmessager-info"></div>').appendTo(contentObj).html(msg);
			var toolObj = $('<div class="slmessager-tool"></div>').appendTo(contentObj);
			var cancelObj = $('<a href="javascript:void(0)"></a>').addClass('slmessager-button').appendTo(toolObj).html($.slmessager.defaults.ok);
			cancelObj.unbind('.slmessager').bind('click.slmessager', function() {
				messagerObj.hide();
				messagerObj.remove();
				mask.remove();
				if (fn) {
					fn();
				}
			}).bind('blur.slmessager', function() {
				$(this).focus();
			}).focus();
			bodyObj.css({
				width : $.slmessager.defaults.width,
				height : $.slmessager.defaults.height - headerObj.outerHeight()
			});
			messagerObj.css({
				width : $.slmessager.defaults.width,
				height : $.slmessager.defaults.height,
				left : Math.ceil((getPageArea().width - $.slmessager.defaults.width) / 2),
				top : Math.ceil((getPageArea().height - $.slmessager.defaults.height) / 2)
			});
			mask.show();
		},
		confirm : function(title, msg, icon, fn) {
			var mask = $('<div class="slui-mask"></div>');
			mask.css({
				width : getPageArea().width,
				height : getPageArea().height,
				display : 'none'
			});
			mask.appendTo(document.body);
			var messagerObj = $('<div class="slui-messager"></div>').appendTo('body').addClass('slmessager');
			var headerObj = $('<div class="slmessager-header"></div>').prependTo(messagerObj);
			var titleObj = $('<div class="slmessager-title"></div>').html(title).appendTo(headerObj);
			var aObj = $('<a href="javascript:void(0)"></a>').addClass('slmessager-close').appendTo(headerObj);
			aObj.bind('click.slmessager', function() {
				messagerObj.hide();
				messagerObj.remove();
				mask.remove();
				if (fn) {
					fn(false);
				}
			});
			var bodyObj = $('<div class="slmessager-body"></div>').appendTo(messagerObj);
			var iconObj = $('<div class="slmessager-icon"></div>').appendTo(bodyObj).addClass('slmessager-icon-' + icon);
			var contentObj = $('<div class="slmessager-content"></div>').appendTo(bodyObj);
			var msgObj = $('<div class="slmessager-info"></div>').appendTo(contentObj).html(msg);
			var toolObj = $('<div class="slmessager-tool"></div>').appendTo(contentObj);
			var okObj = $('<a href="javascript:void(0)"></a>').addClass('slmessager-button').appendTo(toolObj).html($.slmessager.defaults.ok);
			okObj.bind('click.slmessager', function() {
				messagerObj.hide();
				messagerObj.remove();
				mask.remove();
				if (fn) {
					fn(true);
				}
			});
			var cancelObj = $('<a href="javascript:void(0)"></a>').addClass('slmessager-button').appendTo(toolObj).html($.slmessager.defaults.cancel);
			cancelObj.bind('click.slmessager', function() {
				messagerObj.hide();
				messagerObj.remove();
				mask.remove();
				if (fn) {
					fn(false);
				}
			});
			bodyObj.css({
				width : $.slmessager.defaults.width,
				height : $.slmessager.defaults.height - headerObj.outerHeight()
			});
			messagerObj.css({
				width : $.slmessager.defaults.width,
				height : $.slmessager.defaults.height,
				left : Math.ceil((getPageArea().width - $.slmessager.defaults.width) / 2),
				top : Math.ceil((getPageArea().height - $.slmessager.defaults.height) / 2)
			});
			mask.show();
		}
	};
	$.slmessager.defaults = {
		width : 450,
		height : 180,
		ok : "Ok",
		cancel : "Cancel"
	};
})(jQuery);
