var DATASHOW = {
	//获取UA信息
	getDataUrl : '',	//数据源
	dataXn : '',		//业务名称
	dataXk : 0,			//数据编号
	idDb : '', 			//开发者数据库名
	num : null, 		//编号容器
	slideImg : null, 	//图片容器
	slideNavi : null, 	//图片导航
	desc : null, 		//bug描述
	sizeSpan : null, 	//尺寸容器
	dpr : null, 		//dpr容器
	devDetail : null, 	//设备信息容器
	ua : null, 			//UA信息容器
	solvemethod : null, //解决方案容器
	solvestate : null, 	//解决状态容器
	solver : null, 		//解决者容器
	solverSelect : null,//解决者选择框
	submitBtn : null, 	//提交按钮
	dataBox : {}, 		//数据
	idBox : {},		//开发者数据
	timeurl : '', 		//服务端时间获取链接

	init: function(){
		var self = this;
		self.showIdData();//上传信息

		if(self.submitBtn){
			self.submitBtn[0].addEventListener("click", function(e) { 
				$('.loading').css('display', 'block');
				self.getSolveTime();
			}, false);
		}

		self.solverSelect[0].addEventListener("click", function(e) {
			var selectId = this.options[this.selectedIndex].value;
			if(selectId === '00000'){
				self.solver.addClass('solver_fill');
			}else{
				self.solver.removeClass('solver_fill');
			}
		}, false);
	},

	//数据库链接生成器
	getUrl: function(url, xn, xk, act){
		return url+'xn='+xn+'&xk='+xk+'&act='+act;
	},

	//获取数据
	showIdData: function(){
		var self = this;

		if(self.loadId){self.loadId.abort();}
        self.loadId = $.ajax({
        	type:'POST', 
        	url: self.getUrl(self.getDataUrl, self.idDb, '', 'list'), 
        	dataType: 'json', 
        	success: function(response){
        		var idBox = response.info;
	    		self.getSolver(idBox);
	    		self.showData();
        	}
        });
	}, 

	showData: function(){
		var self = this;
		if(self.loadData){self.loadData.abort();}
		self.loadData = $.ajax({
				        	type:'POST',
				        	url:this.getUrl(this.getDataUrl,this.dataXn,this.dataXk,'query'),
				        	dataType:'json', 
				        	success: function(response){
				        		var dataBoxTemp = response.info;
				        		self.generateData(dataBoxTemp);
				        		$('.loading').css('display', 'none');
				        	}
        });
	},

	//获取所有数据
	generateData: function(data){
		var self = this;
		var s;
		self.dataBox = data;
		self.slideShow(self.dataBox);
		self.num.text(self.dataXk);
		self.desc.text((s=self.dataBox.xv["bugdesc"])?unescape(s):'无');
		self.sizeSpan.text(self.dataBox.xv["width"] + ' × ' + self.dataBox.xv["height"]);
		self.dpr.text(self.dataBox.xv["dpr"]);
		self.detailFill(self.dataBox);
		self.ua.text(unescape(self.dataBox.xv["ua"]));
		self.solvemethod.text(unescape(self.dataBox.xv["solvemethod"]));
		self.stateSet(self.dataBox.xv["solvestate"]);
		self.showSolver(self.dataBox.xv["solver"]);
	},

	//bug图片展示
	slideShow: function(data){
		var dataXv = data.xv;
		var pics = dataXv["pics"]?String(dataXv["pics"]).split(','):'';
		if(pics !== ''){
			var picNum = pics.length;
			var html = '';
			var htmlNavi = '';

			for(var i=0; i<picNum; i++){
				html += '<li data-img="'+i+'"><img src="'+pics[i]+'"></li>';
				htmlNavi += '<li></li>';
			}

			this.slideImg.html(html);
			this.slideNavi.html(htmlNavi);
		}else{
			$('.slideshow').css('display', 'none');
		}

        SLIDESHOW.init();
	}, 

	//bug状态展示
	stateSet: function(state){
		var self = this;
		self.solvestate.find('option').each(function(){
			if($(this).attr('value')===state){
				$(this).attr('selected', 'selected');
			}
		});
	}, 

	//设备信息展示
	detailFill: function(data){
		var self = this;
		var dataXv = data.xv;
		var infoArr = self.devDetail.find('.detail_info');
		infoArr.each(function(){
			var id = $(this).attr('id');
			var text = (dataXv[id]['name']?(dataXv[id]['name']+' '):'') + (dataXv[id]['version']?(dataXv[id]['version']+' '):'') + (dataXv[id]['model']?(dataXv[id]['model']+' '):'') + (dataXv[id]['vendor']?(dataXv[id]['vendor']+' '):'') + (dataXv[id]['type']?(dataXv[id]['type']+' '):'') + (dataXv[id]['architecture']?(dataXv[id]['architecture']+' '):'');
			$('#'+id).text(text);
		});
	}, 

	uploadInfo: function(){
		var self = this;
		self.dataBox.xv["solvemethod"] = escape(self.solvemethod.text());
		self.dataBox.xv["solvestate"] = self.solvestate[0].options[self.solvestate[0].selectedIndex].value;
		var solverId = self.solverSelect[0].options[self.solverSelect[0].selectedIndex].value;
		if(solverId === '00000'){
			var total = self.dataBox.length;
			var idData = {};
			var solvername = self.solvername[0].value;
			var solvererp = self.solvererp[0].value;

			if(total){
				var lastId = parseInt(JSON.parse(self.dataBox[total-1].xv).uid);
			}else{
				var lastId = 0;
			}

			if(solvername || solvererp){
				idData = {"uid": lastId, "uname": solvername, "uerp": solvererp};
				self.uploadIdData(lastId, idData);
				self.dataBox.xv["solver"] = lastId;
			}else{
				self.dataBox.xv["solver"] = '';
			}
		}else{
			self.dataBox.xv["solver"] = solverId;
		}

		$.ajax({
        	type:'POST',
        	url:this.getUrl(this.getDataUrl,this.dataXn,this.dataXk,'update'),
        	dataType:'json', 
        	data: JSON.stringify(this.dataBox.xv), 
        	success: function(response){
        		location.href='list.html';
        	}
        });
	}, 

	getSolveTime: function(){
		var self = this;
		var xhr = new XMLHttpRequest();

		xhr.open("POST", self.timeurl, true);
		xhr.onreadystatechange = function(e){
			if(xhr.readyState === 4){
				if(xhr.status === 200){
					self.dataBox.xv["solvedate"] =  xhr.responseText;
					self.uploadInfo();
				}
			}
		}
		xhr.send(null);
	}, 

	getSolver: function(solverData){
		var self = this;
		self.idBox = solverData;
	}, 

	showSolver: function(solverId){
		var self = this;
		var total = self.generateId(self.idBox);
		if(solverId && document.getElementById('solverSelect_' + solverId)){
			document.getElementById('solverSelect_' + solverId).selected = true;
			self.solver.removeClass('solver_fill');
		}
	}, 

	generateId: function(data){
		var self = this;
		var idHtml = '';
		var idtpl = '<option id="solverSelect_{uid}" value="{uid}">{uname} - {uerp}</option>'
		var total = data.length;
		for(var i=0; i<total; i++){
			var dataXv = JSON.parse(data[i].xv);
			idHtml += idtpl.replace(/{([\w\-]+)\}/g, function(match, key){
				return typeof dataXv[key] !== 'undefined' ? unescape(dataXv[key]) : '';
			});
		}
		self.solverSelect.append(idHtml);
		return total;
	}, 

	uploadIdData: function(id, idData){
		var self = this;
		$.ajax({
        	type:'POST',
        	url:self.getUrl(self.getDataUrl,self.dataXn,id,'add'),
        	data: JSON.stringify(idData),
        	dataType:'json', 
        	success: function(response){
        		self.list[0].innerHTML = '';
				$('.loading').css('display', 'block');
        		self.showData();
        	}
        });
	}
}