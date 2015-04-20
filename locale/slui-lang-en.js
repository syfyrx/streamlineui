if ($.fn.slpagination) {
	$.fn.slpagination.defaults.beforePageText = 'Page';
	$.fn.slpagination.defaults.afterPageText = 'of {pages}';
	$.fn.slpagination.defaults.displayMsg = 'Displaying {from} to {to} of {total} items';
}
if ($.fn.sldatagrid) {
	$.fn.sldatagrid.defaults.loadMsg = 'Processing, please wait ...';
}
if ($.fn.sltreegrid && $.fn.datagrid) {
	$.fn.sltreegrid.defaults.loadMsg = $.fn.datagrid.defaults.loadMsg;
}
if ($.slmessager) {
	$.slmessager.defaults.ok = 'Ok';
	$.slmessager.defaults.cancel = 'Cancel';
}
if ($.fn.slvalidate) {
	$.fn.slvalidate.defaults.missingMessage = 'This field is required.';
	$.fn.slvalidate.defaults.rules.email.message = 'Please enter a valid email address.';
	$.fn.slvalidate.defaults.rules.url.message = 'Please enter a valid URL.';
	$.fn.slvalidate.defaults.rules.length.message = 'Please enter a value between {0} and {1}.';
	$.fn.slvalidate.defaults.rules.remote.message = 'Please fix this field.';
}
if ($.fn.slnumberbox) {
	$.fn.slnumberbox.defaults.missingMessage = 'This field is required.';
}
if ($.fn.slcombobox) {
	$.fn.slcombobox.defaults.missingMessage = 'This field is required.';
}
if ($.fn.slcombotree) {
	$.fn.slcombotree.defaults.missingMessage = 'This field is required.';
}
if ($.fn.slcombogrid) {
	$.fn.slcombogrid.defaults.missingMessage = 'This field is required.';
}
if ($.fn.sldatetimebox) {
	$.fn.sldatetimebox.defaults.weeks = [ 'S', 'M', 'T', 'W', 'T', 'F', 'S' ];
	$.fn.sldatetimebox.defaults.months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
	$.fn.sldatetimebox.defaults.title='{month} {year}';
	$.fn.sldatetimebox.defaults.currentText = 'Today';
	$.fn.sldatetimebox.defaults.clearText = 'Clear';
	$.fn.sldatetimebox.defaults.okText = 'Ok';
	$.fn.sldatetimebox.defaults.missingMessage = 'This field is required.';
}
if ($.fn.sldatetimebox && $.fn.datebox) {
	$.extend($.fn.sldatetimebox.defaults, {
		currentText : $.fn.sldatebox.defaults.currentText,
		closeText : $.fn.sldatebox.defaults.closeText,
		okText : $.fn.sldatebox.defaults.okText,
		missingMessage : $.fn.sldatebox.defaults.missingMessage
	});
}
