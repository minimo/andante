/*
 *  main.js
 *  2018/09/20
 */

phina.globalize();

const SC_W = 640;
const SC_H = 1136;

let app;

window.onload = function() {
  app = Application();
  app.replaceScene(MainSceneFlow());

  app.run();
//  app.enableStats();
};

/*
 *  phina.assetloaderex.js
 *  2016/11/25
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//バックグラウンドでアセット読み込み
phina.define("phina.extension.AssetLoaderEx", {

  //進捗
  loadprogress: 0,

  //読み込み終了フラグ
  loadcomplete: false,

  init: function() {
  },

  load: function(assets, callback) {
    this._onLoadAssets = callback || function(){};
    var loader = phina.asset.AssetLoader();
    loader.load(assets);
    loader.on('load', function(e) {
      this.loadcomplete = true;
      this._onLoadAssets();
    }.bind(this));
    loader.onprogress = function(e) {
      this.loadprogress = e.progress;
    }.bind(this);
    return this;
  },
});

/*
 *  phina.extension.js
 *  2016/11/25
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//setAlphaを追加
phina.display.DisplayElement.prototype.setAlpha = function(val) {
  this.alpha = val;
  return this;
};

//スプライト機能拡張
phina.display.Sprite.prototype.setFrameTrimming = function(x, y, width, height) {
  this._frameTrimX = x || 0;
  this._frameTrimY = y || 0;
  this._frameTrimWidth = width || this.image.domElement.width - this._frameTrimX;
  this._frameTrimHeight = height || this.image.domElement.height - this._frameTrimY;
  return this;
}

phina.display.Sprite.prototype.setFrameIndex = function(index, width, height) {
  var sx = this._frameTrimX || 0;
  var sy = this._frameTrimY || 0;
  var sw = this._frameTrimWidth  || (this.image.domElement.width-sx);
  var sh = this._frameTrimHeight || (this.image.domElement.height-sy);

  var tw  = width || this.width;    // tw
  var th  = height || this.height;  // th
  var row = ~~(sw / tw);
  var col = ~~(sh / th);
  var maxIndex = row*col;
  index = index%maxIndex;

  var x   = index%row;
  var y   = ~~(index/row);
  this.srcRect.x = sx+x*tw;
  this.srcRect.y = sy+y*th;
  this.srcRect.width  = tw;
  this.srcRect.height = th;

  this._frameIndex = index;

  return this;
}

//エレメント同士の接触判定
phina.display.DisplayElement.prototype.isHitElement = function(elm) {
  //自分とテスト対象をグローバルへ変換
  var p = this.globalToLocal(elm);
  var target = phina.display.DisplayElement({width: elm.width, height: elm.height}).setPosition(p.x, p.y);

  if (this.boundingType == 'rect') {
    if (elm.boundingType == 'rect') {
      return phina.geom.Collision.testRectRect(this, target);
    } else {
      return phina.geom.Collision.testRectCircle(this, target);
    }
  } else {
    if (elm.boundingType == 'rect') {
      return phina.geom.Collision.testCiecleRect(this, target);
    } else {
      return phina.geom.Collision.testCircleCircle(this, target);
    }
  }
}

//子要素全て切り離し
phina.app.Element.prototype.removeChildren = function(beginIndex) {
  beginIndex = beginIndex || 0;
  var tempChildren = this.children.slice();
  var len = len = tempChildren.length;
  for (var i = beginIndex; i < len; ++i) {
    tempChildren[i].remove();
  }
  this.children = [];
}

/**
 * @method testLineLine
 * @static
 * 2つの線分が重なっているかどうかを判定します
 * 参考：http://www5d.biglobe.ne.jp/~tomoya03/shtml/algorithm/Intersection.htm
 *
 * ### Example
 *   p1 = phina.geom.Vector2(100, 100);
 *   p2 = phina.geom.Vector2(200, 200);
 *   p3 = phina.geom.Vector2(150, 240);
 *   p4 = phina.geom.Vector2(200, 100);
 * phina.geom.Collision.testLineLine(p1, p2, p3, p4); // => true
 *
 * @param {phina.geom.Vector2} p1 線分1の端の座標
 * @param {phina.geom.Vector2} p2 線分1の端の座標
 * @param {phina.geom.Vector2} p3 線分2の端の座標
 * @param {phina.geom.Vector2} p4 線分2の端の座標
 * @return {Boolean} 線分1と線分2が重なっているかどうか
 */
phina.geom.Collision.testLineLine = function(p1, p2, p3, p4) {
  //同一ＸＹ軸上に乗ってる場合の誤判定回避
  if (p1.x == p2.x && p1.x == p3.x && p1.x == p4.x) {
  var min = Math.min(p1.y, p2.y);
  var max = Math.max(p1.y, p2.y);
  if (min <= p3.y && p3.y <= max || min <= p4.y && p4.y <= max) return true;
  return false;
  }
  if (p1.y == p2.y && p1.y == p3.y && p1.y == p4.y) {
  var min = Math.min(p1.x, p2.x);
  var max = Math.max(p1.x, p2.x);
  if (min <= p3.x && p3.x <= max || min <= p4.x && p4.x <= max) return true;
  return false;
  }
  var a = (p1.x - p2.x) * (p3.y - p1.y) + (p1.y - p2.y) * (p1.x - p3.x);
  var b = (p1.x - p2.x) * (p4.y - p1.y) + (p1.y - p2.y) * (p1.x - p4.x);
  var c = (p3.x - p4.x) * (p1.y - p3.y) + (p3.y - p4.y) * (p3.x - p1.x);
  var d = (p3.x - p4.x) * (p2.y - p3.y) + (p3.y - p4.y) * (p3.x - p2.x);
  return a * b <= 0 && c * d <= 0;
}

/**
 * @method testRectLine
 * @static
 * 矩形と線分が重なっているかどうかを判定します
 *
 * ### Example
 *   rect = phina.geom.Rect(120, 130, 40, 50);
 *   p1 = phina.geom.Vector2(100, 100);
 *   p2 = phina.geom.Vector2(200, 200);
 * phina.geom.Collision.testRectLine(rect, p1, p2); // => true
 *
 * @param {phina.geom.Rect} rect 矩形領域オブジェクト
 * @param {phina.geom.Vector2} p1 線分の端の座標
 * @param {phina.geom.Vector2} p2 線分の端の座標
 * @return {Boolean} 矩形と線分が重なっているかどうか
 */
phina.geom.Collision.testRectLine = function(rect, p1, p2) {
  //包含判定(p1が含まれてれば良いのでp2の判定はしない）
  if (rect.left <= p1.x && p1.x <= rect.right && rect.top <= p1.y && p1.y <= rect.bottom ) return true;

  //矩形の４点
  var r1 = phina.geom.Vector2(rect.left, rect.top);   //左上
  var r2 = phina.geom.Vector2(rect.right, rect.top);  //右上
  var r3 = phina.geom.Vector2(rect.right, rect.bottom); //右下
  var r4 = phina.geom.Vector2(rect.left, rect.bottom);  //左下

  //矩形の４辺をなす線分との接触判定
  if (phina.geom.Collision.testLineLine(p1, p2, r1, r2)) return true;
  if (phina.geom.Collision.testLineLine(p1, p2, r2, r3)) return true;
  if (phina.geom.Collision.testLineLine(p1, p2, r3, r4)) return true;
  if (phina.geom.Collision.testLineLine(p1, p2, r1, r4)) return true;
  return false;
}


//円弧の描画
phina.define('phina.display.ArcShape', {
  superClass: 'phina.display.Shape',

  init: function(options) {
  options = ({}).$safe(options, {
    backgroundColor: 'transparent',
    fill: 'red',
    stroke: '#aaa',
    strokeWidth: 4,
    radius: 32,
    startAngle: 0,
    endAngle: 270,

    anticlockwise: false,
  });
  this.superInit(options);

  this.radius = options.radius;
  this.startAngle = options.startAngle;
  this.endAngle = options.endAngle;
  this.anticlockwise = options.anticlockwise;

  this.setBoundingType('circle');
  },

  prerender: function(canvas) {
  canvas.fillPie(0, 0, this.radius, this.startAngle, this.endAngle);
  },
});

/*
 *  phina.tiledmap.js
 *  2016/09/10
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

/**
 * @class phina.asset.TiledMap
 * @extends phina.asset.Asset
 * # TiledMapEditorで作成したtmxファイルを読み込みクラス
 */
