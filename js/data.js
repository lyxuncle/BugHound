var DATALOAD = {
	//获取UA信息
	getDataUrl : '',	//数据源
	dataXn : '',		//业务名称
	bugInput: null, 	//bug描述输入框选择器
	upButton: null, 	//提交按钮
	dataXk : 0,			//数据编号
	uaData : {			//UA数据JSON
		width:0,		//浏览器宽
		height:0,		//浏览器高
		dpr:0,			//设备dpr
		ua:'',			//浏览器完整UA信息
		browser:'',		//浏览器信息
		engine:'',		//浏览器内核信息
		os:'',			//设备操作系统信息
		device:'',		//设备信息
		cpu:'',			//设备CPU信息
		nettype:'',		//用户网络信息
		bugdesc: '',	//bug描述
		pics: [], 		//bug截图
		solver: '',		//bug解决者
		solvemethod: '',//bug解决方案
		solvedate: '', 	//bug解决时间
		solvestate: '-1',//bug状态 -1:未解决 0:解决中 1:已解决
		remark: ''
	},
	setNum: function(){ return null; }, //编码设置器
	updateLink: function(ua){}, 		//用户查看具体数据入口设置

	uaInfo : navigator.userAgent,

	init: function(){
		var self = this;
		//设置编号
		var num = this.setNum();
		this.dataXk = num;
		//获取UA
		this.updateLink(this.uaInfo);

		//文件选择控件选择
		if (this.fileInput) {
			this.fileInput.removeEventListener("change");
			this.fileInput.addEventListener("change", function(e) { self.funGetFiles(e); }, false);
		}

		//上传信息
		if(this.upButton){
			this.upButton.addEventListener("click", function(e) { self.funUploadFile(); }, false);
		}
	},

	//数据库链接生成器
	getUrl: function(url, xn, xk, act){
		return url+'xn='+xn+'&xk='+xk+'&act='+act;
	},

	//上传数据
	addData: function(num){
		$.ajax({
        	type:'POST',
        	url:this.getUrl(this.getDataUrl,this.dataXn,num,'add'),
        	data: JSON.stringify(this.uaData),
        	dataType:'json'
        });
        //console.log(JSON.stringify(this.uaData));
	},

	//获取所有数据
	generateUaData: function(){
		this.getSize();
		this.updateBreakdown(this.uaInfo);
		this.getNetType(this.uaInfo);
		this.getBugInfo();
		this.addData(this.dataXk);
		console.log(this.uaInfo);
		this.onComplete();
	},

	//获取浏览器宽高
	getSize: function(){
		var width = document.documentElement.clientWidth;
		var height = document.documentElement.clientHeight;
		var dpr = window.devicePixelRatio;
		this.uaData.width=width;
		this.uaData.height=height;
		this.uaData.dpr=dpr;
	}, 

	//分割UA信息
    updateBreakdown: function(ua) {
        var UAParser = window.uaParserJs;
        var parser = new UAParser(ua);
        var attrs = ['ua', 'browser', 'engine', 'os', 'device', 'cpu'];
        var result = parser.getResult();
        for(var i=0;i<attrs.length;i++){
        	if(attrs[i]==='ua'){
        		this.uaData[attrs[i]]=escape(result[attrs[i]]);
        	}else{
        		this.uaData[attrs[i]]=result[attrs[i]];
        	}
        }
    },

    //获取网络环境
    getNetType: function(ua){
    	var nettypeExp = /nettype\//i;
    	var uaArr = ua.split(' ');
    	var nettype = '';
    	for(var i=0;i<uaArr.length;i++){
    		if(uaArr[i].match(nettypeExp)){
    			nettype = uaArr[i].replace(nettypeExp, '');
    		}
    	}
    	this.uaData.nettype = nettype;
    },

    //获取用户机型与bug描述
    getBugInfo: function(){
    	var bugIn = this.bugInput;
    	if(bugIn){
    		this.uaData.bugdesc = escape(bugIn.value);
    	}
    }, 

    //获取bug截图地址
    getImage: function(response){
    	if(response){
    		this.uaData.pics.push(response);
    	}
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
    }, 

    //上传图片
	fileInput: null,				//html file控件
	dragDrop: null,					//拖拽敏感区域
	url: "",						//ajax地址
	MAX_Width: 640, 				//图片压缩尺寸
	picQuality: 1, 					//图片压缩质量
	fileFilter: [],					//过滤后的文件数组
	onSelect: function() {},		//文件选择后
	onDelete: function() {},		//文件删除后
	//onDragOver: function() {},		//文件拖拽到敏感区域时
	//onDragLeave: function() {},		//文件离开到敏感区域时
	onProgress: function() {},		//文件上传进度
	onSuccess: function() {},		//文件上传成功时
	onFailure: function() {},		//文件上传失败时
	onComplete: function() {},		//文件全部上传完毕时
	
	/* 开发参数和内置方法分界线 */
	
	//文件拖放
	funDragHover: function(e) {
		e.stopPropagation();
		e.preventDefault();
		this[e.type === "dragover"? "onDragOver": "onDragLeave"].call(e.target);
		return this;
	},
	//获取选择文件，file控件或拖放
	funGetFiles: function(e) {
		var self = this;
		// 取消鼠标经过样式
		//this.funDragHover(e);
				
		// 获取文件列表对象
		//var files = e.target.files || e.dataTransfer.files;
		var files = e.target.files || e.dataTransfer.files;

		//继续添加文件
		this.fileFilter = this.fileFilter.concat(this.filter(files));
		this.funDealFiles();
		return this;
	},
	
	//选中文件的处理与回调
	funDealFiles: function() {
		for (var i = 0, file; file = this.fileFilter[i]; i++) {
	    	var reader = new FileReader();
	    	reader.onload = (function(file) {
	    		return function(e){
		            //readAsDataURL后执行onload，进入图片压缩逻辑
		            //e.target.result得到的就是图片文件的base64 string
					file.src = e.target.result;
		        };
	    	})(file);
	        reader.readAsDataURL(file);
			//增加唯一索引值
			file.index = i;
		}
		//执行选择回调
		this.onSelect(this.fileFilter);
		return this;
	},
	
	//删除对应的文件
	funDeleteFile: function(fileDelete) {
		var arrFile = [];
		for (var i = 0, file; file = this.fileFilter[i]; i++) {
			if (file != fileDelete) {
				arrFile.push(file);
			} else {
				this.onDelete(fileDelete);	
			}
		}
		this.fileFilter = arrFile;
		return this;
	},
	
	//文件上传
	funUploadFile: function() {
		var self = this;	
		if (location.host.indexOf("sitepointstatic") >= 0) {
			//非站点服务器上运行
			return;	
		}

		if(this.fileFilter.length === 0){
			self.generateUaData();
		}else{
			for (var i = 0, file; file = this.fileFilter[i]; i++) {
				self.renderFile(file);	
			}
		}
	}, 

	//压缩图片
	renderFile: function(file){
		var self = this;

		EXIF.getData(file,function(){
	        //获取照片本身的Orientation
	        var orientation = EXIF.getTag(this, "Orientation");
	        var image = new Image();
	        image.onload = function(){
	            var cvs = document.getElementById("cvs");
	            var w = image.width;
	            var h = image.height;
	            //计算压缩后的图片长和宽
	            if(w>self.MAX_WIDTH){
	                h *= self.MAX_WIDTH/w;
	                w = self.MAX_WIDTH;
	            }
	            var ctx = cvs.getContext('2d');
	            cvs.width = w;
	            cvs.height = h;
	            ctx.drawImage(image, 0, 0, w, h);
	            //使用MegaPixImage封装照片数据
	            var mpImg = new MegaPixImage(file);
	            //按照Orientation来写入图片数据，回调函数是上传图片到服务器
	            mpImg.render(cvs, {maxWidth:w,maxHeight:h,orientation:orientation}, self.sendImg(file));
	            //self.sendImg(file);
	        };
	        image.src = file.src;
	    });
	}, 

	//传送图片
	sendImg: function(file){
		var self = this;
	    var cvs = document.getElementById("cvs");
	    //调用Canvas的toDataURL接口，得到的是照片文件的base64编码string
	    var data = cvs.toDataURL("image/jpeg", self.picQuality);
	    //base64 string过短显然就不是正常的图片数据了，过滤の。
	    if(data.length<48){
	        console.log("data error.");
	        return;
	    }
	    data = data.split(",")[1];

	    var formData = new FormData();
	    var oReq = new XMLHttpRequest();

		if (oReq.upload) {
			// 上传中
			oReq.upload.addEventListener("progress", function(e) {
				self.onProgress(file, e.loaded, e.total);
			}, false);

			// 文件上传成功或是失败
			oReq.onreadystatechange = function(e) {
				if (oReq.readyState == 4) {
					if (oReq.status == 200) {
						self.onSuccess(file, oReq.responseText);
						self.getImage(oReq.responseText);
						self.funDeleteFile(file);
						if (!self.fileFilter.length) {
							//全部完毕
							self.generateUaData();
						}
					} else {
						self.onFailure(file, oReq.responseText);		
					}
				}
			};

    		formData.append('pic', data);
			// 开始上传
			oReq.open("POST", self.url, true);
    		oReq.send(formData);
		}
	}
}