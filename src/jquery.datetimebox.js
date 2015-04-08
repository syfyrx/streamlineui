/*jQuery StreamLineUI v1.0*/
(function($) {
	function create(target) {
		var state = $(target).data('datetimebox');
		var opts = state.options;
		// 点击组件外部时隐藏组件
		$(document).unbind('.datetimebox').bind('mousedown.datetimebox mousewheel.datetimebox', function(e) {
			if ($(e.target).closest('.datetimebox-panel,.datetimebox,.datetimebox-arrow').length) {
				return;
			}
			$('.datetimebox-panel').hide();
		});

		var arrow = $('<a href="javascript:void(0)"></a>').addClass('datetimebox-arrow').css({
			width : opts.height,
			height : opts.height
		}).insertAfter(target);
		arrow.click(function() {
			if (!opts.disabled) {
				createCalendar(target);
				createTimeSpinner(target);
				createButton(target);
				if (opts.showTimeSpinner) {// 显示时间微调
					$('.datetimebox-timespinner', state.panel).css({
						'display' : 'block'
					});
				} else {
					$('.datetimebox-timespinner', state.panel).css({
						'display' : 'none'
					});
				}
				if (opts.showSeconds) {// 显示秒钟信息
					$('.datetimebox-timespinner-seconds', state.panel).css({
						'display' : 'inline-block'
					}).prev('.datetimebox-timespinner-separator').css({
						'display' : 'inline-block'
					});
				} else {
					$('.datetimebox-timespinner-seconds', state.panel).css({
						'display' : 'none'
					}).prev('.datetimebox-timespinner-separator').css({
						'display' : 'none'
					});
				}
				state.panel.show();
			}
		});
		$(target).addClass('datetimebox').css({
			width : opts.width - opts.height - $(target).css('padding-left').replace('px', '') - $(target).css('padding-right').replace('px', '') - arrow.css('border-right-width').replace('px', ''),
			height : opts.height
		}).attr('readonly', 'readonly');
		var panel = null;
		if ($('.datetimebox-panel').length > 0) {
			panel = $('.datetimebox-panel');
			state.panel = panel;
		} else {
			panel = $('<div></div>').css({
				display : 'none',
				position : 'absolute',
				zIndex : 10000
			}).addClass('datetimebox-panel').appendTo('body');
			var header = $('<div class="datetimebox-header">' + '<a class="datetimebox-prevyear"></a>' + '<a class="datetimebox-prevmonth"></a>' + '<span class="datetimebox-title"></span>' + '<a class="datetimebox-nextmonth"></a>' + '<a class="datetimebox-nextyear"></a>').appendTo(panel);
			var body = $('<div class="datetimebox-body"></div>').appendTo(panel);
			state.panel = panel;

		}
		if (opts.disabled) {
			$(target).attr('disabled', 'disabled');
		}
		$(header).find('.datetimebox-nextmonth').click(function() {
			showMonth(target, 1);
		});
		$(header).find('.datetimebox-prevmonth').click(function() {
			showMonth(target, -1);
		});
		$(header).find('.datetimebox-nextyear').click(function() {
			showYear(target, 1);
		});
		$(header).find('.datetimebox-prevyear').click(function() {
			showYear(target, -1);
		});
	}
	// 显示指定月份
	function showMonth(target, delta) {
		var opts = $(target).data('datetimebox').options;
		opts.month += delta;
		if (opts.month > 12) {
			opts.year++;
			opts.month = 1;
		} else if (opts.month < 1) {
			opts.year--;
			opts.month = 12;
		}
		createCalendar(target);
	}
	// 显示指定年份
	function showYear(target, delta) {
		var opts = $(target).data('datetimebox').options;
		opts.year += delta;
		createCalendar(target);
	}
	// 创建日历
	function createCalendar(target) {
		var state = $(target).data('datetimebox');
		var opts = state.options;
		var panel = state.panel;
		var header = $(panel).find('.datetimebox-header');
		var body = $(panel).find('.datetimebox-body');
		var now = new Date();
		var todayInfo = now.getFullYear() + ',' + (now.getMonth() + 1) + ',' + now.getDate();
		var currentInfo = '';
		if (state.value) {
			currentInfo = state.value[0] + ',' + state.value[1] + ',' + state.value[2];
		} else {
			currentInfo = now.getFullYear() + ',' + (now.getMonth() + 1) + ',' + now.getDate();
		}
		// saturday 和 sunday 的索引
		var saIndex = 6 - opts.firstDay;
		var suIndex = saIndex + 1;
		if (saIndex >= 7)
			saIndex -= 7;
		if (suIndex >= 7)
			suIndex -= 7;

		$(header).find('.datetimebox-title').html(opts.months[opts.month - 1] + ' ' + opts.year);
		body.children('table').remove();
		var data = [ '<table class="datetimebox-calendar" cellspacing="0" cellpadding="0" border="0">' ];
		data.push('<thead><tr>');
		for (var i = opts.firstDay; i < opts.weeks.length; i++) {
			data.push('<th>' + opts.weeks[i] + '</th>');
		}
		for (var i = 0; i < opts.firstDay; i++) {
			data.push('<th>' + opts.weeks[i] + '</th>');
		}
		data.push('</tr></thead>');
		data.push('<tbody>');
		var weeks = getWeeks(target, opts.year, opts.month);
		for (var i = 0; i < weeks.length; i++) {
			var week = weeks[i];
			var cls = '';
			if (i == 0) {
				cls = 'datetimebox-first';
			} else if (i == weeks.length - 1) {
				cls = 'datetimebox-last';
			}
			data.push('<tr class="' + cls + '">');
			for (var j = 0; j < week.length; j++) {
				var day = week[j];
				var s = day[0] + ',' + day[1] + ',' + day[2];
				var d = day[2];
				var cls = 'datetimebox-day';
				if (!(opts.year == day[0] && opts.month == day[1])) {
					cls += ' datetimebox-other-month';
				}
				if (s == todayInfo) {
					cls += ' datetimebox-today';
				}
				if (s == currentInfo) {
					cls += ' datetimebox-selected';
				}
				if (j == saIndex) {
					cls += ' datetimebox-saturday';
				} else if (j == suIndex) {
					cls += ' datetimebox-sunday';
				}
				if (j == 0) {
					cls += ' datetimebox-first';
				} else if (j == week.length - 1) {
					cls += ' datetimebox-last';
				}
				data.push('<td class="' + cls + '" abbr="' + s + '">' + d + '</td>');
			}
			data.push('</tr>');
		}
		data.push('</tbody>');
		data.push('</table>');
		body.prepend(data.join(''));
		var calendar = body.children('.datetimebox-calendar');
		$('.datetimebox-day', calendar).not('.datetimebox-other-month').click(function() {
			if (opts.showTimeSpinner) {
				$('.datetimebox-selected', calendar).removeClass('datetimebox-selected');
				$(this).addClass('datetimebox-selected');
			} else {
				var oldValue = null;
				if (state.value) {
					oldValue = new Date(state.value[0], state.value[1], state.value[2]);
				}
				var values = $(this).attr('abbr').split(',');
				state.value = [ values[0], values[1], values[2], 0, 0, 0 ];
				var newValue = new Date(state.value[0], state.value[1], state.value[2]);
				$(target).val(opts.formatter.call(target, newValue));
				state.panel.hide();
				opts.onChange.call(target, newValue, oldValue);
			}
		});
		$('.datetimebox-other-month', calendar).click(function() {
			var values = $(this).attr('abbr').split(',');
			opts.year = values[0];
			opts.month = values[1];
			createCalendar(target);
			$('.datetimebox-calendar .datetimebox-selected', body).removeClass('datetimebox-selected');
			$('.datetimebox-calendar .datetimebox-day[abbr="' + opts.year + ',' + opts.month + ',' + parseInt(values[2]) + '"]', body).addClass('datetimebox-selected');
		});
	}
	// 获取周数据
	function getWeeks(target, year, month) {
		var opts = $(target).data('datetimebox').options;
		var dates = [];
		var lastDay = new Date(year, month, 0).getDate();
		for (var i = 1; i <= lastDay; i++)
			dates.push([ year, month, i ]);

		// 将日期按周分组
		var weeks = [], week = [];
		var memoDay = -1;
		while (dates.length > 0) {
			var date = dates.shift();
			week.push(date);
			var day = new Date(date[0], date[1] - 1, date[2]).getDay();
			if (memoDay == day) {
				day = 0;
			} else if (day == (opts.firstDay == 0 ? 7 : opts.firstDay) - 1) {
				weeks.push(week);
				week = [];
			}
			memoDay = day;
		}
		if (week.length) {
			weeks.push(week);
		}

		var firstWeek = weeks[0];
		if (firstWeek.length < 7) {
			while (firstWeek.length < 7) {
				var firstDate = firstWeek[0];
				var date = new Date(firstDate[0], firstDate[1] - 1, firstDate[2] - 1)
				firstWeek.unshift([ date.getFullYear(), date.getMonth() + 1, date.getDate() ]);
			}
		} else {
			var firstDate = firstWeek[0];
			var week = [];
			for (var i = 1; i <= 7; i++) {
				var date = new Date(firstDate[0], firstDate[1] - 1, firstDate[2] - i);
				week.unshift([ date.getFullYear(), date.getMonth() + 1, date.getDate() ]);
			}
			weeks.unshift(week);
		}

		var lastWeek = weeks[weeks.length - 1];
		while (lastWeek.length < 7) {
			var lastDate = lastWeek[lastWeek.length - 1];
			var date = new Date(lastDate[0], lastDate[1] - 1, lastDate[2] + 1);
			lastWeek.push([ date.getFullYear(), date.getMonth() + 1, date.getDate() ]);
		}
		if (weeks.length < 6) {
			var lastDate = lastWeek[lastWeek.length - 1];
			var week = [];
			for (var i = 1; i <= 7; i++) {
				var date = new Date(lastDate[0], lastDate[1] - 1, lastDate[2] + i);
				week.push([ date.getFullYear(), date.getMonth() + 1, date.getDate() ]);
			}
			weeks.push(week);
		}

		return weeks;
	}
	// 创建时间微调
	function createTimeSpinner(target) {
		var state = $(target).data('datetimebox');
		var opts = state.options;
		var panel = state.panel;
		var body = panel.children('.datetimebox-body');
		var timeSpinner = null;
		var hours = parseInt(state.value ? state.value[3] : new Date().getHours());
		var minutes = parseInt(state.value ? state.value[4] : new Date().getMinutes());
		var seconds = parseInt(state.value ? state.value[5] : new Date().getSeconds());
		if ($('.datetimebox-timespinner', body).length > 0) {
			timeSpinner = $('.datetimebox-timespinner', body);
			$('.datetimebox-timespinner-hour', timeSpinner).val((hours < 10 ? ('0' + hours) : hours));
			$('.datetimebox-timespinner-minute', timeSpinner).val((minutes < 10 ? ('0' + minutes) : minutes));
			$('.datetimebox-timespinner-seconds', timeSpinner).val((seconds < 10 ? ('0' + seconds) : seconds));
		} else {
			timeSpinner = $('<div class="datetimebox-timespinner"></div>').appendTo(body);
			var str = '<input type="text" class="datetimebox-timespinner-hour" autocomplete="off" value="' + (hours < 10 ? ('0' + hours) : hours) + '"/>';
			str += '<p class="datetimebox-timespinner-separator">' + opts.timeSeparator + '</p>';
			str += '<input type="text" class="datetimebox-timespinner-minute" autocomplete="off" value="' + (minutes < 10 ? ('0' + minutes) : minutes) + '"/>';
			str += '<p class="datetimebox-timespinner-separator">' + opts.timeSeparator + '</p>';
			str += '<input type="text" class="datetimebox-timespinner-seconds" autocomplete="off" value="' + (seconds < 10 ? ('0' + seconds) : seconds) + '"/>';
			str += '<span><a href="javascript:void(0)" class="datetimebox-timespinner-up" tabindex="-1"></a><a href="javascript:void(0)" class="datetimebox-timespinner-down" tabindex="-1"></a></span>';
			timeSpinner.append(str);
			$('input', timeSpinner).unbind('.datetimebox').bind('focus.datetimebox', function() {
				if ($(this).hasClass('datetimebox-timespinner-hour'))
					opts.highlight = 0;
				else if ($(this).hasClass('datetimebox-timespinner-minute'))
					opts.highlight = 1;
				else if ($(this).hasClass('datetimebox-timespinner-seconds'))
					opts.highlight = 2;
			});
			$('.datetimebox-timespinner-up', timeSpinner).unbind('.datetimebox').bind('click.datetimebox', function() {
				var input = $('input', timeSpinner).eq(opts.highlight).focus();
				var v = parseInt(input.val()) + 1;
				if (opts.highlight == 0) {
					if (v > 23)
						v = 0;
				} else {
					if (v > 59)
						v = 0;
				}
				input.val(v < 10 ? ('0' + v) : v);
			});
			$('.datetimebox-timespinner-down').unbind('.datetimebox').bind('click.datetimebox', function() {
				var input = $('input', timeSpinner).eq(opts.highlight).focus();
				var v = parseInt(input.val()) - 1;
				if (opts.highlight == 0) {
					if (v < 0)
						v = 23;
				} else {
					if (v < 0)
						v = 59;
				}
				input.val(v < 10 ? ('0' + v) : v);
			});
		}
	}
	// 创建按钮
	function createButton(target) {
		var state = $(target).data('datetimebox');
		var opts = state.options;
		var panel = state.panel;
		var body = panel.children('.datetimebox-body');
		var button = null;
		if ($('.datetimebox-button', body).length > 0) {
			button = $('.datetimebox-button', body);
		} else {
			button = $('<div class="datetimebox-button"></div>').appendTo(body);
			var table = '<table cellspacing="0" cellpadding="0"><tbody><tr>';
			table += '<td>' + '<a href="javascript:void(0)">' + opts.currentText + '</a>';
			table += '<td>' + '<a href="javascript:void(0)">' + opts.okText + '</a>';
			table += '<td>' + '<a href="javascript:void(0)">' + opts.closeText + '</a>';
			table += '</tr></tbody></table>';
			button.append(table);
		}
		// 点击today
		$('a', button).eq(0).unbind('click.datetimebox').bind('click.datetimebox', function() {
			if (opts.showTimeSpinner) {
				opts.year = new Date().getFullYear();
				opts.month = new Date().getMonth() + 1;
				createCalendar(target);
				var calendar = $('.datetimebox-calendar', body);
				$('.datetimebox-selected', calendar).removeClass('datetimebox-selected');
				$('.datetimebox-day[abbr="' + opts.year + ',' + opts.month + ',' + new Date().getDate() + '"]').addClass('datetimebox-selected');
			} else {
				var oldValue = null;
				if (state.value) {
					oldValue = new Date(state.value[0], state.value[1] - 1, state.value[2]);
				}
				state.value[0] = new Date().getFullYear();
				state.value[1] = new Date().getMonth() + 1;
				state.value[2] = new Date().getDate();
				var newValue = new Date(state.value[0], state.value[1] - 1, state.value[2]);
				$(target).val(opts.formatter.call(target, newValue));
				panel.hide();
				opts.onChange.call(target, newValue, oldValue);
			}
		});
		// 点击ok
		$('a', button).eq(1).unbind('click.datetimebox').bind('click.datetimebox', function() {
			var oldValue = null;
			if (state.value) {
				oldValue = new Date(state.value[0], state.value[1] - 1, state.value[2], state.value[3], state.value[4], state.value[5]);
			}
			var values = $('.datetimebox-calendar .datetimebox-selected', body).attr('abbr').split(',');
			state.value = [];
			state.value[0] = values[0];
			state.value[1] = values[1];
			state.value[2] = values[2];
			var timespinner = $('.datetimebox-timespinner', body);
			state.value[3] = $('.datetimebox-timespinner-hour', timespinner).val();
			state.value[4] = $('.datetimebox-timespinner-minute', timespinner).val();
			state.value[5] = $('.datetimebox-timespinner-seconds', timespinner).val();
			var newValue = new Date(state.value[0], state.value[1] - 1, state.value[2], state.value[3], state.value[4], state.value[5]);
			$(target).val(opts.formatter.call(target, newValue));
			panel.hide();
			opts.onChange.call(target, newValue, oldValue)
		});
		// 点击close
		$('a', button).eq(2).unbind('click.datetimebox').bind('click.datetimebox', function() {
			panel.hide();
		});
	}
	// 销毁组件
	function destroy(target) {
		var state = $(target).data('datetimebox');
		state.panel.remove();
		$(target).remove();
	}
	// 启用/禁用组件
	function setDisabled(target, param) {
		var state = $(target).data('datetimebox');
		var opts = state.options;
		opts.disabled = param;
		if (opts.disabled) {
			$(target).attr('disabled', 'disabled');
		} else {
			$(target).removeAttr('disabled');
		}
	}
	// 重置组件值
	function reset(target) {
		var state = $(target).data('datetimebox');
		var opts = state.options;
		if (opts.value) {
			$(target).datetimebox('setValue', opts.value);
		} else {
			state.value = null;
		}
	}
	// 清除组件值
	function clear(target) {
		var state = $(target).data('datetimebox');
		state.value = null;
	}
	// value:[年,月,日,时,分,秒]
	// panel:下拉面板
	$.fn.datetimebox = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.datetimebox.methods[options](this, param);
		}

		options = options || {};
		return this.each(function() {
			var state = $(this).data('datetimebox');
			if (state) {
				$.extend(state.options, options);
			} else {
				$(this).data('datetimebox', {
					options : $.extend({}, $.fn.datetimebox.defaults, $.fn.datetimebox.parseOptions(this), options),
					panel : null,
					value : null
				});
				state = $(this).data('datetimebox');
			}
			create(this);
		});
	};

	$.fn.datetimebox.methods = {
		options : function(jq) {
			return $(jq[0]).data('datetimebox').options;
		},
		panel : function(jq) {
			return $(jq[0]).data('datetimebox').panel;
		},
		destroy : function(jq) {
			return jq.each(function() {
				destroy(this);
			});
		},
		getValue : function(jq) {
			var state = $(jq[0]).data('datetimebox');
			var opts = state.options;
			var values = state.value;
			var year = values[0];
			var month = values[1];
			var date = values[2];
			var hour = values[3];
			var minute = values[4];
			var second = values[5];
			return year + opts.dateSeparator + (month < 10 ? ('0' + month) : month) + opts.dateSeparator + date + ' ' + (hour < 10 ? ('0' + hour) : hour) + opts.timeSeparator + (minute < 10 ? ('0' + minute) : minute) + (opts.showSeconds ? (opts.timeSeparator + (second < 10 ? ('0' + second) : second)) : '');
		},
		setValue : function(jq, value) {
			return jq.each(function() {
				var state = $(this).data('datetimebox');
				var opts = state.options;
				var strdate = value.split(' ')[0];
				var strtime = value.split(' ')[1];
				var dates = strdate.split(opts.dateSeparator);
				var times = strtime.split(opts.timeSeparator);
				state.value = [ dates[0], dates[1], dates[2], times[0], times[1], times[2] ];
			});
		},
		enable : function(jq) {
			return jq.each(function() {
				setDisabled(this, false);
			});
		},
		disable : function(jq) {
			return jq.each(function() {
				setDisabled(this, true);
			});
		},
		reset : function(jq) {
			return jq.each(function() {
				reset(this);
			});
		},
		clear : function(jq) {
			return jq.each(function() {
				clear(this);
			});
		}
	};

	$.fn.datetimebox.parseOptions = function(target) {
		return $.extend({}, $.parser.parseOptions(target));
	};

	$.fn.datetimebox.defaults = {
		width : 150,
		height : 22,
		weeks : [ 'S', 'M', 'T', 'W', 'T', 'F', 'S' ],
		months : [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
		firstDay : 0,
		year : new Date().getFullYear(),
		month : new Date().getMonth() + 1,
		currentText : 'Today',
		okText : 'Ok',
		closeText : 'Close',
		disabled : false,
		formatter : function(date) {
			var opts = $(this).data('datetimebox').options;
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();
			if (opts.showTimeSpinner == false) {
				return year + opts.dateSeparator + (month < 10 ? ('0' + month) : month) + opts.dateSeparator + (day < 10 ? ('0' + day) : day);
			} else {
				var hour = date.getHours();
				var minute = date.getMinutes();
				var second = date.getSeconds();
				return year + opts.dateSeparator + (month < 10 ? ('0' + month) : month) + opts.dateSeparator + (day < 10 ? ('0' + day) : day) + ' ' + (hour < 10 ? ('0' + hour) : hour) + opts.timeSeparator + (minute < 10 ? ('0' + minute) : minute) + (opts.showSeconds ? (opts.timeSeparator + (second < 10 ? ('0' + second) : second)) : '');
			}
		},
		dateSeparator : '-',
		showTimeSpinner : true,
		timeSeparator : ':',
		showSeconds : true,
		highlight : 0,
		value : null,
		onChange : function(newDate, oldDate) {
		}
	};
})(jQuery);
