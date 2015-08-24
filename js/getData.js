var DATAGET = {
	//获取UA信息
	getDataUrl : '',	//数据源
	dataXn : '',		//业务名称
	dataXk : 0,			//数据编号
	idDb : '', 			//开发者数据库名
	showUrl: '', 		//展示页链接
	tpl : '', 			//板块模版
	dataBox : [], 		//数据流
	idBox : {}, 		//开发者列表
	searchKey : '', 	//搜索关键字
	searchBtn : null, 	//搜索按钮
	uidKey : '', 		//用户名关键字
	bugquery: function(){}, 	//查找数据

	init: function(){
		var self = this;
		self.getIdData();

		self.searchBtn[0].addEventListener("click", function(e){
			var key = self.searchBtn.siblings('input')[0].value;
			location.href=window.location.pathname + '?key=' + key;
		});

		self.solverFilter[0].addEventListener("change", function(e) {
			var selectId = this.options[this.selectedIndex].value;

			if(selectId !== 'all'){
				self.jumpPathFilter('uid', selectId);
			}else{
				self.jumpPathFilter('uid', '');
			}
		}, false);

		self.solvestateFilter[0].addEventListener("change", function(e) {
			var selectId = this.options[this.selectedIndex].value;

			if(selectId !== 'all'){
				self.jumpPathFilter('solvestate', selectId);
			}else{
				self.jumpPathFilter('solvestate', '');
			}
		}, false);
	}, 

	//筛选跳转链接生成器
	jumpPathFilter: function(key, value){
		var self = this;
		var jumpPath = window.location.pathname+"?";
		var keys = self.searchKey;
		var keyValue, s;

		for(var i=0; i<keys.length; i++){
			if(keys[i]===key){
				keyValue = value;
			}else{
				keyValue = (s = self.getArgs()[keys[i]]) ? s : '';
			}
			jumpPath += keys[i] + "=" + keyValue + "&";
		}
		location.href=jumpPath;
	}, 

	//数据库链接生成器
	getUrl: function(url, xn, xk, act){
		return url+'xn='+xn+'&xk='+xk+'&act='+act;
	},

	//获取数据
	getIdData: function(){
		var self = this;

		if(self.loadId){self.loadId.abort();}
	    self.loadId = $.ajax({
	    	type:'POST', 
	    	url: self.getUrl(self.getDataUrl, self.idDb, '', 'list'), 
	    	dataType: 'json', 
	    	success: function(response){
	    		var idBox = response.info;
	    		self.getSolver(idBox);
	    		self.getData();
	    	}
	    });
	}, 

	getData: function(){
		var self = this;

		if(self.loadData){self.loadData.abort();}
		self.loadData = $.ajax({
				        	type:'POST',
				        	url:self.getUrl(self.getDataUrl,self.dataXn,'','list'),
				        	dataType:'json', 
				        	success: function(response){
				        		var dataBox = response.info;
				        		self.generateData(self.tpl, dataBox);
				        	}
        });
	},

	//获取所有数据
	generateData: function(tpl, data){
		var self = this;
		var key = [];
		var dataBoxTemp = data;
		var total = dataBoxTemp.length;
		var html = '';
		var dataTemp = [];
		var s;

		for(var i=0; i<self.searchKey.length; i++){
			key[i] = (s = self.getArgs()[self.searchKey[i]]) ? s : '';
		}

		for(var i=(total-1); i>=0; i--){
			dataTemp=self.transData(dataBoxTemp[i]);
			self.dataBox.push(dataTemp);
			/*html += tpl.replace(/{([\w\-]+)\}/g, function(match, key){
				return typeof dataTemp[key] !== 'undefined' ? dataTemp[key] : '';
			});*/
		}

		if(key[0] || key[1] || key[2]){
			self.dataBox = self.bugquery(key[0], key[1], key[2]);
			if(key[0]){
				this.searchBtn.siblings('input')[0].value=key;
			}
			if(key[1]){
				document.getElementById('filterDev_' + key[1]).selected = true;
			}
			if(key[2]){
				document.getElementById('filterSta_' + key[2]).selected = true;
			}
		}

		if(!key[2]){
			self.dataBox.sort(function(v1, v2){
				return v1.statevalue - v2.statevalue;
			});
		}

		total = self.dataBox.length;

		if(total !== 0){
			for(var i=0; i<total; i++){
				dataTemp=self.dataBox[i];
				html += tpl.replace(/{([\w\-]+)\}/g, function(match, key){
					return typeof dataTemp[key] !== 'undefined' ? dataTemp[key] : '';
				});
			}
		}else{
			html = '<div class="nocontent"></div>';
		}

		$('.loading').remove();
		$('.cont').append(html);
	},

	//转化信息
	transData: function(data){
		var self = this;
		var dataXv = JSON.parse(data.xv);
		var s;
		//var dataXv = data.xv;
		var dataTrans = {
			itemUrl: self.showUrl + '#' + data.xk,
			bugstate: (s = dataXv["solvestate"]) === '-1' ? '' : s === '0' ? ' solving' : s === '1' ? ' solved' : '',
			pics: (s = String(dataXv["pics"]).split(',')[0]) ? s : 'http://labs.qiang.it/tools/bug/img/bug2.png', 
			itemNo: data.xk, 
			bugdesc: (s = dataXv["bugdesc"]) ? unescape(s) : '', 
			devicename: (s = dataXv["device"]) ? ((s.model?s.model:'') + ' ' + (s.vendor?s.vendor:'') + ' ' + (s.mobile?s.mobile:'')) : '', 
			solvedate: (s = dataXv["solvedate"]) ? s : '', 
			solvervalue: (s = dataXv["solver"]) ? s : '', 
			solver: (s = dataXv["solver"]) ? unescape(self.showSolver(s)) : '', 
			statevalue: (s = dataXv["solvestate"]) ? parseInt(s) : '', 
			solvestate: (s = dataXv["solvestate"]) === '-1' ? '未解决' : s === '0' ? '解决中' : s === '1' ? '已解决' : '测试'
		};
		return dataTrans;
	}, 

	getArgs: function(){
		var args = {};
	    var match = null;
	    var search = decodeURIComponent(location.search.substring(1));
	    var reg = /(?:([^&]+)=([^&]+))/g;
	    while((match = reg.exec(search))!==null){
	        args[match[1]] = match[2];
	    }
	    return args;
	}, 

	getSolver: function(solverData){
		var self = this;
		self.idBox = solverData;
		self.showSolverFilter();
	}, 

	showSolver: function(solverId){
		var self = this;
		var total = self.idBox.length;

		for(var i=0; i<total; i++){
			var idXv = JSON.parse(self.idBox[i].xv);
			if(solverId === idXv['uid']){
				return idXv['uname'];
			}
		}
	}, 

	showSolverFilter: function(){
		var self = this;
		var solverTpl = '<option value="{uid}" id="filterDev_{uid}">{uname} - {uerp}</option>';
		var solverHtml = '';
		var total = self.idBox.length;

		for(var i=0; i<total; i++){
			var idXv = JSON.parse(self.idBox[i].xv);
			solverHtml += solverTpl.replace(/{([\w\-]+)\}/g, function(match, key){
				return typeof idXv[key] !== 'undefined' ? unescape(idXv[key]) : '';
			});
		}
		self.solverFilter.append(solverHtml);
	}
}