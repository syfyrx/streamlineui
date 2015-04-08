if ($.fn.pagination) {
	$.fn.pagination.defaults.beforePageText = '第';
	$.fn.pagination.defaults.afterPageText = '共{pages}页';
	$.fn.pagination.defaults.displayMsg = '显示{from}到{to},共{total}记录';
}
if ($.fn.datagrid) {
	$.fn.datagrid.defaults.loadMsg = '正在处理，请稍待。。。';
}
if ($.fn.treegrid && $.fn.datagrid) {
	$.fn.treegrid.defaults.loadMsg = $.fn.datagrid.defaults.loadMsg;
}
if ($.messager) {
	$.messager.defaults.ok = '确定';
	$.messager.defaults.cancel = '取消';
}
if ($.fn.validate) {
	$.fn.validate.defaults.missingMessage = '该输入项为必输项';
	$.fn.validate.defaults.rules.email.message = '请输入有效的电子邮件地址';
	$.fn.validate.defaults.rules.url.message = '请输入有效的URL地址';
	$.fn.validate.defaults.rules.length.message = '输入内容长度必须介于{0}和{1}之间';
	$.fn.validate.defaults.rules.remote.message = '请修正该字段';
}
if ($.fn.numberbox) {
	$.fn.numberbox.defaults.missingMessage = '该输入项为必输项';
}
if ($.fn.combobox) {
	$.fn.combobox.defaults.missingMessage = '该输入项为必输项';
}
if ($.fn.combotree) {
	$.fn.combotree.defaults.missingMessage = '该输入项为必输项';
}
if ($.fn.combogrid) {
	$.fn.combogrid.defaults.missingMessage = '该输入项为必输项';
}
if ($.fn.datetimebox) {
	$.fn.datetimebox.defaults.weeks = [ '日', '一', '二', '三', '四', '五', '六' ];
	$.fn.datetimebox.defaults.months = [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ];
	$.fn.datetimebox.defaults.currentText = '今天';
	$.fn.datetimebox.defaults.closeText = '关闭';
	$.fn.datetimebox.defaults.okText = '确定';
	$.fn.datetimebox.defaults.missingMessage = '该输入项为必输项';
	$.fn.datetimebox.defaults.formatter = function(date) {
		var opts = $(this).data('datetimebox').options;
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		if (opts.showTimeSpinner == false) {
			return year + opts.dateSeparator + (month < 10 ? ('0' + month) : month) + opts.dateSeparator + (day < 10 ? ('0' + day) : day);
		} else {
			var hour = date.getHours();
			var minute = date.getMinutes();
			var seconds = date.getSeconds();
			return year + opts.dateSeparator + (month < 10 ? ('0' + month) : month) + opts.dateSeparator + (day < 10 ? ('0' + day) : day) + ' ' + (hour < 10 ? ('0' + hour) : hour) + opts.timeSeparator + (minute < 10 ? ('0' + minute) : minute) + (opts.showSeconds ? (opts.timeSeparator + (seconds < 10 ? ('0' + seconds) : seconds)) : '');
		}
	};
}
if ($.fn.datetimebox && $.fn.datebox) {
	$.extend($.fn.datetimebox.defaults, {
		currentText : $.fn.datebox.defaults.currentText,
		closeText : $.fn.datebox.defaults.closeText,
		okText : $.fn.datebox.defaults.okText,
		missingMessage : $.fn.datebox.defaults.missingMessage
	});
}
if ($.fn.datetimespinner) {
	$.fn.datetimespinner.defaults.selections = [ [ 0, 4 ], [ 5, 7 ], [ 8, 10 ], [ 11, 13 ], [ 14, 16 ], [ 17, 19 ] ]
}
