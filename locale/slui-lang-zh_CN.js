if ($.fn.slpagination) {
	$.fn.slpagination.defaults.beforePageText = '第';
	$.fn.slpagination.defaults.afterPageText = '共{pages}页';
	$.fn.slpagination.defaults.displayMsg = '显示{from}到{to},共{total}记录';
}
if ($.fn.sldatagrid) {
	$.fn.sldatagrid.defaults.loadMsg = '正在处理，请稍待。。。';
}
if ($.fn.sltreegrid && $.fn.datagrid) {
	$.fn.sltreegrid.defaults.loadMsg = $.fn.datagrid.defaults.loadMsg;
}
if ($.slmessager) {
	$.slmessager.defaults.ok = '确定';
	$.slmessager.defaults.cancel = '取消';
}
if ($.fn.slvalidate) {
	$.fn.slvalidate.defaults.missingMessage = '该输入项为必输项';
	$.fn.slvalidate.defaults.rules.email.message = '请输入有效的电子邮件地址';
	$.fn.slvalidate.defaults.rules.url.message = '请输入有效的URL地址';
	$.fn.slvalidate.defaults.rules.length.message = '输入内容长度必须介于{0}和{1}之间';
	$.fn.slvalidate.defaults.rules.remote.message = '请修正该字段';
}
if ($.fn.slnumberbox) {
	$.fn.slnumberbox.defaults.missingMessage = '该输入项为必输项';
}
if ($.fn.slcombobox) {
	$.fn.slcombobox.defaults.missingMessage = '该输入项为必输项';
}
if ($.fn.slcombotree) {
	$.fn.slcombotree.defaults.missingMessage = '该输入项为必输项';
}
if ($.fn.slcombogrid) {
	$.fn.slcombogrid.defaults.missingMessage = '该输入项为必输项';
}
if ($.fn.sldatetimebox) {
	$.fn.sldatetimebox.defaults.weeks = [ '日', '一', '二', '三', '四', '五', '六' ];
	$.fn.sldatetimebox.defaults.months = [ '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月' ];
	$.fn.sldatetimebox.defaults.title='{year}年{month}';
	$.fn.sldatetimebox.defaults.currentText = '今天';
	$.fn.sldatetimebox.defaults.clearText = '清除';
	$.fn.sldatetimebox.defaults.okText = '确定';
	$.fn.sldatetimebox.defaults.missingMessage = '该输入项为必输项';
	$.fn.sldatetimebox.defaults.formatter = function(date) {
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
if ($.fn.sldatetimebox && $.fn.datebox) {
	$.extend($.fn.sldatetimebox.defaults, {
		currentText : $.fn.sldatebox.defaults.currentText,
		closeText : $.fn.sldatebox.defaults.closeText,
		okText : $.fn.sldatebox.defaults.okText,
		missingMessage : $.fn.sldatebox.defaults.missingMessage
	});
}
if ($.fn.sldatetimespinner) {
	$.fn.sldatetimespinner.defaults.selections = [ [ 0, 4 ], [ 5, 7 ], [ 8, 10 ], [ 11, 13 ], [ 14, 16 ], [ 17, 19 ] ]
}