phina.define("phina.asset.TiledMap", {
  superClass: "phina.asset.Asset",

  /**
   * @property image
   * 作成されたマップ画像
   */
  image: null,

  /**
   * @property tilesets
   * タイルセット情報
   */
  tilesets: null,

  /**
   * @property layers
   * レイヤー情報が格納されている配列
   */
  layers: null,

  init: function() {
    this.superInit();
  },

  _load: function(resolve) {
    //パス抜き出し
    this.path = "";
    var last = this.src.lastIndexOf("/");
    if (last > 0) {
      this.path = this.src.substring(0, last+1);
    }

    //終了関数保存
    this._resolve = resolve;

    // load
    var self = this;
    var xml = new XMLHttpRequest();
    xml.open('GET', this.src);
    xml.onreadystatechange = function() {
      if (xml.readyState === 4) {
        if ([200, 201, 0].indexOf(xml.status) !== -1) {
          var data = xml.responseText;
          data = (new DOMParser()).parseFromString(data, "text/xml");
          self.dataType = "xml";
          self.data = data;
          self._parse(data);
//          resolve(self);
        }
      }
    };
    xml.send(null);
  },

  /**
   * @method getMapData
   * 指定したマップレイヤーを配列として取得します。
   *
   * @param {String} layerName 対象レイヤー名
   */
  getMapData: function(layerName) {
    //レイヤー検索
    var data = null;
    for(var i = 0; i < this.layers.length; i++) {
      if (this.layers[i].name == layerName) {
        //コピーを返す
        return this.layers[i].data.concat();
      }
    }
    return null;
  },

  /**
   * @method getObjectGroup
   * オブジェクトグループを取得します
   *
   * グループ指定が無い場合、全レイヤーを配列にして返します。
   *
   * @param {String} grounpName 対象オブジェクトグループ名
   */
  getObjectGroup: function(groupName) {
    groupName = groupName || null;
    var ls = [];
    var len = this.layers.length;
    for (var i = 0; i < len; i++) {
      if (this.layers[i].type == "objectgroup") {
        if (groupName == null || groupName == this.layers[i].name) {
          //レイヤー情報をクローンする
          var obj = this._cloneObjectLayer(this.layers[i]);
          if (groupName !== null) return obj;
        }
        ls.push(obj);
      }
    }
    return ls;
  },

  /**
   * @method getMapImage
   * マップイメージの作成
   *
   * 複数のマップレイヤーを指定出来ます。
   * 描画順序はTiledMapEditor側での指定順では無く、引数の順序となります（第一引数が一番下となる）
   *
   * @param {String}  対象レイヤー名
   */
  getImage: function(...args) {
    var numLayer = 0;
    for (var i = 0; i < this.layers.length; i++) {
      if (this.layers[i].type == "layer" || this.layers[i].type == "imagelayer") numLayer++;
    }
    if (numLayer == 0) return null;

    var generated = false;
    var width = this.width * this.tilewidth;
    var height = this.height * this.tileheight;
    var canvas = phina.graphics.Canvas().setSize(width, height);

    for (var i = 0; i < this.layers.length; i++) {
      var find = args.indexOf(this.layers[i].name);
      if (args.length == 0 || find >= 0) {
        //マップレイヤー
        if (this.layers[i].type == "layer" && this.layers[i].visible != "0") {
          var layer = this.layers[i];
          var mapdata = layer.data;
          var width = layer.width;
          var height = layer.height;
          var opacity = layer.opacity || 1.0;
          var count = 0;
          for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
              var index = mapdata[count];
                if (index !== -1) {
                //マップチップを配置
                this._setMapChip(canvas, index, x * this.tilewidth, y * this.tileheight, opacity);
              }
              count++;
            }
          }
          generated = true;
        }
        //オブジェクトグループ
        if (this.layers[i].type == "objectgroup" && this.layers[i].visible != "0") {
          var layer = this.layers[i];
          var opacity = layer.opacity || 1.0;
          layer.objects.forEach(function(e) {
            if (e.gid) {
              this._setMapChip(canvas, e.gid, e.x, e.y, opacity);
            }
          }.bind(this));
          generated = true;
        }
        //イメージレイヤー
        if (this.layers[i].type == "imagelayer" && this.layers[i].visible != "0") {
          var len = this.layers[i];
          var image = phina.asset.AssetManager.get('image', this.layers[i].image.source);
          canvas.context.drawImage(image.domElement, this.layers[i].x, this.layers[i].y);
          generated = true;
        }
      }
    }

    if (!generated) return null;

    var texture = phina.asset.Texture();
    texture.domElement = canvas.domElement;
    return texture;
  },

  /**
   * @method _cloneObjectLayer
   * 引数として渡されたオブジェクトレイヤーをクローンして返します。
   *
   * 内部で使用している関数です。
   * @private
   */
  _cloneObjectLayer: function(srcLayer) {
    var result = {}.$safe(srcLayer);
    result.objects = [];
    //レイヤー内オブジェクトのコピー
    srcLayer.objects.forEach(function(obj){
      var resObj = {
        properties: {}.$safe(obj.properties),
      }.$extend(obj);
      if (obj.ellipse) resObj.ellipse = obj.ellipse;
      if (obj.gid) resObj.gid = obj.gid;
      if (obj.polygon) resObj.polygon = obj.polygon.clone();
      if (obj.polyline) resObj.polyline = obj.polyline.clone();
      result.objects.push(resObj);
    });
    return result;
  },

  /**
   * @method _parse
   * 取得したTiledMapEditのデータをパースします。
   *
   * 内部で使用している関数です。
   * @private
   */
  _parse: function(data) {
    //タイル属性情報取得
    var map = data.getElementsByTagName('map')[0];
    var attr = this._attrToJSON(map);
    this.$extend(attr);
    this.properties = this._propertiesToJSON(map);

    //タイルセット取得
    this.tilesets = this._parseTilesets(data);

    //タイルセット情報補完
    var defaultAttr = {
      tilewidth: 32,
      tileheight: 32,
      spacing: 0,
      margin: 0,
    };
    this.tilesets.chips = [];
    for (var i = 0; i < this.tilesets.length; i++) {
      //タイルセット属性情報取得
      var attr = this._attrToJSON(data.getElementsByTagName('tileset')[i]);
      attr.$safe(defaultAttr);
      attr.firstgid--;
      this.tilesets[i].$extend(attr);

      //マップチップリスト作成
      var t = this.tilesets[i];
      this.tilesets[i].mapChip = [];
      for (var r = attr.firstgid; r < attr.firstgid+attr.tilecount; r++) {
        var chip = {
          image: t.image,
          x: ((r - attr.firstgid) % t.columns) * (t.tilewidth + t.spacing) + t.margin,
          y: Math.floor((r - attr.firstgid) / t.columns) * (t.tileheight + t.spacing) + t.margin,
        }.$safe(attr);
        this.tilesets.chips[r] = chip;
      }
    }

    //レイヤー取得
    this.layers = this._parseLayers(data);

    //イメージデータ読み込み
    this._checkImage();
  },

  /**
   * @method _checkImage
   * アセットに無いイメージデータをチェックして読み込みを行います。
   *
   * 内部で使用している関数です。
   * @private
   */
  _checkImage: function() {
    var that = this;
    var imageSource = [];
    var loadImage = [];

    //一覧作成
    for (var i = 0; i < this.tilesets.length; i++) {
      var obj = {
        image: this.tilesets[i].image,
        transR: this.tilesets[i].transR,
        transG: this.tilesets[i].transG,
        transB: this.tilesets[i].transB,
      };
      imageSource.push(obj);
    }
    for (var i = 0; i < this.layers.length; i++) {
      if (this.layers[i].image) {
        var obj = {
          image: this.layers[i].image.source
        };
        imageSource.push(obj);
      }
    }

    //アセットにあるか確認
    for (var i = 0; i < imageSource.length; i++) {
      var image = phina.asset.AssetManager.get('image', imageSource[i].image);
      if (image) {
        //アセットにある
      } else {
        //なかったのでロードリストに追加
        loadImage.push(imageSource[i]);
      }
    }

    //一括ロード
    //ロードリスト作成
    var assets = {
      image: []
    };
    for (var i = 0; i < loadImage.length; i++) {
      //イメージのパスをマップと同じにする
      assets.image[loadImage[i].image] = this.path+loadImage[i].image;
    }
    if (loadImage.length) {
      var loader = phina.asset.AssetLoader();
      loader.load(assets);
      loader.on('load', function(e) {
        //透過色設定反映
        loadImage.forEach(function(elm) {
          var image = phina.asset.AssetManager.get('image', elm.image);
          if (elm.transR !== undefined) {
            var r = elm.transR, g = elm.transG, b = elm.transB;
            image.filter(function(pixel, index, x, y, bitmap) {
              var data = bitmap.data;
              if (pixel[0] == r && pixel[1] == g && pixel[2] == b) {
                data[index+3] = 0;
              }
            });
          }
        });
        //読み込み終了
        that._resolve(that);
      }.bind(this));
    } else {
      //読み込み終了
      this._resolve(that);
    }
  },

  /**
   * @method _setMapChip
   * キャンバスの指定した座標にマップチップのイメージをコピーします。
   *
   * 内部で使用している関数です。
   * @private
   */
  _setMapChip: function(canvas, index, x, y, opacity) {
    //タイルセットからマップチップを取得
    var chip = this.tilesets.chips[index];
    if (!chip) {
      return;
    }
    var image = phina.asset.AssetManager.get('image', chip.image);
    if (!image) {
      console.log(chip.image);
    }
    canvas.context.drawImage(
      image.domElement,
      chip.x + chip.margin, chip.y + chip.margin,
      chip.tilewidth, chip.tileheight,
      x, y,
      chip.tilewidth, chip.tileheight);
  },

  /**
   * @method _propertiesToJSON
   * XMLプロパティをJSONに変換します。
   *
   * 内部で使用している関数です。
   * @private
   */
  _propertiesToJSON: function(elm) {
    var properties = elm.getElementsByTagName("properties")[0];
    var obj = {};
    if (properties === undefined) {
      return obj;
    }
    for (var k = 0; k < properties.childNodes.length; k++) {
      var p = properties.childNodes[k];
      if (p.tagName === "property") {
        //propertyにtype指定があったら変換
        var type = p.getAttribute('type');
        var value = p.getAttribute('value');
        if (!value) value = p.textContent;
        if (type == "int") {
          obj[p.getAttribute('name')] = parseInt(value, 10);
        } else if (type == "float") {
          obj[p.getAttribute('name')] = parseFloat(value);
        } else if (type == "bool" ) {
          if (value == "true") obj[p.getAttribute('name')] = true;
          else obj[p.getAttribute('name')] = false;
        } else {
          obj[p.getAttribute('name')] = value;
        }
      }
    }
    return obj;
  },

  /**
   * @method _propertiesToJSON
   * XML属性情報をJSONに変換します。
   *
   * 内部で使用している関数です。
   * @private
   */
  _attrToJSON: function(source) {
    var obj = {};
    for (var i = 0; i < source.attributes.length; i++) {
      var val = source.attributes[i].value;
      val = isNaN(parseFloat(val))? val: parseFloat(val);
      obj[source.attributes[i].name] = val;
    }
    return obj;
  },

  /**
   * @method _propertiesToJSON_str
   * XMLプロパティをJSONに変換し、文字列で返します。
   *
   * 内部で使用している関数です。
   * @private
   */
  _attrToJSON_str: function(source) {
    var obj = {};
    for (var i = 0; i < source.attributes.length; i++) {
      var val = source.attributes[i].value;
      obj[source.attributes[i].name] = val;
    }
    return obj;
  },

  /**
   * @method _parseTilesets
   * タイルセットのパースを行います。
   *
   * 内部で使用している関数です。
   * @private
   */
  _parseTilesets: function(xml) {
    var each = Array.prototype.forEach;
    var self = this;
    var data = [];
    var tilesets = xml.getElementsByTagName('tileset');
    each.call(tilesets, function(tileset) {
      var t = {};
      var props = self._propertiesToJSON(tileset);
      if (props.src) {
        t.image = props.src;
      } else {
        t.image = tileset.getElementsByTagName('image')[0].getAttribute('source');
      }
      //透過色設定取得
      t.trans = tileset.getElementsByTagName('image')[0].getAttribute('trans');
      if (t.trans) {
        t.transR = parseInt(t.trans.substring(0, 2), 16);
        t.transG = parseInt(t.trans.substring(2, 4), 16);
        t.transB = parseInt(t.trans.substring(4, 6), 16);
      }

      data.push(t);
    });
    return data;
  },

  /**
   * @method _parseLayers
   * レイヤー情報のパースを行います。
   *
   * 内部で使用している関数です。
   * @private
   */
  _parseLayers: function(xml) {
    var each = Array.prototype.forEach;
    var data = [];

    var map = xml.getElementsByTagName("map")[0];
    var layers = [];
    each.call(map.childNodes, function(elm) {
      if (elm.tagName == "layer" || elm.tagName == "objectgroup" || elm.tagName == "imagelayer") {
        layers.push(elm);
      }
    });

    layers.each(function(layer) {
      switch (layer.tagName) {
        case "layer":
          //通常レイヤー
          var d = layer.getElementsByTagName('data')[0];
          var encoding = d.getAttribute("encoding");
          var l = {
            type: "layer",
            name: layer.getAttribute("name"),
          };

          if (encoding == "csv") {
            l.data = this._parseCSV(d.textContent);
          } else if (encoding == "base64") {
            l.data = this._parseBase64(d.textContent);
          }

          var attr = this._attrToJSON(layer);
          l.$extend(attr);
          l.properties = this._propertiesToJSON(layer);

          data.push(l);
          break;

        //オブジェクトレイヤー
        case "objectgroup":
          var l = {
            type: "objectgroup",
            objects: [],
            name: layer.getAttribute("name"),
            x: parseFloat(layer.getAttribute("offsetx")) || 0,
            y: parseFloat(layer.getAttribute("offsety")) || 0,
            alpha: layer.getAttribute("opacity") || 1,
            color: layer.getAttribute("color") || null,
            draworder: layer.getAttribute("draworder") || null,
          };
          l.properties = this._propertiesToJSON(layer);

          //レイヤー内解析
          each.call(layer.childNodes, function(elm) {
            if (elm.nodeType == 3) return;
            var d = this._attrToJSON(elm);
            if (d.id === undefined) return;
            d.properties = this._propertiesToJSON(elm);
            //子要素の解析
            if (elm.childNodes.length) {
              elm.childNodes.forEach(function(e) {
                if (e.nodeType == 3) return;
                //楕円
                if (e.nodeName == 'ellipse') {
                  d.ellipse = true;
                }
                //多角形
                if (e.nodeName == 'polygon') {
                  d.polygon = [];
                  var attr = this._attrToJSON_str(e);
                  var pl = attr.points.split(" ");
                  pl.forEach(function(str) {
                    var pts = str.split(",");
                    d.polygon.push({x: parseFloat(pts[0]), y: parseFloat(pts[1])});
                  });
                }
                //線分
                if (e.nodeName == 'polyline') {
                  d.polyline = [];
                  var attr = this._attrToJSON_str(e);
                  var pl = attr.points.split(" ");
                  pl.forEach(function(str) {
                    var pts = str.split(",");
                    d.polyline.push({x: parseFloat(pts[0]), y: parseFloat(pts[1])});
                  });
                }
              }.bind(this));
            }
            l.objects.push(d);
          }.bind(this));

          data.push(l);
          break;

        //イメージレイヤー
        case "imagelayer":
          var l = {
            type: "imagelayer",
            name: layer.getAttribute("name"),
            x: parseFloat(layer.getAttribute("offsetx")) || 0,
            y: parseFloat(layer.getAttribute("offsety")) || 0,
            alpha: layer.getAttribute("opacity") || 1,
            visible: (layer.getAttribute("visible") === undefined || layer.getAttribute("visible") != 0),
          };
          var imageElm = layer.getElementsByTagName("image")[0];
          l.image = {source: imageElm.getAttribute("source")};

          data.push(l);
          break;
      }
    }.bind(this));
    return data;
  },

  /**
   * @method _perseCSV
   * CSVのパースを行います。
   *
   * 内部で使用している関数です。
   * @private
   */
  _parseCSV: function(data) {
    var dataList = data.split(',');
    var layer = [];

    dataList.each(function(elm, i) {
      var num = parseInt(elm, 10) - 1;
      layer.push(num);
    });

    return layer;
  },

  /**
   * @method _perseCSV
   * BASE64のパースを行います。
   *
   * 内部で使用している関数です。
   * http://thekannon-server.appspot.com/herpity-derpity.appspot.com/pastebin.com/75Kks0WH
   * @private
   */
  _parseBase64: function(data) {
    var dataList = atob(data.trim());
    var rst = [];

    dataList = dataList.split('').map(function(e) {
      return e.charCodeAt(0);
    });

    for (var i=0,len=dataList.length/4; i<len; ++i) {
      var n = dataList[i*4];
      rst[i] = parseInt(n, 10) - 1;
    }

    return rst;
  },
});

//ローダーに追加
phina.asset.AssetLoader.assetLoadFunctions.tmx = function(key, path) {
  var tmx = phina.asset.TiledMap();
  return tmx.load(path);
};

/*
 *  SoundSet.js
 *  2014/11/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//サウンド管理
phina.define("phina.extension.SoundSet", {

  //サウンドが格納される配列
  elements: null,

  //再生中ＢＧＭ
  bgm: null,
  bgmIsPlay: false,

  //マスターボリューム
  volumeBGM: 0.5,
  volumeSE: 0.5,

  init: function() {
    this.elements = [];
  },

  //登録済みアセット読み込み
  readAsset: function() {
    for (var key in phina.asset.AssetManager.assets.sound) {
      var obj = phina.asset.AssetManager.get("sound", key);
      if (obj instanceof phina.asset.Sound) this.add(key);
    }
  },

  //サウンド追加
  add: function(name, url) {
    if (name === undefined) return null;
    url = url || null;
    if (this.find(name)) return true;

    var e = phina.extension.SoundElement(name);
    if (!e.media) return false;
    this.elements.push(e);
    return true;
  },

  //サウンド検索
  find: function(name) {
    if (!this.elements) return null;
    for (var i = 0; i < this.elements.length; i++) {
      if (this.elements[i].name == name) return this.elements[i];
    }
    return null;
  },

  //サウンドをＢＧＭとして再生
  playBGM: function(name, loop, callback) {
    if (loop === undefined) loop = true;
    if (this.bgm) {
      this.bgm.stop();
      this.bgmIsPlay = false;
    }
    var element = this.find(name);
    if (element) {
      var vol = this.volumeBGM * element._volume;
      element.media.volume = vol;
      element.play(loop, callback);
      this.bgm = element;
      this.bgmIsPlay = true;
    } else {
      if (this.add(name)) this.playBGM(name);
    }
    return this;
  },

  //ＢＧＭ停止
  stopBGM: function() {
    if (this.bgm) {
      if (this.bgmIsPlay) {
        this.bgm.stop();
        this.bgmIsPlay = false;
      }
      this.bgm = null;
    }
    return this;
  },

  //ＢＧＭ一時停止
  pauseBGM: function() {
    if (this.bgm) {
      if (this.bgmIsPlay) {
        this.bgm.pause();
        this.bgmIsPlay = false;
      }
    }
    return this;
  },

  //ＢＧＭ再開
  resumeBGM: function() {
    if (this.bgm) {
      if (!this.bgmIsPlay) {
        this.bgm.volume = this.volumeBGM;
        this.bgm.resume();
        this.bgmIsPlay = true;
      }
    }
    return this;
  },

  //ＢＧＭマスターボリューム設定
  setVolumeBGM: function(vol) {
    this.volumeBGM = vol;
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.setVolume(this.volumeBGM * this.bgm._volume);
      this.bgm.resume();
    }
    return this;
  },

  //アセットを指定してボリュームを設定
  setVolume: function(name, vol) {
    var media = this.find(name);
    if (media) {
      media.setVolume(vol);
    }
    return this;
  },

  //サウンドをサウンドエフェクトとして再生
  playSE: function(name, loop, callback) {
    var element = this.find(name);
    if (element) {
      var vol = this.volumeSE * element._volume;
      element.media.volume = vol;
      element.play(loop, callback);
    } else {
      if (this.add(name)) this.playSE(name);
    }
    return this;
  },

  //ループ再生しているSEを停止
  stopSE: function(name) {
    var media = this.find(name);
    if (media) {
      media.stop();
    }
    return this;
  },

  //ＢＧＭ一時停止
  pauseBGM: function() {
    if (this.bgm) {
      if (this.bgmIsPlay) {
        this.bgm.pause();
        this.bgmIsPlay = false;
      }
    }
    return this;
  },

  //ＳＥマスターボリューム設定
  setVolumeSE: function(vol) {
    this.volumeSE = vol;
    return this;
  },
});

//SoundElement Basic
phina.define("phina.extension.SoundElement", {
  //サウンド名
  name: null,

  //ＵＲＬ
  url: null,

  //サウンド本体
  media: null,

  //ボリューム
  _volume: 1,

  //再生終了時のコールバック関数
  callback: null,

  //再生中フラグ
  playing: false,

  init: function(name) {
    this.name = name;
    this.media = phina.asset.AssetManager.get("sound", name);
    if (this.media) {
      this.media.volume = 1;
      this.media.on('ended', function() {
        if (this.media.loop) this.playing = false;
        if (this.callback) this.callback();
      }.bind(this))
    } else {
      console.warn("asset not found. "+name);
    }
  },

  //サウンドの再生
  play: function(loop, callback) {
    if (loop === undefined) loop = false
    if (!this.media) return this;

    //ループ再生の場合多重再生を禁止
    if (loop && this.playing) return;

    this.media.loop = loop;
    this.media.play();
    this.callback = callback;
    this.playing = true;
    return this;
  },

  //サウンド再生再開
  resume: function() {
    if (!this.media) return this;
    this.media.resume();
    this.playing = true;
    return this;
  },

  //サウンド一時停止
  pause: function () {
    if (!this.media) return this;
    this.media.pause();
    this.playing = false;
  },

  //サウンド停止
  stop: function() {
    if (!this.media) return this;
    this.media.stop();
    this.playing = false;
    return this;
  },

  //ボリューム設定
  setVolume: function(vol) {
    if (!this.media) return this;
    if (vol === undefined) vol = 0.5;
    this._volume = vol;
    return this;
  },

  _accessor: {
    volume: {
      "get": function() { return this._volume; },
      "set": function(vol) { this.setVolume(vol); }
    },
    loop: {
      "get": function() { return this.media.loop; },
      "set": function(f) { this.media.loop = f; }
    },
  }
});

phina.define("Application", {
  superClass: "CanvasApp",

  init: function() {
    this.superInit({
      query: '#world',
      width: SC_W,
      height: SC_H,
      backgroundColor: 'rgba(0, 0, 0, 1)',
    });
    this.fps = 30;
  },

  _onLoadAssets: function() {
  },
});

/*
 *  AssetList.js
 *  2018/09/20
 * 
 */

