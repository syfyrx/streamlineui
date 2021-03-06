/*jQuery StreamLineUI v1.0*/
(function($) {
	function create(target) {
		var state = $(target).data('sldatetimebox');
		var opts = state.options;
		$(target).addClass('slui-sldatetimebox');
		// 点击组件外部时隐藏组件
		$(document).unbind('.sldatetimebox').bind('mousedown.sldatetimebox mousewheel.sldatetimebox', function(e) {
			if ($(e.target).closest('.sldatetimebox-panel,.sldatetimebox,.sldatetimebox-arrow').length) {
				return;
			}
			$('.sldatetimebox-panel').hide();
		});

		var arrow = $('<a href="javascript:void(0)"></a>').addClass('sldatetimebox-arrow').css({
			width : opts.height,
			height : opts.height
		}).insertAfter(target);
		arrow.click(function() {
			if (!opts.disabled) {
				if (state.value) {
					opts.year = state.value[0];
					opts.month = state.value[1];
				}
				createCalendar(target);
				createTimeSpinner(target);
				createButton(target);
				var header = state.panel.find('.sldatetimebox-header');
				header.find('.sldatetimebox-nextmonth').unbind('.sldatetimebox').bind('click.sldatetimebox', function() {
					opts.month++;
					if (opts.month > 12) {
						opts.year++;
						opts.month = 1;
					}
					createCalendar(target);
				});
				header.find('.sldatetimebox-prevmonth').unbind('.sldatetimebox').bind('click.sldatetimebox', function() {
					opts.month--;
					if (opts.month < 1) {
						opts.year--;
						opts.month = 12;
					}
					createCalendar(target);
				});
				header.find('.sldatetimebox-nextyear').unbind('.sldatetimebox').bind('click.sldatetimebox', function() {
					opts.year++;
					createCalendar(target);
				});
				header.find('.sldatetimebox-prevyear').unbind('.sldatetimebox').bind('click.sldatetimebox', function() {
					opts.year--;
					createCalendar(target);
				});
				if (opts.showTimeSpinner) {// 显示时间微调
					$('.sldatetimebox-timespinner', state.panel).css({
						'display' : 'block'
					});
					$('.sldatetimebox-button', state.panel).removeClass('sldatetimebox-button-notimespinner');
					$('.sldatetimebox-button a', state.panel).eq(2).css({
						'display' : 'inline-block'
					});
				} else {
					$('.sldatetimebox-timespinner', state.panel).css({
						'display' : 'none'
					});
					$('.sldatetimebox-button', state.panel).addClass('sldatetimebox-button-notimespinner');
					$('.sldatetimebox-button a', state.panel).eq(2).css({
						'display' : 'none'
					});
				}
				if (opts.showSeconds) {// 显示秒钟信息
					$('.sldatetimebox-timespinner-seconds,.sldatetimebox-timespinner-seconds-spinner', state.panel).css({
						'display' : 'inline-block'
					});
				} else {
					$('.sldatetimebox-timespinner-seconds,.sldatetimebox-timespinner-seconds-spinner', state.panel).css({
						'display' : 'none'
					});
				}
				state.panel.css({
					left : $(this).offset().left - $(target).outerWidth(),
					top : $(this).offset().top + $(target).outerHeight() + 1
				}).show();
			}
		});
		$(target).addClass('sldatetimebox').css(
				{
					width : opts.width - opts.height - $(target).css('padding-left').replace('px', '')
							- $(target).css('padding-right').replace('px', '')
							- arrow.css('border-right-width').replace('px', ''),
					height : opts.height
				}).attr('readonly', 'readonly').val(opts.prompt);
		// 验证默认时间值是否格式正确
		var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
		if (opts.value && opts.value.match(reg)) {
			setValue(target, opts.value);
			$(target).val(
					opts.formatter.call(target, new Date(state.value[0], state.value[1], state.value[2],
							state.value[3], state.value[4], state.value[5])));
		}
		if (opts.required) {
			$(target).addClass('validate-text');
			if ($.fn.validate) {
				$(target).validate({
					required : opts.required,
					missingMessage : opts.missingMessage,
					deltaX : opts.height
				});
			}
		}
		var panel = null;
		if ($('.sldatetimebox-panel').length > 0) {
			panel = $('.sldatetimebox-panel');
			state.panel = panel;
		} else {
			panel = $('<div onselectstart="return false"></div>').css({
				display : 'none',
				position : 'absolute',
				zIndex : 10000
			}).addClass('sldatetimebox-panel').appendTo('body');
			var header = $(
					'<div class="sldatetimebox-header">'
							+ '<a href="javascript:void(0)" class="sldatetimebox-prevyear"></a>'
							+ '<a href="javascript:void(0)" class="sldatetimebox-prevmonth"></a>'
							+ '<span class="sldatetimebox-title"></span>'
							+ '<a href="javascript:void(0)" class="sldatetimebox-nextmonth"></a>'
							+ '<a href="javascript:void(0)" class="sldatetimebox-nextyear"></a>').appendTo(panel);
			var body = $('<div class="sldatetimebox-body"></div>').appendTo(panel);
			state.panel = panel;
		}
		if (opts.disabled) {
			$(target).attr('disabled', 'disabled');
		}
	}
	// 创建日历
	function createCalendar(target) {
		var state = $(target).data('sldatetimebox');
		var opts = state.options;
		var panel = state.panel;
		var header = $(panel).find('.sldatetimebox-header');
		var body = $(panel).find('.sldatetimebox-body');
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
		$(header).find('.sldatetimebox-title').html(
				opts.title.replace('{month}', opts.months[opts.month - 1]).replace('{year}', opts.year));
		body.children('table').remove();
		var data = [ '<table class="sldatetimebox-calendar" cellspacing="0" cellpadding="0" border="0">' ];
		data.push('<thead><tr>');
		for (var i = opts.firstDay; i < opts.weeks.length; i++) {
			if (i == saIndex)
				data.push('<th class="sldatetimebox-th-saturday">' + opts.weeks[i] + '</th>');
			else if (i == suIndex)
				data.push('<th class="sldatetimebox-th-sunday">' + opts.weeks[i] + '</th>');
			else
				data.push('<th>' + opts.weeks[i] + '</th>');
		}
		for (var i = 0; i < opts.firstDay; i++) {
			if (i == saIndex)
				data.push('<th class="sldatetimebox-th-saturday">' + opts.weeks[i] + '</th>');
			else if (i == suIndex)
				data.push('<th class="sldatetimebox-th-sunday">' + opts.weeks[i] + '</th>');
			else
				data.push('<th>' + opts.weeks[i] + '</th>');
		}
		data.push('</tr></thead>');
		data.push('<tbody>');
		var weeks = getWeeks(target, opts.year, opts.month);
		for (var i = 0; i < weeks.length; i++) {
			var week = weeks[i];
			var cls = '';
			if (i == 0) {
				cls = 'sldatetimebox-first';
			} else if (i == weeks.length - 1) {
				cls = 'sldatetimebox-last';
			}
			data.push('<tr class="' + cls + '">');
			for (var j = 0; j < week.length; j++) {
				var day = week[j];
				var s = day[0] + ',' + day[1] + ',' + day[2];
				var d = day[2];
				var cls = 'sldatetimebox-day';
				if (!(opts.year == day[0] && opts.month == day[1])) {
					cls += ' sldatetimebox-other-month';
				}
				if (s == todayInfo) {
					cls += ' sldatetimebox-today';
				}
				if (s == currentInfo) {
					cls += ' sldatetimebox-selected';
				}
				if (j == saIndex) {
					cls += ' sldatetimebox-saturday';
				} else if (j == suIndex) {
					cls += ' sldatetimebox-sunday';
				}
				if (j == 0) {
					cls += ' sldatetimebox-first';
				} else if (j == week.length - 1) {
					cls += ' sldatetimebox-last';
				}
				data.push('<td class="' + cls + '" abbr="' + s + '">' + d + '</td>');
			}
			data.push('</tr>');
		}
		data.push('</tbody>');
		data.push('</table>');
		body.prepend(data.join(''));
		var calendar = body.children('.sldatetimebox-calendar');
		$('.sldatetimebox-day', calendar).not('.sldatetimebox-other-month').click(function() {
			if (opts.showTimeSpinner) {
				$('.sldatetimebox-selected', calendar).removeClass('sldatetimebox-selected');
				$(this).addClass('sldatetimebox-selected');
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
				if (opts.required) {
					if ($.fn.validate) {
						$(target).validate('validate');
					}
				}
			}
		});
		$('.sldatetimebox-other-month', calendar).click(
				function() {
					var values = $(this).attr('abbr').split(',');
					opts.year = values[0];
					opts.month = values[1];
					createCalendar(target);
					$('.sldatetimebox-calendar .sldatetimebox-selected', body).removeClass('sldatetimebox-selected');
					$(
							'.sldatetimebox-calendar .sldatetimebox-day[abbr="' + opts.year + ',' + opts.month + ','
									+ parseInt(values[2]) + '"]', body).addClass('sldatetimebox-selected');
				});
	}
	// 获取周数据
	function getWeeks(target, year, month) {
		var opts = $(target).data('sldatetimebox').options;
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
		var state = $(target).data('sldatetimebox');
		var opts = state.options;
		var panel = state.panel;
		var body = panel.children('.sldatetimebox-body');
		var timeSpinner = null;
		var hours = parseInt(state.value ? state.value[3] : new Date().getHours());
		var minutes = parseInt(state.value ? state.value[4] : new Date().getMinutes());
		var seconds = parseInt(state.value ? state.value[5] : new Date().getSeconds());
		if ($('.sldatetimebox-timespinner', body).length > 0) {
			timeSpinner = $('.sldatetimebox-timespinner', body);
			$('.sldatetimebox-timespinner-hour', timeSpinner).val((hours < 10 ? ('0' + hours) : hours));
			$('.sldatetimebox-timespinner-minute', timeSpinner).val((minutes < 10 ? ('0' + minutes) : minutes));
			$('.sldatetimebox-timespinner-seconds', timeSpinner).val((seconds < 10 ? ('0' + seconds) : seconds));
		} else {
			timeSpinner = $('<div class="sldatetimebox-timespinner"></div>').appendTo(body);
			var str = '<label class="sldatetimebox-timespinner-label">时间</label>';
			str += '<input type="text" class="sldatetimebox-timespinner-hour" autocomplete="off" readonly="readonly" value="'
					+ (hours < 10 ? ('0' + hours) : hours) + '"/>';
			str += '<span class="sldatetimebox-timespinner-hour-spinner"><a href="javascript:void(0)" class="sldatetimebox-timespinner-hour-up" tabindex="-1"></a><a href="javascript:void(0)" class="sldatetimebox-timespinner-hour-down" tabindex="-1"></a></span>';
			str += '<input type="text" class="sldatetimebox-timespinner-minute" autocomplete="off" readonly="readonly" value="'
					+ (minutes < 10 ? ('0' + minutes) : minutes) + '"/>';
			str += '<span class="sldatetimebox-timespinner-minute-spinner"><a href="javascript:void(0)" class="sldatetimebox-timespinner-minute-up" tabindex="-1"></a><a href="javascript:void(0)" class="sldatetimebox-timespinner-minute-down" tabindex="-1"></a></span>';
			str += '<input type="text" class="sldatetimebox-timespinner-seconds" autocomplete="off" readonly="readonly" value="'
					+ (seconds < 10 ? ('0' + seconds) : seconds) + '"/>';
			str += '<span class="sldatetimebox-timespinner-seconds-spinner"><a href="javascript:void(0)" class="sldatetimebox-timespinner-seconds-up" tabindex="-1"></a><a href="javascript:void(0)" class="sldatetimebox-timespinner-seconds-down" tabindex="-1"></a></span>';
			timeSpinner.append(str);
			$('.sldatetimebox-timespinner-hour-up', timeSpinner).unbind('.sldatetimebox').bind('click.sldatetimebox',
					function() {
						var input = $('input.sldatetimebox-timespinner-hour', timeSpinner);
						var v = parseInt(input.val()) + 1;
						if (v > 23)
							v = 0;
						input.val(v < 10 ? ('0' + v) : v);
					});
			$('.sldatetimebox-timespinner-minute-up', timeSpinner).unbind('.sldatetimebox').bind('click.sldatetimebox',
					function() {
						var input = $('input.sldatetimebox-timespinner-minute', timeSpinner);
						var v = parseInt(input.val()) + 1;
						if (v > 59)
							v = 0;
						input.val(v < 10 ? ('0' + v) : v);
					});
			$('.sldatetimebox-timespinner-seconds-up', timeSpinner).unbind('.sldatetimebox').bind('click.sldatetimebox',
					function() {
						var input = $('input.sldatetimebox-timespinner-seconds', timeSpinner);
						var v = parseInt(input.val()) + 1;
						if (v > 59)
							v = 0;
						input.val(v < 10 ? ('0' + v) : v);
					});
			$('.sldatetimebox-timespinner-hour-down', timeSpinner).unbind('.sldatetimebox').bind('click.sldatetimebox',
					function() {
						var input = $('input.sldatetimebox-timespinner-hour', timeSpinner);
						var v = parseInt(input.val()) - 1;
						if (v < 0)
							v = 23;
						input.val(v < 10 ? ('0' + v) : v);
					});
			$('.sldatetimebox-timespinner-minute-down', timeSpinner).unbind('.sldatetimebox').bind('click.sldatetimebox',
					function() {
						var input = $('input.sldatetimebox-timespinner-minute', timeSpinner);
						var v = parseInt(input.val()) - 1;
						if (v < 0)
							v = 59;
						input.val(v < 10 ? ('0' + v) : v);
					});
			$('.sldatetimebox-timespinner-seconds-down', timeSpinner).unbind('.sldatetimebox').bind('click.sldatetimebox',
					function() {
						var input = $('input.sldatetimebox-timespinner-seconds', timeSpinner);
						var v = parseInt(input.val()) - 1;
						if (v < 0)
							v = 59;
						input.val(v < 10 ? ('0' + v) : v);
					});
		}
	}
	// 创建按钮
	function createButton(target) {
		var state = $(target).data('sldatetimebox');
		var opts = state.options;
		var panel = state.panel;
		var body = panel.children('.sldatetimebox-body');
		var button = null;
		if ($('.sldatetimebox-button', body).length > 0) {
			button = $('.sldatetimebox-button', body);
		} else {
			button = $('<div class="sldatetimebox-button"></div>').appendTo(body);
			var table = '<table cellspacing="0" cellpadding="0"><tbody><tr>';
			table += '<td>' + '<a href="javascript:void(0)">' + opts.currentText + '</a></td>';
			table += '<td>' + '<a href="javascript:void(0)">' + opts.clearText + '</a></td>';
			table += '<td></td>';
			table += '<td>' + '<a href="javascript:void(0)">' + opts.okText + '</a></td>';
			table += '</tr></tbody></table>';
			button.append(table);
		}
		// 点击today
		$('a', button).eq(0).unbind('click.sldatetimebox').bind(
				'click.sldatetimebox',
				function() {
					if (opts.showTimeSpinner) {
						opts.year = new Date().getFullYear();
						opts.month = new Date().getMonth() + 1;
						createCalendar(target);
						var calendar = $('.sldatetimebox-calendar', body);
						$('.sldatetimebox-selected', calendar).removeClass('sldatetimebox-selected');
						$('.sldatetimebox-day[abbr="' + opts.year + ',' + opts.month + ',' + new Date().getDate() + '"]')
								.addClass('sldatetimebox-selected');
					} else {
						var oldValue = null;
						if (state.value) {
							oldValue = new Date(state.value[0], state.value[1] - 1, state.value[2]);
						}
						state.value = [];
						state.value[0] = new Date().getFullYear();
						state.value[1] = new Date().getMonth() + 1;
						state.value[2] = new Date().getDate();
						var newValue = new Date(state.value[0], state.value[1] - 1, state.value[2]);
						$(target).val(opts.formatter.call(target, newValue));
						panel.hide();
						opts.onChange.call(target, newValue, oldValue);
						if (opts.required) {
							if ($.fn.validate) {
								$(target).validate('validate');
							}
						}
					}
				});
		// 点击ok
		$('a', button).eq(2).unbind('click.sldatetimebox').bind(
				'click.sldatetimebox',
				function() {
					var oldValue = null;
					if (state.value) {
						oldValue = new Date(state.value[0], state.value[1] - 1, state.value[2], state.value[3],
								state.value[4], state.value[5]);
					}
					var selected = $('.sldatetimebox-calendar .sldatetimebox-selected', body);
					state.value = [];
					if (selected.length) {
						var values = selected.attr('abbr').split(',');
						state.value[0] = values[0];
						state.value[1] = values[1];
						state.value[2] = values[2];
					} else {
						state.value[0] = new Date().getFullYear();
						state.value[1] = new Date().getMonth() + 1;
						state.value[2] = new Date().getDate();
					}
					var timespinner = $('.sldatetimebox-timespinner', body);
					state.value[3] = $('.sldatetimebox-timespinner-hour', timespinner).val();
					state.value[4] = $('.sldatetimebox-timespinner-minute', timespinner).val();
					state.value[5] = $('.sldatetimebox-timespinner-seconds', timespinner).val();
					if (opts.showSeconds == false) {
						state.value[5] = 0;
					}
					var newValue = new Date(state.value[0], state.value[1] - 1, state.value[2], state.value[3],
							state.value[4], state.value[5]);
					$(target).val(opts.formatter.call(target, newValue));
					panel.hide();
					if (opts.required) {
						if ($.fn.validate) {
							$(target).validate('validate');
						}
					}
					opts.onChange.call(target, newValue, oldValue);
				});
		// 点击clear
		$('a', button).eq(1).unbind('click.sldatetimebox').bind('click.sldatetimebox', function() {
			$(target).sldatetimebox('reset');
			panel.hide();
			if (opts.required) {
				if ($.fn.validate) {
					$(target).slvalidate('validate');
				}
			}
		});
	}
	// 设置值
	function setValue(target, value) {
		var state = $(target).data('sldatetimebox');
		var opts = state.options;
		value.replace('/', opts.dateSeparator).replace('-', opts.dateSeparator);
		var strdate = value.split(' ')[0];
		var strtime = value.split(' ')[1];
		var dates = strdate.split(opts.dateSeparator);
		var times = strtime.split(opts.timeSeparator);
		state.value = [ dates[0], dates[1], dates[2], times[0], times[1], times[2] ];
	}
	// 销毁组件
	function destroy(target) {
		var state = $(target).data('sldatetimebox');
		state.panel.remove();
		$(target).remove();
	}
	// 启用/禁用组件
	function setDisabled(target, param) {
		var state = $(target).data('sldatetimebox');
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
		var state = $(target).data('sldatetimebox');
		var opts = state.options;
		if (opts.value) {
			$(target).sldatetimebox('setValue', opts.value);
		} else {
			state.value = null;
			$(target).val(opts.prompt);
		}
	}
	// 清除组件值
	function clear(target) {
		var state = $(target).data('sldatetimebox');
		state.value = null;
	}
	// value:[年,月,日,时,分,秒]
	// panel:下拉面板
	$.fn.sldatetimebox = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.sldatetimebox.methods[options](this, param);
		}

		options = options || {};
		return this.each(function() {
			var state = $(this).data('sldatetimebox');
			if (state) {
				$.extend(state.options, options);
			} else {
				$(this).data('sldatetimebox', {
					options : $.extend({}, $.fn.sldatetimebox.defaults, $.fn.sldatetimebox.parseOptions(this), options),
					panel : null,
					value : null
				});
				state = $(this).data('sldatetimebox');
			}
			create(this);
		});
	};

	$.fn.sldatetimebox.methods = {
		options : function(jq) {
			return $(jq[0]).data('sldatetimebox').options;
		},
		panel : function(jq) {
			return $(jq[0]).data('sldatetimebox').panel;
		},
		destroy : function(jq) {
			return jq.each(function() {
				destroy(this);
			});
		},
		getValue : function(jq) {
			var state = $(jq[0]).data('sldatetimebox');
			var opts = state.options;
			if (state.value) {
				var values = state.value;
				var year = parseInt(values[0]);
				var month = parseInt(values[1]);
				var date = parseInt(values[2]);
				var hour = parseInt(values[3]);
				var minute = parseInt(values[4]);
				var seconds = parseInt(values[5]);
				return year + opts.dateSeparator + (month < 10 ? ('0' + month) : month) + opts.dateSeparator
						+ (date < 10 ? ('0' + date) : date) + ' ' + (hour < 10 ? ('0' + hour) : hour)
						+ opts.timeSeparator + (minute < 10 ? ('0' + minute) : minute) + opts.timeSeparator
						+ (seconds < 10 ? ('0' + seconds) : seconds);
			} else {
				return '';
			}
		},
		setValue : function(jq, value) {
			return jq.each(function() {
				setValue(this, value);
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

	$.fn.sldatetimebox.parseOptions = function(target) {
		return $.extend({}, $.slparser.parseOptions(target));
	};

	$.fn.sldatetimebox.defaults = {
		width : 150,
		height : 22,
		weeks : [ 'S', 'M', 'T', 'W', 'T', 'F', 'S' ],
		months : [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
		title : '{month} {year}',
		firstDay : 0,
		year : new Date().getFullYear(),
		month : new Date().getMonth() + 1,
		currentText : 'Today',
		okText : 'Ok',
		clearText : 'Clear',
		disabled : false,
		formatter : function(date) {
			var opts = $(this).data('sldatetimebox').options;
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();
			if (opts.showTimeSpinner == false) {
				return year + opts.dateSeparator + (month < 10 ? ('0' + month) : month) + opts.dateSeparator
						+ (day < 10 ? ('0' + day) : day);
			} else {
				var hour = date.getHours();
				var minute = date.getMinutes();
				var second = date.getSeconds();
				return year + opts.dateSeparator + (month < 10 ? ('0' + month) : month) + opts.dateSeparator
						+ (day < 10 ? ('0' + day) : day) + ' ' + (hour < 10 ? ('0' + hour) : hour) + opts.timeSeparator
						+ (minute < 10 ? ('0' + minute) : minute)
						+ (opts.showSeconds ? (opts.timeSeparator + (second < 10 ? ('0' + second) : second)) : '');
			}
		},
		dateSeparator : '-',
		showTimeSpinner : true,
		timeSeparator : ':',
		showSeconds : true,
		value : null,
		prompt : '',
		required : false,
		missingMessage : 'This field is required.',
		onChange : function(newDate, oldDate) {
		}
	};
})(jQuery);
