var PVLOAD = {
	dataUrl : '', 		//数据库连接
	dataXn : '', 		//数据库名称
	dataNo : 0, 		//数据条编码
	pvData : {			//pv数据JSON
		date:'',
		ua: navigator.userAgent,
	},

	init: function(){
		var self = this;
		self.getTotalNo();
	}, 

	//数据库链接生成器
	getUrl: function(url, xn, xk, act){
		return url+'xn='+xn+'&xk='+xk+'&act='+act;
	},

	getTotalNo: function(){
		var self = this;

		if(self.loadId){self.loadId.abort();}
	    self.loadId = $.ajax({
	    	type:'POST', 
	    	url: self.getUrl(self.dataUrl, self.dataXn, '', 'list'), 
	    	dataType: 'json', 
	    	success: function(response){
	    		var total;
	    		if(typeof(response.info)==="string"){
	    			total = 0;
	    		}else{
	    			total = response.info.length;
	    		}
	    		self.dataNo = total + 1;
	    		var date = $.trim($('#num').text());
	    		self.uploadData(self.dataNo, self.pvData);
	    	}
	    });
	}, 

	uploadData: function(dataNo, pvData){
		$.ajax({
        	type:'POST',
        	url:this.getUrl(this.dataUrl,this.dataXn,dataNo,'add'),
        	data: JSON.stringify(pvData),
        	dataType:'json'
        });
	}
}

var pvDataBox = {
	dataUrl : 'http://db.qiang.it/api.php?', 
	dataXn : 'bugpv'
}

PVLOAD = $.extend(PVLOAD, pvDataBox);
PVLOAD.init();