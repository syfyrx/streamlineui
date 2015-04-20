/*jQuery StreamlineUI v1.0
 *依赖：slparser
 */
(function ($) {
	function init(target) {
		$(target).addClass('slmenu-top');

		$(document).unbind('.slmenu').bind('mousedown.slmenu', function (e) {
			var m = $(e.target).closest('div.slmenu');
			if (m.length) { return; }
			$('body>div.slmenu-top:visible').slmenu('hide');
		});

		var slmenuObjs = [];
		splitslmenu($(target));
		for (var i = 0; i < slmenuObjs.length; i++) {
			createMenu(slmenuObjs[i]);
		}

		function splitslmenu(slmenuObj) {
			slmenuObj.addClass('slmenu');
			slmenuObjs.push(slmenuObj);
			slmenuObj.children('div').each(function () {
				var subslmenuObj = $(this).children('div');
				if (subslmenuObj.length) {
					subslmenuObj.insertAfter(target);
					this.subslmenuObj = subslmenuObj;
					splitslmenu(subslmenuObj);
				}
			});
		}

		function createMenu(slmenuObj) {
			slmenuObj.children('div').each(function (i, n) {
				var itemObj = $(this);
				var itemOpts = $.extend({}, $.slparser.parseOptions(this, ['name', 'iconCls', 'href', { separator: 'boolean' }]), {
					text: $.trim(itemObj.html()),
					disabled: (itemObj.attr('disabled') ? true : undefined)
				});
				if (itemOpts.separator) {
					itemObj.before('<div class="slmenu-sep"></div>');
				}
				itemOpts.name = itemOpts.name || '';
				itemOpts.text = itemOpts.text || '';
				itemOpts.iconCls = itemOpts.iconCls || '';
				itemOpts.href = itemOpts.href || '';
				itemOpts.separator = itemOpts.separator || false;
				itemOpts.disabled = itemOpts.disabled || false;

				itemObj.data('slmenuItem', { options: itemOpts });
				itemObj.addClass('slmenu-item');
				if (itemOpts.iconCls) {
					itemObj.addClass('slmenu-icon').addClass(itemOpts.iconCls);
				}
				if (itemOpts.disabled) {
					setDisabled(target, itemObj[0], true);
				}
				if (itemObj[0].subslmenuObj) {
					$('<div class="slmenu-rightarrow"></div>').appendTo(itemObj);
				}

				bindslmenuItemEvent(target, itemObj);
			});
			setSize(target, slmenuObj);
			slmenuObj.hide();
			bindEvent(target, slmenuObj);
		}
	}

	function setSize(target, slmenuObj) {
		slmenuObj.css({
			left: -10000
		});
	}
	function bindEvent(target, slmenuObj) {
		var state = $(target).data('slmenu');
		slmenuObj.unbind('.slmenu').bind('mouseenter.slmenu', function () {
			if (state.timer) {
				clearTimeout(state.timer);
				state.timer = null;
			}
		}).bind('mouseleave.slmenu', function () {
			if (state.options.hideOnUnhover) {
				state.timer = setTimeout(function () {
					hideAll(target);
				}, state.options.duration);
			}
		});
	}
	function bindslmenuItemEvent(target, itemObj) {
		itemObj.unbind('.slmenu');
		var itemOpts = itemObj.data('slmenuItem').options;
		itemObj.bind('click.slmenu', function () {
			if ($(this).hasClass('slmenu-item-disabled')) {
				return;
			}
			// only the sub slmenu clicked can hide all slmenus
			if (!this.subslmenuObj) {
				hideAll(target);
				var href = itemOpts.href;
				if (href) {
					location.href = href;
				}
			}
			$(target).data('slmenu').options.onClick.call(target, $(target).slmenu('getItem', this));
		}).bind('mouseenter.slmenu', function (e) {
			// hide other slmenu
			itemObj.siblings().each(function () {
				if (this.subslmenuObj) {
					hideslmenu(this.subslmenuObj);
				}
				$(this).removeClass('slmenu-active');
			});
			// show this slmenu
			itemObj.addClass('slmenu-active');

			if ($(this).hasClass('slmenu-item-disabled')) {
				itemObj.addClass('slmenu-active-disabled');
				return;
			}

			var subslmenuObj = itemObj[0].subslmenuObj;
			if (subslmenuObj) {
				$(target).slmenu('show', {
					slmenuObj: subslmenuObj,
					parentObj: itemObj
				});
			}
		}).bind('mouseleave.slmenu', function (e) {
			itemObj.removeClass('slmenu-active slmenu-active-disabled');
			var subslmenuObj = itemObj[0].subslmenuObj;
			if (subslmenuObj) {
				if (e.pageX >= parseInt(subslmenuObj.css('left'))) {
					itemObj.addClass('slmenu-active');
				} else {
					hideslmenu(subslmenuObj);
				}
			} else {
				itemObj.removeClass('slmenu-active');
			}
		});
	}

	/**
	 * hide top slmenu and it's all sub slmenus
	 */
	function hideAll(target) {
		var state = $(target).data('slmenu');
		if (state) {
			if ($(target).is(':visible')) {
				hideslmenu($(target));
				state.options.onHide.call(target);
			}
		}
	}

	/**
	 * show the slmenu, the 'param' object has one or more properties:
	 * left: the left position to display
	 * top: the top position to display
	 * slmenuObj: the slmenu to display, if not defined, the 'target slmenu' is used
	 * parentObj: the parent slmenu item to align to
	 * alignTo: the element object to align to
	 */
	function showslmenu(target, param) {
		var left, top;
		param = param || {};
		var slmenuObj = param.slmenuObj || $(target);
		if (slmenuObj.hasClass('slmenu-top')) {
			var slmenuOpts = $(target).data('slmenu').options;
			$.extend(slmenuOpts, param);
			left = slmenuOpts.left;
			top = slmenuOpts.top;
			if (slmenuOpts.alignTo) {
				var alignToObj = $(slmenuOpts.alignTo);
				left = alignToObj.offset().left;
				top = alignToObj.offset().top + alignToObj.outerHeight();
				if (slmenuOpts.align == 'right') {
					left += alignToObj.outerWidth() - slmenuObj.outerWidth();
				}
			}
			if (left + slmenuObj.outerWidth() > $(window).outerWidth() + $(document).scrollLeft()) {
				left = $(window).outerWidth() + $(document).scrollLeft() - slmenuObj.outerWidth() - 5;
			}
			if (left < 0) { left = 0; }
			top = fixTop(top, slmenuOpts.alignTo);
		} else {
			var parentObj = param.parentObj;	// the parent slmenu item
			left = parentObj.offset().left + parentObj.outerWidth() - 2;
			if (left + slmenuObj.outerWidth() + 5 > $(window).outerWidth() + $(document).scrollLeft()) {
				left = parentObj.offset().left - slmenuObj.outerWidth() + 2;
			}
			top = fixTop(parentObj.offset().top - 3);
		}

		function fixTop(top, alignToObj) {
			if (top + slmenuObj.outerHeight() > $(window).outerHeight() + $(document).scrollTop()) {
				if (alignToObj) {
					top = $(alignToObj).offset().top - slmenuObj.outerHeight();
				} else {
					top = $(window).outerHeight() + $(document).scrollTop() - slmenuObj.outerHeight();
				}
			}
			if (top < 0) { top = 0; }
			return top;
		}

		slmenuObj.css({ left: left, top: top });
		slmenuObj.show(0, function () {
			if (slmenuObj.hasClass('slmenu-top')) {
				slmenuObj.data('slmenu').options.onShow.call(slmenuObj[0]);
			}
		});
	}

	function hideslmenu(slmenuObj) {
		if (!slmenuObj) return;
		slmenuObj.hide();
		slmenuObj.find('div.slmenu-item').each(function () {
			if (this.subslmenuObj) {
				hideslmenu(this.subslmenuObj);
			}
			$(this).removeClass('slmenu-active');
		});
	}

	function findItem(target, name) {
		var result = null;
		function find(slmenuObj) {
			slmenuObj.children('div.slmenu-item').each(function () {
				var itemObj = $(target).slmenu('getItem', this);
				if (name == itemObj.options.name) {
					result = {
						target: this,
						options: itemObj.options
					};
				} else if (this.subslmenuObj && result == null) {
					find(this.subslmenuObj);
				}
			});
		}
		find($(target));
		return result;
	}

	function setDisabled(target, item, disabled) {
		var itemObj = $(item);
		if (!itemObj.hasClass('slmenu-item')) { return; }
		var itemOpts = itemObj.data('slmenuItem').options;
		if (disabled) {
			itemObj.addClass('slmenu-item-disabled');
		} else {
			itemObj.removeClass('slmenu-item-disabled');
		}
	}

	function appendItem(target, param) {
		var slmenuObj = $(target);
		if (param.parent) {
			if (!param.parent.subslmenuObj) {
				var subslmenuObj = $(param.parent).after('<div class="slmenu"></div>');
				subslmenuObj.hide();
				param.parent.subslmenuObj = subslmenuObj;
				$('<div class="slmenu-rightarrow"></div>').appendTo(param.parent);
			}
			slmenuObj = param.parent.subslmenuObj;
		}
		var itemObj = $('<div class="slmenu-item"></div>').appendTo(slmenuObj);
		itemObj.html(param.text);
		if (param.iconCls) {
			itemObj.addClass('slmenu-icon').addClass(param.iconCls);
		}
		var itemOpts = {};
		itemOpts.name = param.name || '';
		itemOpts.text = param.text || '';
		itemOpts.iconCls = param.iconCls || '';
		itemOpts.href = param.href || '';
		itemOpts.separator = param.separator || false;
		itemOpts.disabled = param.disabled || false;
		itemObj.data('slmenuItem', { options: itemOpts });
		if (itemOpts.separators) {
			itemObj.before('<div class="slmenu-sep"></div>');
		}
		if(itemOpts.disabled){
			setDisabled(target, itemObj[0], false);
		}

		bindslmenuItemEvent(target, itemObj);
		bindEvent(target, slmenuObj);
	}

	function removeItem(target, item) {
		function removeit(el) {
			if (el.subslmenuObj) {
				el.subslmenuObj.children('div.slmenu-item').each(function () {
					removeit(this);
				});
				el.subslmenuObj.remove();
			}
			$(el).remove();
		}
		var slmenuObj = $(item).parent();
		removeit(item);
	}

	function setVisible(target, item, visible) {
		var slmenu = $(item).parent();
		if (visible) {
			$(item).show();
		} else {
			$(item).hide();
		}
	}

	function destroyslmenu(target) {
		$(target).children('div.slmenu-item').each(function () {
			removeItem(target, this);
		});
		$(target).remove();
	}

	$.fn.slmenu = function (options, param) {
		if (typeof options == 'string') {
			return $.fn.slmenu.methods[options](this, param);
		}

		options = options || {};
		return this.each(function () {
			var state = $(this).data('slmenu');
			if (state) {
				$.extend(state.options, options);
			} else {
				state = $(this).data('slmenu', {
					options: $.extend({}, $.fn.slmenu.defaults, $.fn.slmenu.parseOptions(this), options)
				});
				init(this);
			}
		});
	};

	$.fn.slmenu.methods = {
		options: function (jq) {
			return $(jq[0]).data('slmenu').options;
		},
		show: function (jq, param) {
			return jq.each(function () {
				showslmenu(this, param);
			});
		},
		hide: function (jq) {
			return jq.each(function () {
				hideAll(this);
			});
		},
		destroy: function (jq) {
			return jq.each(function () {
				destroyslmenu(this);
			});
		},
		/**
		 * set the slmenu item text
		 * param: {
		 * 	target: DOM object, indicate the slmenu item
		 * 	text: string, the new text
		 * }
		 */
		setText: function (jq, param) {
			return jq.each(function () {
				$(param.target).html(param.text);
			});
		},
		/**
		 * set the slmenu icon class
		 * param: {
		 * 	target: DOM object, indicate the slmenu item
		 * 	iconCls: the slmenu item icon class
		 * }
		 */
		setIcon: function (jq, param) {
			return jq.each(function () {
				if (param.iconCls) {
					$(param.target).addClass(param.iconCls).removeClass($(param.target).data('slmenuItem').options.iconCls);
				}
			});
		},
		/**
		 * get the slmenu item data that contains the following property:
		 * {
		 * 	target: DOM object, the slmenu item
		 *  options:
		 * }
		 */
		getItem: function (jq, item) {
			var itemObj = $(item);
			var item = {
				target: item,
				options: itemObj.data('slmenuItem').options
			}
			return item;
		},
		findItem: function (jq, name) {
			return findItem(jq[0], name);
		},
		/**
		 * append slmenu item, the param contains following properties:
		 * parent,name,text,iconCls,href,separator,disabled
		 * when parent property is assigned, append slmenu item to it
		 */
		appendItem: function (jq, param) {
			return jq.each(function () {
				appendItem(this, param);
			});
		},
		removeItem: function (jq, name) {
			return jq.each(function () {
				removeItem(this, findItem(jq[0], name).target);
			});
		},
		enableItem: function (jq, name) {
			return jq.each(function () {
				setDisabled(this, findItem(jq[0], name).target, false);
			});
		},
		disableItem: function (jq, name) {
			return jq.each(function () {
				setDisabled(this, findItem(jq[0], name).target, true);
			});
		},
		showItem: function (jq, name) {
			return jq.each(function () {
				setVisible(this, findItem(jq[0], name).target, true);
			});
		},
		hideItem: function (jq, name) {
			return jq.each(function () {
				setVisible(this, findItem(jq[0], name).target, false);
			});
		}
	};

	$.fn.slmenu.parseOptions = function (target) {
		return $.extend({}, $.slparser.parseOptions(target, [{ minWidth: 'number', duration: 'number', hideOnUnhover: 'boolean' }]));
	};

	$.fn.slmenu.defaults = {
		zIndex: 110000,
		left: 0,
		top: 0,
		alignTo: null,
		align: 'left',
		minWidth: 120,
		duration: 100,	// �Զ������ز˵������ĳ���ʱ�䣬�Ժ���Ϊ��λ
		hideOnUnhover: true,	// ������Ϊtrueʱ��������뿪�˵���ʱ���Զ����ز˵�
		onShow: function () { },
		onHide: function () { },
		onClick: function (item) { }
	};
})(jQuery);