phina.define("AssetList", {
  _static: {
    loaded: [],
    isLoaded: function(assetType) {
      return AssetList.loaded[assetType]? true: false;
    },
    get: function(options) {
      AssetList.loaded[options.assetType] = true;
      switch (options.assetType) {
        case "splash":
          return {
            image: {
              "actor4":  "assets/images/actor4.png",
              "actor19":  "assets/images/actor19.png",
              "actor40":  "assets/images/actor40.png",
              "actor55":  "assets/images/actor55.png",
              "actor64":  "assets/images/actor64_a.png",
              "actor642":  "assets/images/actor64_b.png",
              "actor108":  "assets/images/actor108.png",
              "actor111":  "assets/images/actor111.png",
              "actor112":  "assets/images/actor112.png",
            },
          };
        case "common":
          return {
            image: {
              "actor4":  "assets/images/actor4.png",
              "actor19":  "assets/images/actor19.png",
              "actor40":  "assets/images/actor40.png",
              "actor55":  "assets/images/actor55.png",
              "actor64":  "assets/images/actor64_a.png",
              "actor642":  "assets/images/actor64_b.png",
              "actor108":  "assets/images/actor108.png",
              "actor111":  "assets/images/actor111.png",
              "actor112":  "assets/images/actor112.png",
            },
          };
        default:
          throw "invalid assetType: " + options.assetType;
      }
    },
  },
});


/*
 *  Benri.js
 *  2014/12/18
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
var toRad = 3.14159/180;  //弧度法toラジアン変換
var toDeg = 180/3.14159;  //ラジアンto弧度法変換

//距離計算
var distance = function(from, to) {
  var x = from.x-to.x;
  var y = from.y-to.y;
  return Math.sqrt(x*x+y*y);
}

//距離計算（ルート無し版）
var distanceSq = function(from, to) {
  var x = from.x - to.x;
  var y = from.y - to.y;
  return x*x+y*y;
}

//数値の制限
var clamp = function(x, min, max) {
  return (x<min)?min:((x>max)?max:x);
};

//乱数生成
var prand = phina.util.Random();
var rand = function(min, max) {
  return prand.randint(min, max);
}

//タイトル無しダイアログ
var AdvanceAlert = function(str) {
  var tmpFrame = document.createElement('iframe');
  tmpFrame.setAttribute('src', 'data:text/plain,');
  document.documentElement.appendChild(tmpFrame);

  window.frames[0].window.alert(str);
  tmpFrame.parentNode.removeChild(tmpFrame);
};
var AdvanceConfirm = function(str) {
  var tmpFrame = document.createElement('iframe');
  tmpFrame.setAttribute('src', 'data:text/plain,');
  document.documentElement.appendChild(tmpFrame);

  var result = window.frames[0].window.confirm(str);
  tmpFrame.parentNode.removeChild(tmpFrame);

  return result;
};

/*
 *  MainScene.js
 *  2018/09/20
 */

 phina.define("MainScene", {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit({width: SC_W, height: SC_H});
  },

  update: function() {
  },
});

/*
 *  SceneFlow.js
 *  2018/09/20
 *
 */

//メインシーンフロー
phina.define("MainSceneFlow", {
    superClass: "ManagerScene",

    init: function(options) {
        options = options || {};
        startLabel = options.startLabel || "splash";
        this.superInit({
            startLabel: startLabel,
            scenes: [{
                label: "splash",
                className: "SplashScene",
            },{
                label: "main",
                className: "MainScene",
                // nextLabel: "title",
            }],
        });
    }
});

/*
 *  SplashScene.js
 *  2018/09/20
 *
 */

phina.define('SplashScene', {
  superClass: 'DisplayScene',

  init: function() {
    this.superInit({ width: SC_W, height: SC_H });

    this.unlock = false;
    this.loadcomplete1 = false;
    this.progress1 = 0;

    //preload asset
    var assets = AssetList.get({ assetType: "splash" });
    this.loader = phina.asset.AssetLoader();
    this.loader.load(assets);
    this.loader.on('load', function(e) {
      this.loadcomplete1 = true;
    }.bind(this));
    this.loader.on('progress', function(e) {
      this.progress1 = Math.floor(e.progress*100);
    }.bind(this));

    //logo
    var texture = phina.asset.Texture();
    texture.load(SplashScene.logo).then(function() {
      this._init();
    }.bind(this));
    this.texture = texture;
  },

  _init: function() {
    this.sprite = phina.display.Sprite(this.texture)
      .addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.center())
      .setScale(0.3);
    this.sprite.alpha = 0;

    this.sprite.tweener.clear()
      .to({alpha:1}, 500, 'easeOutCubic')
      .wait(500)
      .call(function() {
        this.unlock = true;
      }, this);

    var that = this;
    //進捗ゲージ
    var options = {
      width:  SC_W * 0.1,
      height: 3,
      backgroundColor: 'transparent',
      fill: 'red',
      stroke: 'white',
      strokeWidth: 1,
      gaugeColor: 'lime',
      cornerRadius: 3,
      value: 0,
      maxValue: 100,
    };
    this.progressGauge = phina.ui.Gauge(options).addChildTo(this).setPosition(SC_W * 0.5, SC_H * 0.8);
    this.progressGauge.beforeValue = 0;
    this.progressGauge.update = function() {
      if (that.progress1 == this.beforeValue) {
        this.value++;
      } else {
        this.value = that.progress1;
      }
      this.beforeValue = this.value;
    };
  },

  update: function() {
    if (this.unlock && this.loadcomplete1) {
      this.unlock = false;
      this.sprite.tweener.clear()
        .to({alpha:0}, 500, 'easeOutCubic')
        .call(function() {
          this.exit();
        }, this);
      this.progressGauge.tweener.clear().to({alpha:0}, 10, 'easeOutCubic')
    }
  },

  _static: {
    logo: "assets/images/phinajs_logo.png",
  },
});

/*
 *  titlescene.js
 *  2018/09/20
 *
 */

phina.define("TitleScene", {
  superClass: "DisplayScene",

  init: function() {
    this.superInit({width: SC_W, height: SC_H});
  },

  update: function() {
  },

});

/*
 *  Character.js
 *  2018/09/20
 *  キャラクタ管理用ベースクラス
 *  ゲーム内のキャラクタは全てこのクラスから派生する
 */

phina.define("Character", {
  superClass: "DisplayElement",

  characterType: "object",

  init: function() {
    this.superInit();
  },

});

/*
 *  Player.js
 *  2018/09/20
 */

