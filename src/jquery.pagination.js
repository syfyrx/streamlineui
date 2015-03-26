/**
 * jQuery StreamlineUI v1.0
 * 依赖：parser
 */
 (function ($) {
	/**
	 * 初始化分页控件
	 */
	 function init(target) {
	 	var state = $(target).data('pagination');
	 	var opts = state.options;
	 	var bb=state.bb={};
	 	var table = $(target).addClass('pagination').html('<table cellspacing="0" cellpadding="0" border="0"><tr></tr></table>');
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
	 			var ps = $('<select class="pagination-page-list"></select>');
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
	 			$('<td><div class="pagination-btn-separator"></div></td>').appendTo(tr);
	 		} else if (str == 'first') {
	 			bb.first = setLayout('first');
	 		} else if (str == 'prev') {
	 			bb.prev = setLayout('prev');
	 		} else if (str == 'next') {
	 			bb.next = setLayout('next');
	 		} else if (str == 'last') {
	 			bb.last = setLayout('last');
	 		} else if (str == 'manual') {
	 			$('<span class="pagination-text"></span>').html(opts.beforePageText).appendTo(tr).wrap('<td></td>');
	 			bb.num = $('<input class="pagination-num" type="text" value="1">').appendTo(tr).wrap('<td></td>');
	 			bb.num.unbind('.pagination').bind('keydown.pagination', function (e) {
					if (e.keyCode == 13) {//回车响应
						var number = parseInt($(this).val()) || 1;
						changePage(target, number);
						return false;
					}
				}).bind('focusout.pagination',function(e){
					var number = parseInt($(this).val()) || 1;
					changePage(target, number);
					return false;
				});
	 			bb.after = $('<span class="pagination-text"></span>').appendTo(tr).wrap('<td></td>');
	 		} else if (str == 'refresh') {
	 			bb.refresh = setLayout('refresh');
	 		} else if (str == 'links') {
	 			$('<td class="pagination-links"></td>').appendTo(tr);
	 		}
	 	}
	 	if (opts.controls) {
	 		$('<td><div class="pagination-btn-separator"></div></td>').appendTo(tr);
	 		if ($.isArray(opts.controls)) {
	 			for (var i = 0; i < opts.controls.length; i++) {
	 				var control = opts.controls[i];
	 				if (control == "-") {
	 					$('<td><div class="pagination-btn-separator"></div></td>').appendTo(tr);
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
	 	$('<div class="pagination-info"></div>').appendTo(table);
	 	$('<div style="clear:both;"></div>').appendTo(table);
		/**
		 * 添加分页布局按钮
		 */
		 function setLayout(str) {
		 	var control = opts.nav[str];
		 	var a = $('<a href="javascript:void(0)" class="'+control.css+'">'+control.text+'</a>').appendTo(tr);
		 	a.wrap("<td></td>");
		 	a.unbind(".pagination").bind("click.pagination", function () {
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
	 	var opts = $(target).data("pagination").options;
	 	update(target, { pageNumber: pageNumber });
	 	opts.onSelectPage.call(target, opts.pageNumber, opts.pageSize);
	 };
	/**
	 * 更新分页控件
	 * param：object
	 */
	 function update(target, param) {
	 	var state = $(target).data('pagination');
	 	var opts = state.options;
	 	var bb = state.bb;
	 	$.extend(opts, param || {});
	 	var ps = $(target).find('select.pagination-page-list');
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
	 	var td = $(target).find('td.pagination-links');
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
				var a = $('<a class="pagination-link" href="javascript:void(0)">'+i+'</a>').appendTo(td);
				if (i == opts.pageNumber) {
					a.addClass('select');
				} else {
					//给其他未选中链接添加点击事件
					a.unbind('.pagination').bind('click.pagination', { pageNumber: i }, function (e) {
						changePage(target, e.data.pageNumber);
					});
				}
			}
		}
		var displayMsg = opts.displayMsg;
		displayMsg = displayMsg.replace(/{from}/, opts.total == 0 ? 0 : opts.pageSize * (opts.pageNumber - 1) + 1);
		displayMsg = displayMsg.replace(/{to}/, Math.min(opts.pageSize * (opts.pageNumber), opts.total));
		displayMsg = displayMsg.replace(/{total}/, opts.total);
		$(target).find("div.pagination-info").html(displayMsg);
		if (bb.first) {
			if(opts.total==0||opts.pageNumber==1){
				bb.first.addClass('pagination-disabled');
			}else{
				bb.first.removeClass('pagination-disabled');
			}
		}
		if (bb.prev) {
			if(opts.total==0||opts.pageNumber==1){
				bb.prev.addClass('pagination-disabled');
			}else{
				bb.prev.removeClass('pagination-disabled');
			}
		}
		if (bb.next) {
			if(opts.pageNumber==pageCount){
				bb.next.addClass('pagination-disabled');
			}else{
				bb.next.removeClass('pagination-disabled');
			}
		}
		if (bb.last) {
			if(opts.pageNumber==pageCount){
				bb.last.addClass('pagination-disabled');
			}else{
				bb.last.removeClass('pagination-disabled');
			}
		}
		showLoading(target, opts.loading);
	};
	/**
	 * 显示正在加载	 
	 */
	 function showLoading(target, param) {
	 	var state = $(target).data("pagination");
	 	var opts = state.options;
	 	opts.loading = param;
	 	if (opts.showRefresh && state.bb.refresh) {
	 		if(opts.loading){
	 			state.bb.refresh.addClass('pagination-loading').removeClass('pagination-load');
	 		}else{
	 			state.bb.refresh.addClass('pagination-load').removeClass('pagination-loading');
	 		}
	 	}
	 };
	 $.fn.pagination = function (options, param) {
	 	if (typeof options == "string") {
	 		return $.fn.pagination.methods[options](this, param);
	 	}
	 	options = options || {};
	 	return this.each(function () {
	 		var state = $(this).data('pagination');
			if (state) {
				$.extend(state.options, options);
			} else {
				$(this).data('pagination', {
					options: $.extend({}, $.fn.pagination.defaults, $.fn.pagination.parseOptions(this), options)
				});
				state =$(this).data('pagination');
			}
	 		init(this);
	 		update(this);
	 	});
	 };
	 $.fn.pagination.methods = {
	 	options: function (jq) {
	 		return $(jq[0]).data("pagination").options;
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
	 $.fn.pagination.parseOptions = function (target) {
	 	var t = $(target);
	 	return $.extend({}, $.parser.parseOptions(target, [{ total: "number", pageSize: "number", pageNumber: "number", links: "number" }, { loading: "boolean", showPageList: "boolean", showRefresh: "boolean" }]), { pageList: (t.attr("pageList") ? eval(t.attr("pageList")) : undefined) });
	 };
	 $.fn.pagination.defaults = {
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
	 			css: "pagination-first", 
	 			handler: function () {
	 				var opts = $(this).pagination("options");
	 				if (opts.pageNumber > 1) {
	 					$(this).pagination("select", 1);
	 				}
	 			}
	 		}, prev: {
	 			text:'',
	 			css: "pagination-prev", 
	 			handler: function () {
	 				var opts = $(this).pagination("options");
	 				if (opts.pageNumber > 1) {
	 					$(this).pagination("select", opts.pageNumber - 1);
	 				}
	 			}
	 		}, next: {
	 			text:'',
	 			css: "pagination-next", 
	 			handler: function () {
	 				var opts = $(this).pagination("options");
	 				var pageCount = Math.ceil(opts.total / opts.pageSize);
	 				if (opts.pageNumber < pageCount) {
	 					$(this).pagination("select", opts.pageNumber + 1);
	 				}
	 			}
	 		}, last: {
	 			text:'',
	 			css: "pagination-last", 
	 			handler: function () {
	 				var opts = $(this).pagination("options");
	 				var pageCount = Math.ceil(opts.total / opts.pageSize);
	 				if (opts.pageNumber < pageCount) {
	 					$(this).pagination("select", pageCount);
	 				}
	 			}
	 		}, refresh: {
	 			text:'',
	 			css: "pagination-load", 
	 			handler: function () {
	 				var opts = $(this).pagination("options");
	 				if (opts.onBeforeRefresh.call(this, opts.pageNumber, opts.pageSize) != false) {
	 					$(this).pagination("select", opts.pageNumber);
	 					opts.onRefresh.call(this, opts.pageNumber, opts.pageSize);
	 				}
	 			}
	 		}
	 	}
	 };
	})(jQuery);

