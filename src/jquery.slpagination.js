/**
 * jQuery StreamlineUI v1.0
 * 依赖：slparser
 */
 (function ($) {
	/**
	 * 初始化分页控件
	 */
	 function init(target) {
	 	var state = $(target).data('slpagination');
	 	var opts = state.options;
	 	var bb=state.bb={};
	 	var table = $(target).addClass('slpagination').html('<table cellspacing="0" cellpadding="0" border="0"><tr></tr></table>');
	 	var tr = table.find('tr');
	 	var layout = $.extend([], opts.layout);
	 	if (!opts.showPageList) {
	 		removeLayout(layout, 'list');
	 	}
	 	if (!opts.showRefresh) {
	 		removeLayout(layout, 'refresh');
	 	}
	 	if (layout[0] == 'sep') {
	 		layout.shift();
	 	}
	 	if (layout[layout.length - 1] == 'sep') {
	 		layout.pop();
	 	}
	 	for (var layoutIndex = 0; layoutIndex < layout.length; layoutIndex++) {
	 		var str = layout[layoutIndex];
	 		if (str == 'list') {
	 			var ps = $('<select class="slpagination-page-list"></select>');
	 			ps.bind('change', function () {
	 				opts.pageSize = parseInt($(this).val());
	 				opts.onChangePageSize.call(target, opts.pageSize);
	 				changePage(target, opts.pageNumber);
	 			});
	 			for (var i = 0; i < opts.pageList.length; i++) {
	 				$('<option></option>').text(opts.pageList[i]).appendTo(ps);
	 			}
	 			$('<td></td>').append(ps).appendTo(tr);
	 		} else if(str == 'sep'){
	 			$('<td><div class="slpagination-btn-separator"></div></td>').appendTo(tr);
	 		} else if (str == 'first') {
	 			bb.first = setLayout('first');
	 		} else if (str == 'prev') {
	 			bb.prev = setLayout('prev');
	 		} else if (str == 'next') {
	 			bb.next = setLayout('next');
	 		} else if (str == 'last') {
	 			bb.last = setLayout('last');
	 		} else if (str == 'manual') {
	 			$('<span class="slpagination-text"></span>').html(opts.beforePageText).appendTo(tr).wrap('<td></td>');
	 			bb.num = $('<input class="slpagination-num" type="text" value="1">').appendTo(tr).wrap('<td></td>');
	 			bb.num.unbind('.slpagination').bind('keydown.slpagination', function (e) {
					if (e.keyCode == 13) {//回车响应
						var number = parseInt($(this).val()) || 1;
						changePage(target, number);
						return false;
					}
				}).bind('focusout.slpagination',function(e){
					var number = parseInt($(this).val()) || 1;
					changePage(target, number);
					return false;
				});
	 			bb.after = $('<span class="slpagination-text"></span>').appendTo(tr).wrap('<td></td>');
	 		} else if (str == 'refresh') {
	 			bb.refresh = setLayout('refresh');
	 		} else if (str == 'links') {
	 			$('<td class="slpagination-links"></td>').appendTo(tr);
	 		}
	 	}
	 	if (opts.controls) {
	 		$('<td><div class="slpagination-btn-separator"></div></td>').appendTo(tr);
	 		if ($.isArray(opts.controls)) {
	 			for (var i = 0; i < opts.controls.length; i++) {
	 				var control = opts.controls[i];
	 				if (control == "-") {
	 					$('<td><div class="slpagination-btn-separator"></div></td>').appendTo(tr);
	 				} else {
	 					var td = $('<td></td>').appendTo(tr);
	 					var a = $('<a href="javascript:void(0)" class="'+control.css+'">'+(control.text==undefined?'':control.text)+'</a>').appendTo(td);
	 					a[0].onclick = eval(control.handler || function () {
	 					});
	 				}
	 			}
	 		} else {
	 			var td = $('<td></td>').appendTo(tr);
	 			$(opts.controls).appendTo(td).show();
	 		}
	 	}
	 	$('<div class="slpagination-info"></div>').appendTo(table);
	 	$('<div style="clear:both;"></div>').appendTo(table);
		/**
		 * 添加分页布局按钮
		 */
		 function setLayout(str) {
		 	var control = opts.nav[str];
		 	var a = $('<a href="javascript:void(0)" class="'+control.css+'">'+control.text+'</a>').appendTo(tr);
		 	a.wrap("<td></td>");
		 	a.unbind(".slpagination").bind("click.slpagination", function () {
		 		control.handler.call(target);
		 	});
		 	return a;
		 };
		 function removeLayout(layout, param) {
		 	var index = $.inArray(param, layout);
		 	if (index >= 0) {
		 		layout.splice(index, 1);
		 	}
		 	return layout;
		 };
		};
	/**
	 * 切换到指定页
	 * pageNumber：指定的页码
	 */
	 function changePage(target, pageNumber) {
	 	var opts = $(target).data("slpagination").options;
	 	update(target, { pageNumber: pageNumber });
	 	opts.onSelectPage.call(target, opts.pageNumber, opts.pageSize);
	 };
	/**
	 * 更新分页控件
	 * param：object
	 */
	 function update(target, param) {
	 	var state = $(target).data('slpagination');
	 	var opts = state.options;
	 	var bb = state.bb;
	 	$.extend(opts, param || {});
	 	var ps = $(target).find('select.slpagination-page-list');
	 	if (ps.length) {
	 		ps.val(opts.pageSize);
	 	}
	 	var pageCount = Math.ceil(opts.total / opts.pageSize) || 1;
	 	if (opts.pageNumber < 1) {
	 		opts.pageNumber = 1;
	 	}
	 	if (opts.pageNumber > pageCount) {
	 		opts.pageNumber = pageCount;
	 	}
	 	if (opts.total == 0) {
	 		opts.pageNumber = 1;
	 		pageCount = 1;
	 	}

	 	if (bb.num) {
	 		bb.num.val(opts.pageNumber);
	 	}
	 	if (bb.after) {
	 		bb.after.html(opts.afterPageText.replace(/{pages}/, pageCount));
	 	}
	 	var td = $(target).find('td.slpagination-links');
	 	if (td.length) {
	 		td.empty();
			var numMin = opts.pageNumber - Math.floor(opts.links / 2);//分页链接的最小值
			if (numMin < 1) {
				numMin = 1;
			}
			var numMax = numMin + opts.links - 1;//分页链接的最大值
			if (numMax > pageCount) {
				numMax = pageCount;
			}
			numMin = numMax - opts.links + 1;
			if (numMin < 1) {
				numMin = 1;
			}
			for (var i = numMin; i <= numMax; i++) {
				var a = $('<a class="slpagination-link" href="javascript:void(0)">'+i+'</a>').appendTo(td);
				if (i == opts.pageNumber) {
					a.addClass('select');
				} else {
					//给其他未选中链接添加点击事件
					a.unbind('.slpagination').bind('click.slpagination', { pageNumber: i }, function (e) {
						changePage(target, e.data.pageNumber);
					});
				}
			}
		}
		var displayMsg = opts.displayMsg;
		displayMsg = displayMsg.replace(/{from}/, opts.total == 0 ? 0 : opts.pageSize * (opts.pageNumber - 1) + 1);
		displayMsg = displayMsg.replace(/{to}/, Math.min(opts.pageSize * (opts.pageNumber), opts.total));
		displayMsg = displayMsg.replace(/{total}/, opts.total);
		$(target).find("div.slpagination-info").html(displayMsg);
		if (bb.first) {
			if(opts.total==0||opts.pageNumber==1){
				bb.first.addClass('slpagination-disabled');
			}else{
				bb.first.removeClass('slpagination-disabled');
			}
		}
		if (bb.prev) {
			if(opts.total==0||opts.pageNumber==1){
				bb.prev.addClass('slpagination-disabled');
			}else{
				bb.prev.removeClass('slpagination-disabled');
			}
		}
		if (bb.next) {
			if(opts.pageNumber==pageCount){
				bb.next.addClass('slpagination-disabled');
			}else{
				bb.next.removeClass('slpagination-disabled');
			}
		}
		if (bb.last) {
			if(opts.pageNumber==pageCount){
				bb.last.addClass('slpagination-disabled');
			}else{
				bb.last.removeClass('slpagination-disabled');
			}
		}
		showLoading(target, opts.loading);
	};
	/**
	 * 显示正在加载	 
	 */
	 function showLoading(target, param) {
	 	var state = $(target).data("slpagination");
	 	var opts = state.options;
	 	opts.loading = param;
	 	if (opts.showRefresh && state.bb.refresh) {
	 		if(opts.loading){
	 			state.bb.refresh.addClass('slpagination-loading').removeClass('slpagination-load');
	 		}else{
	 			state.bb.refresh.addClass('slpagination-load').removeClass('slpagination-loading');
	 		}
	 	}
	 };
	 $.fn.slpagination = function (options, param) {
	 	if (typeof options == "string") {
	 		return $.fn.slpagination.methods[options](this, param);
	 	}
	 	options = options || {};
	 	return this.each(function () {
	 		var state = $(this).data('slpagination');
			if (state) {
				$.extend(state.options, options);
			} else {
				$(this).data('slpagination', {
					options: $.extend({}, $.fn.slpagination.defaults, $.fn.slpagination.parseOptions(this), options)
				});
				state =$(this).data('slpagination');
			}
	 		init(this);
	 		update(this);
	 	});
	 };
	 $.fn.slpagination.methods = {
	 	options: function (jq) {
	 		return $(jq[0]).data("slpagination").options;
	 	}, 
	 	loading: function (jq) {
	 		return jq.each(function () {
	 			showLoading(this, true);
	 		});
	 	}, 
	 	loaded: function (jq) {
	 		return jq.each(function () {
	 			showLoading(this, false);
	 		});
	 	}, 
	 	refresh: function (jq, param) {
	 		return jq.each(function () {
	 			update(this, param);
	 		});
	 	}, 
	 	select: function (jq, param) {
	 		return jq.each(function () {
	 			changePage(this, param);
	 		});
	 	}
	 };
	 $.fn.slpagination.parseOptions = function (target) {
	 	var t = $(target);
	 	return $.extend({}, $.slparser.parseOptions(target, [{ total: "number", pageSize: "number", pageNumber: "number", links: "number" }, { loading: "boolean", showPageList: "boolean", showRefresh: "boolean" }]), { pageList: (t.attr("pageList") ? eval(t.attr("pageList")) : undefined) });
	 };
	 $.fn.slpagination.defaults = {
	 	total: 1, 
	 	pageSize: 10, 
	 	pageNumber: 1, 
	 	pageList: [10, 20, 30, 50], 
	 	loading: false, 
	 	controls: null, 
	 	layout: ["list", "sep", "first", "prev", "sep", "manual", "sep", "next", "last", "sep", "refresh"],
	 	links: 10, 
	 	showPageList:true,
	 	showRefresh:true,
	 	beforePageText: "Page",
	 	afterPageText: "of {pages}",
	 	displayMsg: "Displaying {from} to {to} of {total} items",
	 	onSelectPage: function (pageNumber, pageSize) {
	 	}, onBeforeRefresh: function (pageNumber, pageSize) {
	 	}, onRefresh: function (pageNumber, pageSize) {
	 	}, onChangePageSize: function (pageSize) {
	 	}, 
	 	nav: {
	 		first: {
	 			text:'',
	 			css: "slpagination-first", 
	 			handler: function () {
	 				var opts = $(this).slpagination("options");
	 				if (opts.pageNumber > 1) {
	 					$(this).slpagination("select", 1);
	 				}
	 			}
	 		}, prev: {
	 			text:'',
	 			css: "slpagination-prev", 
	 			handler: function () {
	 				var opts = $(this).slpagination("options");
	 				if (opts.pageNumber > 1) {
	 					$(this).slpagination("select", opts.pageNumber - 1);
	 				}
	 			}
	 		}, next: {
	 			text:'',
	 			css: "slpagination-next", 
	 			handler: function () {
	 				var opts = $(this).slpagination("options");
	 				var pageCount = Math.ceil(opts.total / opts.pageSize);
	 				if (opts.pageNumber < pageCount) {
	 					$(this).slpagination("select", opts.pageNumber + 1);
	 				}
	 			}
	 		}, last: {
	 			text:'',
	 			css: "slpagination-last", 
	 			handler: function () {
	 				var opts = $(this).slpagination("options");
	 				var pageCount = Math.ceil(opts.total / opts.pageSize);
	 				if (opts.pageNumber < pageCount) {
	 					$(this).slpagination("select", pageCount);
	 				}
	 			}
	 		}, refresh: {
	 			text:'',
	 			css: "slpagination-load", 
	 			handler: function () {
	 				var opts = $(this).slpagination("options");
	 				if (opts.onBeforeRefresh.call(this, opts.pageNumber, opts.pageSize) != false) {
	 					$(this).slpagination("select", opts.pageNumber);
	 					opts.onRefresh.call(this, opts.pageNumber, opts.pageSize);
	 				}
	 			}
	 		}
	 	}
	 };
	})(jQuery);

