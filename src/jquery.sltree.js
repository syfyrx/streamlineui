// jQuery StreamlineUI v1.0 
// 依赖：slparse、sldraggable、sldroppable
(function($) {
	// 初始化
	function init(target) {
		var t = $(target);
		t.addClass('slui-tree sltree');
		return t;
	}
	// 绑定事件
	function bindEvent(target) {
		var opts = $(target).data('sltree').options;
		$(target).unbind('.sltree').bind('mouseover.sltree', function(e) {
			var tt = $(e.target);
			var node = tt.closest('div.sltree-node');
			if (!node.length) {
				return;
			}
			node.addClass('sltree-node-hover');
			if (tt.hasClass('sltree-hit')) {
				if (tt.hasClass('sltree-expanded')) {
					tt.addClass('sltree-expanded-hover');
				} else {
					tt.addClass('sltree-collapsed-hover');
				}
			}
			e.stopPropagation();
		}).bind('mouseout.sltree', function(e) {
			var tt = $(e.target);
			var node = tt.closest('div.sltree-node');
			if (!node.length) {
				return;
			}
			node.removeClass('sltree-node-hover');
			if (tt.hasClass('sltree-hit')) {
				if (tt.hasClass('sltree-expanded')) {
					tt.removeClass('sltree-expanded-hover');
				} else {
					tt.removeClass('sltree-collapsed-hover');
				}
			}
			e.stopPropagation();
		}).bind('click.sltree', function(e) {
			var tt = $(e.target);
			var node = tt.closest('div.sltree-node');
			if (!node.length) {
				return;
			}
			if (tt.hasClass('sltree-hit')) {
				toggle(target, node[0]);
				return false;
			} else if (tt.hasClass('sltree-checkbox')) {
				check(target, node[0]);
				return false;
			} else {
				select(target, node[0]);
				opts.onClick.call(target, getNode(target, node[0]));
			}
			e.stopPropagation();
		}).bind('dblclick.sltree', function(e) {
			var node = $(e.target).closest('div.sltree-node');
			if (!node.length) {
				return;
			}
			select(target, node[0]);
			opts.onDblClick.call(target, getNode(target, node[0]));
			e.stopPropagation();
		}).bind('contextmenu.sltree', function(e) {
			var node = $(e.target).closest('div.sltree-node');
			if (!node.length) {
				return;
			}
			opts.onContextMenu.call(target, e, getNode(target, node[0]));
			e.stopPropagation();
		});
	}
	// 禁用拖拽
	function disableDnd(target) {
		var opts = $(target).data('sltree').options;
		opts.dnd = false;
		$(target).find('div.sltree-node').draggable('disable').css('cursor', 'pointer');
	}
	// 启用拖拽
	function enableDnd(target) {
		var state = $(target).data('sltree');
		var opts = state.options;
		state.disabledNodes = [];
		opts.dnd = true;
		if ($.fn.sldraggable && $.fn.sldroppable) {
			$(target).find('div.sltree-node').sldraggable({
				disabled : false,
				revert : true,
				cursor : 'pointer',
				deltaX : 15,
				deltaY : 15,
				onBeforeDrag : function(e) {
					if (opts.onBeforeDrag.call(target, getNode(target, this)) == false) {
						return false;
					}
					$(this).sldraggable({
						proxy : function(nodeEl) {
							var p = $('<div class="sltree-node-proxy"></div>').appendTo('body');
							p.html('<span class="sltree-dnd-icon sltree-dnd-no">&nbsp;</span>' + $(nodeEl).find('.sltree-title').html());
							p.hide();
							return p;
						}
					});
					if ($(e.target).hasClass('sltree-hit') || $(e.target).hasClass('sltree-checkbox')) {
						return false;
					}
					if (e.which != 1) {
						return false;
					}
					$(this).next('ul').find('div.sltree-node').sldroppable({
						accept : 'no-accept'
					});
					var indent = $(this).find('span.sltree-indent');
					if (indent.length) {
						e.data.offsetWidth -= indent.length * indent.width();
					}
				},
				onStartDrag : function() {
					$(this).sldraggable('proxy').css({
						left : -10000,
						top : -10000
					});
					var node = getNode(target, this);
					opts.onStartDrag.call(target, node);
					if (node.id == undefined) {
						node.id = 'slui_sltree_node_id_temp';
						update(target, node);
					}
					state.draggingNodeId = node.id;
				},
				onDrag : function(e) {
					var x1 = e.pageX, y1 = e.pageY, x2 = e.data.startX, y2 = e.data.startY;
					var d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
					if (d > 3) {
						$(this).sldraggable('proxy').show();
					}
					this.pageY = e.pageY;
				},
				onStopDrag : function() {
					$(this).next('ul').find('div.sltree-node').sldroppable({
						accept : 'div.sltree-node'
					});
					for (var i = 0; i < state.disabledNodes.length; i++) {
						$(state.disabledNodes[i]).sldroppable('enable');
					}
					state.disabledNodes = [];
					var node = find(target, state.draggingNodeId);
					if (node && node.id == 'slui_sltree_node_id_temp') {
						node.id = '';
						update(target, node);
					}
					opts.onStopDrag.call(target, node);
				}
			}).sldroppable({
				accept : 'div.sltree-node',
				onDragEnter : function(e, source) {
					if (opts.onDragEnter.call(target, this, getNode(target, source)) == false) {
						changeProxyIcon(source, false);
						$(this).removeClass('sltree-node-append sltree-node-top sltree-node-bottom');
						$(this).sldroppable('disable');
						state.disabledNodes.push(this);
					}
				},
				onDragOver : function(e, source) {
					if ($(this).sldroppable('options').disabled) {
						return;
					}
					var pageY = source.pageY;
					var top = $(this).offset().top;
					var otop = top + $(this).outerHeight();
					changeProxyIcon(source, true);
					$(this).removeClass('sltree-node-append sltree-node-top sltree-node-bottom');
					if (pageY > top + (otop - top) / 2) {
						if (otop - pageY < 5) {
							$(this).addClass('sltree-node-bottom');
						} else {
							$(this).addClass('sltree-node-append');
						}
					} else {
						if (pageY - top < 5) {
							$(this).addClass('sltree-node-top');
						} else {
							$(this).addClass('sltree-node-append');
						}
					}
					if (opts.onDragOver.call(target, this, getNode(target, source)) == false) {
						changeProxyIcon(source, false);
						$(this).removeClass('sltree-node-append sltree-node-top sltree-node-bottom');
						$(this).sldroppable('disable');
						state.disabledNodes.push(this);
					}
				},
				onDragLeave : function(e, source) {
					changeProxyIcon(source, false);
					$(this).removeClass('sltree-node-append sltree-node-top sltree-node-bottom');
					opts.onDragLeave.call(target, this, getNode(target, source));
				},
				onDrop : function(e, source) {
					var fun, point;
					if ($(this).hasClass('sltree-node-append')) {
						fun = dropAppend;
						point = 'append';
					} else {
						fun = dropPosition;
						point = $(this).hasClass('sltree-node-top') ? 'top' : 'bottom';
					}
					if (opts.onBeforeDrop.call(target, this, getNode(target, source), point) == false) {
						$(this).removeClass('sltree-node-append sltree-node-top sltree-node-bottom');
						return;
					}
					fun(source, this, point);
					$(this).removeClass('sltree-node-append sltree-node-top sltree-node-bottom');
				}
			});
			// 改变代理节点的图标
			function changeProxyIcon(nodeEl, flag) {
				var icon = $(nodeEl).sldraggable('proxy').find('span.sltree-dnd-icon');
				icon.removeClass('sltree-dnd-yes sltree-dnd-no').addClass(flag ? 'sltree-dnd-yes' : 'sltree-dnd-no');
			}
			// 以追加的方式拖拽节点
			function dropAppend(sourceEl, proxyEl) {
				if (getNode(target, proxyEl).state == 'closed') {
					expand(target, proxyEl, function() {
						mAppend();
					});
				} else {
					mAppend();
				}
				function mAppend() {
					var source = getNode(target, sourceEl);
					remove(target, sourceEl);
					append(target, {
						parent : proxyEl,
						data : [ source ]
					});
					opts.onDrop.call(target, proxyEl, source, 'append');
				}
			}
			// 拖拽节点，改变节点位置
			function dropPosition(sourceEl, proxyEl, point) {
				var param = {};
				if (point == 'top') {
					param.before = proxyEl;
				} else {
					param.after = proxyEl;
				}
				var source = getNode(target, sourceEl);
				remove(target, sourceEl);
				param.data = source;
				insert(target, param);
				opts.onDrop.call(target, proxyEl, source, point);
			}
		}
	}
	// 选中或取消选中节点
	function check(target, nodeEl, flag) {
		var state = $(target).data('sltree');
		var opts = state.options;
		if (!opts.checkbox) {
			return;
		}
		var nodeData = getNode(target, nodeEl);
		if (flag == undefined) {
			var ck = $(nodeEl).find('.sltree-checkbox');
			if (ck.hasClass('sltree-checkbox1')) {
				flag = false;
			} else {
				if (ck.hasClass('sltree-checkbox0')) {
					flag = true;
				} else {
					if (nodeData.checked == undefined) {
						nodeData.checked = $(nodeEl).find('.sltree-checkbox').hasClass('sltree-checkbox1');
					}
					flag = !nodeData.checked;
				}
			}
		}
		nodeData.checked = flag;
		if (opts.onBeforeCheck.call(target, nodeData, flag) == false) {
			return;
		}
		if (opts.cascadeCheck) {
			changeLower(nodeData, flag);
			changeHigher(nodeData, flag);
		} else {
			changeCls($(nodeData.target), flag ? '1' : '0');
		}
		opts.onCheck.call(target, nodeData, flag);
		// 改变节点的选中状态
		function changeCls(cNode, cState) {
			var ck = cNode.find('.sltree-checkbox');
			ck.removeClass('sltree-checkbox0 sltree-checkbox1 sltree-checkbox2');
			ck.addClass('sltree-checkbox' + cState);
		}
		// 改变节点及节点的子节点状态
		function changeLower(mNodeData, mFlag) {
			changeCls($('#' + mNodeData.domId), mFlag ? '1' : '0');
			ergodic(mNodeData.children || [], function(n) {
				changeCls($('#' + n.domId), mFlag ? '1' : '0');
			});
		}
		// 改变父节点
		function changeHigher(mNode, mFlag) {
			var nodeObj = $('#' + mNode.domId);
			var pNodeObj = getParent(target, nodeObj[0]);
			if (pNodeObj) {
				var status = '';
				// 判断当前节点同辈节点是否全部为选中
				if (judgeStatus(nodeObj, true)) {
					status = '1';
				} else {
					// 判断当前节点同辈节点是否全部为未选中
					if (judgeStatus(nodeObj, false)) {
						status = '0';
					} else {
						status = '2';
					}
				}
				changeCls($(pNodeObj.target), status);
				changeHigher(pNodeObj, mFlag);
			}
		}
		// 判断同级节点的状态
		function judgeStatus(mNode, mFlag) {
			var cls = 'sltree-checkbox' + (mFlag ? '1' : '0');
			var ck = mNode.find('.sltree-checkbox');
			if (!ck.hasClass(cls)) {
				return false;
			}
			var b = true;
			mNode.parent().siblings().each(function() {
				var ck = $(this).children('div.sltree-node').children('.sltree-checkbox');
				if (ck.length && !ck.hasClass(cls)) {
					b = false;
					return false;
				}
			});
			return b;
		}
	}
	// 当移除指定节点或给指定节点添加子节点后，更新节点
	function updateCheckStatus(target, nodeEl) {
		var opts = $(target).data('sltree').options;
		if (!opts.checkbox) {
			return;
		}
		var node = $(nodeEl);
		if (isLeaf(target, nodeEl)) {
			var ck = node.find('.sltree-checkbox');
			if (ck.length) {
				if (ck.hasClass('sltree-checkbox1')) {
					check(target, nodeEl, true);
				} else {
					check(target, nodeEl, false);
				}
			} else {
				if (opts.onlyLeafCheck) {
					$('<span class="sltree-checkbox sltree-checkbox0"></span>').insertBefore(node.find('.sltree-title'));
				}
			}
		} else {
			var ck = node.find('.sltree-checkbox');
			if (opts.onlyLeafCheck) {
				ck.remove();
			} else {
				if (ck.hasClass('sltree-checkbox1')) {
					check(target, nodeEl, true);
				} else {
					if (ck.hasClass('sltree-checkbox2')) {
						var flag1 = true;
						var flag2 = true;
						var subNode = getChildren(target, nodeEl);
						for (var i = 0; i < subNode.length; i++) {
							if (subNode[i].checked) {
								flag2 = false;
							} else {
								flag1 = false;
							}
						}
						if (flag1) {
							check(target, nodeEl, true);
						}
						if (flag2) {
							check(target, nodeEl, false);
						}
					}
				}
			}
		}
	}
	// 加载数据
	// ul：加载数据的目标
	// data：加载的数据
	// flag：true代表向节点追加数据，否则为替换节点数据
	function loadData(target, ul, data, flag) {
		var state = $(target).data('sltree');
		var opts = state.options;
		var pNode = $(ul).prevAll('div.sltree-node:first');
		data = opts.loadFilter.call(target, data, pNode[0]);
		var pNodeData = getNodeData(target, 'domId', pNode.attr('id'));

		if (!flag) {// 替换节点数据
			pNodeData ? pNodeData.children = data : state.data = data;
			$(ul).empty();
		} else {// 追加节点数据
			if (pNodeData) {
				pNodeData.children ? pNodeData.children = pNodeData.children.concat(data) : pNodeData.children = data;
			} else {
				state.data = state.data.concat(data);
			}
		}
		opts.view.render.call(opts.view, target, ul, data);
		if (opts.dnd) {
			enableDnd(target);
		}
		if (pNodeData) {
			update(target, pNodeData);
		}
		var uncheckedData = [];
		var checkedData = [];
		for (var i = 0; i < data.length; i++) {
			var item = data[i];
			if (!item.checked) {
				uncheckedData.push(item);
			}
		}
		ergodic(data, function(nodeData) {
			if (nodeData.checked) {
				checkedData.push(nodeData);
			}
		});
		// 加载数据的时候不响应onCheck事件
		var onCheck = opts.onCheck;
		opts.onCheck = function() {
		};
		if (uncheckedData.length) {
			check(target, $('#' + uncheckedData[0].domId)[0], false);
		}
		for (var i = 0; i < checkedData.length; i++) {
			check(target, $('#' + checkedData[i].domId)[0], true);
		}
		opts.onCheck = onCheck;
		opts.onLoadSuccess.call(target, pNodeData, data);
	}
	// 请求远程数据
	// ul指定节点
	function request(target, ul, param, fun) {
		var opts = $(target).data('sltree').options;
		param = $.extend({}, opts.queryParams, param || {});
		var nodeData = null;
		if (target != ul) {
			var node = $(ul).prev();
			nodeData = getNode(target, node[0]);
		}
		if (opts.onBeforeLoad.call(target, nodeData, param) == false) {
			return;
		}
		var icon = $(ul).prev().children('span.sltree-folder');
		icon.addClass('sltree-loading');
		var res = opts.loader.call(target, param, function(data) {
			icon.removeClass('sltree-loading');
			loadData(target, ul, data);
			if (fun) {
				fun();
			}
		}, function() {
			icon.removeClass('sltree-loading');
			opts.onLoadError.apply(target, arguments);
			if (fun) {
				fun();
			}
		});
		if (res == false) {
			icon.removeClass('sltree-loading');
		}
	}
	// 展开指定节点
	function expand(target, nodeEl, fun) {
		var opts = $(target).data('sltree').options;
		var hit = $(nodeEl).children('.sltree-hit');
		if (hit.length == 0) {
			return;
		}
		if (hit.hasClass('sltree-expanded')) {
			return;
		}
		var nodeData = getNode(target, nodeEl);
		if (opts.onBeforeExpand.call(target, nodeData) == false) {
			return;
		}
		hit.removeClass('sltree-collapsed sltree-collapsed-hover').addClass('sltree-expanded');
		hit.next().addClass('sltree-folder-open');
		var ul = $(nodeEl).next();
		if (ul.length) {
			if (opts.animate) {
				ul.slideDown('normal', function() {
					nodeData.state = 'open';
					opts.onExpand.call(target, nodeData);
					if (fun) {
						fun();
					}
				});
			} else {
				ul.css('display', 'block');
				nodeData.state = 'open';
				opts.onExpand.call(target, nodeData);
				if (fun) {
					fun();
				}
			}
		} else {
			ul = $('<ul style="display:none"></ul>').insertAfter(nodeEl);
			request(target, ul[0], {
				id : nodeData.id
			}, function() {
				if (ul.is(':empty')) {
					ul.remove();
				}
				if (opts.animate) {
					ul.slideDown('normal', function() {
						nodeData.state = 'open';
						opts.onExpand.call(target, nodeData);
						if (fun) {
							fun();
						}
					});
				} else {
					ul.css('display', 'block');
					nodeData.state = 'open';
					opts.onExpand.call(target, nodeData);
					if (fun) {
						fun();
					}
				}
			});
		}
	}
	// 折叠指定节点。
	function collapse(target, nodeEl) {
		var opts = $(target).data('sltree').options;
		var hit = $(nodeEl).children('span.sltree-hit');
		if (hit.length == 0) {
			return;
		}
		if (hit.hasClass('sltree-collapsed')) {
			return;
		}
		var nodeData = getNode(target, nodeEl);
		if (opts.onBeforeCollapse.call(target, nodeData) == false) {
			return;
		}
		hit.removeClass('sltree-expanded sltree-expanded-hover').addClass('sltree-collapsed');
		hit.next().removeClass('sltree-folder-open');
		var ul = $(nodeEl).next();
		if (opts.animate) {
			ul.slideUp('normal', function() {
				nodeData.state = 'closed';
				opts.onCollapse.call(target, nodeData);
			});
		} else {
			ul.css('display', 'none');
			nodeData.state = 'closed';
			opts.onCollapse.call(target, nodeData);
		}
	}
	// 切换节点的展开或折叠状态
	function toggle(target, nodeEl) {
		var hit = $(nodeEl).children('span.sltree-hit');
		if (hit.length == 0) {
			return;
		}
		if (hit.hasClass('sltree-expanded')) {
			collapse(target, nodeEl);
		} else {
			expand(target, nodeEl);
		}
	}
	// 展开所有节点
	function expandAll(target, nodeEl) {
		var nodeDatas = getChildren(target, nodeEl);
		if (nodeEl) {
			nodeDatas.unshift(getNode(target, nodeEl));
		}
		for (var i = 0; i < nodeDatas.length; i++) {
			expand(target, nodeDatas[i].target);
		}
	}
	// 展开节点到指定节点位置
	function expandTo(target, nodeEl) {
		var nodes = [];
		var p = getParent(target, nodeEl);
		while (p) {
			nodes.unshift(p);
			p = getParent(target, p.target);
		}
		for (var i = 0; i < nodes.length; i++) {
			expand(target, nodes[i].target);
		}
	}
	// 滚动到指定节点位置
	function scrollTo(target, nodeEl) {
		var c = $(target).parent();
		while (c[0].tagName != 'BODY' && c.css('overflow-y') != 'auto') {
			c = c.parent();
		}
		var n = $(nodeEl);
		var nodeTop = n.offset().top;
		if (c[0].tagName != 'BODY') {
			var top = c.offset().top;
			if (nodeTop < top) {
				c.scrollTop(c.scrollTop() + nodeTop - top);
			} else {
				if (nodeTop + n.outerHeight() > top + c.outerHeight() - 18) {
					c.scrollTop(c.scrollTop() + nodeTop + n.outerHeight() - top - c.outerHeight() + 18);
				}
			}
		} else {
			c.scrollTop(nodeTop);
		}
	}
	// 折叠所有节点
	function collapseAll(target, nodeEl) {
		var nodeDatas = getChildren(target, nodeEl);
		if (nodeEl) {
			nodeDatas.unshift(getNode(target, nodeEl));
		}
		for (var i = 0; i < nodeDatas.length; i++) {
			collapse(target, nodeDatas[i].target);
		}
	}
	// 追加节点到指定节点内部
	// param参数：
	// parent：DOM元素，父节点
	// data：数组，节点数据
	function append(target, param) {
		var pNode = $(param.parent);
		var data = param.data;
		if (!data) {
			return;
		}
		data = $.isArray(data) ? data : [ data ];
		if (!data.length) {
			return;
		}
		var ul;
		if (pNode.length == 0) {
			ul = $(target);
		} else {
			if (isLeaf(target, pNode[0])) {
				var icon = pNode.find('span.sltree-icon');
				icon.removeClass('sltree-file').addClass('sltree-folder sltree-folder-open');
				var hit = $('<span class="sltree-hit sltree-expanded"></span>').insertBefore(icon);
				if (hit.prev().length) {
					hit.prev().remove();
				}
			}
			ul = pNode.next();
			if (!ul.length) {
				ul = $('<ul></ul>').insertAfter(pNode);
			}
		}
		loadData(target, ul[0], data, true);
		updateCheckStatus(target, ul.prev());
	}
	// 在指定节点之前或之后插入
	// param参数：
	// before：DOM元素，节点之前插入
	// after：DOM元素，节点之后插入
	// data：数组，节点数据
	function insert(target, param) {
		var ref = param.before || param.after;
		var pNodeData = getParent(target, ref);
		var data = param.data;
		if (!data) {
			return;
		}
		data = $.isArray(data) ? data : [ data ];
		if (!data.length) {
			return;
		}
		append(target, {
			parent : (pNodeData ? pNodeData.target : null),
			data : data
		});
		var subNode = pNodeData ? pNodeData.children : $(target).sltree('getRoots');
		for (var i = 0; i < subNode.length; i++) {
			if (subNode[i].domId == $(ref).attr('id')) {
				for (var j = data.length - 1; j >= 0; j--) {
					subNode.splice((param.before ? i : (i + 1)), 0, data[j]);
				}
				subNode.splice(subNode.length - data.length, data.length);
				break;
			}
		}
		console.log(pNodeData.children);
		var li = $();
		for (var i = 0; i < data.length; i++) {
			li = li.add($('#' + data[i].domId).parent());
		}
		if (param.before) {
			li.insertBefore($(ref).parent());
		} else {
			li.insertAfter($(ref).parent());
		}
	}
	// 移除指定节点
	function remove(target, nodeEl) {
		var pNodeData = del(nodeEl);
		$(nodeEl).parent().remove();
		if (pNodeData) {
			if (!pNodeData.children || !pNodeData.children.length) {
				var pNode = $(pNodeData.target);
				pNode.find('.sltree-icon').removeClass('sltree-folder').addClass('sltree-file');
				pNode.find('.sltree-hit').remove();
				$('<span class="sltree-indent"></span>').prependTo(pNode);
				pNode.next().remove();
			}
			update(target, pNodeData);
			updateCheckStatus(target, pNodeData.target);
		}
		function del(nodeEl) {
			var id = $(nodeEl).attr('id');
			var pNodeData = getParent(target, nodeEl);
			var cc = pNodeData ? pNodeData.children : $(target).data('sltree').data;
			for (var i = 0; i < cc.length; i++) {
				if (cc[i].domId == id) {
					cc.splice(i, 1);
					break;
				}
			}
			return pNodeData;
		}
	}
	// 更新指定节点
	// param参数：
	// target：DOM元素，更新的节点
	// text：
	// iconCls：
	// checked：
	function update(target, param) {
		var opts = $(target).data('sltree').options;
		var node = $(param.target);
		var nodeData = getNode(target, param.target);
		var nodeChecked = nodeData.checked;
		if (nodeData.iconCls) {
			node.find('.sltree-icon').removeClass(nodeData.iconCls);
		}
		$.extend(nodeData, param);
		node.find('.sltree-title').html(opts.formatter.call(target, nodeData));
		if (nodeData.iconCls) {
			node.find('.sltree-icon').addClass(nodeData.iconCls);
		}
		if (nodeChecked != nodeData.checked) {
			check(target, param.target, nodeData.checked);
		}
	}
	// 获取节点的根节点，返回null或节点数据。
	function getRoot(target, nodeEl) {
		if (nodeEl) {
			var p = getParent(target, nodeEl);
			while (p) {
				nodeEl = p.target;
				p = getParent(target, nodeEl);
			}
			return getNode(target, nodeEl);
		} else {
			var root = getRoots(target);
			return root.length ? root[0] : null;
		}
	}
	// 获取所有根节点
	function getRoots(target) {
		var roots = $(target).data('sltree').data;
		for (var i = 0; i < roots.length; i++) {
			getNodeNow(roots[i]);
		}
		return roots;
	}
	// 获取所有子节点
	function getChildren(target, nodeEl) {
		var res = [];
		var n = getNode(target, nodeEl);
		var nodes = n ? (n.children || []) : $(target).data('sltree').data;
		ergodic(nodes, function(node) {
			res.push(getNodeNow(node));
		});
		return res;
	}
	// 获取父节点
	function getParent(target, nodeEl) {
		var p = $(nodeEl).closest('ul').prevAll('div.sltree-node:first');
		return getNode(target, p[0]);
	}
	// 获取指定状态的节点
	function getChecked(target, state) {
		state = state || 'checked';
		if (!$.isArray(state)) {
			state = [ state ];
		}
		var selector = [];
		for (var i = 0; i < state.length; i++) {
			var s = state[i];
			if (s == 'checked') {
				selector.push('span.sltree-checkbox1');
			} else {
				if (s == 'unchecked') {
					selector.push('span.sltree-checkbox0');
				} else {
					if (s == 'indeterminate') {
						selector.push('span.sltree-checkbox2');
					}
				}
			}
		}
		var nodes = [];
		$(target).find(selector.join(',')).each(function() {
			var nodeEl = $(this).parent();
			nodes.push(getNode(target, nodeEl[0]));
		});
		return nodes;
	}
	// 获取选中的节点
	function getSelected(target) {
		var selectedNode = $(target).find('div.sltree-node-selected');
		return selectedNode.length ? getNode(target, selectedNode[0]) : null;
	}
	// 获取节点数据，包含它的子节点
	function getData(target, nodeEl) {
		var node = getNode(target, nodeEl);
		if (node && node.children) {
			ergodic(node.children, function(subNode) {
				getNodeNow(subNode);
			});
		}
		return node;
	}
	// 获取节点数据。
	function getNode(target, nodeEl) {
		return getNodeData(target, 'domId', $(nodeEl).attr('id'));
	}
	// 根据节点id，获取节点数据。
	function find(target, id) {
		return getNodeData(target, 'id', id);
	}
	// 获取节点数据。
	// type可用值：'domId'、'id'
	// 返回null或object
	function getNodeData(target, type, typeValue) {
		var data = $(target).data('sltree').data;
		var res = null;
		ergodic(data, function(node) {
			if (node[type] == typeValue) {
				res = getNodeNow(node);
				return false;
			}
		});
		return res;
	}
	// 获取指定节点的当前状态。
	function getNodeNow(node) {
		var d = $('#' + node.domId);
		node.target = d[0];
		node.checked = d.find('.sltree-checkbox').hasClass('sltree-checkbox1');
		return node;
	}
	// 遍历所有节点，当fun的返回值为false时退出。
	function ergodic(data, fun) {
		var cloneData = [];
		for (var i = 0; i < data.length; i++) {
			cloneData.push(data[i]);
		}
		while (cloneData.length) {
			var firstData = cloneData.shift();
			if (fun(firstData) == false) {
				return;
			}
			if (firstData.children) {
				for (var i = firstData.children.length - 1; i >= 0; i--) {
					cloneData.unshift(firstData.children[i]);
				}
			}
		}
	}
	// 选择指定节点
	function select(target, nodeEl) {
		var opts = $(target).data('sltree').options;
		var node = getNode(target, nodeEl);
		if (opts.onBeforeSelect.call(target, node) == false) {
			return;
		}
		$(target).find('div.sltree-node-selected').removeClass('sltree-node-selected');
		$(nodeEl).addClass('sltree-node-selected');
		opts.onSelect.call(target, node);
	}
	// 判断是否为叶子节点
	function isLeaf(target, nodeEl) {
		return $(nodeEl).children('span.sltree-hit').length == 0;
	}
	// 开始编辑节点
	function beginEdit(target, nodeEl) {
		var opts = $(target).data('sltree').options;
		var node = getNode(target, nodeEl);
		if (opts.onBeforeEdit.call(target, node) == false) {
			return;
		}
		$(nodeEl).css('position', 'relative');
		var nt = $(nodeEl).find('.sltree-title');
		var titleOuterWidth = nt.outerWidth();
		nt.empty();
		var editor = $('<input class=\'sltree-editor\'>').appendTo(nt);
		editor.val(node.text).focus();
		editor.width(titleOuterWidth + 20);
		editor.height(document.compatMode == 'CSS1Compat' ? (18 - (editor.outerHeight() - editor.height())) : 18);
		editor.bind('click', function(e) {
			return false;
		}).bind('mousedown', function(e) {
			e.stopPropagation();
		}).bind('mousemove', function(e) {
			e.stopPropagation();
		}).bind('keydown', function(e) {
			if (e.keyCode == 13) {
				endEdit(target, nodeEl);
				return false;
			} else {
				if (e.keyCode == 27) {
					cancelEdit(target, nodeEl);
					return false;
				}
			}
		}).bind('blur', function(e) {
			e.stopPropagation();
			endEdit(target, nodeEl);
		});
	}
	// 结束编辑节点
	function endEdit(target, nodeEl) {
		var opts = $(target).data('sltree').options;
		$(nodeEl).css('position', '');
		var editor = $(nodeEl).find('input.sltree-editor');
		var val = editor.val();
		editor.remove();
		var node = getNode(target, nodeEl);
		node.text = val;
		update(target, node);
		opts.onAfterEdit.call(target, node);
	}
	// 取消编辑节点
	function cancelEdit(target, nodeEl) {
		var opts = $.data(target, 'sltree').options;
		$(nodeEl).css('position', '');
		$(nodeEl).find('input.sltree-editor').remove();
		var node = getNode(target, nodeEl);
		update(target, node);
		opts.onCancelEdit.call(target, node);
	}
	function doFilter(target, q) {
		var state = $(target).data('sltree');
		var opts = state.options;
		var ids = {};
		ergodic(state.data, function(node) {
			if (opts.filter.call(target, q, node)) {
				$('#' + node.domId).removeClass('sltree-node-hidden');
				ids[node.domId] = 1;
				node.hidden = false;
			} else {
				$('#' + node.domId).addClass('sltree-node-hidden');
				node.hidden = true;
			}
		});
		for ( var id in ids) {
			_103(id);
		}
		function _103(_104) {
			var p = $(target).sltree('getParent', $('#' + _104)[0]);
			while (p) {
				$(p.target).removeClass('sltree-node-hidden');
				p.hidden = false;
				p = $(target).sltree('getParent', p.target);
			}
		}
	}
	$.fn.sltree = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.sltree.methods[options](this, param);
		}
		var options = options || {};
		return this.each(function() {
			var state = $(this).data('sltree');
			var opts;
			if (state) {
				opts = $.extend(state.options, options);
				state.options = opts;
			} else {
				opts = $.extend({}, $.fn.sltree.defaults, $.fn.sltree.parseOptions(this), options);
				$(this).data('sltree', {
					options : opts,
					data : []
				});
				init(this);
			}
			bindEvent(this);
			if (opts.data) {
				loadData(this, this, $.extend(true, [], opts.data));
			}
			request(this, this);
		});
	};
	$.fn.sltree.methods = {
		options : function(jq) {
			return $(jq[0]).data('sltree').options;
		},
		loadData : function(jq, data) {
			return jq.each(function() {
				loadData(this, this, data);
			});
		},
		getNode : function(jq, nodeEl) {
			return getNode(jq[0], nodeEl);
		},
		getData : function(jq, nodeEl) {
			return getData(jq[0], nodeEl);
		},
		reload : function(jq, nodeEl) {
			return jq.each(function() {
				if (nodeEl) {
					var node = $(nodeEl);
					var hit = node.children('span.sltree-hit');
					hit.removeClass('sltree-expanded sltree-expanded-hover').addClass('sltree-collapsed');
					node.next().remove();
					expand(this, nodeEl);
				} else {
					$(this).empty();
					request(this, this);
				}
			});
		},
		getRoot : function(jq, nodeEl) {
			return getRoot(jq[0], nodeEl);
		},
		getRoots : function(jq) {
			return getRoots(jq[0]);
		},
		getParent : function(jq, nodeEl) {
			return getParent(jq[0], nodeEl);
		},
		getChildren : function(jq, nodeEl) {
			return getChildren(jq[0], nodeEl);
		},
		getChecked : function(jq, state) {
			return getChecked(jq[0], state);
		},
		getSelected : function(jq) {
			return getSelected(jq[0]);
		},
		isLeaf : function(jq, nodeEl) {
			return isLeaf(jq[0], nodeEl);
		},
		find : function(jq, id) {
			return find(jq[0], id);
		},
		select : function(jq, nodeEl) {
			return jq.each(function() {
				select(this, nodeEl);
			});
		},
		check : function(jq, nodeEl) {
			return jq.each(function() {
				check(this, nodeEl, true);
			});
		},
		uncheck : function(jq, nodeEl) {
			return jq.each(function() {
				check(this, nodeEl, false);
			});
		},
		collapse : function(jq, nodeEl) {
			return jq.each(function() {
				collapse(this, nodeEl);
			});
		},
		expand : function(jq, nodeEl) {
			return jq.each(function() {
				expand(this, nodeEl);
			});
		},
		collapseAll : function(jq, nodeEl) {
			return jq.each(function() {
				collapseAll(this, nodeEl);
			});
		},
		expandAll : function(jq, nodeEl) {
			return jq.each(function() {
				expandAll(this, nodeEl);
			});
		},
		expandTo : function(jq, nodeEl) {
			return jq.each(function() {
				expandTo(this, nodeEl);
			});
		},
		scrollTo : function(jq, nodeEl) {
			return jq.each(function() {
				scrollTo(this, nodeEl);
			});
		},
		append : function(jq, param) {
			return jq.each(function() {
				append(this, param);
			});
		},
		toggle : function(jq, nodeEl) {
			return jq.each(function() {
				toggle(this, nodeEl);
			});
		},
		insert : function(jq, param) {
			return jq.each(function() {
				insert(this, param);
			});
		},
		remove : function(jq, nodeEl) {
			return jq.each(function() {
				remove(this, nodeEl);
			});
		},
		pop : function(jq, nodeEl) {
			var node = jq.sltree('getData', nodeEl);
			jq.sltree('remove', nodeEl);
			return node;
		},
		update : function(jq, param) {
			return jq.each(function() {
				update(this, param);
			});
		},
		enableDnd : function(jq) {
			return jq.each(function() {
				enableDnd(this);
			});
		},
		disableDnd : function(jq) {
			return jq.each(function() {
				disableDnd(this);
			});
		},
		beginEdit : function(jq, nodeEl) {
			return jq.each(function() {
				beginEdit(this, nodeEl);
			});
		},
		endEdit : function(jq, nodeEl) {
			return jq.each(function() {
				endEdit(this, nodeEl);
			});
		},
		cancelEdit : function(jq, nodeEl) {
			return jq.each(function() {
				cancelEdit(this, nodeEl);
			});
		},
		doFilter : function(jq, q) {
			return jq.each(function() {
				doFilter(this, q);
			});
		}
	};
	$.fn.sltree.parseOptions = function(target) {
		var t = $(target);
		return $.extend({}, $.slparser.parseOptions(target, [ 'url', 'method', {
			checkbox : 'boolean',
			cascadeCheck : 'boolean',
			onlyLeafCheck : 'boolean'
		}, {
			animate : 'boolean',
			lines : 'boolean',
			dnd : 'boolean'
		} ]));
	};
	var index = 1;
	// 节点的属性：
	// id：节点的标识值
	// text：节点文本
	// iconCls：节点图标CSS类
	// checked：是否选中
	// state：节点状态“open”或“closed”
	// attributes：节点的自定义属性
	// domId：元素的ID
	var view = {
		render : function(target, ul, data) {
			var opts = $(target).data('sltree').options;
			var layer = $(ul).prev('div.sltree-node').find('span.sltree-indent, span.sltree-hit').length;
			var cc = create(layer, data);
			$(ul).append(cc.join(''));
			function create(layer, data) {
				var cc = [];
				for (var i = 0; i < data.length; i++) {
					var item = data[i];
					if (item.state != 'open' && item.state != 'closed') {
						item.state = 'open';
					}
					item.domId = '_slui_sltree_' + index++;
					cc.push('<li>');
					cc.push('<div id="' + item.domId + '" class="sltree-node">');
					for (var j = 0; j < layer; j++) {
						cc.push('<span class="sltree-indent"></span>');
					}
					var isLeaf = false;
					if (item.state == 'closed') {
						cc.push('<span class="sltree-hit sltree-collapsed"></span>');
						cc.push('<span class="sltree-icon sltree-folder ' + (item.iconCls ? item.iconCls : '') + '"></span>');
					} else {
						if (item.children && item.children.length) {
							cc.push('<span class="sltree-hit sltree-expanded"></span>');
							cc.push('<span class="sltree-icon sltree-folder sltree-folder-open ' + (item.iconCls ? item.iconCls : '') + '"></span>');
						} else {
							cc.push('<span class="sltree-indent"></span>');
							cc.push('<span class="sltree-icon sltree-file ' + (item.iconCls ? item.iconCls : '') + '"></span>');
							isLeaf = true;
						}
					}
					if (opts.checkbox) {
						if ((!opts.onlyLeafCheck) || isLeaf) {
							cc.push('<span class="sltree-checkbox sltree-checkbox0"></span>');
						}
					}
					cc.push('<span class="sltree-title">' + opts.formatter.call(target, item) + '</span>');
					cc.push('</div>');
					if (item.children && item.children.length) {
						var tmp = create(layer + 1, item.children);
						cc.push('<ul style="display:' + (item.state == 'closed' ? 'none' : 'block') + '">');
						cc = cc.concat(tmp);
						cc.push('</ul>');
					}
					cc.push('</li>');
				}
				return cc;
			}
		}
	};
	$.fn.sltree.defaults = {
		url : null,
		method : 'post',
		animate : false,
		checkbox : false,
		cascadeCheck : true,
		onlyLeafCheck : false,
		lines : false,
		dnd : false,
		data : null,
		queryParams : {},
		formatter : function(nodeData) {
			return nodeData.text;
		},
		filter : function(q, node) {
			return node.text.toLowerCase().indexOf(q.toLowerCase()) >= 0;
		},
		loader : function(param, success, error) {
			var opts = $(this).sltree('options');
			if (!opts.url) {
				return false;
			}
			$.ajax({
				type : opts.method,
				url : opts.url,
				data : param,
				dataType : 'json',
				success : function(data) {
					success(data);
				},
				error : function() {
					error.apply(this, arguments);
				}
			});
		},
		loadFilter : function(data, pNode) {
			return data;
		},
		view : view,
		onClick : function(node) {
		},
		onDblClick : function(node) {
		},
		onBeforeLoad : function(node, param) {
		},
		onLoadSuccess : function(node, data) {
		},
		onLoadError : function() {
		},
		onBeforeExpand : function(node) {
		},
		onExpand : function(node) {
		},
		onBeforeCollapse : function(node) {
		},
		onCollapse : function(node) {
		},
		onBeforeCheck : function(node, isChecked) {
		},
		onCheck : function(node, isChecked) {
		},
		onBeforeSelect : function(node) {
		},
		onSelect : function(node) {
		},
		onContextMenu : function(e, node) {
		},
		onBeforeDrag : function(node) {
		},
		onStartDrag : function(node) {
		},
		onStopDrag : function(node) {
		},
		onDragEnter : function(target, source) {
		},
		onDragOver : function(target, source) {
		},
		onDragLeave : function(target, source) {
		},
		onBeforeDrop : function(target, source, point) {
		},
		onDrop : function(target, source, point) {
		},
		onBeforeEdit : function(node) {
		},
		onAfterEdit : function(node) {
		},
		onCancelEdit : function(node) {
		}
	};
})(jQuery);
