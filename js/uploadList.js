var LISTSHOW = {
	//获取UA信息
	getDataUrl : '',	//数据源
	dataXn : '',		//业务名称
	tpl: '', 			//数据展示模板
	list: null, 		//列表容器
	addBtn: null, 		//添加按钮
	modiBtn: null, 		//修改按钮
	saveBtn: null, 		//保存按钮
	deleBtn: null, 		//删除按钮
	dataBox: {}, 		//数据流

	init: function(){
		var self = this;
		self.showData();

		if(self.addBtn){
			self.addBtn[0].addEventListener("click", function(e) {
				var total = self.dataBox.length;
				if(total){
					var lastId = parseInt(JSON.parse(self.dataBox[total-1].xv).uid);
				}else{
					var lastId = 0;
				}
				self.newData(lastId);
			}, false);
		}
		if(self.list){
			self.list[0].addEventListener("click", function(e){
				if(e.target && e.target.getAttribute('data-func') === 'save'){
					var dataId = e.target.getAttribute('data-id');
					var item = document.getElementById('listItem_'+dataId);
					var itemInput = item.getElementsByTagName('input');
					var uname = escape(itemInput[0].value);
					var uerp = itemInput[1].value;
					var dataBlock = {'uid': dataId, 'uname': uname, 'uerp': uerp};
					self.uploadData(dataId, dataBlock);
					item.setAttribute('class', '');
				}

				if(e.target && e.target.getAttribute('data-func')=== 'modify'){
					var dataId = e.target.getAttribute('data-id');
					var item = document.getElementById('listItem_'+dataId);
					item.setAttribute('class', 'editable');
				}

				if(e.target && e.target.getAttribute('data-func')=== 'delete'){
					var dataId = e.target.getAttribute('data-id');
					var conf = confirm('确定删除？');
					if(conf===true){
						self.deleteData(dataId);
					}else{
						return;
					}
				}
			}, false);
		}
	},

	//数据库链接生成器
	getUrl: function(url, xn, xk, act){
		return url+'xn='+xn+'&xk='+xk+'&act='+act;
	},

	//获取数据
	showData: function(){
		var self = this;
		if(self.loadData){self.loadData.abort();}

        self.loadData = $.ajax({
        	type:'POST', 
        	url: self.getUrl(self.getDataUrl, self.dataXn, '', 'list'), 
        	dataType: 'json', 
        	success: function(response){
        		if(typeof(response.info) !== 'string'){
        			self.dataBox = response.info;
        			console.log(self.dataBox);
	        		self.generateData(self.tpl, self.dataBox);
	        	}
        	}
        });
	},

	//获取所有数据
	generateData: function(tpl, data){
		var self = this;
		var total = data.length;
		var html = '';
		var s;
		for(var i=0; i<=(total-1); i++){
			dataTemp=self.transData(data[i]);
			html += self.fillData(dataTemp);
		}
		$('.loading').css('display', 'none');
		self.list.append(html);
	},

	//转化信息
	transData: function(data){
		var dataXv = JSON.parse(data.xv);
		var s;
		//var dataXv = data.xv;
		var dataTrans = {
			uid: (s = dataXv["uid"]) ? s : '', 
			uname: (s = dataXv["uname"]) ? unescape(s) : '', 
			uerp: (s = dataXv["uerp"]) ? s : ''
		};
		return dataTrans;
	}, 

	fillData: function(data){
		var self = this;
		return self.tpl.replace(/{([\w\-]+)\}/g, function(match, key){
				return typeof data[key] !== 'undefined' ? unescape(data[key]) : '';
			})
	}, 

	newData: function(lastId){
		var self = this;
		var addId = self.numFix(lastId + 1, 5);
		var dataTemp = {'uid':addId, 'uname':'', 'uerp':''};
		self.list.append(self.fillData(dataTemp));
		var listNodes = self.list[0].childNodes;
		var totalNodes = listNodes.length;
		listNodes[totalNodes - 1].setAttribute('class','editable');
		var saveTotal = self.saveBtn.length;
		//self.saveData(saveTotal-1);
	}, 

	uploadData: function(id, idData){
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
	}, 

	deleteData: function(id){
		var self = this;
		$.ajax({
        	type:'POST',
        	url:self.getUrl(self.getDataUrl,self.dataXn,id,'delete'),
        	dataType:'json', 
        	success: function(response){
        		self.list[0].innerHTML = '';
				$('.loading').css('display', 'block');
        		self.showData();
        	}
        });
	}, 

	//数位补足器
    numFix: function(digit, bit){
		var digitArr = (digit+"").split("");
		var digitBit = digitArr.length;
    	var limit = Math.pow(10, (bit-1));

    	if(digitBit >= bit){return digit;}

    	if(digit<limit){
    		for(var i=0; i<(bit-digitBit); i++){
    			digitArr.unshift('0');
    		}
    	}
    	return digitArr.join('');
    }
}