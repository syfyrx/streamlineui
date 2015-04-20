/*jQuery StreamLineUI v1.0*/
(function(){
	var modules = {
			slslparser:{
			js:'jquery.slslparser.js'
		},
		sldraggable:{
			js:'jquery.sldraggable.js'
		},
		sldroppable:{
			js:'jquery.sldroppable.js'
		},
		slresizable:{
			js:'jquery.slresizable.js'
		},
		slbutton:{
			js:'jquery.sllinkbutton.js',
			css:'sllinkbutton.css'
		},
		slprogressbar:{
			js:'jquery.slprogressbar.js',
			css:'slprogressbar.css'
		},
		sltooltip:{
			js:'jquery.sltooltip.js',
			css:'sltooltip.css'
		},
		slpagination:{
			js:'jquery.slpagination.js',
			css:'slpagination.css',
			dependencies:['slbutton']
		},
		sldatagrid:{
			js:'jquery.sldatagrid.js',
			css:'sldatagrid.css',
			dependencies:['slpanel','slresizable','slbutton','slpagination']
		},
		sltreegrid:{
			js:'jquery.sltreegrid.js',
			css:'sltree.css',
			dependencies:['sldatagrid']
		},
		slpropertygrid:{
			js:'jquery.slpropertygrid.js',
			css:'slpropertygrid.css',
			dependencies:['sldatagrid']
		},
		slpanel: {
			js:'jquery.slpanel.js',
			css:'slpanel.css'
		},
		slwindow:{
			js:'jquery.slwindow.js',
			css:'slwindow.css',
			dependencies:['slresizable','sldraggable','slpanel']
		},
		sldialog:{
			js:'jquery.sldialog.js',
			css:'sldialog.css',
			dependencies:['slbutton','slwindow']
		},
		slmessager:{
			js:'jquery.slmessager.js',
			css:'slmessager.css',
			dependencies:['slbutton','slwindow','slprogressbar']
		},
		sllayout:{
			js:'jquery.sllayout.js',
			css:'sllayout.css',
			dependencies:['slresizable','slpanel']
		},
		slform:{
			js:'jquery.slform.js'
		},
		slmenu:{
			js:'jquery.slmenu.js',
			css:'slmenu.css'
		},
		sltabs:{
			js:'jquery.sltabs.js',
			css:'sltabs.css',
			dependencies:['slpanel','slbutton']
		},
		slmenubutton:{
			js:'jquery.slmenubutton.js',
			css:'slmenubutton.css',
			dependencies:['slbutton','menu']
		},
		splitbutton:{
			js:'jquery.splitbutton.js',
			css:'splitbutton.css',
			dependencies:['menubutton']
		},
		accordion:{
			js:'jquery.accordion.js',
			css:'accordion.css',
			dependencies:['panel']
		},
		calendar:{
			js:'jquery.calendar.js',
			css:'calendar.css'
		},
		textbox:{
			js:'jquery.textbox.js',
			css:'textbox.css',
			dependencies:['validatebox','linkbutton']
		},
		filebox:{
			js:'jquery.filebox.js',
			css:'filebox.css',
			dependencies:['textbox']
		},
		combo:{
			js:'jquery.combo.js',
			css:'combo.css',
			dependencies:['panel','textbox']
		},
		combobox:{
			js:'jquery.combobox.js',
			css:'combobox.css',
			dependencies:['combo']
		},
		combotree:{
			js:'jquery.combotree.js',
			dependencies:['combo','tree']
		},
		combogrid:{
			js:'jquery.combogrid.js',
			dependencies:['combo','datagrid']
		},
		validate:{
			js:'jquery.validate.js',
			css:'validate.css',
			dependencies:['tooltip']
		},
		numberbox:{
			js:'jquery.numberbox.js',
			dependencies:['textbox']
		},
		searchbox:{
			js:'jquery.searchbox.js',
			css:'searchbox.css',
			dependencies:['menubutton','textbox']
		},
		spinner:{
			js:'jquery.spinner.js',
			css:'spinner.css',
			dependencies:['textbox']
		},
		numberspinner:{
			js:'jquery.numberspinner.js',
			dependencies:['spinner','numberbox']
		},
		timespinner:{
			js:'jquery.timespinner.js',
			dependencies:['spinner']
		},
		tree:{
			js:'jquery.tree.js',
			css:'tree.css',
			dependencies:['draggable','droppable']
		},
		datebox:{
			js:'jquery.datebox.js',
			css:'datebox.css',
			dependencies:['calendar','combo']
		},
		datetimebox:{
			js:'jquery.datetimebox.js',
			dependencies:['datebox','timespinner']
		},
		slider:{
			js:'jquery.slider.js',
			dependencies:['draggable']
		}
	};

	var locales = {
		'en':'slui-lang-en.js',
		'zh_CN':'slui-lang-zh_CN.js',
		'zh_TW':'slui-lang-zh_TW.js'
	};

	var queues = {};

	function loadJs(url, callback){
		var done = false;
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.language = 'javascript';
		script.src = url;
		script.onload = script.onreadystatechange = function(){
			if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete')){
				done = true;
				script.onload = script.onreadystatechange = null;
				if (callback){
					callback.call(script);
				}
			}
		}
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	
	function runJs(url, callback){
		loadJs(url, function(){
			document.getElementsByTagName("head")[0].removeChild(this);
			if (callback){
				callback();
			}
		});
	}
	
	function loadCss(url, callback){
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.media = 'screen';
		link.href = url;
		document.getElementsByTagName('head')[0].appendChild(link);
		if (callback){
			callback.call(link);
		}
	}
	
	function loadSingle(name, callback){
		queues[name] = 'loading';
		
		var module = modules[name];
		var jsStatus = 'loading';
		var cssStatus = (loader.css && module['css']) ? 'loading' : 'loaded';
		
		if (loader.css && module['css']){
			if (/^http/i.test(module['css'])){
				var url = module['css'];
			} else {
				var url = loader.base + 'themes/' + loader.theme + '/' + module['css'];
			}
			loadCss(url, function(){
				cssStatus = 'loaded';
				if (jsStatus == 'loaded' && cssStatus == 'loaded'){
					finish();
				}
			});
		}
		
		if (/^http/i.test(module['js'])){
			var url = module['js'];
		} else {
			var url = loader.base + 'plugins/' + module['js'];
		}
		loadJs(url, function(){
			jsStatus = 'loaded';
			if (jsStatus == 'loaded' && cssStatus == 'loaded'){
				finish();
			}
		});
		
		function finish(){
			queues[name] = 'loaded';
			loader.onProgress(name);
			if (callback){
				callback();
			}
		}
	}
	
	function loadModule(name, callback){
		var mm = [];
		var doLoad = false;
		
		if (typeof name == 'string'){
			add(name);
		} else {
			for(var i=0; i<name.length; i++){
				add(name[i]);
			}
		}
		
		function add(name){
			if (!modules[name]) return;
			var d = modules[name]['dependencies'];
			if (d){
				for(var i=0; i<d.length; i++){
					add(d[i]);
				}
			}
			mm.push(name);
		}
		
		function finish(){
			if (callback){
				callback();
			}
			loader.onLoad(name);
		}
		
		var time = 0;
		function loadMm(){
			if (mm.length){
				var m = mm[0];	// the first module
				if (!queues[m]){
					doLoad = true;
					loadSingle(m, function(){
						mm.shift();
						loadMm();
					});
				} else if (queues[m] == 'loaded'){
					mm.shift();
					loadMm();
				} else {
					if (time < loader.timeout){
						time += 10;
						setTimeout(arguments.callee, 10);
					}
				}
			} else {
				if (loader.locale && doLoad == true && locales[loader.locale]){
					var url = loader.base + 'locale/' + locales[loader.locale];
					runJs(url, function(){
						finish();
					});
				} else {
					finish();
				}
			}
		}
		
		loadMm();
	}
	
	loader = {
		modules:modules,
		locales:locales,
		base:'.',
		theme:'default',
		css:true,
		locale:null,
		timeout:2000,
		load: function(name, callback){
			if (/\.css$/i.test(name)){
				if (/^http/i.test(name)){
					loadCss(name, callback);
				} else {
					loadCss(loader.base + name, callback);
				}
			} else if (/\.js$/i.test(name)){
				if (/^http/i.test(name)){
					loadJs(name, callback);
				} else {
					loadJs(loader.base + name, callback);
				}
			} else {
				loadModule(name, callback);
			}
		},
		onProgress: function(name){},
		onLoad: function(name){}
	};

	//设置基础目录
	var scripts = document.getElementsByTagName('script');
	for(var i=0; i<scripts.length; i++){
		var src = scripts[i].src;
		if (!src) continue;
		var m = src.match(/loader\.js(\W|$)/i);
		if (m){
			loader.base = src.substring(0, m.index);
		}
	}

	window.using = loader.load;
	
	if (window.jQuery){
		jQuery(function(){
			loader.load('slparser', function(){
				jQuery.slparser.parse();
			});
		});
	}
})();
