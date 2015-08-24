
	var SLIDESHOW = {
		slideWin : null, //轮播图容器
		slideNavi : null, //轮播图导航
		slideTotal : 0, //轮播图数量
		slideWidth : 0, //轮播图宽
		curPic : 0,	//当前图片
		startPosX : 0, //X起始位置
		endPosX : 0, //X结束位置
		startPosY : 0,	//Y轴起始位置
		endPosY : 0, 	//Y轴结束位置

		init: function(){
			var self = this;
			var slideClass = '.'+self.slideWin.attr('class');
			self.slideTotal = self.slideWin.find('li').length;
			self.slideWidth = document.documentElement.clientWidth>640?640:document.documentElement.clientWidth;

			self.setSize();
			self.slideWin.css({webkitTransform:'translateX(0)',transform:'translateX(0)'});
			self.slideNavi.find('li').eq(0).addClass('cur');

			$(document).on('touchstart', slideClass, function(e){
				//console.log(1);
				self.onStart(e.changedTouches[0]);
			})
			.on('touchmove', slideClass, function(e){
				self.onMove(e.changedTouches[0]);
			})
			.on('touchend', slideClass, function(e){
				//console.log(3);
				self.onEnd(e.changedTouches[0]);
			});
		}, 

		setSize: function(){
			var self = this;
			self.slideWin.css({width: self.slideTotal * self.slideWidth + 'px'});
			this.slideWin.find('li').css({width: self.slideWidth + 'px'});
		},

		onStart: function(e){
			//event.preventDefault();
			this.startPosX = e.pageX;
			this.startPosY = e.pageY;
			this.slideWin.css({webkitTransition:'none', transition:'none'});
			//console.log(this.startPos);
		}, 

		onMove: function(e){
			var self = this;
			//event.preventDefault();
			self.endPosX = e.pageX;
			self.endPosY = e.pageY;
			self.animateSlide(self.startPosX, self.endPosX);
		}, 

		onEnd: function(e){
			var self = this;
			//event.preventDefault();
			self.endPosX = e.pageX;
			self.endPosY = e.pageY;

			if(self.endPosX-self.startPosX<-50){
				self.curPic += 1;
			}else if(self.endPosX-self.startPosX>50){
				self.curPic -= 1;
			}else if(self.endPosX === self.startPosX && self.endPosY === self.startPosY){
				self.slideWin.parent('div').toggleClass('slide_scale');
			}

			if(self.curPic >= this.slideTotal){
				self.curPic = this.slideTotal - 1;
			}else if(self.curPic < 0){
				self.curPic = 0;
			}

			this.slideWin.css({webkitTransition:'all ease .2s', transition:'all ease .2s'});
			self.animateSlide(0,0);
		}, 

		animateSlide: function(startPos, endPos){
			var movLen = startPos - endPos;
			var stopPos = - this.curPic * this.slideWidth;
			var tempPos = stopPos - movLen;

			this.slideWin.css('-webkit-transform', 'translateX('+tempPos+'px)').css('transform', 'translateX('+tempPos+'px)');
			this.slideNavi.find('li').removeClass('cur').eq(this.curPic).addClass('cur');
		}
	}