phina.namespace(function() {
  phina.define("Player", {
    superClass: "Character",
      init: function(parentScene) {
        this.superInit(parentScene, {width: 16, height: 20});
      },
      update: function(app) {
      },
  });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCIwMDBfcGx1Z2lucy9waGluYS5hc3NldGxvYWRlcmV4LmpzIiwiMDAwX3BsdWdpbnMvcGhpbmEuZXh0ZW5zaW9uLmpzIiwiMDAwX3BsdWdpbnMvcGhpbmEudGlsZWRtYXAuanMiLCIwMDBfcGx1Z2lucy9zb3VuZHNldC5qcyIsIjAxMF9hcHBsaWNhdGlvbi9BcHBsaWNhdGlvbi5qcyIsIjAxMF9hcHBsaWNhdGlvbi9Bc3NldExpc3QuanMiLCIwMTBfYXBwbGljYXRpb24vYmVucmkuanMiLCIwMjBfc2NlbmUvTWFpblNjZW5lLmpzIiwiMDIwX3NjZW5lL01haW5TY2VuZUZsb3cuanMiLCIwMjBfc2NlbmUvU3BsYXNoU2NlbmUuanMiLCIwMjBfc2NlbmUvVGl0bGVTY2VuZS5qcyIsIjAzMF9iYXNlL0NoYXJhY3Rlci5qcyIsIjA0MF9wbGF5ZXIvUGxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InBoaW5hX2FwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiAgbWFpbi5qc1xuICogIDIwMTgvMDkvMjBcbiAqL1xuXG5waGluYS5nbG9iYWxpemUoKTtcblxuY29uc3QgU0NfVyA9IDY0MDtcbmNvbnN0IFNDX0ggPSAxMTM2O1xuXG5sZXQgYXBwO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIGFwcCA9IEFwcGxpY2F0aW9uKCk7XG4gIGFwcC5yZXBsYWNlU2NlbmUoTWFpblNjZW5lRmxvdygpKTtcblxuICBhcHAucnVuKCk7XG4vLyAgYXBwLmVuYWJsZVN0YXRzKCk7XG59O1xuIiwiLypcbiAqICBwaGluYS5hc3NldGxvYWRlcmV4LmpzXG4gKiAgMjAxNi8xMS8yNVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmV4dGVuc2lvbiA9IHBoaW5hLmV4dGVuc2lvbiB8fCB7fTtcblxuLy/jg5Djg4Pjgq/jgrDjg6njgqbjg7Pjg4njgafjgqLjgrvjg4Pjg4joqq3jgb/ovrzjgb9cbnBoaW5hLmRlZmluZShcInBoaW5hLmV4dGVuc2lvbi5Bc3NldExvYWRlckV4XCIsIHtcblxuICAvL+mAsuaNl1xuICBsb2FkcHJvZ3Jlc3M6IDAsXG5cbiAgLy/oqq3jgb/ovrzjgb/ntYLkuobjg5Xjg6njgrBcbiAgbG9hZGNvbXBsZXRlOiBmYWxzZSxcblxuICBpbml0OiBmdW5jdGlvbigpIHtcbiAgfSxcblxuICBsb2FkOiBmdW5jdGlvbihhc3NldHMsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fb25Mb2FkQXNzZXRzID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKXt9O1xuICAgIHZhciBsb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgIGxvYWRlci5sb2FkKGFzc2V0cyk7XG4gICAgbG9hZGVyLm9uKCdsb2FkJywgZnVuY3Rpb24oZSkge1xuICAgICAgdGhpcy5sb2FkY29tcGxldGUgPSB0cnVlO1xuICAgICAgdGhpcy5fb25Mb2FkQXNzZXRzKCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICBsb2FkZXIub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMubG9hZHByb2dyZXNzID0gZS5wcm9ncmVzcztcbiAgICB9LmJpbmQodGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG59KTtcbiIsIi8qXG4gKiAgcGhpbmEuZXh0ZW5zaW9uLmpzXG4gKiAgMjAxNi8xMS8yNVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmV4dGVuc2lvbiA9IHBoaW5hLmV4dGVuc2lvbiB8fCB7fTtcblxuLy9zZXRBbHBoYeOCkui/veWKoFxucGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudC5wcm90b3R5cGUuc2V0QWxwaGEgPSBmdW5jdGlvbih2YWwpIHtcbiAgdGhpcy5hbHBoYSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL+OCueODl+ODqeOCpOODiOapn+iDveaLoeW8tVxucGhpbmEuZGlzcGxheS5TcHJpdGUucHJvdG90eXBlLnNldEZyYW1lVHJpbW1pbmcgPSBmdW5jdGlvbih4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHRoaXMuX2ZyYW1lVHJpbVggPSB4IHx8IDA7XG4gIHRoaXMuX2ZyYW1lVHJpbVkgPSB5IHx8IDA7XG4gIHRoaXMuX2ZyYW1lVHJpbVdpZHRoID0gd2lkdGggfHwgdGhpcy5pbWFnZS5kb21FbGVtZW50LndpZHRoIC0gdGhpcy5fZnJhbWVUcmltWDtcbiAgdGhpcy5fZnJhbWVUcmltSGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMuaW1hZ2UuZG9tRWxlbWVudC5oZWlnaHQgLSB0aGlzLl9mcmFtZVRyaW1ZO1xuICByZXR1cm4gdGhpcztcbn1cblxucGhpbmEuZGlzcGxheS5TcHJpdGUucHJvdG90eXBlLnNldEZyYW1lSW5kZXggPSBmdW5jdGlvbihpbmRleCwgd2lkdGgsIGhlaWdodCkge1xuICB2YXIgc3ggPSB0aGlzLl9mcmFtZVRyaW1YIHx8IDA7XG4gIHZhciBzeSA9IHRoaXMuX2ZyYW1lVHJpbVkgfHwgMDtcbiAgdmFyIHN3ID0gdGhpcy5fZnJhbWVUcmltV2lkdGggIHx8ICh0aGlzLmltYWdlLmRvbUVsZW1lbnQud2lkdGgtc3gpO1xuICB2YXIgc2ggPSB0aGlzLl9mcmFtZVRyaW1IZWlnaHQgfHwgKHRoaXMuaW1hZ2UuZG9tRWxlbWVudC5oZWlnaHQtc3kpO1xuXG4gIHZhciB0dyAgPSB3aWR0aCB8fCB0aGlzLndpZHRoOyAgICAvLyB0d1xuICB2YXIgdGggID0gaGVpZ2h0IHx8IHRoaXMuaGVpZ2h0OyAgLy8gdGhcbiAgdmFyIHJvdyA9IH5+KHN3IC8gdHcpO1xuICB2YXIgY29sID0gfn4oc2ggLyB0aCk7XG4gIHZhciBtYXhJbmRleCA9IHJvdypjb2w7XG4gIGluZGV4ID0gaW5kZXglbWF4SW5kZXg7XG5cbiAgdmFyIHggICA9IGluZGV4JXJvdztcbiAgdmFyIHkgICA9IH5+KGluZGV4L3Jvdyk7XG4gIHRoaXMuc3JjUmVjdC54ID0gc3greCp0dztcbiAgdGhpcy5zcmNSZWN0LnkgPSBzeSt5KnRoO1xuICB0aGlzLnNyY1JlY3Qud2lkdGggID0gdHc7XG4gIHRoaXMuc3JjUmVjdC5oZWlnaHQgPSB0aDtcblxuICB0aGlzLl9mcmFtZUluZGV4ID0gaW5kZXg7XG5cbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8v44Ko44Os44Oh44Oz44OI5ZCM5aOr44Gu5o6l6Kem5Yik5a6aXG5waGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50LnByb3RvdHlwZS5pc0hpdEVsZW1lbnQgPSBmdW5jdGlvbihlbG0pIHtcbiAgLy/oh6rliIbjgajjg4bjgrnjg4jlr77osaHjgpLjgrDjg63jg7zjg5Djg6vjgbjlpInmj5tcbiAgdmFyIHAgPSB0aGlzLmdsb2JhbFRvTG9jYWwoZWxtKTtcbiAgdmFyIHRhcmdldCA9IHBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnQoe3dpZHRoOiBlbG0ud2lkdGgsIGhlaWdodDogZWxtLmhlaWdodH0pLnNldFBvc2l0aW9uKHAueCwgcC55KTtcblxuICBpZiAodGhpcy5ib3VuZGluZ1R5cGUgPT0gJ3JlY3QnKSB7XG4gICAgaWYgKGVsbS5ib3VuZGluZ1R5cGUgPT0gJ3JlY3QnKSB7XG4gICAgICByZXR1cm4gcGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdFJlY3RSZWN0KHRoaXMsIHRhcmdldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0UmVjdENpcmNsZSh0aGlzLCB0YXJnZXQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZWxtLmJvdW5kaW5nVHlwZSA9PSAncmVjdCcpIHtcbiAgICAgIHJldHVybiBwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0Q2llY2xlUmVjdCh0aGlzLCB0YXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdENpcmNsZUNpcmNsZSh0aGlzLCB0YXJnZXQpO1xuICAgIH1cbiAgfVxufVxuXG4vL+WtkOimgee0oOWFqOOBpuWIh+OCiumbouOBl1xucGhpbmEuYXBwLkVsZW1lbnQucHJvdG90eXBlLnJlbW92ZUNoaWxkcmVuID0gZnVuY3Rpb24oYmVnaW5JbmRleCkge1xuICBiZWdpbkluZGV4ID0gYmVnaW5JbmRleCB8fCAwO1xuICB2YXIgdGVtcENoaWxkcmVuID0gdGhpcy5jaGlsZHJlbi5zbGljZSgpO1xuICB2YXIgbGVuID0gbGVuID0gdGVtcENoaWxkcmVuLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IGJlZ2luSW5kZXg7IGkgPCBsZW47ICsraSkge1xuICAgIHRlbXBDaGlsZHJlbltpXS5yZW1vdmUoKTtcbiAgfVxuICB0aGlzLmNoaWxkcmVuID0gW107XG59XG5cbi8qKlxuICogQG1ldGhvZCB0ZXN0TGluZUxpbmVcbiAqIEBzdGF0aWNcbiAqIDLjgaTjga7nt5rliIbjgYzph43jgarjgaPjgabjgYTjgovjgYvjganjgYbjgYvjgpLliKTlrprjgZfjgb7jgZlcbiAqIOWPguiAg++8mmh0dHA6Ly93d3c1ZC5iaWdsb2JlLm5lLmpwL350b21veWEwMy9zaHRtbC9hbGdvcml0aG0vSW50ZXJzZWN0aW9uLmh0bVxuICpcbiAqICMjIyBFeGFtcGxlXG4gKiAgIHAxID0gcGhpbmEuZ2VvbS5WZWN0b3IyKDEwMCwgMTAwKTtcbiAqICAgcDIgPSBwaGluYS5nZW9tLlZlY3RvcjIoMjAwLCAyMDApO1xuICogICBwMyA9IHBoaW5hLmdlb20uVmVjdG9yMigxNTAsIDI0MCk7XG4gKiAgIHA0ID0gcGhpbmEuZ2VvbS5WZWN0b3IyKDIwMCwgMTAwKTtcbiAqIHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RMaW5lTGluZShwMSwgcDIsIHAzLCBwNCk7IC8vID0+IHRydWVcbiAqXG4gKiBAcGFyYW0ge3BoaW5hLmdlb20uVmVjdG9yMn0gcDEg57ea5YiGMeOBruerr+OBruW6p+aomVxuICogQHBhcmFtIHtwaGluYS5nZW9tLlZlY3RvcjJ9IHAyIOe3muWIhjHjga7nq6/jga7luqfmqJlcbiAqIEBwYXJhbSB7cGhpbmEuZ2VvbS5WZWN0b3IyfSBwMyDnt5rliIYy44Gu56uv44Gu5bqn5qiZXG4gKiBAcGFyYW0ge3BoaW5hLmdlb20uVmVjdG9yMn0gcDQg57ea5YiGMuOBruerr+OBruW6p+aomVxuICogQHJldHVybiB7Qm9vbGVhbn0g57ea5YiGMeOBqOe3muWIhjLjgYzph43jgarjgaPjgabjgYTjgovjgYvjganjgYbjgYtcbiAqL1xucGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdExpbmVMaW5lID0gZnVuY3Rpb24ocDEsIHAyLCBwMywgcDQpIHtcbiAgLy/lkIzkuIDvvLjvvLnou7jkuIrjgavkuZfjgaPjgabjgovloLTlkIjjga7oqqTliKTlrprlm57pgb9cbiAgaWYgKHAxLnggPT0gcDIueCAmJiBwMS54ID09IHAzLnggJiYgcDEueCA9PSBwNC54KSB7XG4gIHZhciBtaW4gPSBNYXRoLm1pbihwMS55LCBwMi55KTtcbiAgdmFyIG1heCA9IE1hdGgubWF4KHAxLnksIHAyLnkpO1xuICBpZiAobWluIDw9IHAzLnkgJiYgcDMueSA8PSBtYXggfHwgbWluIDw9IHA0LnkgJiYgcDQueSA8PSBtYXgpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHAxLnkgPT0gcDIueSAmJiBwMS55ID09IHAzLnkgJiYgcDEueSA9PSBwNC55KSB7XG4gIHZhciBtaW4gPSBNYXRoLm1pbihwMS54LCBwMi54KTtcbiAgdmFyIG1heCA9IE1hdGgubWF4KHAxLngsIHAyLngpO1xuICBpZiAobWluIDw9IHAzLnggJiYgcDMueCA8PSBtYXggfHwgbWluIDw9IHA0LnggJiYgcDQueCA8PSBtYXgpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGEgPSAocDEueCAtIHAyLngpICogKHAzLnkgLSBwMS55KSArIChwMS55IC0gcDIueSkgKiAocDEueCAtIHAzLngpO1xuICB2YXIgYiA9IChwMS54IC0gcDIueCkgKiAocDQueSAtIHAxLnkpICsgKHAxLnkgLSBwMi55KSAqIChwMS54IC0gcDQueCk7XG4gIHZhciBjID0gKHAzLnggLSBwNC54KSAqIChwMS55IC0gcDMueSkgKyAocDMueSAtIHA0LnkpICogKHAzLnggLSBwMS54KTtcbiAgdmFyIGQgPSAocDMueCAtIHA0LngpICogKHAyLnkgLSBwMy55KSArIChwMy55IC0gcDQueSkgKiAocDMueCAtIHAyLngpO1xuICByZXR1cm4gYSAqIGIgPD0gMCAmJiBjICogZCA8PSAwO1xufVxuXG4vKipcbiAqIEBtZXRob2QgdGVzdFJlY3RMaW5lXG4gKiBAc3RhdGljXG4gKiDnn6nlvaLjgajnt5rliIbjgYzph43jgarjgaPjgabjgYTjgovjgYvjganjgYbjgYvjgpLliKTlrprjgZfjgb7jgZlcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICogICByZWN0ID0gcGhpbmEuZ2VvbS5SZWN0KDEyMCwgMTMwLCA0MCwgNTApO1xuICogICBwMSA9IHBoaW5hLmdlb20uVmVjdG9yMigxMDAsIDEwMCk7XG4gKiAgIHAyID0gcGhpbmEuZ2VvbS5WZWN0b3IyKDIwMCwgMjAwKTtcbiAqIHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RSZWN0TGluZShyZWN0LCBwMSwgcDIpOyAvLyA9PiB0cnVlXG4gKlxuICogQHBhcmFtIHtwaGluYS5nZW9tLlJlY3R9IHJlY3Qg55+p5b2i6aCY5Z+f44Kq44OW44K444Kn44Kv44OIXG4gKiBAcGFyYW0ge3BoaW5hLmdlb20uVmVjdG9yMn0gcDEg57ea5YiG44Gu56uv44Gu5bqn5qiZXG4gKiBAcGFyYW0ge3BoaW5hLmdlb20uVmVjdG9yMn0gcDIg57ea5YiG44Gu56uv44Gu5bqn5qiZXG4gKiBAcmV0dXJuIHtCb29sZWFufSDnn6nlvaLjgajnt5rliIbjgYzph43jgarjgaPjgabjgYTjgovjgYvjganjgYbjgYtcbiAqL1xucGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdFJlY3RMaW5lID0gZnVuY3Rpb24ocmVjdCwgcDEsIHAyKSB7XG4gIC8v5YyF5ZCr5Yik5a6aKHAx44GM5ZCr44G+44KM44Gm44KM44Gw6Imv44GE44Gu44GncDLjga7liKTlrprjga/jgZfjgarjgYTvvIlcbiAgaWYgKHJlY3QubGVmdCA8PSBwMS54ICYmIHAxLnggPD0gcmVjdC5yaWdodCAmJiByZWN0LnRvcCA8PSBwMS55ICYmIHAxLnkgPD0gcmVjdC5ib3R0b20gKSByZXR1cm4gdHJ1ZTtcblxuICAvL+efqeW9ouOBru+8lOeCuVxuICB2YXIgcjEgPSBwaGluYS5nZW9tLlZlY3RvcjIocmVjdC5sZWZ0LCByZWN0LnRvcCk7ICAgLy/lt6bkuIpcbiAgdmFyIHIyID0gcGhpbmEuZ2VvbS5WZWN0b3IyKHJlY3QucmlnaHQsIHJlY3QudG9wKTsgIC8v5Y+z5LiKXG4gIHZhciByMyA9IHBoaW5hLmdlb20uVmVjdG9yMihyZWN0LnJpZ2h0LCByZWN0LmJvdHRvbSk7IC8v5Y+z5LiLXG4gIHZhciByNCA9IHBoaW5hLmdlb20uVmVjdG9yMihyZWN0LmxlZnQsIHJlY3QuYm90dG9tKTsgIC8v5bem5LiLXG5cbiAgLy/nn6nlvaLjga7vvJTovrrjgpLjgarjgZnnt5rliIbjgajjga7mjqXop6bliKTlrppcbiAgaWYgKHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RMaW5lTGluZShwMSwgcDIsIHIxLCByMikpIHJldHVybiB0cnVlO1xuICBpZiAocGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdExpbmVMaW5lKHAxLCBwMiwgcjIsIHIzKSkgcmV0dXJuIHRydWU7XG4gIGlmIChwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0TGluZUxpbmUocDEsIHAyLCByMywgcjQpKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RMaW5lTGluZShwMSwgcDIsIHIxLCByNCkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG5cblxuLy/lhoblvKfjga7mj4/nlLtcbnBoaW5hLmRlZmluZSgncGhpbmEuZGlzcGxheS5BcmNTaGFwZScsIHtcbiAgc3VwZXJDbGFzczogJ3BoaW5hLmRpc3BsYXkuU2hhcGUnLFxuXG4gIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9ICh7fSkuJHNhZmUob3B0aW9ucywge1xuICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICBmaWxsOiAncmVkJyxcbiAgICBzdHJva2U6ICcjYWFhJyxcbiAgICBzdHJva2VXaWR0aDogNCxcbiAgICByYWRpdXM6IDMyLFxuICAgIHN0YXJ0QW5nbGU6IDAsXG4gICAgZW5kQW5nbGU6IDI3MCxcblxuICAgIGFudGljbG9ja3dpc2U6IGZhbHNlLFxuICB9KTtcbiAgdGhpcy5zdXBlckluaXQob3B0aW9ucyk7XG5cbiAgdGhpcy5yYWRpdXMgPSBvcHRpb25zLnJhZGl1cztcbiAgdGhpcy5zdGFydEFuZ2xlID0gb3B0aW9ucy5zdGFydEFuZ2xlO1xuICB0aGlzLmVuZEFuZ2xlID0gb3B0aW9ucy5lbmRBbmdsZTtcbiAgdGhpcy5hbnRpY2xvY2t3aXNlID0gb3B0aW9ucy5hbnRpY2xvY2t3aXNlO1xuXG4gIHRoaXMuc2V0Qm91bmRpbmdUeXBlKCdjaXJjbGUnKTtcbiAgfSxcblxuICBwcmVyZW5kZXI6IGZ1bmN0aW9uKGNhbnZhcykge1xuICBjYW52YXMuZmlsbFBpZSgwLCAwLCB0aGlzLnJhZGl1cywgdGhpcy5zdGFydEFuZ2xlLCB0aGlzLmVuZEFuZ2xlKTtcbiAgfSxcbn0pO1xuIiwiLypcbiAqICBwaGluYS50aWxlZG1hcC5qc1xuICogIDIwMTYvMDkvMTBcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG4vKipcbiAqIEBjbGFzcyBwaGluYS5hc3NldC5UaWxlZE1hcFxuICogQGV4dGVuZHMgcGhpbmEuYXNzZXQuQXNzZXRcbiAqICMgVGlsZWRNYXBFZGl0b3LjgafkvZzmiJDjgZfjgZ90bXjjg5XjgqHjgqTjg6vjgpLoqq3jgb/ovrzjgb/jgq/jg6njgrlcbiAqL1xucGhpbmEuZGVmaW5lKFwicGhpbmEuYXNzZXQuVGlsZWRNYXBcIiwge1xuICBzdXBlckNsYXNzOiBcInBoaW5hLmFzc2V0LkFzc2V0XCIsXG5cbiAgLyoqXG4gICAqIEBwcm9wZXJ0eSBpbWFnZVxuICAgKiDkvZzmiJDjgZXjgozjgZ/jg57jg4Pjg5fnlLvlg49cbiAgICovXG4gIGltYWdlOiBudWxsLFxuXG4gIC8qKlxuICAgKiBAcHJvcGVydHkgdGlsZXNldHNcbiAgICog44K/44Kk44Or44K744OD44OI5oOF5aCxXG4gICAqL1xuICB0aWxlc2V0czogbnVsbCxcblxuICAvKipcbiAgICogQHByb3BlcnR5IGxheWVyc1xuICAgKiDjg6zjgqTjg6Tjg7zmg4XloLHjgYzmoLzntI3jgZXjgozjgabjgYTjgovphY3liJdcbiAgICovXG4gIGxheWVyczogbnVsbCxcblxuICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN1cGVySW5pdCgpO1xuICB9LFxuXG4gIF9sb2FkOiBmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgLy/jg5HjgrnmipzjgY3lh7rjgZdcbiAgICB0aGlzLnBhdGggPSBcIlwiO1xuICAgIHZhciBsYXN0ID0gdGhpcy5zcmMubGFzdEluZGV4T2YoXCIvXCIpO1xuICAgIGlmIChsYXN0ID4gMCkge1xuICAgICAgdGhpcy5wYXRoID0gdGhpcy5zcmMuc3Vic3RyaW5nKDAsIGxhc3QrMSk7XG4gICAgfVxuXG4gICAgLy/ntYLkuobplqLmlbDkv53lrZhcbiAgICB0aGlzLl9yZXNvbHZlID0gcmVzb2x2ZTtcblxuICAgIC8vIGxvYWRcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHhtbCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhtbC5vcGVuKCdHRVQnLCB0aGlzLnNyYyk7XG4gICAgeG1sLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHhtbC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgIGlmIChbMjAwLCAyMDEsIDBdLmluZGV4T2YoeG1sLnN0YXR1cykgIT09IC0xKSB7XG4gICAgICAgICAgdmFyIGRhdGEgPSB4bWwucmVzcG9uc2VUZXh0O1xuICAgICAgICAgIGRhdGEgPSAobmV3IERPTVBhcnNlcigpKS5wYXJzZUZyb21TdHJpbmcoZGF0YSwgXCJ0ZXh0L3htbFwiKTtcbiAgICAgICAgICBzZWxmLmRhdGFUeXBlID0gXCJ4bWxcIjtcbiAgICAgICAgICBzZWxmLmRhdGEgPSBkYXRhO1xuICAgICAgICAgIHNlbGYuX3BhcnNlKGRhdGEpO1xuLy8gICAgICAgICAgcmVzb2x2ZShzZWxmKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgeG1sLnNlbmQobnVsbCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgZ2V0TWFwRGF0YVxuICAgKiDmjIflrprjgZfjgZ/jg57jg4Pjg5fjg6zjgqTjg6Tjg7zjgpLphY3liJfjgajjgZfjgablj5blvpfjgZfjgb7jgZnjgIJcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGxheWVyTmFtZSDlr77osaHjg6zjgqTjg6Tjg7zlkI1cbiAgICovXG4gIGdldE1hcERhdGE6IGZ1bmN0aW9uKGxheWVyTmFtZSkge1xuICAgIC8v44Os44Kk44Ok44O85qSc57SiXG4gICAgdmFyIGRhdGEgPSBudWxsO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLm5hbWUgPT0gbGF5ZXJOYW1lKSB7XG4gICAgICAgIC8v44Kz44OU44O844KS6L+U44GZXG4gICAgICAgIHJldHVybiB0aGlzLmxheWVyc1tpXS5kYXRhLmNvbmNhdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBnZXRPYmplY3RHcm91cFxuICAgKiDjgqrjg5bjgrjjgqfjgq/jg4jjgrDjg6vjg7zjg5fjgpLlj5blvpfjgZfjgb7jgZlcbiAgICpcbiAgICog44Kw44Or44O844OX5oyH5a6a44GM54Sh44GE5aC05ZCI44CB5YWo44Os44Kk44Ok44O844KS6YWN5YiX44Gr44GX44Gm6L+U44GX44G+44GZ44CCXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBncm91bnBOYW1lIOWvvuixoeOCquODluOCuOOCp+OCr+ODiOOCsOODq+ODvOODl+WQjVxuICAgKi9cbiAgZ2V0T2JqZWN0R3JvdXA6IGZ1bmN0aW9uKGdyb3VwTmFtZSkge1xuICAgIGdyb3VwTmFtZSA9IGdyb3VwTmFtZSB8fCBudWxsO1xuICAgIHZhciBscyA9IFtdO1xuICAgIHZhciBsZW4gPSB0aGlzLmxheWVycy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLnR5cGUgPT0gXCJvYmplY3Rncm91cFwiKSB7XG4gICAgICAgIGlmIChncm91cE5hbWUgPT0gbnVsbCB8fCBncm91cE5hbWUgPT0gdGhpcy5sYXllcnNbaV0ubmFtZSkge1xuICAgICAgICAgIC8v44Os44Kk44Ok44O85oOF5aCx44KS44Kv44Ot44O844Oz44GZ44KLXG4gICAgICAgICAgdmFyIG9iaiA9IHRoaXMuX2Nsb25lT2JqZWN0TGF5ZXIodGhpcy5sYXllcnNbaV0pO1xuICAgICAgICAgIGlmIChncm91cE5hbWUgIT09IG51bGwpIHJldHVybiBvYmo7XG4gICAgICAgIH1cbiAgICAgICAgbHMucHVzaChvYmopO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbHM7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgZ2V0TWFwSW1hZ2VcbiAgICog44Oe44OD44OX44Kk44Oh44O844K444Gu5L2c5oiQXG4gICAqXG4gICAqIOikh+aVsOOBruODnuODg+ODl+ODrOOCpOODpOODvOOCkuaMh+WumuWHuuadpeOBvuOBmeOAglxuICAgKiDmj4/nlLvpoIbluo/jga9UaWxlZE1hcEVkaXRvcuWBtOOBp+OBruaMh+WumumghuOBp+OBr+eEoeOBj+OAgeW8leaVsOOBrumghuW6j+OBqOOBquOCiuOBvuOBme+8iOesrOS4gOW8leaVsOOBjOS4gOeVquS4i+OBqOOBquOCi++8iVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gIOWvvuixoeODrOOCpOODpOODvOWQjVxuICAgKi9cbiAgZ2V0SW1hZ2U6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICB2YXIgbnVtTGF5ZXIgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmxheWVyc1tpXS50eXBlID09IFwibGF5ZXJcIiB8fCB0aGlzLmxheWVyc1tpXS50eXBlID09IFwiaW1hZ2VsYXllclwiKSBudW1MYXllcisrO1xuICAgIH1cbiAgICBpZiAobnVtTGF5ZXIgPT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgZ2VuZXJhdGVkID0gZmFsc2U7XG4gICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aCAqIHRoaXMudGlsZXdpZHRoO1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLmhlaWdodCAqIHRoaXMudGlsZWhlaWdodDtcbiAgICB2YXIgY2FudmFzID0gcGhpbmEuZ3JhcGhpY3MuQ2FudmFzKCkuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBmaW5kID0gYXJncy5pbmRleE9mKHRoaXMubGF5ZXJzW2ldLm5hbWUpO1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09IDAgfHwgZmluZCA+PSAwKSB7XG4gICAgICAgIC8v44Oe44OD44OX44Os44Kk44Ok44O8XG4gICAgICAgIGlmICh0aGlzLmxheWVyc1tpXS50eXBlID09IFwibGF5ZXJcIiAmJiB0aGlzLmxheWVyc1tpXS52aXNpYmxlICE9IFwiMFwiKSB7XG4gICAgICAgICAgdmFyIGxheWVyID0gdGhpcy5sYXllcnNbaV07XG4gICAgICAgICAgdmFyIG1hcGRhdGEgPSBsYXllci5kYXRhO1xuICAgICAgICAgIHZhciB3aWR0aCA9IGxheWVyLndpZHRoO1xuICAgICAgICAgIHZhciBoZWlnaHQgPSBsYXllci5oZWlnaHQ7XG4gICAgICAgICAgdmFyIG9wYWNpdHkgPSBsYXllci5vcGFjaXR5IHx8IDEuMDtcbiAgICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICB2YXIgaW5kZXggPSBtYXBkYXRhW2NvdW50XTtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy/jg57jg4Pjg5fjg4Hjg4Pjg5fjgpLphY3nva5cbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRNYXBDaGlwKGNhbnZhcywgaW5kZXgsIHggKiB0aGlzLnRpbGV3aWR0aCwgeSAqIHRoaXMudGlsZWhlaWdodCwgb3BhY2l0eSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZ2VuZXJhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvL+OCquODluOCuOOCp+OCr+ODiOOCsOODq+ODvOODl1xuICAgICAgICBpZiAodGhpcy5sYXllcnNbaV0udHlwZSA9PSBcIm9iamVjdGdyb3VwXCIgJiYgdGhpcy5sYXllcnNbaV0udmlzaWJsZSAhPSBcIjBcIikge1xuICAgICAgICAgIHZhciBsYXllciA9IHRoaXMubGF5ZXJzW2ldO1xuICAgICAgICAgIHZhciBvcGFjaXR5ID0gbGF5ZXIub3BhY2l0eSB8fCAxLjA7XG4gICAgICAgICAgbGF5ZXIub2JqZWN0cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmIChlLmdpZCkge1xuICAgICAgICAgICAgICB0aGlzLl9zZXRNYXBDaGlwKGNhbnZhcywgZS5naWQsIGUueCwgZS55LCBvcGFjaXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgIGdlbmVyYXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy/jgqTjg6Hjg7zjgrjjg6zjgqTjg6Tjg7xcbiAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLnR5cGUgPT0gXCJpbWFnZWxheWVyXCIgJiYgdGhpcy5sYXllcnNbaV0udmlzaWJsZSAhPSBcIjBcIikge1xuICAgICAgICAgIHZhciBsZW4gPSB0aGlzLmxheWVyc1tpXTtcbiAgICAgICAgICB2YXIgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIHRoaXMubGF5ZXJzW2ldLmltYWdlLnNvdXJjZSk7XG4gICAgICAgICAgY2FudmFzLmNvbnRleHQuZHJhd0ltYWdlKGltYWdlLmRvbUVsZW1lbnQsIHRoaXMubGF5ZXJzW2ldLngsIHRoaXMubGF5ZXJzW2ldLnkpO1xuICAgICAgICAgIGdlbmVyYXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWdlbmVyYXRlZCkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgdGV4dHVyZSA9IHBoaW5hLmFzc2V0LlRleHR1cmUoKTtcbiAgICB0ZXh0dXJlLmRvbUVsZW1lbnQgPSBjYW52YXMuZG9tRWxlbWVudDtcbiAgICByZXR1cm4gdGV4dHVyZTtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfY2xvbmVPYmplY3RMYXllclxuICAgKiDlvJXmlbDjgajjgZfjgabmuKHjgZXjgozjgZ/jgqrjg5bjgrjjgqfjgq/jg4jjg6zjgqTjg6Tjg7zjgpLjgq/jg63jg7zjg7PjgZfjgabov5TjgZfjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfY2xvbmVPYmplY3RMYXllcjogZnVuY3Rpb24oc3JjTGF5ZXIpIHtcbiAgICB2YXIgcmVzdWx0ID0ge30uJHNhZmUoc3JjTGF5ZXIpO1xuICAgIHJlc3VsdC5vYmplY3RzID0gW107XG4gICAgLy/jg6zjgqTjg6Tjg7zlhoXjgqrjg5bjgrjjgqfjgq/jg4jjga7jgrPjg5Tjg7xcbiAgICBzcmNMYXllci5vYmplY3RzLmZvckVhY2goZnVuY3Rpb24ob2JqKXtcbiAgICAgIHZhciByZXNPYmogPSB7XG4gICAgICAgIHByb3BlcnRpZXM6IHt9LiRzYWZlKG9iai5wcm9wZXJ0aWVzKSxcbiAgICAgIH0uJGV4dGVuZChvYmopO1xuICAgICAgaWYgKG9iai5lbGxpcHNlKSByZXNPYmouZWxsaXBzZSA9IG9iai5lbGxpcHNlO1xuICAgICAgaWYgKG9iai5naWQpIHJlc09iai5naWQgPSBvYmouZ2lkO1xuICAgICAgaWYgKG9iai5wb2x5Z29uKSByZXNPYmoucG9seWdvbiA9IG9iai5wb2x5Z29uLmNsb25lKCk7XG4gICAgICBpZiAob2JqLnBvbHlsaW5lKSByZXNPYmoucG9seWxpbmUgPSBvYmoucG9seWxpbmUuY2xvbmUoKTtcbiAgICAgIHJlc3VsdC5vYmplY3RzLnB1c2gocmVzT2JqKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9wYXJzZVxuICAgKiDlj5blvpfjgZfjgZ9UaWxlZE1hcEVkaXTjga7jg4fjg7zjgr/jgpLjg5Hjg7zjgrnjgZfjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcGFyc2U6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvL+OCv+OCpOODq+WxnuaAp+aDheWgseWPluW+l1xuICAgIHZhciBtYXAgPSBkYXRhLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtYXAnKVswXTtcbiAgICB2YXIgYXR0ciA9IHRoaXMuX2F0dHJUb0pTT04obWFwKTtcbiAgICB0aGlzLiRleHRlbmQoYXR0cik7XG4gICAgdGhpcy5wcm9wZXJ0aWVzID0gdGhpcy5fcHJvcGVydGllc1RvSlNPTihtYXApO1xuXG4gICAgLy/jgr/jgqTjg6vjgrvjg4Pjg4jlj5blvpdcbiAgICB0aGlzLnRpbGVzZXRzID0gdGhpcy5fcGFyc2VUaWxlc2V0cyhkYXRhKTtcblxuICAgIC8v44K/44Kk44Or44K744OD44OI5oOF5aCx6KOc5a6MXG4gICAgdmFyIGRlZmF1bHRBdHRyID0ge1xuICAgICAgdGlsZXdpZHRoOiAzMixcbiAgICAgIHRpbGVoZWlnaHQ6IDMyLFxuICAgICAgc3BhY2luZzogMCxcbiAgICAgIG1hcmdpbjogMCxcbiAgICB9O1xuICAgIHRoaXMudGlsZXNldHMuY2hpcHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGlsZXNldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8v44K/44Kk44Or44K744OD44OI5bGe5oCn5oOF5aCx5Y+W5b6XXG4gICAgICB2YXIgYXR0ciA9IHRoaXMuX2F0dHJUb0pTT04oZGF0YS5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGlsZXNldCcpW2ldKTtcbiAgICAgIGF0dHIuJHNhZmUoZGVmYXVsdEF0dHIpO1xuICAgICAgYXR0ci5maXJzdGdpZC0tO1xuICAgICAgdGhpcy50aWxlc2V0c1tpXS4kZXh0ZW5kKGF0dHIpO1xuXG4gICAgICAvL+ODnuODg+ODl+ODgeODg+ODl+ODquOCueODiOS9nOaIkFxuICAgICAgdmFyIHQgPSB0aGlzLnRpbGVzZXRzW2ldO1xuICAgICAgdGhpcy50aWxlc2V0c1tpXS5tYXBDaGlwID0gW107XG4gICAgICBmb3IgKHZhciByID0gYXR0ci5maXJzdGdpZDsgciA8IGF0dHIuZmlyc3RnaWQrYXR0ci50aWxlY291bnQ7IHIrKykge1xuICAgICAgICB2YXIgY2hpcCA9IHtcbiAgICAgICAgICBpbWFnZTogdC5pbWFnZSxcbiAgICAgICAgICB4OiAoKHIgLSBhdHRyLmZpcnN0Z2lkKSAlIHQuY29sdW1ucykgKiAodC50aWxld2lkdGggKyB0LnNwYWNpbmcpICsgdC5tYXJnaW4sXG4gICAgICAgICAgeTogTWF0aC5mbG9vcigociAtIGF0dHIuZmlyc3RnaWQpIC8gdC5jb2x1bW5zKSAqICh0LnRpbGVoZWlnaHQgKyB0LnNwYWNpbmcpICsgdC5tYXJnaW4sXG4gICAgICAgIH0uJHNhZmUoYXR0cik7XG4gICAgICAgIHRoaXMudGlsZXNldHMuY2hpcHNbcl0gPSBjaGlwO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8v44Os44Kk44Ok44O85Y+W5b6XXG4gICAgdGhpcy5sYXllcnMgPSB0aGlzLl9wYXJzZUxheWVycyhkYXRhKTtcblxuICAgIC8v44Kk44Oh44O844K444OH44O844K/6Kqt44G/6L6844G/XG4gICAgdGhpcy5fY2hlY2tJbWFnZSgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9jaGVja0ltYWdlXG4gICAqIOOCouOCu+ODg+ODiOOBq+eEoeOBhOOCpOODoeODvOOCuOODh+ODvOOCv+OCkuODgeOCp+ODg+OCr+OBl+OBpuiqreOBv+i+vOOBv+OCkuihjOOBhOOBvuOBmeOAglxuICAgKlxuICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jaGVja0ltYWdlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGltYWdlU291cmNlID0gW107XG4gICAgdmFyIGxvYWRJbWFnZSA9IFtdO1xuXG4gICAgLy/kuIDopqfkvZzmiJBcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGlsZXNldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBvYmogPSB7XG4gICAgICAgIGltYWdlOiB0aGlzLnRpbGVzZXRzW2ldLmltYWdlLFxuICAgICAgICB0cmFuc1I6IHRoaXMudGlsZXNldHNbaV0udHJhbnNSLFxuICAgICAgICB0cmFuc0c6IHRoaXMudGlsZXNldHNbaV0udHJhbnNHLFxuICAgICAgICB0cmFuc0I6IHRoaXMudGlsZXNldHNbaV0udHJhbnNCLFxuICAgICAgfTtcbiAgICAgIGltYWdlU291cmNlLnB1c2gob2JqKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLmltYWdlKSB7XG4gICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgaW1hZ2U6IHRoaXMubGF5ZXJzW2ldLmltYWdlLnNvdXJjZVxuICAgICAgICB9O1xuICAgICAgICBpbWFnZVNvdXJjZS5wdXNoKG9iaik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy/jgqLjgrvjg4Pjg4jjgavjgYLjgovjgYvnorroqo1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlU291cmNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIGltYWdlU291cmNlW2ldLmltYWdlKTtcbiAgICAgIGlmIChpbWFnZSkge1xuICAgICAgICAvL+OCouOCu+ODg+ODiOOBq+OBguOCi1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgarjgYvjgaPjgZ/jga7jgafjg63jg7zjg4njg6rjgrnjg4jjgavov73liqBcbiAgICAgICAgbG9hZEltYWdlLnB1c2goaW1hZ2VTb3VyY2VbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8v5LiA5ous44Ot44O844OJXG4gICAgLy/jg63jg7zjg4njg6rjgrnjg4jkvZzmiJBcbiAgICB2YXIgYXNzZXRzID0ge1xuICAgICAgaW1hZ2U6IFtdXG4gICAgfTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvYWRJbWFnZS5sZW5ndGg7IGkrKykge1xuICAgICAgLy/jgqTjg6Hjg7zjgrjjga7jg5HjgrnjgpLjg57jg4Pjg5fjgajlkIzjgZjjgavjgZnjgotcbiAgICAgIGFzc2V0cy5pbWFnZVtsb2FkSW1hZ2VbaV0uaW1hZ2VdID0gdGhpcy5wYXRoK2xvYWRJbWFnZVtpXS5pbWFnZTtcbiAgICB9XG4gICAgaWYgKGxvYWRJbWFnZS5sZW5ndGgpIHtcbiAgICAgIHZhciBsb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgICAgbG9hZGVyLmxvYWQoYXNzZXRzKTtcbiAgICAgIGxvYWRlci5vbignbG9hZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgLy/pgI/pgY7oibLoqK3lrprlj43mmKBcbiAgICAgICAgbG9hZEltYWdlLmZvckVhY2goZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgICAgdmFyIGltYWdlID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgnaW1hZ2UnLCBlbG0uaW1hZ2UpO1xuICAgICAgICAgIGlmIChlbG0udHJhbnNSICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciByID0gZWxtLnRyYW5zUiwgZyA9IGVsbS50cmFuc0csIGIgPSBlbG0udHJhbnNCO1xuICAgICAgICAgICAgaW1hZ2UuZmlsdGVyKGZ1bmN0aW9uKHBpeGVsLCBpbmRleCwgeCwgeSwgYml0bWFwKSB7XG4gICAgICAgICAgICAgIHZhciBkYXRhID0gYml0bWFwLmRhdGE7XG4gICAgICAgICAgICAgIGlmIChwaXhlbFswXSA9PSByICYmIHBpeGVsWzFdID09IGcgJiYgcGl4ZWxbMl0gPT0gYikge1xuICAgICAgICAgICAgICAgIGRhdGFbaW5kZXgrM10gPSAwO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL+iqreOBv+i+vOOBv+e1guS6hlxuICAgICAgICB0aGF0Ll9yZXNvbHZlKHRoYXQpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy/oqq3jgb/ovrzjgb/ntYLkuoZcbiAgICAgIHRoaXMuX3Jlc29sdmUodGhhdCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9zZXRNYXBDaGlwXG4gICAqIOOCreODo+ODs+ODkOOCueOBruaMh+WumuOBl+OBn+W6p+aomeOBq+ODnuODg+ODl+ODgeODg+ODl+OBruOCpOODoeODvOOCuOOCkuOCs+ODlOODvOOBl+OBvuOBmeOAglxuICAgKlxuICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRNYXBDaGlwOiBmdW5jdGlvbihjYW52YXMsIGluZGV4LCB4LCB5LCBvcGFjaXR5KSB7XG4gICAgLy/jgr/jgqTjg6vjgrvjg4Pjg4jjgYvjgonjg57jg4Pjg5fjg4Hjg4Pjg5fjgpLlj5blvpdcbiAgICB2YXIgY2hpcCA9IHRoaXMudGlsZXNldHMuY2hpcHNbaW5kZXhdO1xuICAgIGlmICghY2hpcCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIGNoaXAuaW1hZ2UpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKGNoaXAuaW1hZ2UpO1xuICAgIH1cbiAgICBjYW52YXMuY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgICBpbWFnZS5kb21FbGVtZW50LFxuICAgICAgY2hpcC54ICsgY2hpcC5tYXJnaW4sIGNoaXAueSArIGNoaXAubWFyZ2luLFxuICAgICAgY2hpcC50aWxld2lkdGgsIGNoaXAudGlsZWhlaWdodCxcbiAgICAgIHgsIHksXG4gICAgICBjaGlwLnRpbGV3aWR0aCwgY2hpcC50aWxlaGVpZ2h0KTtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfcHJvcGVydGllc1RvSlNPTlxuICAgKiBYTUzjg5fjg63jg5Hjg4bjgqPjgpJKU09O44Gr5aSJ5o+b44GX44G+44GZ44CCXG4gICAqXG4gICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3Byb3BlcnRpZXNUb0pTT046IGZ1bmN0aW9uKGVsbSkge1xuICAgIHZhciBwcm9wZXJ0aWVzID0gZWxtLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicHJvcGVydGllc1wiKVswXTtcbiAgICB2YXIgb2JqID0ge307XG4gICAgaWYgKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBwcm9wZXJ0aWVzLmNoaWxkTm9kZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgIHZhciBwID0gcHJvcGVydGllcy5jaGlsZE5vZGVzW2tdO1xuICAgICAgaWYgKHAudGFnTmFtZSA9PT0gXCJwcm9wZXJ0eVwiKSB7XG4gICAgICAgIC8vcHJvcGVydHnjgat0eXBl5oyH5a6a44GM44GC44Gj44Gf44KJ5aSJ5o+bXG4gICAgICAgIHZhciB0eXBlID0gcC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICAgICAgdmFyIHZhbHVlID0gcC5nZXRBdHRyaWJ1dGUoJ3ZhbHVlJyk7XG4gICAgICAgIGlmICghdmFsdWUpIHZhbHVlID0gcC50ZXh0Q29udGVudDtcbiAgICAgICAgaWYgKHR5cGUgPT0gXCJpbnRcIikge1xuICAgICAgICAgIG9ialtwLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImZsb2F0XCIpIHtcbiAgICAgICAgICBvYmpbcC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiYm9vbFwiICkge1xuICAgICAgICAgIGlmICh2YWx1ZSA9PSBcInRydWVcIikgb2JqW3AuZ2V0QXR0cmlidXRlKCduYW1lJyldID0gdHJ1ZTtcbiAgICAgICAgICBlbHNlIG9ialtwLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9ialtwLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX3Byb3BlcnRpZXNUb0pTT05cbiAgICogWE1M5bGe5oCn5oOF5aCx44KSSlNPTuOBq+WkieaPm+OBl+OBvuOBmeOAglxuICAgKlxuICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hdHRyVG9KU09OOiBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICB2YXIgb2JqID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2UuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbCA9IHNvdXJjZS5hdHRyaWJ1dGVzW2ldLnZhbHVlO1xuICAgICAgdmFsID0gaXNOYU4ocGFyc2VGbG9hdCh2YWwpKT8gdmFsOiBwYXJzZUZsb2F0KHZhbCk7XG4gICAgICBvYmpbc291cmNlLmF0dHJpYnV0ZXNbaV0ubmFtZV0gPSB2YWw7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX3Byb3BlcnRpZXNUb0pTT05fc3RyXG4gICAqIFhNTOODl+ODreODkeODhuOCo+OCkkpTT07jgavlpInmj5vjgZfjgIHmloflrZfliJfjgafov5TjgZfjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYXR0clRvSlNPTl9zdHI6IGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgIHZhciBvYmogPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsID0gc291cmNlLmF0dHJpYnV0ZXNbaV0udmFsdWU7XG4gICAgICBvYmpbc291cmNlLmF0dHJpYnV0ZXNbaV0ubmFtZV0gPSB2YWw7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX3BhcnNlVGlsZXNldHNcbiAgICog44K/44Kk44Or44K744OD44OI44Gu44OR44O844K544KS6KGM44GE44G+44GZ44CCXG4gICAqXG4gICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3BhcnNlVGlsZXNldHM6IGZ1bmN0aW9uKHhtbCkge1xuICAgIHZhciBlYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkYXRhID0gW107XG4gICAgdmFyIHRpbGVzZXRzID0geG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0aWxlc2V0Jyk7XG4gICAgZWFjaC5jYWxsKHRpbGVzZXRzLCBmdW5jdGlvbih0aWxlc2V0KSB7XG4gICAgICB2YXIgdCA9IHt9O1xuICAgICAgdmFyIHByb3BzID0gc2VsZi5fcHJvcGVydGllc1RvSlNPTih0aWxlc2V0KTtcbiAgICAgIGlmIChwcm9wcy5zcmMpIHtcbiAgICAgICAgdC5pbWFnZSA9IHByb3BzLnNyYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHQuaW1hZ2UgPSB0aWxlc2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWFnZScpWzBdLmdldEF0dHJpYnV0ZSgnc291cmNlJyk7XG4gICAgICB9XG4gICAgICAvL+mAj+mBjuiJsuioreWumuWPluW+l1xuICAgICAgdC50cmFucyA9IHRpbGVzZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltYWdlJylbMF0uZ2V0QXR0cmlidXRlKCd0cmFucycpO1xuICAgICAgaWYgKHQudHJhbnMpIHtcbiAgICAgICAgdC50cmFuc1IgPSBwYXJzZUludCh0LnRyYW5zLnN1YnN0cmluZygwLCAyKSwgMTYpO1xuICAgICAgICB0LnRyYW5zRyA9IHBhcnNlSW50KHQudHJhbnMuc3Vic3RyaW5nKDIsIDQpLCAxNik7XG4gICAgICAgIHQudHJhbnNCID0gcGFyc2VJbnQodC50cmFucy5zdWJzdHJpbmcoNCwgNiksIDE2KTtcbiAgICAgIH1cblxuICAgICAgZGF0YS5wdXNoKHQpO1xuICAgIH0pO1xuICAgIHJldHVybiBkYXRhO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9wYXJzZUxheWVyc1xuICAgKiDjg6zjgqTjg6Tjg7zmg4XloLHjga7jg5Hjg7zjgrnjgpLooYzjgYTjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcGFyc2VMYXllcnM6IGZ1bmN0aW9uKHhtbCkge1xuICAgIHZhciBlYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG4gICAgdmFyIGRhdGEgPSBbXTtcblxuICAgIHZhciBtYXAgPSB4bWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJtYXBcIilbMF07XG4gICAgdmFyIGxheWVycyA9IFtdO1xuICAgIGVhY2guY2FsbChtYXAuY2hpbGROb2RlcywgZnVuY3Rpb24oZWxtKSB7XG4gICAgICBpZiAoZWxtLnRhZ05hbWUgPT0gXCJsYXllclwiIHx8IGVsbS50YWdOYW1lID09IFwib2JqZWN0Z3JvdXBcIiB8fCBlbG0udGFnTmFtZSA9PSBcImltYWdlbGF5ZXJcIikge1xuICAgICAgICBsYXllcnMucHVzaChlbG0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGF5ZXJzLmVhY2goZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgIHN3aXRjaCAobGF5ZXIudGFnTmFtZSkge1xuICAgICAgICBjYXNlIFwibGF5ZXJcIjpcbiAgICAgICAgICAvL+mAmuW4uOODrOOCpOODpOODvFxuICAgICAgICAgIHZhciBkID0gbGF5ZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2RhdGEnKVswXTtcbiAgICAgICAgICB2YXIgZW5jb2RpbmcgPSBkLmdldEF0dHJpYnV0ZShcImVuY29kaW5nXCIpO1xuICAgICAgICAgIHZhciBsID0ge1xuICAgICAgICAgICAgdHlwZTogXCJsYXllclwiLFxuICAgICAgICAgICAgbmFtZTogbGF5ZXIuZ2V0QXR0cmlidXRlKFwibmFtZVwiKSxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKGVuY29kaW5nID09IFwiY3N2XCIpIHtcbiAgICAgICAgICAgIGwuZGF0YSA9IHRoaXMuX3BhcnNlQ1NWKGQudGV4dENvbnRlbnQpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZW5jb2RpbmcgPT0gXCJiYXNlNjRcIikge1xuICAgICAgICAgICAgbC5kYXRhID0gdGhpcy5fcGFyc2VCYXNlNjQoZC50ZXh0Q29udGVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGF0dHIgPSB0aGlzLl9hdHRyVG9KU09OKGxheWVyKTtcbiAgICAgICAgICBsLiRleHRlbmQoYXR0cik7XG4gICAgICAgICAgbC5wcm9wZXJ0aWVzID0gdGhpcy5fcHJvcGVydGllc1RvSlNPTihsYXllcik7XG5cbiAgICAgICAgICBkYXRhLnB1c2gobCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy/jgqrjg5bjgrjjgqfjgq/jg4jjg6zjgqTjg6Tjg7xcbiAgICAgICAgY2FzZSBcIm9iamVjdGdyb3VwXCI6XG4gICAgICAgICAgdmFyIGwgPSB7XG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdGdyb3VwXCIsXG4gICAgICAgICAgICBvYmplY3RzOiBbXSxcbiAgICAgICAgICAgIG5hbWU6IGxheWVyLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG4gICAgICAgICAgICB4OiBwYXJzZUZsb2F0KGxheWVyLmdldEF0dHJpYnV0ZShcIm9mZnNldHhcIikpIHx8IDAsXG4gICAgICAgICAgICB5OiBwYXJzZUZsb2F0KGxheWVyLmdldEF0dHJpYnV0ZShcIm9mZnNldHlcIikpIHx8IDAsXG4gICAgICAgICAgICBhbHBoYTogbGF5ZXIuZ2V0QXR0cmlidXRlKFwib3BhY2l0eVwiKSB8fCAxLFxuICAgICAgICAgICAgY29sb3I6IGxheWVyLmdldEF0dHJpYnV0ZShcImNvbG9yXCIpIHx8IG51bGwsXG4gICAgICAgICAgICBkcmF3b3JkZXI6IGxheWVyLmdldEF0dHJpYnV0ZShcImRyYXdvcmRlclwiKSB8fCBudWxsLFxuICAgICAgICAgIH07XG4gICAgICAgICAgbC5wcm9wZXJ0aWVzID0gdGhpcy5fcHJvcGVydGllc1RvSlNPTihsYXllcik7XG5cbiAgICAgICAgICAvL+ODrOOCpOODpOODvOWGheino+aekFxuICAgICAgICAgIGVhY2guY2FsbChsYXllci5jaGlsZE5vZGVzLCBmdW5jdGlvbihlbG0pIHtcbiAgICAgICAgICAgIGlmIChlbG0ubm9kZVR5cGUgPT0gMykgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGQgPSB0aGlzLl9hdHRyVG9KU09OKGVsbSk7XG4gICAgICAgICAgICBpZiAoZC5pZCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICBkLnByb3BlcnRpZXMgPSB0aGlzLl9wcm9wZXJ0aWVzVG9KU09OKGVsbSk7XG4gICAgICAgICAgICAvL+WtkOimgee0oOOBruino+aekFxuICAgICAgICAgICAgaWYgKGVsbS5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBlbG0uY2hpbGROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS5ub2RlVHlwZSA9PSAzKSByZXR1cm47XG4gICAgICAgICAgICAgICAgLy/mpZXlhoZcbiAgICAgICAgICAgICAgICBpZiAoZS5ub2RlTmFtZSA9PSAnZWxsaXBzZScpIHtcbiAgICAgICAgICAgICAgICAgIGQuZWxsaXBzZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8v5aSa6KeS5b2iXG4gICAgICAgICAgICAgICAgaWYgKGUubm9kZU5hbWUgPT0gJ3BvbHlnb24nKSB7XG4gICAgICAgICAgICAgICAgICBkLnBvbHlnb24gPSBbXTtcbiAgICAgICAgICAgICAgICAgIHZhciBhdHRyID0gdGhpcy5fYXR0clRvSlNPTl9zdHIoZSk7XG4gICAgICAgICAgICAgICAgICB2YXIgcGwgPSBhdHRyLnBvaW50cy5zcGxpdChcIiBcIik7XG4gICAgICAgICAgICAgICAgICBwbC5mb3JFYWNoKGZ1bmN0aW9uKHN0cikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHRzID0gc3RyLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICAgICAgZC5wb2x5Z29uLnB1c2goe3g6IHBhcnNlRmxvYXQocHRzWzBdKSwgeTogcGFyc2VGbG9hdChwdHNbMV0pfSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy/nt5rliIZcbiAgICAgICAgICAgICAgICBpZiAoZS5ub2RlTmFtZSA9PSAncG9seWxpbmUnKSB7XG4gICAgICAgICAgICAgICAgICBkLnBvbHlsaW5lID0gW107XG4gICAgICAgICAgICAgICAgICB2YXIgYXR0ciA9IHRoaXMuX2F0dHJUb0pTT05fc3RyKGUpO1xuICAgICAgICAgICAgICAgICAgdmFyIHBsID0gYXR0ci5wb2ludHMuc3BsaXQoXCIgXCIpO1xuICAgICAgICAgICAgICAgICAgcGwuZm9yRWFjaChmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHB0cyA9IHN0ci5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgIGQucG9seWxpbmUucHVzaCh7eDogcGFyc2VGbG9hdChwdHNbMF0pLCB5OiBwYXJzZUZsb2F0KHB0c1sxXSl9KTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGwub2JqZWN0cy5wdXNoKGQpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICBkYXRhLnB1c2gobCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy/jgqTjg6Hjg7zjgrjjg6zjgqTjg6Tjg7xcbiAgICAgICAgY2FzZSBcImltYWdlbGF5ZXJcIjpcbiAgICAgICAgICB2YXIgbCA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2VsYXllclwiLFxuICAgICAgICAgICAgbmFtZTogbGF5ZXIuZ2V0QXR0cmlidXRlKFwibmFtZVwiKSxcbiAgICAgICAgICAgIHg6IHBhcnNlRmxvYXQobGF5ZXIuZ2V0QXR0cmlidXRlKFwib2Zmc2V0eFwiKSkgfHwgMCxcbiAgICAgICAgICAgIHk6IHBhcnNlRmxvYXQobGF5ZXIuZ2V0QXR0cmlidXRlKFwib2Zmc2V0eVwiKSkgfHwgMCxcbiAgICAgICAgICAgIGFscGhhOiBsYXllci5nZXRBdHRyaWJ1dGUoXCJvcGFjaXR5XCIpIHx8IDEsXG4gICAgICAgICAgICB2aXNpYmxlOiAobGF5ZXIuZ2V0QXR0cmlidXRlKFwidmlzaWJsZVwiKSA9PT0gdW5kZWZpbmVkIHx8IGxheWVyLmdldEF0dHJpYnV0ZShcInZpc2libGVcIikgIT0gMCksXG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgaW1hZ2VFbG0gPSBsYXllci5nZXRFbGVtZW50c0J5VGFnTmFtZShcImltYWdlXCIpWzBdO1xuICAgICAgICAgIGwuaW1hZ2UgPSB7c291cmNlOiBpbWFnZUVsbS5nZXRBdHRyaWJ1dGUoXCJzb3VyY2VcIil9O1xuXG4gICAgICAgICAgZGF0YS5wdXNoKGwpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX3BlcnNlQ1NWXG4gICAqIENTVuOBruODkeODvOOCueOCkuihjOOBhOOBvuOBmeOAglxuICAgKlxuICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wYXJzZUNTVjogZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBkYXRhTGlzdCA9IGRhdGEuc3BsaXQoJywnKTtcbiAgICB2YXIgbGF5ZXIgPSBbXTtcblxuICAgIGRhdGFMaXN0LmVhY2goZnVuY3Rpb24oZWxtLCBpKSB7XG4gICAgICB2YXIgbnVtID0gcGFyc2VJbnQoZWxtLCAxMCkgLSAxO1xuICAgICAgbGF5ZXIucHVzaChudW0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGxheWVyO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9wZXJzZUNTVlxuICAgKiBCQVNFNjTjga7jg5Hjg7zjgrnjgpLooYzjgYTjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIGh0dHA6Ly90aGVrYW5ub24tc2VydmVyLmFwcHNwb3QuY29tL2hlcnBpdHktZGVycGl0eS5hcHBzcG90LmNvbS9wYXN0ZWJpbi5jb20vNzVLa3MwV0hcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wYXJzZUJhc2U2NDogZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBkYXRhTGlzdCA9IGF0b2IoZGF0YS50cmltKCkpO1xuICAgIHZhciByc3QgPSBbXTtcblxuICAgIGRhdGFMaXN0ID0gZGF0YUxpc3Quc3BsaXQoJycpLm1hcChmdW5jdGlvbihlKSB7XG4gICAgICByZXR1cm4gZS5jaGFyQ29kZUF0KDApO1xuICAgIH0pO1xuXG4gICAgZm9yICh2YXIgaT0wLGxlbj1kYXRhTGlzdC5sZW5ndGgvNDsgaTxsZW47ICsraSkge1xuICAgICAgdmFyIG4gPSBkYXRhTGlzdFtpKjRdO1xuICAgICAgcnN0W2ldID0gcGFyc2VJbnQobiwgMTApIC0gMTtcbiAgICB9XG5cbiAgICByZXR1cm4gcnN0O1xuICB9LFxufSk7XG5cbi8v44Ot44O844OA44O844Gr6L+95YqgXG5waGluYS5hc3NldC5Bc3NldExvYWRlci5hc3NldExvYWRGdW5jdGlvbnMudG14ID0gZnVuY3Rpb24oa2V5LCBwYXRoKSB7XG4gIHZhciB0bXggPSBwaGluYS5hc3NldC5UaWxlZE1hcCgpO1xuICByZXR1cm4gdG14LmxvYWQocGF0aCk7XG59O1xuIiwiLypcbiAqICBTb3VuZFNldC5qc1xuICogIDIwMTQvMTEvMjhcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG5waGluYS5leHRlbnNpb24gPSBwaGluYS5leHRlbnNpb24gfHwge307XG5cbi8v44K144Km44Oz44OJ566h55CGXG5waGluYS5kZWZpbmUoXCJwaGluYS5leHRlbnNpb24uU291bmRTZXRcIiwge1xuXG4gIC8v44K144Km44Oz44OJ44GM5qC857SN44GV44KM44KL6YWN5YiXXG4gIGVsZW1lbnRzOiBudWxsLFxuXG4gIC8v5YaN55Sf5Lit77yi77yn77ytXG4gIGJnbTogbnVsbCxcbiAgYmdtSXNQbGF5OiBmYWxzZSxcblxuICAvL+ODnuOCueOCv+ODvOODnOODquODpeODvOODoFxuICB2b2x1bWVCR006IDAuNSxcbiAgdm9sdW1lU0U6IDAuNSxcblxuICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsZW1lbnRzID0gW107XG4gIH0sXG5cbiAgLy/nmbvpjLLmuIjjgb/jgqLjgrvjg4Pjg4joqq3jgb/ovrzjgb9cbiAgcmVhZEFzc2V0OiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmFzc2V0cy5zb3VuZCkge1xuICAgICAgdmFyIG9iaiA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoXCJzb3VuZFwiLCBrZXkpO1xuICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIHBoaW5hLmFzc2V0LlNvdW5kKSB0aGlzLmFkZChrZXkpO1xuICAgIH1cbiAgfSxcblxuICAvL+OCteOCpuODs+ODiei/veWKoFxuICBhZGQ6IGZ1bmN0aW9uKG5hbWUsIHVybCkge1xuICAgIGlmIChuYW1lID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xuICAgIHVybCA9IHVybCB8fCBudWxsO1xuICAgIGlmICh0aGlzLmZpbmQobmFtZSkpIHJldHVybiB0cnVlO1xuXG4gICAgdmFyIGUgPSBwaGluYS5leHRlbnNpb24uU291bmRFbGVtZW50KG5hbWUpO1xuICAgIGlmICghZS5tZWRpYSkgcmV0dXJuIGZhbHNlO1xuICAgIHRoaXMuZWxlbWVudHMucHVzaChlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvL+OCteOCpuODs+ODieaknOe0olxuICBmaW5kOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgaWYgKCF0aGlzLmVsZW1lbnRzKSByZXR1cm4gbnVsbDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmVsZW1lbnRzW2ldLm5hbWUgPT0gbmFtZSkgcmV0dXJuIHRoaXMuZWxlbWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIC8v44K144Km44Oz44OJ44KS77yi77yn77yt44Go44GX44Gm5YaN55SfXG4gIHBsYXlCR006IGZ1bmN0aW9uKG5hbWUsIGxvb3AsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGxvb3AgPT09IHVuZGVmaW5lZCkgbG9vcCA9IHRydWU7XG4gICAgaWYgKHRoaXMuYmdtKSB7XG4gICAgICB0aGlzLmJnbS5zdG9wKCk7XG4gICAgICB0aGlzLmJnbUlzUGxheSA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgZWxlbWVudCA9IHRoaXMuZmluZChuYW1lKTtcbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgdmFyIHZvbCA9IHRoaXMudm9sdW1lQkdNICogZWxlbWVudC5fdm9sdW1lO1xuICAgICAgZWxlbWVudC5tZWRpYS52b2x1bWUgPSB2b2w7XG4gICAgICBlbGVtZW50LnBsYXkobG9vcCwgY2FsbGJhY2spO1xuICAgICAgdGhpcy5iZ20gPSBlbGVtZW50O1xuICAgICAgdGhpcy5iZ21Jc1BsYXkgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5hZGQobmFtZSkpIHRoaXMucGxheUJHTShuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLy/vvKLvvKfvvK3lgZzmraJcbiAgc3RvcEJHTTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuYmdtKSB7XG4gICAgICBpZiAodGhpcy5iZ21Jc1BsYXkpIHtcbiAgICAgICAgdGhpcy5iZ20uc3RvcCgpO1xuICAgICAgICB0aGlzLmJnbUlzUGxheSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgdGhpcy5iZ20gPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvL++8ou+8p++8reS4gOaZguWBnOatolxuICBwYXVzZUJHTTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuYmdtKSB7XG4gICAgICBpZiAodGhpcy5iZ21Jc1BsYXkpIHtcbiAgICAgICAgdGhpcy5iZ20ucGF1c2UoKTtcbiAgICAgICAgdGhpcy5iZ21Jc1BsYXkgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLy/vvKLvvKfvvK3lho3plotcbiAgcmVzdW1lQkdNOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5iZ20pIHtcbiAgICAgIGlmICghdGhpcy5iZ21Jc1BsYXkpIHtcbiAgICAgICAgdGhpcy5iZ20udm9sdW1lID0gdGhpcy52b2x1bWVCR007XG4gICAgICAgIHRoaXMuYmdtLnJlc3VtZSgpO1xuICAgICAgICB0aGlzLmJnbUlzUGxheSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIC8v77yi77yn77yt44Oe44K544K/44O844Oc44Oq44Ol44O844Og6Kit5a6aXG4gIHNldFZvbHVtZUJHTTogZnVuY3Rpb24odm9sKSB7XG4gICAgdGhpcy52b2x1bWVCR00gPSB2b2w7XG4gICAgaWYgKHRoaXMuYmdtKSB7XG4gICAgICB0aGlzLmJnbS5wYXVzZSgpO1xuICAgICAgdGhpcy5iZ20uc2V0Vm9sdW1lKHRoaXMudm9sdW1lQkdNICogdGhpcy5iZ20uX3ZvbHVtZSk7XG4gICAgICB0aGlzLmJnbS5yZXN1bWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLy/jgqLjgrvjg4Pjg4jjgpLmjIflrprjgZfjgabjg5zjg6rjg6Xjg7zjg6DjgpLoqK3lrppcbiAgc2V0Vm9sdW1lOiBmdW5jdGlvbihuYW1lLCB2b2wpIHtcbiAgICB2YXIgbWVkaWEgPSB0aGlzLmZpbmQobmFtZSk7XG4gICAgaWYgKG1lZGlhKSB7XG4gICAgICBtZWRpYS5zZXRWb2x1bWUodm9sKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLy/jgrXjgqbjg7Pjg4njgpLjgrXjgqbjg7Pjg4njgqjjg5Xjgqfjgq/jg4jjgajjgZfjgablho3nlJ9cbiAgcGxheVNFOiBmdW5jdGlvbihuYW1lLCBsb29wLCBjYWxsYmFjaykge1xuICAgIHZhciBlbGVtZW50ID0gdGhpcy5maW5kKG5hbWUpO1xuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICB2YXIgdm9sID0gdGhpcy52b2x1bWVTRSAqIGVsZW1lbnQuX3ZvbHVtZTtcbiAgICAgIGVsZW1lbnQubWVkaWEudm9sdW1lID0gdm9sO1xuICAgICAgZWxlbWVudC5wbGF5KGxvb3AsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuYWRkKG5hbWUpKSB0aGlzLnBsYXlTRShuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLy/jg6vjg7zjg5flho3nlJ/jgZfjgabjgYTjgotTReOCkuWBnOatolxuICBzdG9wU0U6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWVkaWEgPSB0aGlzLmZpbmQobmFtZSk7XG4gICAgaWYgKG1lZGlhKSB7XG4gICAgICBtZWRpYS5zdG9wKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIC8v77yi77yn77yt5LiA5pmC5YGc5q2iXG4gIHBhdXNlQkdNOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5iZ20pIHtcbiAgICAgIGlmICh0aGlzLmJnbUlzUGxheSkge1xuICAgICAgICB0aGlzLmJnbS5wYXVzZSgpO1xuICAgICAgICB0aGlzLmJnbUlzUGxheSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvL++8s++8peODnuOCueOCv+ODvOODnOODquODpeODvOODoOioreWumlxuICBzZXRWb2x1bWVTRTogZnVuY3Rpb24odm9sKSB7XG4gICAgdGhpcy52b2x1bWVTRSA9IHZvbDtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbn0pO1xuXG4vL1NvdW5kRWxlbWVudCBCYXNpY1xucGhpbmEuZGVmaW5lKFwicGhpbmEuZXh0ZW5zaW9uLlNvdW5kRWxlbWVudFwiLCB7XG4gIC8v44K144Km44Oz44OJ5ZCNXG4gIG5hbWU6IG51bGwsXG5cbiAgLy/vvLXvvLLvvKxcbiAgdXJsOiBudWxsLFxuXG4gIC8v44K144Km44Oz44OJ5pys5L2TXG4gIG1lZGlhOiBudWxsLFxuXG4gIC8v44Oc44Oq44Ol44O844OgXG4gIF92b2x1bWU6IDEsXG5cbiAgLy/lho3nlJ/ntYLkuobmmYLjga7jgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbBcbiAgY2FsbGJhY2s6IG51bGwsXG5cbiAgLy/lho3nlJ/kuK3jg5Xjg6njgrBcbiAgcGxheWluZzogZmFsc2UsXG5cbiAgaW5pdDogZnVuY3Rpb24obmFtZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5tZWRpYSA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoXCJzb3VuZFwiLCBuYW1lKTtcbiAgICBpZiAodGhpcy5tZWRpYSkge1xuICAgICAgdGhpcy5tZWRpYS52b2x1bWUgPSAxO1xuICAgICAgdGhpcy5tZWRpYS5vbignZW5kZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMubWVkaWEubG9vcCkgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmNhbGxiYWNrKSB0aGlzLmNhbGxiYWNrKCk7XG4gICAgICB9LmJpbmQodGhpcykpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihcImFzc2V0IG5vdCBmb3VuZC4gXCIrbmFtZSk7XG4gICAgfVxuICB9LFxuXG4gIC8v44K144Km44Oz44OJ44Gu5YaN55SfXG4gIHBsYXk6IGZ1bmN0aW9uKGxvb3AsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGxvb3AgPT09IHVuZGVmaW5lZCkgbG9vcCA9IGZhbHNlXG4gICAgaWYgKCF0aGlzLm1lZGlhKSByZXR1cm4gdGhpcztcblxuICAgIC8v44Or44O844OX5YaN55Sf44Gu5aC05ZCI5aSa6YeN5YaN55Sf44KS56aB5q2iXG4gICAgaWYgKGxvb3AgJiYgdGhpcy5wbGF5aW5nKSByZXR1cm47XG5cbiAgICB0aGlzLm1lZGlhLmxvb3AgPSBsb29wO1xuICAgIHRoaXMubWVkaWEucGxheSgpO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIC8v44K144Km44Oz44OJ5YaN55Sf5YaN6ZaLXG4gIHJlc3VtZTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLm1lZGlhKSByZXR1cm4gdGhpcztcbiAgICB0aGlzLm1lZGlhLnJlc3VtZSgpO1xuICAgIHRoaXMucGxheWluZyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLy/jgrXjgqbjg7Pjg4nkuIDmmYLlgZzmraJcbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMubWVkaWEpIHJldHVybiB0aGlzO1xuICAgIHRoaXMubWVkaWEucGF1c2UoKTtcbiAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgfSxcblxuICAvL+OCteOCpuODs+ODieWBnOatolxuICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMubWVkaWEpIHJldHVybiB0aGlzO1xuICAgIHRoaXMubWVkaWEuc3RvcCgpO1xuICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIC8v44Oc44Oq44Ol44O844Og6Kit5a6aXG4gIHNldFZvbHVtZTogZnVuY3Rpb24odm9sKSB7XG4gICAgaWYgKCF0aGlzLm1lZGlhKSByZXR1cm4gdGhpcztcbiAgICBpZiAodm9sID09PSB1bmRlZmluZWQpIHZvbCA9IDAuNTtcbiAgICB0aGlzLl92b2x1bWUgPSB2b2w7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgX2FjY2Vzc29yOiB7XG4gICAgdm9sdW1lOiB7XG4gICAgICBcImdldFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3ZvbHVtZTsgfSxcbiAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKHZvbCkgeyB0aGlzLnNldFZvbHVtZSh2b2wpOyB9XG4gICAgfSxcbiAgICBsb29wOiB7XG4gICAgICBcImdldFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMubWVkaWEubG9vcDsgfSxcbiAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKGYpIHsgdGhpcy5tZWRpYS5sb29wID0gZjsgfVxuICAgIH0sXG4gIH1cbn0pO1xuIiwicGhpbmEuZGVmaW5lKFwiQXBwbGljYXRpb25cIiwge1xuICBzdXBlckNsYXNzOiBcIkNhbnZhc0FwcFwiLFxuXG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3VwZXJJbml0KHtcbiAgICAgIHF1ZXJ5OiAnI3dvcmxkJyxcbiAgICAgIHdpZHRoOiBTQ19XLFxuICAgICAgaGVpZ2h0OiBTQ19ILFxuICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgwLCAwLCAwLCAxKScsXG4gICAgfSk7XG4gICAgdGhpcy5mcHMgPSAzMDtcbiAgfSxcblxuICBfb25Mb2FkQXNzZXRzOiBmdW5jdGlvbigpIHtcbiAgfSxcbn0pO1xuIiwiLypcbiAqICBBc3NldExpc3QuanNcbiAqICAyMDE4LzA5LzIwXG4gKiBcbiAqL1xuXG5waGluYS5kZWZpbmUoXCJBc3NldExpc3RcIiwge1xuICBfc3RhdGljOiB7XG4gICAgbG9hZGVkOiBbXSxcbiAgICBpc0xvYWRlZDogZnVuY3Rpb24oYXNzZXRUeXBlKSB7XG4gICAgICByZXR1cm4gQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdPyB0cnVlOiBmYWxzZTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgQXNzZXRMaXN0LmxvYWRlZFtvcHRpb25zLmFzc2V0VHlwZV0gPSB0cnVlO1xuICAgICAgc3dpdGNoIChvcHRpb25zLmFzc2V0VHlwZSkge1xuICAgICAgICBjYXNlIFwic3BsYXNoXCI6XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgIFwiYWN0b3I0XCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3I0LnBuZ1wiLFxuICAgICAgICAgICAgICBcImFjdG9yMTlcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjE5LnBuZ1wiLFxuICAgICAgICAgICAgICBcImFjdG9yNDBcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjQwLnBuZ1wiLFxuICAgICAgICAgICAgICBcImFjdG9yNTVcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjU1LnBuZ1wiLFxuICAgICAgICAgICAgICBcImFjdG9yNjRcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjY0X2EucG5nXCIsXG4gICAgICAgICAgICAgIFwiYWN0b3I2NDJcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjY0X2IucG5nXCIsXG4gICAgICAgICAgICAgIFwiYWN0b3IxMDhcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjEwOC5wbmdcIixcbiAgICAgICAgICAgICAgXCJhY3RvcjExMVwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yMTExLnBuZ1wiLFxuICAgICAgICAgICAgICBcImFjdG9yMTEyXCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3IxMTIucG5nXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgXCJjb21tb25cIjpcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgXCJhY3RvcjRcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjQucG5nXCIsXG4gICAgICAgICAgICAgIFwiYWN0b3IxOVwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yMTkucG5nXCIsXG4gICAgICAgICAgICAgIFwiYWN0b3I0MFwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNDAucG5nXCIsXG4gICAgICAgICAgICAgIFwiYWN0b3I1NVwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNTUucG5nXCIsXG4gICAgICAgICAgICAgIFwiYWN0b3I2NFwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNjRfYS5wbmdcIixcbiAgICAgICAgICAgICAgXCJhY3RvcjY0MlwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNjRfYi5wbmdcIixcbiAgICAgICAgICAgICAgXCJhY3RvcjEwOFwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yMTA4LnBuZ1wiLFxuICAgICAgICAgICAgICBcImFjdG9yMTExXCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3IxMTEucG5nXCIsXG4gICAgICAgICAgICAgIFwiYWN0b3IxMTJcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjExMi5wbmdcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBcImludmFsaWQgYXNzZXRUeXBlOiBcIiArIG9wdGlvbnMuYXNzZXRUeXBlO1xuICAgICAgfVxuICAgIH0sXG4gIH0sXG59KTtcblxuIiwiLypcbiAqICBCZW5yaS5qc1xuICogIDIwMTQvMTIvMThcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG4gXG52YXIgdG9SYWQgPSAzLjE0MTU5LzE4MDsgIC8v5byn5bqm5rOVdG/jg6njgrjjgqLjg7PlpInmj5tcbnZhciB0b0RlZyA9IDE4MC8zLjE0MTU5OyAgLy/jg6njgrjjgqLjg7N0b+W8p+W6puazleWkieaPm1xuXG4vL+i3nembouioiOeul1xudmFyIGRpc3RhbmNlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgdmFyIHggPSBmcm9tLngtdG8ueDtcbiAgdmFyIHkgPSBmcm9tLnktdG8ueTtcbiAgcmV0dXJuIE1hdGguc3FydCh4KngreSp5KTtcbn1cblxuLy/ot53pm6LoqIjnrpfvvIjjg6vjg7zjg4jnhKHjgZfniYjvvIlcbnZhciBkaXN0YW5jZVNxID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgdmFyIHggPSBmcm9tLnggLSB0by54O1xuICB2YXIgeSA9IGZyb20ueSAtIHRvLnk7XG4gIHJldHVybiB4KngreSp5O1xufVxuXG4vL+aVsOWApOOBruWItumZkFxudmFyIGNsYW1wID0gZnVuY3Rpb24oeCwgbWluLCBtYXgpIHtcbiAgcmV0dXJuICh4PG1pbik/bWluOigoeD5tYXgpP21heDp4KTtcbn07XG5cbi8v5Lmx5pWw55Sf5oiQXG52YXIgcHJhbmQgPSBwaGluYS51dGlsLlJhbmRvbSgpO1xudmFyIHJhbmQgPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICByZXR1cm4gcHJhbmQucmFuZGludChtaW4sIG1heCk7XG59XG5cbi8v44K/44Kk44OI44Or54Sh44GX44OA44Kk44Ki44Ot44KwXG52YXIgQWR2YW5jZUFsZXJ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHZhciB0bXBGcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICB0bXBGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdkYXRhOnRleHQvcGxhaW4sJyk7XG4gIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0bXBGcmFtZSk7XG5cbiAgd2luZG93LmZyYW1lc1swXS53aW5kb3cuYWxlcnQoc3RyKTtcbiAgdG1wRnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0bXBGcmFtZSk7XG59O1xudmFyIEFkdmFuY2VDb25maXJtID0gZnVuY3Rpb24oc3RyKSB7XG4gIHZhciB0bXBGcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICB0bXBGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdkYXRhOnRleHQvcGxhaW4sJyk7XG4gIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0bXBGcmFtZSk7XG5cbiAgdmFyIHJlc3VsdCA9IHdpbmRvdy5mcmFtZXNbMF0ud2luZG93LmNvbmZpcm0oc3RyKTtcbiAgdG1wRnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0bXBGcmFtZSk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvKlxuICogIE1haW5TY2VuZS5qc1xuICogIDIwMTgvMDkvMjBcbiAqL1xuXG4gcGhpbmEuZGVmaW5lKFwiTWFpblNjZW5lXCIsIHtcbiAgc3VwZXJDbGFzczogJ0Rpc3BsYXlTY2VuZScsXG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3VwZXJJbml0KHt3aWR0aDogU0NfVywgaGVpZ2h0OiBTQ19IfSk7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgfSxcbn0pO1xuIiwiLypcbiAqICBTY2VuZUZsb3cuanNcbiAqICAyMDE4LzA5LzIwXG4gKlxuICovXG5cbi8v44Oh44Kk44Oz44K344O844Oz44OV44Ot44O8XG5waGluYS5kZWZpbmUoXCJNYWluU2NlbmVGbG93XCIsIHtcbiAgICBzdXBlckNsYXNzOiBcIk1hbmFnZXJTY2VuZVwiLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgc3RhcnRMYWJlbCA9IG9wdGlvbnMuc3RhcnRMYWJlbCB8fCBcInNwbGFzaFwiO1xuICAgICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgICAgICBzdGFydExhYmVsOiBzdGFydExhYmVsLFxuICAgICAgICAgICAgc2NlbmVzOiBbe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInNwbGFzaFwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJTcGxhc2hTY2VuZVwiLFxuICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwibWFpblwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJNYWluU2NlbmVcIixcbiAgICAgICAgICAgICAgICAvLyBuZXh0TGFiZWw6IFwidGl0bGVcIixcbiAgICAgICAgICAgIH1dLFxuICAgICAgICB9KTtcbiAgICB9XG59KTtcbiIsIi8qXG4gKiAgU3BsYXNoU2NlbmUuanNcbiAqICAyMDE4LzA5LzIwXG4gKlxuICovXG5cbnBoaW5hLmRlZmluZSgnU3BsYXNoU2NlbmUnLCB7XG4gIHN1cGVyQ2xhc3M6ICdEaXNwbGF5U2NlbmUnLFxuXG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3VwZXJJbml0KHsgd2lkdGg6IFNDX1csIGhlaWdodDogU0NfSCB9KTtcblxuICAgIHRoaXMudW5sb2NrID0gZmFsc2U7XG4gICAgdGhpcy5sb2FkY29tcGxldGUxID0gZmFsc2U7XG4gICAgdGhpcy5wcm9ncmVzczEgPSAwO1xuXG4gICAgLy9wcmVsb2FkIGFzc2V0XG4gICAgdmFyIGFzc2V0cyA9IEFzc2V0TGlzdC5nZXQoeyBhc3NldFR5cGU6IFwic3BsYXNoXCIgfSk7XG4gICAgdGhpcy5sb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgIHRoaXMubG9hZGVyLmxvYWQoYXNzZXRzKTtcbiAgICB0aGlzLmxvYWRlci5vbignbG9hZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMubG9hZGNvbXBsZXRlMSA9IHRydWU7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmxvYWRlci5vbigncHJvZ3Jlc3MnLCBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnByb2dyZXNzMSA9IE1hdGguZmxvb3IoZS5wcm9ncmVzcyoxMDApO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvL2xvZ29cbiAgICB2YXIgdGV4dHVyZSA9IHBoaW5hLmFzc2V0LlRleHR1cmUoKTtcbiAgICB0ZXh0dXJlLmxvYWQoU3BsYXNoU2NlbmUubG9nbykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmU7XG4gIH0sXG5cbiAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3ByaXRlID0gcGhpbmEuZGlzcGxheS5TcHJpdGUodGhpcy50ZXh0dXJlKVxuICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgIC5zZXRQb3NpdGlvbih0aGlzLmdyaWRYLmNlbnRlcigpLCB0aGlzLmdyaWRZLmNlbnRlcigpKVxuICAgICAgLnNldFNjYWxlKDAuMyk7XG4gICAgdGhpcy5zcHJpdGUuYWxwaGEgPSAwO1xuXG4gICAgdGhpcy5zcHJpdGUudHdlZW5lci5jbGVhcigpXG4gICAgICAudG8oe2FscGhhOjF9LCA1MDAsICdlYXNlT3V0Q3ViaWMnKVxuICAgICAgLndhaXQoNTAwKVxuICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMudW5sb2NrID0gdHJ1ZTtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIC8v6YCy5o2X44Ky44O844K4XG4gICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICB3aWR0aDogIFNDX1cgKiAwLjEsXG4gICAgICBoZWlnaHQ6IDMsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICBmaWxsOiAncmVkJyxcbiAgICAgIHN0cm9rZTogJ3doaXRlJyxcbiAgICAgIHN0cm9rZVdpZHRoOiAxLFxuICAgICAgZ2F1Z2VDb2xvcjogJ2xpbWUnLFxuICAgICAgY29ybmVyUmFkaXVzOiAzLFxuICAgICAgdmFsdWU6IDAsXG4gICAgICBtYXhWYWx1ZTogMTAwLFxuICAgIH07XG4gICAgdGhpcy5wcm9ncmVzc0dhdWdlID0gcGhpbmEudWkuR2F1Z2Uob3B0aW9ucykuYWRkQ2hpbGRUbyh0aGlzKS5zZXRQb3NpdGlvbihTQ19XICogMC41LCBTQ19IICogMC44KTtcbiAgICB0aGlzLnByb2dyZXNzR2F1Z2UuYmVmb3JlVmFsdWUgPSAwO1xuICAgIHRoaXMucHJvZ3Jlc3NHYXVnZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGF0LnByb2dyZXNzMSA9PSB0aGlzLmJlZm9yZVZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWUrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGF0LnByb2dyZXNzMTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYmVmb3JlVmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgIH07XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy51bmxvY2sgJiYgdGhpcy5sb2FkY29tcGxldGUxKSB7XG4gICAgICB0aGlzLnVubG9jayA9IGZhbHNlO1xuICAgICAgdGhpcy5zcHJpdGUudHdlZW5lci5jbGVhcigpXG4gICAgICAgIC50byh7YWxwaGE6MH0sIDUwMCwgJ2Vhc2VPdXRDdWJpYycpXG4gICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoaXMuZXhpdCgpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIHRoaXMucHJvZ3Jlc3NHYXVnZS50d2VlbmVyLmNsZWFyKCkudG8oe2FscGhhOjB9LCAxMCwgJ2Vhc2VPdXRDdWJpYycpXG4gICAgfVxuICB9LFxuXG4gIF9zdGF0aWM6IHtcbiAgICBsb2dvOiBcImFzc2V0cy9pbWFnZXMvcGhpbmFqc19sb2dvLnBuZ1wiLFxuICB9LFxufSk7XG4iLCIvKlxuICogIHRpdGxlc2NlbmUuanNcbiAqICAyMDE4LzA5LzIwXG4gKlxuICovXG5cbnBoaW5hLmRlZmluZShcIlRpdGxlU2NlbmVcIiwge1xuICBzdXBlckNsYXNzOiBcIkRpc3BsYXlTY2VuZVwiLFxuXG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3VwZXJJbml0KHt3aWR0aDogU0NfVywgaGVpZ2h0OiBTQ19IfSk7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgfSxcblxufSk7XG4iLCIvKlxuICogIENoYXJhY3Rlci5qc1xuICogIDIwMTgvMDkvMjBcbiAqICDjgq3jg6Pjg6njgq/jgr/nrqHnkIbnlKjjg5njg7zjgrnjgq/jg6njgrlcbiAqICDjgrLjg7zjg6DlhoXjga7jgq3jg6Pjg6njgq/jgr/jga/lhajjgabjgZPjga7jgq/jg6njgrnjgYvjgonmtL7nlJ/jgZnjgotcbiAqL1xuXG5waGluYS5kZWZpbmUoXCJDaGFyYWN0ZXJcIiwge1xuICBzdXBlckNsYXNzOiBcIkRpc3BsYXlFbGVtZW50XCIsXG5cbiAgY2hhcmFjdGVyVHlwZTogXCJvYmplY3RcIixcblxuICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN1cGVySW5pdCgpO1xuICB9LFxuXG59KTtcbiIsIi8qXG4gKiAgUGxheWVyLmpzXG4gKiAgMjAxOC8wOS8yMFxuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcbiAgcGhpbmEuZGVmaW5lKFwiUGxheWVyXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcIkNoYXJhY3RlclwiLFxuICAgICAgaW5pdDogZnVuY3Rpb24ocGFyZW50U2NlbmUpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQocGFyZW50U2NlbmUsIHt3aWR0aDogMTYsIGhlaWdodDogMjB9KTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uKGFwcCkge1xuICAgICAgfSxcbiAgfSk7XG59KTsiXX0=
