// Generated by CoffeeScript 1.4.0
(function() {
  var Api, BaseApi, WebFITS, version,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.astro == null) {
    this.astro = {};
  }

  WebFITS = {};

  WebFITS.version = '0.3.1';

  this.astro.WebFITS = WebFITS;

  BaseApi = (function() {

    function BaseApi(el, width, height) {
      var canvasStyle, overlayStyle, parentStyle;
      this.el = el;
      this.wheelHandler = __bind(this.wheelHandler, this);

      this._reset();
      this.width = width;
      this.height = height;
      this.canvas = document.createElement('canvas');
      this.canvas.setAttribute('width', this.width);
      this.canvas.setAttribute('height', this.height);
      this.canvas.setAttribute('class', 'visualization');
      this.overlay = document.createElement('canvas');
      this.overlay.setAttribute('width', this.width);
      this.overlay.setAttribute('height', this.height);
      this.overlay.setAttribute('class', 'overlay');
      this.overlayCtx = this.overlay.getContext('2d');
      this.report = document.createElement('canvas');
      this.report.setAttribute('width', this.width);
      this.report.setAttribute('height', this.height);
      this.report.setAttribute('class', 'report');
      this.reportCtx = this.report.getContext('2d');
      this.el.appendChild(this.canvas);
      this.el.appendChild(this.overlay);
      this.el.appendChild(this.report);
      this.nImages = 0;
      if (!this.getContext()) {
        return null;
      }
      this.offsetLeft = this.canvas.offsetLeft;
      this.offsetTop = this.canvas.offsetTop;
      this.showMask = true;
      parentStyle = this.canvas.parentElement.style;
      parentStyle.width = "" + this.canvas.width + "px";
      parentStyle.height = "" + this.canvas.height + "px";
      parentStyle.overflow = 'hidden';
      parentStyle.backgroundColor = '#252525';
      parentStyle.position = 'relative';
      canvasStyle = this.canvas.style;
      overlayStyle = this.overlay.style;
      reportStyle = this.report.style;
      canvasStyle.position = 'absolute';
      overlayStyle.position = 'absolute';
      reportStyle.position = 'absolute';
      overlayStyle.pointerEvents = 'none';
      reportStyle.pointerEvents = 'none';
    }

    BaseApi.prototype.setupControls = function(callbacks, opts) {
      var _onmousedown, _onmousemove, _onmouseout, _onmouseover, _onmouseup,
        _this = this;
      if (callbacks == null) {
        callbacks = null;
      }
      if (opts == null) {
        opts = null;
      }
      
      if ((callbacks != null ? callbacks.onclick : void 0) != null) {
        this.canvas.onclick = function(e) {
          return callbacks.onclick.call(_this, _this, opts, e);
        };
      }
    };
    
    return BaseApi;

  })();

  this.astro.WebFITS.BaseApi = BaseApi;

  BaseApi = this.astro.WebFITS.BaseApi;

  Api = (function(_super) {

    __extends(Api, _super);

    function Api() {
      return Api.__super__.constructor.apply(this, arguments);
    }

    Api.prototype._reset = function() {
      this.images = {};
      this.scales = {};
      return this.calibrations = {};
    };

    Api.prototype._applyTransforms = function() {
      var transforms;
      transforms = ["scaleX(" + this.zoom + ")", "scaleY(" + (-this.zoom) + ")", "translateX(" + this.xOffset + "px)", "translateY(" + this.yOffset + "px)"].join(' ');
      this.canvas.style.transform = transforms;
      this.canvas.style.webkitTransform = transforms;
      return this.canvas.style.MozTransform = transforms;
    };

    Api.prototype.getContext = function() {
      this.canvas.style.transform = 'scaleY(-1)';
      this.canvas.style.webkitTransform = 'scaleY(-1)';
      this.canvas.style.MozTransform = 'scaleY(-1)';
      this.ctx = this.canvas.getContext('2d');
      this.draw = this.drawLinear;
      return this.ctx;
    };

    Api.prototype.setupControls = function() {
      var _this = this;
      Api.__super__.setupControls.apply(this, arguments);
    };

    Api.prototype.loadImage = function(identifier, arr, width, height) {
      this.images[identifier] = {
        arr: new Float32Array(arr),
        width: width,
        height: height
      };
      if (!this.currentImage) {
        this.setImage(identifier);
      }
      return this.nImages += 1;
    };

    Api.prototype.setImage = function(identifier) {
      return this.currentImage = identifier;
    };

    Api.prototype.setStretch = function(stretch) {
      switch (stretch) {
        case 'logarithm':
          this.draw = this.drawLog;
          break;
        case 'sqrt':
          this.draw = this.drawSqrt;
          break;
        case 'arcsinh':
          this.draw = this.drawAsinh;
          break;
        case 'peter':
          this.draw = this.drawPeter;
          break;
        case 'power':
          this.draw = this.drawPower;
          break;
        default:
          this.draw = this.drawLinear;
      }
      return this.draw();
    };

    Api.prototype.setExtent = function(min, max) {
      this.minimum = min;
      this.maximum = max;
      return this.draw();
    };

    Api.prototype.setScales = function(r, g, b) {
      this.scales.r = r;
      this.scales.g = g;
      this.scales.b = b;
      return this.draw();
    };

    Api.prototype.setCalibrations = function(r, g, b) {
      this.calibrations.r = r;
      this.calibrations.g = g;
      this.calibrations.b = b;
      return this.draw();
    };

    Api.prototype.setAlpha = function(value) {
      this.alpha = value;
      return this.draw();
    };

    Api.prototype.setQ = function(value) {
      this.Q = value;
      return this.draw();
    };

    // color all masked pixels blue
    Api.prototype.addMask = function(arr) {
      var data = this.images.bpm.arr;
      var length = arr.length;
      while (length -= 4) {
        if (data[length / 4] != 65536) {// issue with fits.js, compression and Uint16
          arr[length + 0] = 0;
          arr[length + 1] = 0;
          arr[length+2] = 255;
        }
      }
    };

    Api.prototype.drawLinear = function() {
      var arr, data, height, imgData, length, max, min, range, value, width;
      data = this.images[this.currentImage].arr;
      width = this.images[this.currentImage].width;
      height = this.images[this.currentImage].height;
      imgData = this.ctx.getImageData(0, 0, width, height);
      arr = imgData.data;
      min = this.minimum;
      max = this.maximum;
      range = max - min;
      length = arr.length;
      while (length -= 4) {
        value = 255 * (data[length / 4] - min) / range;
        arr[length + 0] = value;
        arr[length + 1] = value;
        arr[length + 2] = value;
        arr[length + 3] = 255;
      }
      if (this.showMask && this.nImages % 2 == 0)
        this.addMask(arr);
      imgData.data = arr;
      this.ctx.putImageData(imgData, 0, 0);
      return this._applyTransforms();
    };

    Api.prototype.drawLog = function() {
      var arr, data, height, imgData, length, max, min, minimum, pixel, range, value, width;
      data = this.images[this.currentImage].arr;
      width = this.images[this.currentImage].width;
      height = this.images[this.currentImage].height;
      imgData = this.ctx.getImageData(0, 0, width, height);
      arr = imgData.data;
      minimum = this.minimum;
      min = 0;
      max = this.logarithm(this.maximum - this.minimum);
      range = max - min;
      length = arr.length;
      while (length -= 4) {
        pixel = this.logarithm(data[length / 4] - minimum);
        value = 255 * (pixel - min) / range;
        arr[length + 0] = value;
        arr[length + 1] = value;
        arr[length + 2] = value;
        arr[length + 3] = 255;
      }
      if (this.showMask && this.nImages % 2 == 0)
        this.addMask(arr);
      imgData.data = arr;
      this.ctx.putImageData(imgData, 0, 0);
      return this._applyTransforms();
    };

    Api.prototype.drawSqrt = function() {
      var arr, data, height, imgData, length, max, minimum, pixel, value, width;
      data = this.images[this.currentImage].arr;
      width = this.images[this.currentImage].width;
      height = this.images[this.currentImage].height;
      imgData = this.ctx.getImageData(0, 0, width, height);
      arr = imgData.data;
      minimum = this.minimum;
      max = this.maximum - minimum;
      length = arr.length;
      while (length -= 4) {
        pixel = data[length / 4] - minimum;
        value = 255 * Math.sqrt(pixel / max);
        arr[length + 0] = value;
        arr[length + 1] = value;
        arr[length + 2] = value;
        arr[length + 3] = 255;
      }
      if (this.showMask && this.nImages % 2 == 0)
        this.addMask(arr);
      imgData.data = arr;
      this.ctx.putImageData(imgData, 0, 0);
      return this._applyTransforms();
    };
    Api.prototype.drawAsinh = function(minval) {
      var arr, data, height, imgData, length, max, min, pixel, range, value, width;
      data = this.images[this.currentImage].arr;
      width = this.images[this.currentImage].width;
      height = this.images[this.currentImage].height;
      imgData = this.ctx.getImageData(0, 0, width, height);
      arr = imgData.data;
      if (minval === undefined)
        min = this.scaledArcsinh(this.minimum);
      else
        min = this.scaledArcsinh(minval);
      max = this.scaledArcsinh(this.maximum);
      range = max - min;
      length = arr.length;
      while (length -= 4) {
        pixel = this.scaledArcsinh(data[length / 4]);
        value = 255 * (pixel - min) / range;
        arr[length + 0] = value;
        arr[length + 1] = value;
        arr[length + 2] = value;
        arr[length + 3] = 255;
      }
      if (this.showMask && this.nImages % 2 == 0)
        this.addMask(arr);
      imgData.data = arr;
      this.ctx.putImageData(imgData, 0, 0);
      return this._applyTransforms();
    };
    
    Api.prototype.drawPeter = function() {
      return this.drawAsinh(1);
    };
    
    Api.prototype.drawPower = function() {
      var arr, data, height, imgData, length, max, min, pixel, value, width;
      data = this.images[this.currentImage].arr;
      width = this.images[this.currentImage].width;
      height = this.images[this.currentImage].height;
      imgData = this.ctx.getImageData(0, 0, width, height);
      arr = imgData.data;
      min = this.minimum;
      max = this.maximum - min;
      length = arr.length;
      while (length -= 4) {
        pixel = data[length / 4] - min;
        value = 255 * Math.pow(pixel / max, 2);
        arr[length + 0] = value;
        arr[length + 1] = value;
        arr[length + 2] = value;
        arr[length + 3] = 255;
      }
      if (this.showMask && this.nImages % 2 == 0)
        this.addMask(arr);
      imgData.data = arr;
      this.ctx.putImageData(imgData, 0, 0);
      return this._applyTransforms();
    };

    Api.prototype.teardown = function() {
      this.el.removeChild(this.canvas);
      this.ctx = void 0;
      return this._reset();
    };

    Api.prototype.logarithm = function(value) {
      return Math.log(value / 0.05 + 1.0) / Math.log(1.0 / 0.05 + 1.0);
    };

    Api.prototype.arcsinh = function(value) {
      return Math.log(value + Math.sqrt(1 + value * value));
    };

    Api.prototype.scaledArcsinh = function(value) {
      return this.arcsinh(value / -0.033) / this.arcsinh(1.0 / -0.033);
    };

    return Api;

  })(BaseApi);

  version = this.astro.WebFITS.version;

  this.astro.WebFITS = Api;

  this.astro.WebFITS.version = version;

}).call(this);