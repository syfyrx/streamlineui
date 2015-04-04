/**
 * jQuery StreamlineUI v1.0
 */
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
	$.messager = {
		alert : function(title, msg, icon, fn) {
			var mask= $('<div class="slui-mask"></div>');
			mask.css({
				width : getPageArea().width,
				height : getPageArea().height,
				display : 'none'
			});
			mask.appendTo(document.body);
			var messagerObj = $('<div class="slui-messager"></div>').appendTo('body').addClass('messager');
			var headerObj = $('<div class="messager-header"></div>').prependTo(messagerObj);
			var titleObj = $('<div class="messager-title"></div>').html(title).appendTo(headerObj);
			var aObj = $('<a href="javascript:void(0)"></a>').addClass('messager-close').appendTo(headerObj);
			aObj.bind('click.messager', function() {
				messagerObj.hide();
				messagerObj.remove();
				mask.remove();
				if (fn) {
					fn();
				}
			});
			var bodyObj = $('<div class="messager-body"></div>').appendTo(messagerObj);
			var iconObj = $('<div class="messager-icon"></div>').appendTo(bodyObj);
			if (icon) {
				iconObj.addClass('messager-icon-' + icon);
			}
			var contentObj = $('<div class="messager-content"></div>').appendTo(bodyObj);
			var msgObj = $('<div class="messager-info"></div>').appendTo(contentObj).html(msg);
			var toolObj = $('<div class="messager-tool"></div>').appendTo(contentObj);
			var cancelObj = $('<a href="javascript:void(0)"></a>').addClass('messager-button').appendTo(toolObj).html($.messager.defaults.cancel);
			cancelObj.bind('click.messager', function() {
				messagerObj.hide();
				messagerObj.remove();
				mask.remove();
				if (fn) {
					fn();
				}
			});
			bodyObj.css({
				width : $.messager.defaults.width,
				height : $.messager.defaults.height - headerObj.outerHeight()
			});
			messagerObj.css({
				width : $.messager.defaults.width,
				height : $.messager.defaults.height,
				left : Math.ceil((getPageArea().width - $.messager.defaults.width) / 2),
				top : Math.ceil((getPageArea().height - $.messager.defaults.height) / 2)
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
			var messagerObj = $('<div class="slui-messager"></div>').appendTo('body').addClass('messager');
			var headerObj = $('<div class="messager-header"></div>').prependTo(messagerObj);
			var titleObj = $('<div class="messager-title"></div>').html(title).appendTo(headerObj);
			var aObj = $('<a href="javascript:void(0)"></a>').addClass('messager-close').appendTo(headerObj);
			aObj.bind('click.messager', function() {
				messagerObj.hide();
				messagerObj.remove();
				mask.remove();
				if (fn) {
					fn(false);
				}
			});
			var bodyObj = $('<div class="messager-body"></div>').appendTo(messagerObj);
			var iconObj = $('<div class="messager-icon"></div>').appendTo(bodyObj).addClass('messager-icon-' + icon);
			var contentObj = $('<div class="messager-content"></div>').appendTo(bodyObj);
			var msgObj = $('<div class="messager-info"></div>').appendTo(contentObj).html(msg);
			var toolObj = $('<div class="messager-tool"></div>').appendTo(contentObj);
			var okObj = $('<a href="javascript:void(0)"></a>').addClass('messager-button').appendTo(toolObj).html($.messager.defaults.ok);
			okObj.bind('click.messager', function() {
				messagerObj.hide();
				messagerObj.remove();
				mask.remove();
				if (fn) {
					fn(true);
				}
			});
			var cancelObj = $('<a href="javascript:void(0)"></a>').addClass('messager-button').appendTo(toolObj).html($.messager.defaults.cancel);
			cancelObj.bind('click.messager', function() {
				messagerObj.hide();
				messagerObj.remove();
				mask.remove();
				if (fn) {
					fn(false);
				}
			});
			bodyObj.css({
				width : $.messager.defaults.width,
				height : $.messager.defaults.height - headerObj.outerHeight()
			});
			messagerObj.css({
				width : $.messager.defaults.width,
				height : $.messager.defaults.height,
				left : Math.ceil((getPageArea().width - $.messager.defaults.width) / 2),
				top : Math.ceil((getPageArea().height - $.messager.defaults.height) / 2)
			});
			mask.show();
		}
	};
	$.messager.defaults = {
		width : 450,
		height : 180,
		ok : "Ok",
		cancel : "Cancel"
	};
})(jQuery);
