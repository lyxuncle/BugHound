// 图片压缩器
  var Compressor = function() {
    this.canvas = null;
    this.context = null;

    this.init();
  };

  Compressor.prototype = {
    constructor: Compressor,
    init: function () {
      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d");
    },
    /**
     * 压缩图片，可以压缩尺寸及质量
     * @param
     * @param.image
     * @param.maxWidth
     * @param.maxHeight
     * @param.rate
     * @param.quality
     * @param.imageType
     * @param.isIos
     **/
    compress: function (param) {
      var q = !! param.quality ? param.quality : 1;
      var type = !! param.imageType ? param.imageType : 'image/jpeg';
      var rate = 1;
      var ow = param.image.width;
      var oh = param.image.height;
      if( !! param.maxWidth && param.maxHeight) {
        var rw = ow / param.maxWidth;
        var rh = oh / param.maxHeight;
        rate = rw > rh ? 1 / rw : 1 / rh;
      }
      rate = !! param.rate ? param.rate : rate;
      var deviation = param.isIos ? this._detectVerticalSquash(param.image, ow, oh) : 1;
      this.canvas.width = ow * rate;
      this.canvas.height = oh * rate;
      this.context.clearRect(0, 0, ow, oh);
      this.context.scale(rate, rate / deviation);
      this.context.drawImage(param.image, 0, 0);
      var data = this.canvas.toDataURL(type, q);
      var size = ((data.length - 814) / 1.37);
      if( !! param.maxSize && param.maxSize < size) {
        q = param.maxSize / size;
        data = this.canvas.toDataURL(type, q);
      }
      return data;
    },

    /**
     * 检测图片的高度有没有被压扁,主要是解决ios下图片画到canvas时被压扁的问题
     **/
    _detectVerticalSquash: function (img, iw, ih) {
      this.canvas.width = 1;
      this.canvas.height = ih;
      this.context.drawImage(img, 0, 0);
      var data = this.context.getImageData(0, 0, 1, ih).data;
      // search image edge pixel position in case it is squashed vertically.
      var sy = 0;
      var ey = ih;
      var py = ih;
      while(py > sy) {
        var alpha = data[(py - 1) * 4 + 3];
        if(alpha === 0) {
          ey = py;
        } else {
          sy = py;
        }
        py = (ey + sy) >> 1;
      }
      var ratio = (py / ih);
      return(ratio === 0) ? 1 : ratio;
    }
  };
