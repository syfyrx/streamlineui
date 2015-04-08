if ($.fn.pagination) {
	$.fn.pagination.defaults.beforePageText = 'Page';
	$.fn.pagination.defaults.afterPageText = 'of {pages}';
	$.fn.pagination.defaults.displayMsg = 'Displaying {from} to {to} of {total} items';
}
if ($.fn.datagrid) {
	$.fn.datagrid.defaults.loadMsg = 'Processing, please wait ...';
}
if ($.fn.treegrid && $.fn.datagrid) {
	$.fn.treegrid.defaults.loadMsg = $.fn.datagrid.defaults.loadMsg;
}
if ($.messager) {
	$.messager.defaults.ok = 'Ok';
	$.messager.defaults.cancel = 'Cancel';
}
if ($.fn.validate) {
	$.fn.validate.defaults.missingMessage = 'This field is required.';
	$.fn.validate.defaults.rules.email.message = 'Please enter a valid email address.';
	$.fn.validate.defaults.rules.url.message = 'Please enter a valid URL.';
	$.fn.validate.defaults.rules.length.message = 'Please enter a value between {0} and {1}.';
	$.fn.validate.defaults.rules.remote.message = 'Please fix this field.';
}
if ($.fn.numberbox) {
	$.fn.numberbox.defaults.missingMessage = 'This field is required.';
}
if ($.fn.combobox) {
	$.fn.combobox.defaults.missingMessage = 'This field is required.';
}
if ($.fn.combotree) {
	$.fn.combotree.defaults.missingMessage = 'This field is required.';
}
if ($.fn.combogrid) {
	$.fn.combogrid.defaults.missingMessage = 'This field is required.';
}
if ($.fn.datetimebox) {
	$.fn.datetimebox.defaults.weeks = [ 'S', 'M', 'T', 'W', 'T', 'F', 'S' ];
	$.fn.datetimebox.defaults.months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
	$.fn.datetimebox.defaults.title='{month} {year}';
	$.fn.datetimebox.defaults.currentText = 'Today';
	$.fn.datetimebox.defaults.clearText = 'Clear';
	$.fn.datetimebox.defaults.okText = 'Ok';
	$.fn.datetimebox.defaults.missingMessage = 'This field is required.';
}
if ($.fn.datetimebox && $.fn.datebox) {
	$.extend($.fn.datetimebox.defaults, {
		currentText : $.fn.datebox.defaults.currentText,
		closeText : $.fn.datebox.defaults.closeText,
		okText : $.fn.datebox.defaults.okText,
		missingMessage : $.fn.datebox.defaults.missingMessage
	});
}
