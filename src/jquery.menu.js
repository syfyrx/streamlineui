/*jQuery StreamlineUI v1.0
 *依赖：parser
 */
(function ($) {
	function init(target) {
		$(target).addClass('menu-top');

		$(document).unbind('.menu').bind('mousedown.menu', function (e) {
			var m = $(e.target).closest('div.menu');
			if (m.length) { return; }
			$('body>div.menu-top:visible').menu('hide');
		});

		var menuObjs = [];
		splitMenu($(target));
		for (var i = 0; i < menuObjs.length; i++) {
			createMenu(menuObjs[i]);
		}

		function splitMenu(menuObj) {
			menuObj.addClass('menu');
			menuObjs.push(menuObj);
			menuObj.children('div').each(function () {
				var submenuObj = $(this).children('div');
				if (submenuObj.length) {
					submenuObj.insertAfter(target);
					this.submenuObj = submenuObj;
					splitMenu(submenuObj);
				}
			});
		}

		function createMenu(menuObj) {
			menuObj.children('div').each(function (i, n) {
				var itemObj = $(this);
				var itemOpts = $.extend({}, $.parser.parseOptions(this, ['name', 'iconCls', 'href', { separator: 'boolean' }]), {
					text: $.trim(itemObj.html()),
					disabled: (itemObj.attr('disabled') ? true : undefined)
				});
				if (itemOpts.separator) {
					itemObj.before('<div class="menu-sep"></div>');
				}
				itemOpts.name = itemOpts.name || '';
				itemOpts.text = itemOpts.text || '';
				itemOpts.iconCls = itemOpts.iconCls || '';
				itemOpts.href = itemOpts.href || '';
				itemOpts.separator = itemOpts.separator || false;
				itemOpts.disabled = itemOpts.disabled || false;

				itemObj.data('menuItem', { options: itemOpts });
				itemObj.addClass('menu-item');
				if (itemOpts.iconCls) {
					itemObj.addClass('menu-icon').addClass(itemOpts.iconCls);
				}
				if (itemOpts.disabled) {
					setDisabled(target, itemObj[0], true);
				}
				if (itemObj[0].submenuObj) {
					$('<div class="menu-rightarrow"></div>').appendTo(itemObj);
				}

				bindMenuItemEvent(target, itemObj);
			});
			setMenuSize(target, menuObj);
			menuObj.hide();
			bindMenuEvent(target, menuObj);
		}
	}

	function setMenuSize(target, menuObj) {
		menuObj.css({
			left: -10000
		});
	}
	function bindMenuEvent(target, menuObj) {
		var state = $(target).data('menu');
		menuObj.unbind('.menu').bind('mouseenter.menu', function () {
			if (state.timer) {
				clearTimeout(state.timer);
				state.timer = null;
			}
		}).bind('mouseleave.menu', function () {
			if (state.options.hideOnUnhover) {
				state.timer = setTimeout(function () {
					hideAll(target);
				}, state.options.duration);
			}
		});
	}
	function bindMenuItemEvent(target, itemObj) {
		itemObj.unbind('.menu');
		var itemOpts = itemObj.data('menuItem').options;
		itemObj.bind('click.menu', function () {
			if ($(this).hasClass('menu-item-disabled')) {
				return;
			}
			// only the sub menu clicked can hide all menus
			if (!this.submenuObj) {
				hideAll(target);
				var href = itemOpts.href;
				if (href) {
					location.href = href;
				}
			}
			$(target).data('menu').options.onClick.call(target, $(target).menu('getItem', this));
		}).bind('mouseenter.menu', function (e) {
			// hide other menu
			itemObj.siblings().each(function () {
				if (this.submenuObj) {
					hideMenu(this.submenuObj);
				}
				$(this).removeClass('menu-active');
			});
			// show this menu
			itemObj.addClass('menu-active');

			if ($(this).hasClass('menu-item-disabled')) {
				itemObj.addClass('menu-active-disabled');
				return;
			}

			var submenuObj = itemObj[0].submenuObj;
			if (submenuObj) {
				$(target).menu('show', {
					menuObj: submenuObj,
					parentObj: itemObj
				});
			}
		}).bind('mouseleave.menu', function (e) {
			itemObj.removeClass('menu-active menu-active-disabled');
			var submenuObj = itemObj[0].submenuObj;
			if (submenuObj) {
				if (e.pageX >= parseInt(submenuObj.css('left'))) {
					itemObj.addClass('menu-active');
				} else {
					hideMenu(submenuObj);
				}
			} else {
				itemObj.removeClass('menu-active');
			}
		});
	}

	/**
	 * hide top menu and it's all sub menus
	 */
	function hideAll(target) {
		var state = $(target).data('menu');
		if (state) {
			if ($(target).is(':visible')) {
				hideMenu($(target));
				state.options.onHide.call(target);
			}
		}
	}

	/**
	 * show the menu, the 'param' object has one or more properties:
	 * left: the left position to display
	 * top: the top position to display
	 * menuObj: the menu to display, if not defined, the 'target menu' is used
	 * parentObj: the parent menu item to align to
	 * alignTo: the element object to align to
	 */
	function showMenu(target, param) {
		var left, top;
		param = param || {};
		var menuObj = param.menuObj || $(target);
		if (menuObj.hasClass('menu-top')) {
			var menuOpts = $(target).data('menu').options;
			$.extend(menuOpts, param);
			left = menuOpts.left;
			top = menuOpts.top;
			if (menuOpts.alignTo) {
				var alignToObj = $(menuOpts.alignTo);
				left = alignToObj.offset().left;
				top = alignToObj.offset().top + alignToObj.outerHeight();
				if (menuOpts.align == 'right') {
					left += alignToObj.outerWidth() - menuObj.outerWidth();
				}
			}
			if (left + menuObj.outerWidth() > $(window).outerWidth() + $(document).scrollLeft()) {
				left = $(window).outerWidth() + $(document).scrollLeft() - menuObj.outerWidth() - 5;
			}
			if (left < 0) { left = 0; }
			top = fixTop(top, menuOpts.alignTo);
		} else {
			var parentObj = param.parentObj;	// the parent menu item
			left = parentObj.offset().left + parentObj.outerWidth() - 2;
			if (left + menuObj.outerWidth() + 5 > $(window).outerWidth() + $(document).scrollLeft()) {
				left = parentObj.offset().left - menuObj.outerWidth() + 2;
			}
			top = fixTop(parentObj.offset().top - 3);
		}

		function fixTop(top, alignToObj) {
			if (top + menuObj.outerHeight() > $(window).outerHeight() + $(document).scrollTop()) {
				if (alignToObj) {
					top = $(alignToObj).offset().top - menuObj.outerHeight();
				} else {
					top = $(window).outerHeight() + $(document).scrollTop() - menuObj.outerHeight();
				}
			}
			if (top < 0) { top = 0; }
			return top;
		}

		menuObj.css({ left: left, top: top });
		menuObj.show(0, function () {
			if (menuObj.hasClass('menu-top')) {
				menuObj.data('menu').options.onShow.call(menuObj[0]);
			}
		});
	}

	function hideMenu(menuObj) {
		if (!menuObj) return;
		menuObj.hide();
		menuObj.find('div.menu-item').each(function () {
			if (this.submenuObj) {
				hideMenu(this.submenuObj);
			}
			$(this).removeClass('menu-active');
		});
	}

	function findItem(target, name) {
		var result = null;
		function find(menuObj) {
			menuObj.children('div.menu-item').each(function () {
				var itemObj = $(target).menu('getItem', this);
				if (name == itemObj.options.name) {
					result = {
						target: this,
						options: itemObj.options
					};
				} else if (this.submenuObj && result == null) {
					find(this.submenuObj);
				}
			});
		}
		find($(target));
		return result;
	}

	function setDisabled(target, item, disabled) {
		var itemObj = $(item);
		if (!itemObj.hasClass('menu-item')) { return; }
		var itemOpts = itemObj.data('menuItem').options;
		if (disabled) {
			itemObj.addClass('menu-item-disabled');
		} else {
			itemObj.removeClass('menu-item-disabled');
		}
	}

	function appendItem(target, param) {
		var menuObj = $(target);
		if (param.parent) {
			if (!param.parent.submenuObj) {
				var submenuObj = $(param.parent).after('<div class="menu"></div>');
				submenuObj.hide();
				param.parent.submenuObj = submenuObj;
				$('<div class="menu-rightarrow"></div>').appendTo(param.parent);
			}
			menuObj = param.parent.submenuObj;
		}
		var itemObj = $('<div class="menu-item"></div>').appendTo(menuObj);
		itemObj.html(param.text);
		if (param.iconCls) {
			itemObj.addClass('menu-icon').addClass(param.iconCls);
		}
		var itemOpts = {};
		itemOpts.name = param.name || '';
		itemOpts.text = param.text || '';
		itemOpts.iconCls = param.iconCls || '';
		itemOpts.href = param.href || '';
		itemOpts.separator = param.separator || false;
		itemOpts.disabled = param.disabled || false;
		itemObj.data('menuItem', { options: itemOpts });
		if (itemOpts.separators) {
			itemObj.before('<div class="menu-sep"></div>');
		}
		if(itemOpts.disabled){
			setDisabled(target, itemObj[0], false);
		}

		bindMenuItemEvent(target, itemObj);
		bindMenuEvent(target, menuObj);
	}

	function removeItem(target, item) {
		function removeit(el) {
			if (el.submenuObj) {
				el.submenuObj.children('div.menu-item').each(function () {
					removeit(this);
				});
				el.submenuObj.remove();
			}
			$(el).remove();
		}
		var menuObj = $(item).parent();
		removeit(item);
	}

	function setVisible(target, item, visible) {
		var menu = $(item).parent();
		if (visible) {
			$(item).show();
		} else {
			$(item).hide();
		}
	}

	function destroyMenu(target) {
		$(target).children('div.menu-item').each(function () {
			removeItem(target, this);
		});
		$(target).remove();
	}

	$.fn.menu = function (options, param) {
		if (typeof options == 'string') {
			return $.fn.menu.methods[options](this, param);
		}

		options = options || {};
		return this.each(function () {
			var state = $(this).data('menu');
			if (state) {
				$.extend(state.options, options);
			} else {
				state = $(this).data('menu', {
					options: $.extend({}, $.fn.menu.defaults, $.fn.menu.parseOptions(this), options)
				});
				init(this);
			}
		});
	};

	$.fn.menu.methods = {
		options: function (jq) {
			return $(jq[0]).data('menu').options;
		},
		show: function (jq, param) {
			return jq.each(function () {
				showMenu(this, param);
			});
		},
		hide: function (jq) {
			return jq.each(function () {
				hideAll(this);
			});
		},
		destroy: function (jq) {
			return jq.each(function () {
				destroyMenu(this);
			});
		},
		/**
		 * set the menu item text
		 * param: {
		 * 	target: DOM object, indicate the menu item
		 * 	text: string, the new text
		 * }
		 */
		setText: function (jq, param) {
			return jq.each(function () {
				$(param.target).html(param.text);
			});
		},
		/**
		 * set the menu icon class
		 * param: {
		 * 	target: DOM object, indicate the menu item
		 * 	iconCls: the menu item icon class
		 * }
		 */
		setIcon: function (jq, param) {
			return jq.each(function () {
				if (param.iconCls) {
					$(param.target).addClass(param.iconCls).removeClass($(param.target).data('menuItem').options.iconCls);
				}
			});
		},
		/**
		 * get the menu item data that contains the following property:
		 * {
		 * 	target: DOM object, the menu item
		 *  options:
		 * }
		 */
		getItem: function (jq, item) {
			var itemObj = $(item);
			var item = {
				target: item,
				options: itemObj.data('menuItem').options
			}
			return item;
		},
		findItem: function (jq, name) {
			return findItem(jq[0], name);
		},
		/**
		 * append menu item, the param contains following properties:
		 * parent,name,text,iconCls,href,separator,disabled
		 * when parent property is assigned, append menu item to it
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

	$.fn.menu.parseOptions = function (target) {
		return $.extend({}, $.parser.parseOptions(target, [{ minWidth: 'number', duration: 'number', hideOnUnhover: 'boolean' }]));
	};

	$.fn.menu.defaults = {
		zIndex: 110000,
		left: 0,
		top: 0,
		alignTo: null,
		align: 'left',
		minWidth: 120,
		duration: 100,	// 自定义隐藏菜单动画的持续时间，以毫秒为单位
		hideOnUnhover: true,	// 当设置为true时，在鼠标离开菜单的时候将自动隐藏菜单
		onShow: function () { },
		onHide: function () { },
		onClick: function (item) { }
	};
})(jQuery);
