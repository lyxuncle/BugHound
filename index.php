<!DOCTYPE HTML>
<html lang="zh-CN">
<head>
	<meta charset="utf-8" />
	<title>BugHound</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black" />
	<meta name="format-detection" content="telephone=no" />
    <link rel="stylesheet" type="text/css" href="css/gb.css" />
    <link rel="stylesheet" type="text/css" href="css/index.css" />
</head>
<!-- 注：加ontouchstart使css：active生效 -->
<body ontouchstart="">
    <h1 class="top_bar"><i></i>移动端bug跟踪系统</h1>
    <div class="cont">
        <form class="form" action="upload.php" method="post" enctype="multipart/form-data">
            <div class="form_plat">
                <!-- <label class="form_content form_content_mobile"><input type="text" id="devicename" placeholder="请输入机型" /></label> -->
                <div class="form_pic">
                    <!-- ctrler = controller -->
                    <div class="form_pic_ctrler">
                        <!-- cpics = controller pictures -->
                        <div class="form_pic_cpics">
                            <canvas id="cvs"></canvas>
                            <div id="preview">
                                <!-- <div class="form_pic_cpics_item ">
                                    <div class="form_pic_cpics_img"><img src="http://img.qiang.it/75" /></div>
                                    <a href="#" class="form_pic_cpics_del">删除</a>
                                    <span class="uploading"><span class="bar"><i style="height:30%;"></i></span></span>
                                </div> -->
                            </div>
                            <div class="form_pic_cpics_add">
                                <input type="file" name="fileselect[]" id="fileImage" size="5" multiple />
                            </div>
                            <!-- <input type="button" class="form_pic_cpics_add" id="selectImgeBut" /> -->
                            <div class="form_pic_cpics_json" id="fileImageLinks"></div>
                        </div>
                        <!-- cnotice = controller notice -->
                        <div class="form_pic_txt">上传bug截图</div>
                    </div>
                </div>
                <label class="form_content">
                    <textarea class="form_content_textarea" id="bugdesc"></textarea>
                    <!-- 填充内容后隐藏 -->
                    <div class="form_content_textarea_txt" style="display:;">bug描述</div>
                </label>
            </div>
            <div class="header">
                <div id="num"><?php 
                        date_default_timezone_set('Asia/Shanghai');
                        echo date('Ymd').'_'.date('His');
                ?></div>
                <h2>系统为您分配bug编号</h2>
                <p>请将编号复制给开发人员</p>
            </div>
            <div class="form_ft">
                <button type="button" id="fileSubmit" class="form_submit">提交bug</button>
            </div>
        </form>
        <!-- <a href="#" id="ua-link"></a> -->
    </div>
    <span class="submiting" style="display:none;">提交中</span>

    <a href="#" id="refresh" style="display:none;">还有bug<img src="img/cryout.png" /></a>

	<script src="js/zepto.js"></script>
	<script src="js/ua-parser-js"></script>
    <script src="js/data.js"></script>
    <script src="js/exif.js"></script>
    <script src="js/megapix-image.js"></script>
    <script src="js/pvrecord.js"></script>
    <script>
    $(function(exports, P){
    	//数据块
    	var dataBox ={
    		//获取UA信息
    		//数据源
    		//getDataUrl : 'http://db.qiang.it/api.php?xn=mobilebugs&xk=&act=list',
    		getDataUrl : 'http://db.qiang.it/api.php?',
    		//业务名称
    		dataXn : 'mobilebugs',
    		deviceInput: $('#devicename').get(0), 
    		bugInput: $('#bugdesc').get(0), 
    		upButton: $('#fileSubmit').get(0), 

    		setNum: function(){
    	    	/*var now = new Date();
    	    	var month = this.numFix(now.getMonth(),2);
    	    	var day = this.numFix(now.getDay(),2);
    	    	var hours = this.numFix(now.getHours(),2);
    	    	var minutes = this.numFix(now.getMinutes(),2);
    	    	var seconds = this.numFix(now.getSeconds(),2);

    	    	var num = now.getFullYear() + month + day + "_" + hours + minutes + seconds;*/
    			//document.getElementById('num').innerText = num;
                var num = $.trim($('#num').text());
    	    	return num;
    	    },

    	    /*updateLink: function(ua){
    	    	var uaLink = document.getElementById('ua-link');
    	    	uaLink.href = 'http://www.whatsmyua.com/#' + ua;
    	    	uaLink.innerText = uaLink.textContent = "如果你想查看具体数据："+ua;
    	    },*/ 

            MAX_WIDTH: 640, 
            picQuality: 0.7, 
            fileInput: $('#fileImage').get(0),
            url: $('.form').attr('action'),
            filter: function(files){
                var arrFiles = [];
                for(var i=0, file; file=files[i]; i++){
                    if(file.type.indexOf('image') == 0){
                        arrFiles.push(file);
                    }else{
                        alert('文件“' + file.name + '”不是图片。');
                    }
                }
                return arrFiles;
            },
            onSelect: function(files){
                var html = '', i = 0;
                var funAppendImage = function(){
                    file = files[i];
                    if(file){
                        var reader = new FileReader();
                        reader.onload = function(e){
                            html = html + 
                                '<div id="uploadList_' + i +'" class="form_pic_cpics_item">' +
                                    '<div class="form_pic_cpics_img"><img id="uploadImage_'+i+'" src="'+e.target.result+'" /></div>' +
                                    '<a href="javascript:void(0);" class="form_pic_cpics_del" data-index="' + i + '">删除</a>' +
                                    '<span class="uploading" id="uploadProgress_' + i +'" style="display:none;"><span class="bar"><i></i></span></span>' +
                                '</div>';
                            i++;
                            funAppendImage();
                        }
                        reader.readAsDataURL(file);
                    }else{
                        //图片相关HTML片段载入
                        $('#preview').html(html);
                        $('.form_pic').addClass('form_pic_added');
                        if(html){
                            //删除方法
                            $('.form_pic_cpics_del').click(function(){
                                DATALOAD.funDeleteFile(files[parseInt($(this).attr("data-index"))]);
                                return false;
                            });
                        }
                    }
                };
                //执行图片HTML片段的载入
                funAppendImage();
            },

            onDelete: function(file){
                $('#uploadList_' + file.index).css('display','none');
            },

            onProgress: function(file, loaded, total){
                var eleProgress = $('#uploadProgress_' + file.index).find('i'),
                    percent = (loaded / total * 100).toFixed(2) + '%';
                eleProgress.css('height', percent);
                this.upButton.removeEventListener("click");
                $(this.upButton).addClass("disabled");
                $('.submiting').css('display', 'block');
                $('.uploading').css('display', 'block');
                $('.form_pic_cpics_del').css('display', 'none');
            }, 

            onSuccess: function(file, response){
                $('#uploadProgress_' + file.index).css('display','none');
            }, 

            onFailure: function(file){
                $('#uploadProgress_' + file.index).html('上传失败！');
                $('#uploadImage_' + file.index).css('opacity', 0.2);
            },

            onComplete: function(){
                $('.form_plat').html('<div class="notice">感谢您的反馈，祝您旅途愉快！</div>');
                $('.submiting').css('display', 'none');
                $('.form_ft').css('display', 'none');
                $('#refresh').css('display','block');
            }
    	} 

    	DATALOAD = $.extend(DATALOAD, dataBox);
    	DATALOAD.init();

        $('#refresh').on('click', function(e){
            e.preventDefault();
            location.reload();
        });
        $('.form_content_textarea').on('change',function(){
            var placeholder = $(this).next('.form_content_textarea_txt');
            if(this.value!=''){
                placeholder.css('display','none');
            }else{
                placeholder.css('display','block');
            }
        });

    });
    </script>
</body>
</html>