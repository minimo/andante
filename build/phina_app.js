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

phina.namespace(function() {

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

});
/*
 *  AssetList.js
 *  2018/09/20
 * 
 */

phina.namespace(function() {

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

phina.namespace(function() {

  phina.define("MainScene", {
    superClass: 'DisplayScene',
    init: function() {
      this.superInit({width: SC_W, height: SC_H});
    },

    update: function() {
    },
  });

});
/*
 *  SceneFlow.js
 *  2018/09/20
 *
 */

phina.namespace(function() {

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

});
/*
 *  SplashScene.js
 *  2018/09/20
 *
 */

phina.namespace(function() {

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

});
/*
 *  titlescene.js
 *  2018/09/20
 *
 */

phina.namespace(function() {

  phina.define("TitleScene", {
    superClass: "DisplayScene",

    init: function() {
      this.superInit({width: SC_W, height: SC_H});
    },

    update: function() {
    },
  });

});
/*
 *  Character.js
 *  2018/09/20
 *  キャラクタ管理用ベースクラス
 *  ゲーム内のキャラクタは全てこのクラスから派生する
 */

phina.namespace(function() {

  phina.define("Character", {
    superClass: "DisplayElement",

    characterType: null,

    init: function() {
      this.superInit();
    },
  });

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

    update: function() {
    },
  });

});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCIwMDBfcGx1Z2lucy9waGluYS5hc3NldGxvYWRlcmV4LmpzIiwiMDAwX3BsdWdpbnMvcGhpbmEuZXh0ZW5zaW9uLmpzIiwiMDAwX3BsdWdpbnMvcGhpbmEudGlsZWRtYXAuanMiLCIwMTBfYXBwbGljYXRpb24vQXBwbGljYXRpb24uanMiLCIwMTBfYXBwbGljYXRpb24vQXNzZXRMaXN0LmpzIiwiMDEwX2FwcGxpY2F0aW9uL2JlbnJpLmpzIiwiMDIwX3NjZW5lL01haW5TY2VuZS5qcyIsIjAyMF9zY2VuZS9NYWluU2NlbmVGbG93LmpzIiwiMDIwX3NjZW5lL1NwbGFzaFNjZW5lLmpzIiwiMDIwX3NjZW5lL1RpdGxlU2NlbmUuanMiLCIwMzBfYmFzZS9DaGFyYWN0ZXIuanMiLCIwNDBfcGxheWVyL1BsYXllci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0bkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwaGluYV9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogIG1haW4uanNcbiAqICAyMDE4LzA5LzIwXG4gKi9cblxucGhpbmEuZ2xvYmFsaXplKCk7XG5cbmNvbnN0IFNDX1cgPSA2NDA7XG5jb25zdCBTQ19IID0gMTEzNjtcblxubGV0IGFwcDtcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICBhcHAgPSBBcHBsaWNhdGlvbigpO1xuICBhcHAucmVwbGFjZVNjZW5lKE1haW5TY2VuZUZsb3coKSk7XG5cbiAgYXBwLnJ1bigpO1xuLy8gIGFwcC5lbmFibGVTdGF0cygpO1xufTtcbiIsIi8qXG4gKiAgcGhpbmEuYXNzZXRsb2FkZXJleC5qc1xuICogIDIwMTYvMTEvMjVcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG5waGluYS5leHRlbnNpb24gPSBwaGluYS5leHRlbnNpb24gfHwge307XG5cbi8v44OQ44OD44Kv44Kw44Op44Km44Oz44OJ44Gn44Ki44K744OD44OI6Kqt44G/6L6844G/XG5waGluYS5kZWZpbmUoXCJwaGluYS5leHRlbnNpb24uQXNzZXRMb2FkZXJFeFwiLCB7XG5cbiAgLy/pgLLmjZdcbiAgbG9hZHByb2dyZXNzOiAwLFxuXG4gIC8v6Kqt44G/6L6844G/57WC5LqG44OV44Op44KwXG4gIGxvYWRjb21wbGV0ZTogZmFsc2UsXG5cbiAgaW5pdDogZnVuY3Rpb24oKSB7XG4gIH0sXG5cbiAgbG9hZDogZnVuY3Rpb24oYXNzZXRzLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX29uTG9hZEFzc2V0cyA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKCl7fTtcbiAgICB2YXIgbG9hZGVyID0gcGhpbmEuYXNzZXQuQXNzZXRMb2FkZXIoKTtcbiAgICBsb2FkZXIubG9hZChhc3NldHMpO1xuICAgIGxvYWRlci5vbignbG9hZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMubG9hZGNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgIHRoaXMuX29uTG9hZEFzc2V0cygpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgbG9hZGVyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLmxvYWRwcm9ncmVzcyA9IGUucHJvZ3Jlc3M7XG4gICAgfS5iaW5kKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxufSk7XG4iLCIvKlxuICogIHBoaW5hLmV4dGVuc2lvbi5qc1xuICogIDIwMTYvMTEvMjVcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG5waGluYS5leHRlbnNpb24gPSBwaGluYS5leHRlbnNpb24gfHwge307XG5cbi8vc2V0QWxwaGHjgpLov73liqBcbnBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnQucHJvdG90eXBlLnNldEFscGhhID0gZnVuY3Rpb24odmFsKSB7XG4gIHRoaXMuYWxwaGEgPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy/jgrnjg5fjg6njgqTjg4jmqZ/og73mi6HlvLVcbnBoaW5hLmRpc3BsYXkuU3ByaXRlLnByb3RvdHlwZS5zZXRGcmFtZVRyaW1taW5nID0gZnVuY3Rpb24oeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICB0aGlzLl9mcmFtZVRyaW1YID0geCB8fCAwO1xuICB0aGlzLl9mcmFtZVRyaW1ZID0geSB8fCAwO1xuICB0aGlzLl9mcmFtZVRyaW1XaWR0aCA9IHdpZHRoIHx8IHRoaXMuaW1hZ2UuZG9tRWxlbWVudC53aWR0aCAtIHRoaXMuX2ZyYW1lVHJpbVg7XG4gIHRoaXMuX2ZyYW1lVHJpbUhlaWdodCA9IGhlaWdodCB8fCB0aGlzLmltYWdlLmRvbUVsZW1lbnQuaGVpZ2h0IC0gdGhpcy5fZnJhbWVUcmltWTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbnBoaW5hLmRpc3BsYXkuU3ByaXRlLnByb3RvdHlwZS5zZXRGcmFtZUluZGV4ID0gZnVuY3Rpb24oaW5kZXgsIHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIHN4ID0gdGhpcy5fZnJhbWVUcmltWCB8fCAwO1xuICB2YXIgc3kgPSB0aGlzLl9mcmFtZVRyaW1ZIHx8IDA7XG4gIHZhciBzdyA9IHRoaXMuX2ZyYW1lVHJpbVdpZHRoICB8fCAodGhpcy5pbWFnZS5kb21FbGVtZW50LndpZHRoLXN4KTtcbiAgdmFyIHNoID0gdGhpcy5fZnJhbWVUcmltSGVpZ2h0IHx8ICh0aGlzLmltYWdlLmRvbUVsZW1lbnQuaGVpZ2h0LXN5KTtcblxuICB2YXIgdHcgID0gd2lkdGggfHwgdGhpcy53aWR0aDsgICAgLy8gdHdcbiAgdmFyIHRoICA9IGhlaWdodCB8fCB0aGlzLmhlaWdodDsgIC8vIHRoXG4gIHZhciByb3cgPSB+fihzdyAvIHR3KTtcbiAgdmFyIGNvbCA9IH5+KHNoIC8gdGgpO1xuICB2YXIgbWF4SW5kZXggPSByb3cqY29sO1xuICBpbmRleCA9IGluZGV4JW1heEluZGV4O1xuXG4gIHZhciB4ICAgPSBpbmRleCVyb3c7XG4gIHZhciB5ICAgPSB+fihpbmRleC9yb3cpO1xuICB0aGlzLnNyY1JlY3QueCA9IHN4K3gqdHc7XG4gIHRoaXMuc3JjUmVjdC55ID0gc3kreSp0aDtcbiAgdGhpcy5zcmNSZWN0LndpZHRoICA9IHR3O1xuICB0aGlzLnNyY1JlY3QuaGVpZ2h0ID0gdGg7XG5cbiAgdGhpcy5fZnJhbWVJbmRleCA9IGluZGV4O1xuXG4gIHJldHVybiB0aGlzO1xufVxuXG4vL+OCqOODrOODoeODs+ODiOWQjOWjq+OBruaOpeinpuWIpOWumlxucGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudC5wcm90b3R5cGUuaXNIaXRFbGVtZW50ID0gZnVuY3Rpb24oZWxtKSB7XG4gIC8v6Ieq5YiG44Go44OG44K544OI5a++6LGh44KS44Kw44Ot44O844OQ44Or44G45aSJ5o+bXG4gIHZhciBwID0gdGhpcy5nbG9iYWxUb0xvY2FsKGVsbSk7XG4gIHZhciB0YXJnZXQgPSBwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50KHt3aWR0aDogZWxtLndpZHRoLCBoZWlnaHQ6IGVsbS5oZWlnaHR9KS5zZXRQb3NpdGlvbihwLngsIHAueSk7XG5cbiAgaWYgKHRoaXMuYm91bmRpbmdUeXBlID09ICdyZWN0Jykge1xuICAgIGlmIChlbG0uYm91bmRpbmdUeXBlID09ICdyZWN0Jykge1xuICAgICAgcmV0dXJuIHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RSZWN0UmVjdCh0aGlzLCB0YXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdFJlY3RDaXJjbGUodGhpcywgdGFyZ2V0KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGVsbS5ib3VuZGluZ1R5cGUgPT0gJ3JlY3QnKSB7XG4gICAgICByZXR1cm4gcGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdENpZWNsZVJlY3QodGhpcywgdGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RDaXJjbGVDaXJjbGUodGhpcywgdGFyZ2V0KTtcbiAgICB9XG4gIH1cbn1cblxuLy/lrZDopoHntKDlhajjgabliIfjgorpm6LjgZdcbnBoaW5hLmFwcC5FbGVtZW50LnByb3RvdHlwZS5yZW1vdmVDaGlsZHJlbiA9IGZ1bmN0aW9uKGJlZ2luSW5kZXgpIHtcbiAgYmVnaW5JbmRleCA9IGJlZ2luSW5kZXggfHwgMDtcbiAgdmFyIHRlbXBDaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW4uc2xpY2UoKTtcbiAgdmFyIGxlbiA9IGxlbiA9IHRlbXBDaGlsZHJlbi5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSBiZWdpbkluZGV4OyBpIDwgbGVuOyArK2kpIHtcbiAgICB0ZW1wQ2hpbGRyZW5baV0ucmVtb3ZlKCk7XG4gIH1cbiAgdGhpcy5jaGlsZHJlbiA9IFtdO1xufVxuXG4vKipcbiAqIEBtZXRob2QgdGVzdExpbmVMaW5lXG4gKiBAc3RhdGljXG4gKiAy44Gk44Gu57ea5YiG44GM6YeN44Gq44Gj44Gm44GE44KL44GL44Gp44GG44GL44KS5Yik5a6a44GX44G+44GZXG4gKiDlj4LogIPvvJpodHRwOi8vd3d3NWQuYmlnbG9iZS5uZS5qcC9+dG9tb3lhMDMvc2h0bWwvYWxnb3JpdGhtL0ludGVyc2VjdGlvbi5odG1cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICogICBwMSA9IHBoaW5hLmdlb20uVmVjdG9yMigxMDAsIDEwMCk7XG4gKiAgIHAyID0gcGhpbmEuZ2VvbS5WZWN0b3IyKDIwMCwgMjAwKTtcbiAqICAgcDMgPSBwaGluYS5nZW9tLlZlY3RvcjIoMTUwLCAyNDApO1xuICogICBwNCA9IHBoaW5hLmdlb20uVmVjdG9yMigyMDAsIDEwMCk7XG4gKiBwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0TGluZUxpbmUocDEsIHAyLCBwMywgcDQpOyAvLyA9PiB0cnVlXG4gKlxuICogQHBhcmFtIHtwaGluYS5nZW9tLlZlY3RvcjJ9IHAxIOe3muWIhjHjga7nq6/jga7luqfmqJlcbiAqIEBwYXJhbSB7cGhpbmEuZ2VvbS5WZWN0b3IyfSBwMiDnt5rliIYx44Gu56uv44Gu5bqn5qiZXG4gKiBAcGFyYW0ge3BoaW5hLmdlb20uVmVjdG9yMn0gcDMg57ea5YiGMuOBruerr+OBruW6p+aomVxuICogQHBhcmFtIHtwaGluYS5nZW9tLlZlY3RvcjJ9IHA0IOe3muWIhjLjga7nq6/jga7luqfmqJlcbiAqIEByZXR1cm4ge0Jvb2xlYW59IOe3muWIhjHjgajnt5rliIYy44GM6YeN44Gq44Gj44Gm44GE44KL44GL44Gp44GG44GLXG4gKi9cbnBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RMaW5lTGluZSA9IGZ1bmN0aW9uKHAxLCBwMiwgcDMsIHA0KSB7XG4gIC8v5ZCM5LiA77y477y56Lu45LiK44Gr5LmX44Gj44Gm44KL5aC05ZCI44Gu6Kqk5Yik5a6a5Zue6YG/XG4gIGlmIChwMS54ID09IHAyLnggJiYgcDEueCA9PSBwMy54ICYmIHAxLnggPT0gcDQueCkge1xuICB2YXIgbWluID0gTWF0aC5taW4ocDEueSwgcDIueSk7XG4gIHZhciBtYXggPSBNYXRoLm1heChwMS55LCBwMi55KTtcbiAgaWYgKG1pbiA8PSBwMy55ICYmIHAzLnkgPD0gbWF4IHx8IG1pbiA8PSBwNC55ICYmIHA0LnkgPD0gbWF4KSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChwMS55ID09IHAyLnkgJiYgcDEueSA9PSBwMy55ICYmIHAxLnkgPT0gcDQueSkge1xuICB2YXIgbWluID0gTWF0aC5taW4ocDEueCwgcDIueCk7XG4gIHZhciBtYXggPSBNYXRoLm1heChwMS54LCBwMi54KTtcbiAgaWYgKG1pbiA8PSBwMy54ICYmIHAzLnggPD0gbWF4IHx8IG1pbiA8PSBwNC54ICYmIHA0LnggPD0gbWF4KSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBhID0gKHAxLnggLSBwMi54KSAqIChwMy55IC0gcDEueSkgKyAocDEueSAtIHAyLnkpICogKHAxLnggLSBwMy54KTtcbiAgdmFyIGIgPSAocDEueCAtIHAyLngpICogKHA0LnkgLSBwMS55KSArIChwMS55IC0gcDIueSkgKiAocDEueCAtIHA0LngpO1xuICB2YXIgYyA9IChwMy54IC0gcDQueCkgKiAocDEueSAtIHAzLnkpICsgKHAzLnkgLSBwNC55KSAqIChwMy54IC0gcDEueCk7XG4gIHZhciBkID0gKHAzLnggLSBwNC54KSAqIChwMi55IC0gcDMueSkgKyAocDMueSAtIHA0LnkpICogKHAzLnggLSBwMi54KTtcbiAgcmV0dXJuIGEgKiBiIDw9IDAgJiYgYyAqIGQgPD0gMDtcbn1cblxuLyoqXG4gKiBAbWV0aG9kIHRlc3RSZWN0TGluZVxuICogQHN0YXRpY1xuICog55+p5b2i44Go57ea5YiG44GM6YeN44Gq44Gj44Gm44GE44KL44GL44Gp44GG44GL44KS5Yik5a6a44GX44G+44GZXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqICAgcmVjdCA9IHBoaW5hLmdlb20uUmVjdCgxMjAsIDEzMCwgNDAsIDUwKTtcbiAqICAgcDEgPSBwaGluYS5nZW9tLlZlY3RvcjIoMTAwLCAxMDApO1xuICogICBwMiA9IHBoaW5hLmdlb20uVmVjdG9yMigyMDAsIDIwMCk7XG4gKiBwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0UmVjdExpbmUocmVjdCwgcDEsIHAyKTsgLy8gPT4gdHJ1ZVxuICpcbiAqIEBwYXJhbSB7cGhpbmEuZ2VvbS5SZWN0fSByZWN0IOefqeW9oumgmOWfn+OCquODluOCuOOCp+OCr+ODiFxuICogQHBhcmFtIHtwaGluYS5nZW9tLlZlY3RvcjJ9IHAxIOe3muWIhuOBruerr+OBruW6p+aomVxuICogQHBhcmFtIHtwaGluYS5nZW9tLlZlY3RvcjJ9IHAyIOe3muWIhuOBruerr+OBruW6p+aomVxuICogQHJldHVybiB7Qm9vbGVhbn0g55+p5b2i44Go57ea5YiG44GM6YeN44Gq44Gj44Gm44GE44KL44GL44Gp44GG44GLXG4gKi9cbnBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RSZWN0TGluZSA9IGZ1bmN0aW9uKHJlY3QsIHAxLCBwMikge1xuICAvL+WMheWQq+WIpOWumihwMeOBjOWQq+OBvuOCjOOBpuOCjOOBsOiJr+OBhOOBruOBp3Ay44Gu5Yik5a6a44Gv44GX44Gq44GE77yJXG4gIGlmIChyZWN0LmxlZnQgPD0gcDEueCAmJiBwMS54IDw9IHJlY3QucmlnaHQgJiYgcmVjdC50b3AgPD0gcDEueSAmJiBwMS55IDw9IHJlY3QuYm90dG9tICkgcmV0dXJuIHRydWU7XG5cbiAgLy/nn6nlvaLjga7vvJTngrlcbiAgdmFyIHIxID0gcGhpbmEuZ2VvbS5WZWN0b3IyKHJlY3QubGVmdCwgcmVjdC50b3ApOyAgIC8v5bem5LiKXG4gIHZhciByMiA9IHBoaW5hLmdlb20uVmVjdG9yMihyZWN0LnJpZ2h0LCByZWN0LnRvcCk7ICAvL+WPs+S4ilxuICB2YXIgcjMgPSBwaGluYS5nZW9tLlZlY3RvcjIocmVjdC5yaWdodCwgcmVjdC5ib3R0b20pOyAvL+WPs+S4i1xuICB2YXIgcjQgPSBwaGluYS5nZW9tLlZlY3RvcjIocmVjdC5sZWZ0LCByZWN0LmJvdHRvbSk7ICAvL+W3puS4i1xuXG4gIC8v55+p5b2i44Gu77yU6L6644KS44Gq44GZ57ea5YiG44Go44Gu5o6l6Kem5Yik5a6aXG4gIGlmIChwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0TGluZUxpbmUocDEsIHAyLCByMSwgcjIpKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RMaW5lTGluZShwMSwgcDIsIHIyLCByMykpIHJldHVybiB0cnVlO1xuICBpZiAocGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdExpbmVMaW5lKHAxLCBwMiwgcjMsIHI0KSkgcmV0dXJuIHRydWU7XG4gIGlmIChwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0TGluZUxpbmUocDEsIHAyLCByMSwgcjQpKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbi8v5YaG5byn44Gu5o+P55S7XG5waGluYS5kZWZpbmUoJ3BoaW5hLmRpc3BsYXkuQXJjU2hhcGUnLCB7XG4gIHN1cGVyQ2xhc3M6ICdwaGluYS5kaXNwbGF5LlNoYXBlJyxcblxuICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSAoe30pLiRzYWZlKG9wdGlvbnMsIHtcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgZmlsbDogJ3JlZCcsXG4gICAgc3Ryb2tlOiAnI2FhYScsXG4gICAgc3Ryb2tlV2lkdGg6IDQsXG4gICAgcmFkaXVzOiAzMixcbiAgICBzdGFydEFuZ2xlOiAwLFxuICAgIGVuZEFuZ2xlOiAyNzAsXG5cbiAgICBhbnRpY2xvY2t3aXNlOiBmYWxzZSxcbiAgfSk7XG4gIHRoaXMuc3VwZXJJbml0KG9wdGlvbnMpO1xuXG4gIHRoaXMucmFkaXVzID0gb3B0aW9ucy5yYWRpdXM7XG4gIHRoaXMuc3RhcnRBbmdsZSA9IG9wdGlvbnMuc3RhcnRBbmdsZTtcbiAgdGhpcy5lbmRBbmdsZSA9IG9wdGlvbnMuZW5kQW5nbGU7XG4gIHRoaXMuYW50aWNsb2Nrd2lzZSA9IG9wdGlvbnMuYW50aWNsb2Nrd2lzZTtcblxuICB0aGlzLnNldEJvdW5kaW5nVHlwZSgnY2lyY2xlJyk7XG4gIH0sXG5cbiAgcHJlcmVuZGVyOiBmdW5jdGlvbihjYW52YXMpIHtcbiAgY2FudmFzLmZpbGxQaWUoMCwgMCwgdGhpcy5yYWRpdXMsIHRoaXMuc3RhcnRBbmdsZSwgdGhpcy5lbmRBbmdsZSk7XG4gIH0sXG59KTtcbiIsIi8qXG4gKiAgcGhpbmEudGlsZWRtYXAuanNcbiAqICAyMDE2LzA5LzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxuLyoqXG4gKiBAY2xhc3MgcGhpbmEuYXNzZXQuVGlsZWRNYXBcbiAqIEBleHRlbmRzIHBoaW5hLmFzc2V0LkFzc2V0XG4gKiAjIFRpbGVkTWFwRWRpdG9y44Gn5L2c5oiQ44GX44GfdG1444OV44Kh44Kk44Or44KS6Kqt44G/6L6844G/44Kv44Op44K5XG4gKi9cbnBoaW5hLmRlZmluZShcInBoaW5hLmFzc2V0LlRpbGVkTWFwXCIsIHtcbiAgc3VwZXJDbGFzczogXCJwaGluYS5hc3NldC5Bc3NldFwiLFxuXG4gIC8qKlxuICAgKiBAcHJvcGVydHkgaW1hZ2VcbiAgICog5L2c5oiQ44GV44KM44Gf44Oe44OD44OX55S75YOPXG4gICAqL1xuICBpbWFnZTogbnVsbCxcblxuICAvKipcbiAgICogQHByb3BlcnR5IHRpbGVzZXRzXG4gICAqIOOCv+OCpOODq+OCu+ODg+ODiOaDheWgsVxuICAgKi9cbiAgdGlsZXNldHM6IG51bGwsXG5cbiAgLyoqXG4gICAqIEBwcm9wZXJ0eSBsYXllcnNcbiAgICog44Os44Kk44Ok44O85oOF5aCx44GM5qC857SN44GV44KM44Gm44GE44KL6YWN5YiXXG4gICAqL1xuICBsYXllcnM6IG51bGwsXG5cbiAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdXBlckluaXQoKTtcbiAgfSxcblxuICBfbG9hZDogZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgIC8v44OR44K55oqc44GN5Ye644GXXG4gICAgdGhpcy5wYXRoID0gXCJcIjtcbiAgICB2YXIgbGFzdCA9IHRoaXMuc3JjLmxhc3RJbmRleE9mKFwiL1wiKTtcbiAgICBpZiAobGFzdCA+IDApIHtcbiAgICAgIHRoaXMucGF0aCA9IHRoaXMuc3JjLnN1YnN0cmluZygwLCBsYXN0KzEpO1xuICAgIH1cblxuICAgIC8v57WC5LqG6Zai5pWw5L+d5a2YXG4gICAgdGhpcy5fcmVzb2x2ZSA9IHJlc29sdmU7XG5cbiAgICAvLyBsb2FkXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciB4bWwgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4bWwub3BlbignR0VUJywgdGhpcy5zcmMpO1xuICAgIHhtbC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh4bWwucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICBpZiAoWzIwMCwgMjAxLCAwXS5pbmRleE9mKHhtbC5zdGF0dXMpICE9PSAtMSkge1xuICAgICAgICAgIHZhciBkYXRhID0geG1sLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICBkYXRhID0gKG5ldyBET01QYXJzZXIoKSkucGFyc2VGcm9tU3RyaW5nKGRhdGEsIFwidGV4dC94bWxcIik7XG4gICAgICAgICAgc2VsZi5kYXRhVHlwZSA9IFwieG1sXCI7XG4gICAgICAgICAgc2VsZi5kYXRhID0gZGF0YTtcbiAgICAgICAgICBzZWxmLl9wYXJzZShkYXRhKTtcbi8vICAgICAgICAgIHJlc29sdmUoc2VsZik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIHhtbC5zZW5kKG51bGwpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGdldE1hcERhdGFcbiAgICog5oyH5a6a44GX44Gf44Oe44OD44OX44Os44Kk44Ok44O844KS6YWN5YiX44Go44GX44Gm5Y+W5b6X44GX44G+44GZ44CCXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYXllck5hbWUg5a++6LGh44Os44Kk44Ok44O85ZCNXG4gICAqL1xuICBnZXRNYXBEYXRhOiBmdW5jdGlvbihsYXllck5hbWUpIHtcbiAgICAvL+ODrOOCpOODpOODvOaknOe0olxuICAgIHZhciBkYXRhID0gbnVsbDtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmxheWVyc1tpXS5uYW1lID09IGxheWVyTmFtZSkge1xuICAgICAgICAvL+OCs+ODlOODvOOCkui/lOOBmVxuICAgICAgICByZXR1cm4gdGhpcy5sYXllcnNbaV0uZGF0YS5jb25jYXQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgZ2V0T2JqZWN0R3JvdXBcbiAgICog44Kq44OW44K444Kn44Kv44OI44Kw44Or44O844OX44KS5Y+W5b6X44GX44G+44GZXG4gICAqXG4gICAqIOOCsOODq+ODvOODl+aMh+WumuOBjOeEoeOBhOWgtOWQiOOAgeWFqOODrOOCpOODpOODvOOCkumFjeWIl+OBq+OBl+OBpui/lOOBl+OBvuOBmeOAglxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdW5wTmFtZSDlr77osaHjgqrjg5bjgrjjgqfjgq/jg4jjgrDjg6vjg7zjg5flkI1cbiAgICovXG4gIGdldE9iamVjdEdyb3VwOiBmdW5jdGlvbihncm91cE5hbWUpIHtcbiAgICBncm91cE5hbWUgPSBncm91cE5hbWUgfHwgbnVsbDtcbiAgICB2YXIgbHMgPSBbXTtcbiAgICB2YXIgbGVuID0gdGhpcy5sYXllcnMubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmxheWVyc1tpXS50eXBlID09IFwib2JqZWN0Z3JvdXBcIikge1xuICAgICAgICBpZiAoZ3JvdXBOYW1lID09IG51bGwgfHwgZ3JvdXBOYW1lID09IHRoaXMubGF5ZXJzW2ldLm5hbWUpIHtcbiAgICAgICAgICAvL+ODrOOCpOODpOODvOaDheWgseOCkuOCr+ODreODvOODs+OBmeOCi1xuICAgICAgICAgIHZhciBvYmogPSB0aGlzLl9jbG9uZU9iamVjdExheWVyKHRoaXMubGF5ZXJzW2ldKTtcbiAgICAgICAgICBpZiAoZ3JvdXBOYW1lICE9PSBudWxsKSByZXR1cm4gb2JqO1xuICAgICAgICB9XG4gICAgICAgIGxzLnB1c2gob2JqKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGdldE1hcEltYWdlXG4gICAqIOODnuODg+ODl+OCpOODoeODvOOCuOOBruS9nOaIkFxuICAgKlxuICAgKiDopIfmlbDjga7jg57jg4Pjg5fjg6zjgqTjg6Tjg7zjgpLmjIflrprlh7rmnaXjgb7jgZnjgIJcbiAgICog5o+P55S76aCG5bqP44GvVGlsZWRNYXBFZGl0b3LlgbTjgafjga7mjIflrprpoIbjgafjga/nhKHjgY/jgIHlvJXmlbDjga7poIbluo/jgajjgarjgorjgb7jgZnvvIjnrKzkuIDlvJXmlbDjgYzkuIDnlarkuIvjgajjgarjgovvvIlcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9ICDlr77osaHjg6zjgqTjg6Tjg7zlkI1cbiAgICovXG4gIGdldEltYWdlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgdmFyIG51bUxheWVyID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5sYXllcnNbaV0udHlwZSA9PSBcImxheWVyXCIgfHwgdGhpcy5sYXllcnNbaV0udHlwZSA9PSBcImltYWdlbGF5ZXJcIikgbnVtTGF5ZXIrKztcbiAgICB9XG4gICAgaWYgKG51bUxheWVyID09IDApIHJldHVybiBudWxsO1xuXG4gICAgdmFyIGdlbmVyYXRlZCA9IGZhbHNlO1xuICAgIHZhciB3aWR0aCA9IHRoaXMud2lkdGggKiB0aGlzLnRpbGV3aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5oZWlnaHQgKiB0aGlzLnRpbGVoZWlnaHQ7XG4gICAgdmFyIGNhbnZhcyA9IHBoaW5hLmdyYXBoaWNzLkNhbnZhcygpLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZmluZCA9IGFyZ3MuaW5kZXhPZih0aGlzLmxheWVyc1tpXS5uYW1lKTtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSAwIHx8IGZpbmQgPj0gMCkge1xuICAgICAgICAvL+ODnuODg+ODl+ODrOOCpOODpOODvFxuICAgICAgICBpZiAodGhpcy5sYXllcnNbaV0udHlwZSA9PSBcImxheWVyXCIgJiYgdGhpcy5sYXllcnNbaV0udmlzaWJsZSAhPSBcIjBcIikge1xuICAgICAgICAgIHZhciBsYXllciA9IHRoaXMubGF5ZXJzW2ldO1xuICAgICAgICAgIHZhciBtYXBkYXRhID0gbGF5ZXIuZGF0YTtcbiAgICAgICAgICB2YXIgd2lkdGggPSBsYXllci53aWR0aDtcbiAgICAgICAgICB2YXIgaGVpZ2h0ID0gbGF5ZXIuaGVpZ2h0O1xuICAgICAgICAgIHZhciBvcGFjaXR5ID0gbGF5ZXIub3BhY2l0eSB8fCAxLjA7XG4gICAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgdmFyIGluZGV4ID0gbWFwZGF0YVtjb3VudF07XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8v44Oe44OD44OX44OB44OD44OX44KS6YWN572uXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0TWFwQ2hpcChjYW52YXMsIGluZGV4LCB4ICogdGhpcy50aWxld2lkdGgsIHkgKiB0aGlzLnRpbGVoZWlnaHQsIG9wYWNpdHkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy/jgqrjg5bjgrjjgqfjgq/jg4jjgrDjg6vjg7zjg5dcbiAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLnR5cGUgPT0gXCJvYmplY3Rncm91cFwiICYmIHRoaXMubGF5ZXJzW2ldLnZpc2libGUgIT0gXCIwXCIpIHtcbiAgICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzLmxheWVyc1tpXTtcbiAgICAgICAgICB2YXIgb3BhY2l0eSA9IGxheWVyLm9wYWNpdHkgfHwgMS4wO1xuICAgICAgICAgIGxheWVyLm9iamVjdHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAoZS5naWQpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc2V0TWFwQ2hpcChjYW52YXMsIGUuZ2lkLCBlLngsIGUueSwgb3BhY2l0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8v44Kk44Oh44O844K444Os44Kk44Ok44O8XG4gICAgICAgIGlmICh0aGlzLmxheWVyc1tpXS50eXBlID09IFwiaW1hZ2VsYXllclwiICYmIHRoaXMubGF5ZXJzW2ldLnZpc2libGUgIT0gXCIwXCIpIHtcbiAgICAgICAgICB2YXIgbGVuID0gdGhpcy5sYXllcnNbaV07XG4gICAgICAgICAgdmFyIGltYWdlID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgnaW1hZ2UnLCB0aGlzLmxheWVyc1tpXS5pbWFnZS5zb3VyY2UpO1xuICAgICAgICAgIGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZShpbWFnZS5kb21FbGVtZW50LCB0aGlzLmxheWVyc1tpXS54LCB0aGlzLmxheWVyc1tpXS55KTtcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFnZW5lcmF0ZWQpIHJldHVybiBudWxsO1xuXG4gICAgdmFyIHRleHR1cmUgPSBwaGluYS5hc3NldC5UZXh0dXJlKCk7XG4gICAgdGV4dHVyZS5kb21FbGVtZW50ID0gY2FudmFzLmRvbUVsZW1lbnQ7XG4gICAgcmV0dXJuIHRleHR1cmU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX2Nsb25lT2JqZWN0TGF5ZXJcbiAgICog5byV5pWw44Go44GX44Gm5rih44GV44KM44Gf44Kq44OW44K444Kn44Kv44OI44Os44Kk44Ok44O844KS44Kv44Ot44O844Oz44GX44Gm6L+U44GX44G+44GZ44CCXG4gICAqXG4gICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2Nsb25lT2JqZWN0TGF5ZXI6IGZ1bmN0aW9uKHNyY0xheWVyKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9LiRzYWZlKHNyY0xheWVyKTtcbiAgICByZXN1bHQub2JqZWN0cyA9IFtdO1xuICAgIC8v44Os44Kk44Ok44O85YaF44Kq44OW44K444Kn44Kv44OI44Gu44Kz44OU44O8XG4gICAgc3JjTGF5ZXIub2JqZWN0cy5mb3JFYWNoKGZ1bmN0aW9uKG9iail7XG4gICAgICB2YXIgcmVzT2JqID0ge1xuICAgICAgICBwcm9wZXJ0aWVzOiB7fS4kc2FmZShvYmoucHJvcGVydGllcyksXG4gICAgICB9LiRleHRlbmQob2JqKTtcbiAgICAgIGlmIChvYmouZWxsaXBzZSkgcmVzT2JqLmVsbGlwc2UgPSBvYmouZWxsaXBzZTtcbiAgICAgIGlmIChvYmouZ2lkKSByZXNPYmouZ2lkID0gb2JqLmdpZDtcbiAgICAgIGlmIChvYmoucG9seWdvbikgcmVzT2JqLnBvbHlnb24gPSBvYmoucG9seWdvbi5jbG9uZSgpO1xuICAgICAgaWYgKG9iai5wb2x5bGluZSkgcmVzT2JqLnBvbHlsaW5lID0gb2JqLnBvbHlsaW5lLmNsb25lKCk7XG4gICAgICByZXN1bHQub2JqZWN0cy5wdXNoKHJlc09iaik7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfcGFyc2VcbiAgICog5Y+W5b6X44GX44GfVGlsZWRNYXBFZGl044Gu44OH44O844K/44KS44OR44O844K544GX44G+44GZ44CCXG4gICAqXG4gICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3BhcnNlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy/jgr/jgqTjg6vlsZ7mgKfmg4XloLHlj5blvpdcbiAgICB2YXIgbWFwID0gZGF0YS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWFwJylbMF07XG4gICAgdmFyIGF0dHIgPSB0aGlzLl9hdHRyVG9KU09OKG1hcCk7XG4gICAgdGhpcy4kZXh0ZW5kKGF0dHIpO1xuICAgIHRoaXMucHJvcGVydGllcyA9IHRoaXMuX3Byb3BlcnRpZXNUb0pTT04obWFwKTtcblxuICAgIC8v44K/44Kk44Or44K744OD44OI5Y+W5b6XXG4gICAgdGhpcy50aWxlc2V0cyA9IHRoaXMuX3BhcnNlVGlsZXNldHMoZGF0YSk7XG5cbiAgICAvL+OCv+OCpOODq+OCu+ODg+ODiOaDheWgseijnOWujFxuICAgIHZhciBkZWZhdWx0QXR0ciA9IHtcbiAgICAgIHRpbGV3aWR0aDogMzIsXG4gICAgICB0aWxlaGVpZ2h0OiAzMixcbiAgICAgIHNwYWNpbmc6IDAsXG4gICAgICBtYXJnaW46IDAsXG4gICAgfTtcbiAgICB0aGlzLnRpbGVzZXRzLmNoaXBzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRpbGVzZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvL+OCv+OCpOODq+OCu+ODg+ODiOWxnuaAp+aDheWgseWPluW+l1xuICAgICAgdmFyIGF0dHIgPSB0aGlzLl9hdHRyVG9KU09OKGRhdGEuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3RpbGVzZXQnKVtpXSk7XG4gICAgICBhdHRyLiRzYWZlKGRlZmF1bHRBdHRyKTtcbiAgICAgIGF0dHIuZmlyc3RnaWQtLTtcbiAgICAgIHRoaXMudGlsZXNldHNbaV0uJGV4dGVuZChhdHRyKTtcblxuICAgICAgLy/jg57jg4Pjg5fjg4Hjg4Pjg5fjg6rjgrnjg4jkvZzmiJBcbiAgICAgIHZhciB0ID0gdGhpcy50aWxlc2V0c1tpXTtcbiAgICAgIHRoaXMudGlsZXNldHNbaV0ubWFwQ2hpcCA9IFtdO1xuICAgICAgZm9yICh2YXIgciA9IGF0dHIuZmlyc3RnaWQ7IHIgPCBhdHRyLmZpcnN0Z2lkK2F0dHIudGlsZWNvdW50OyByKyspIHtcbiAgICAgICAgdmFyIGNoaXAgPSB7XG4gICAgICAgICAgaW1hZ2U6IHQuaW1hZ2UsXG4gICAgICAgICAgeDogKChyIC0gYXR0ci5maXJzdGdpZCkgJSB0LmNvbHVtbnMpICogKHQudGlsZXdpZHRoICsgdC5zcGFjaW5nKSArIHQubWFyZ2luLFxuICAgICAgICAgIHk6IE1hdGguZmxvb3IoKHIgLSBhdHRyLmZpcnN0Z2lkKSAvIHQuY29sdW1ucykgKiAodC50aWxlaGVpZ2h0ICsgdC5zcGFjaW5nKSArIHQubWFyZ2luLFxuICAgICAgICB9LiRzYWZlKGF0dHIpO1xuICAgICAgICB0aGlzLnRpbGVzZXRzLmNoaXBzW3JdID0gY2hpcDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL+ODrOOCpOODpOODvOWPluW+l1xuICAgIHRoaXMubGF5ZXJzID0gdGhpcy5fcGFyc2VMYXllcnMoZGF0YSk7XG5cbiAgICAvL+OCpOODoeODvOOCuOODh+ODvOOCv+iqreOBv+i+vOOBv1xuICAgIHRoaXMuX2NoZWNrSW1hZ2UoKTtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfY2hlY2tJbWFnZVxuICAgKiDjgqLjgrvjg4Pjg4jjgavnhKHjgYTjgqTjg6Hjg7zjgrjjg4fjg7zjgr/jgpLjg4Hjgqfjg4Pjgq/jgZfjgaboqq3jgb/ovrzjgb/jgpLooYzjgYTjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfY2hlY2tJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBpbWFnZVNvdXJjZSA9IFtdO1xuICAgIHZhciBsb2FkSW1hZ2UgPSBbXTtcblxuICAgIC8v5LiA6Kan5L2c5oiQXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRpbGVzZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgb2JqID0ge1xuICAgICAgICBpbWFnZTogdGhpcy50aWxlc2V0c1tpXS5pbWFnZSxcbiAgICAgICAgdHJhbnNSOiB0aGlzLnRpbGVzZXRzW2ldLnRyYW5zUixcbiAgICAgICAgdHJhbnNHOiB0aGlzLnRpbGVzZXRzW2ldLnRyYW5zRyxcbiAgICAgICAgdHJhbnNCOiB0aGlzLnRpbGVzZXRzW2ldLnRyYW5zQixcbiAgICAgIH07XG4gICAgICBpbWFnZVNvdXJjZS5wdXNoKG9iaik7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmxheWVyc1tpXS5pbWFnZSkge1xuICAgICAgICB2YXIgb2JqID0ge1xuICAgICAgICAgIGltYWdlOiB0aGlzLmxheWVyc1tpXS5pbWFnZS5zb3VyY2VcbiAgICAgICAgfTtcbiAgICAgICAgaW1hZ2VTb3VyY2UucHVzaChvYmopO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8v44Ki44K744OD44OI44Gr44GC44KL44GL56K66KqNXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZVNvdXJjZS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGltYWdlID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgnaW1hZ2UnLCBpbWFnZVNvdXJjZVtpXS5pbWFnZSk7XG4gICAgICBpZiAoaW1hZ2UpIHtcbiAgICAgICAgLy/jgqLjgrvjg4Pjg4jjgavjgYLjgotcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v44Gq44GL44Gj44Gf44Gu44Gn44Ot44O844OJ44Oq44K544OI44Gr6L+95YqgXG4gICAgICAgIGxvYWRJbWFnZS5wdXNoKGltYWdlU291cmNlW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL+S4gOaLrOODreODvOODiVxuICAgIC8v44Ot44O844OJ44Oq44K544OI5L2c5oiQXG4gICAgdmFyIGFzc2V0cyA9IHtcbiAgICAgIGltYWdlOiBbXVxuICAgIH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2FkSW1hZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8v44Kk44Oh44O844K444Gu44OR44K544KS44Oe44OD44OX44Go5ZCM44GY44Gr44GZ44KLXG4gICAgICBhc3NldHMuaW1hZ2VbbG9hZEltYWdlW2ldLmltYWdlXSA9IHRoaXMucGF0aCtsb2FkSW1hZ2VbaV0uaW1hZ2U7XG4gICAgfVxuICAgIGlmIChsb2FkSW1hZ2UubGVuZ3RoKSB7XG4gICAgICB2YXIgbG9hZGVyID0gcGhpbmEuYXNzZXQuQXNzZXRMb2FkZXIoKTtcbiAgICAgIGxvYWRlci5sb2FkKGFzc2V0cyk7XG4gICAgICBsb2FkZXIub24oJ2xvYWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIC8v6YCP6YGO6Imy6Kit5a6a5Y+N5pigXG4gICAgICAgIGxvYWRJbWFnZS5mb3JFYWNoKGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICAgIHZhciBpbWFnZSA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ2ltYWdlJywgZWxtLmltYWdlKTtcbiAgICAgICAgICBpZiAoZWxtLnRyYW5zUiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgciA9IGVsbS50cmFuc1IsIGcgPSBlbG0udHJhbnNHLCBiID0gZWxtLnRyYW5zQjtcbiAgICAgICAgICAgIGltYWdlLmZpbHRlcihmdW5jdGlvbihwaXhlbCwgaW5kZXgsIHgsIHksIGJpdG1hcCkge1xuICAgICAgICAgICAgICB2YXIgZGF0YSA9IGJpdG1hcC5kYXRhO1xuICAgICAgICAgICAgICBpZiAocGl4ZWxbMF0gPT0gciAmJiBwaXhlbFsxXSA9PSBnICYmIHBpeGVsWzJdID09IGIpIHtcbiAgICAgICAgICAgICAgICBkYXRhW2luZGV4KzNdID0gMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy/oqq3jgb/ovrzjgb/ntYLkuoZcbiAgICAgICAgdGhhdC5fcmVzb2x2ZSh0aGF0KTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8v6Kqt44G/6L6844G/57WC5LqGXG4gICAgICB0aGlzLl9yZXNvbHZlKHRoYXQpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfc2V0TWFwQ2hpcFxuICAgKiDjgq3jg6Pjg7Pjg5Djgrnjga7mjIflrprjgZfjgZ/luqfmqJnjgavjg57jg4Pjg5fjg4Hjg4Pjg5fjga7jgqTjg6Hjg7zjgrjjgpLjgrPjg5Tjg7zjgZfjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0TWFwQ2hpcDogZnVuY3Rpb24oY2FudmFzLCBpbmRleCwgeCwgeSwgb3BhY2l0eSkge1xuICAgIC8v44K/44Kk44Or44K744OD44OI44GL44KJ44Oe44OD44OX44OB44OD44OX44KS5Y+W5b6XXG4gICAgdmFyIGNoaXAgPSB0aGlzLnRpbGVzZXRzLmNoaXBzW2luZGV4XTtcbiAgICBpZiAoIWNoaXApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGltYWdlID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgnaW1hZ2UnLCBjaGlwLmltYWdlKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICBjb25zb2xlLmxvZyhjaGlwLmltYWdlKTtcbiAgICB9XG4gICAgY2FudmFzLmNvbnRleHQuZHJhd0ltYWdlKFxuICAgICAgaW1hZ2UuZG9tRWxlbWVudCxcbiAgICAgIGNoaXAueCArIGNoaXAubWFyZ2luLCBjaGlwLnkgKyBjaGlwLm1hcmdpbixcbiAgICAgIGNoaXAudGlsZXdpZHRoLCBjaGlwLnRpbGVoZWlnaHQsXG4gICAgICB4LCB5LFxuICAgICAgY2hpcC50aWxld2lkdGgsIGNoaXAudGlsZWhlaWdodCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX3Byb3BlcnRpZXNUb0pTT05cbiAgICogWE1M44OX44Ot44OR44OG44Kj44KSSlNPTuOBq+WkieaPm+OBl+OBvuOBmeOAglxuICAgKlxuICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wcm9wZXJ0aWVzVG9KU09OOiBmdW5jdGlvbihlbG0pIHtcbiAgICB2YXIgcHJvcGVydGllcyA9IGVsbS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInByb3BlcnRpZXNcIilbMF07XG4gICAgdmFyIG9iaiA9IHt9O1xuICAgIGlmIChwcm9wZXJ0aWVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgcHJvcGVydGllcy5jaGlsZE5vZGVzLmxlbmd0aDsgaysrKSB7XG4gICAgICB2YXIgcCA9IHByb3BlcnRpZXMuY2hpbGROb2Rlc1trXTtcbiAgICAgIGlmIChwLnRhZ05hbWUgPT09IFwicHJvcGVydHlcIikge1xuICAgICAgICAvL3Byb3BlcnR544GrdHlwZeaMh+WumuOBjOOBguOBo+OBn+OCieWkieaPm1xuICAgICAgICB2YXIgdHlwZSA9IHAuZ2V0QXR0cmlidXRlKCd0eXBlJyk7XG4gICAgICAgIHZhciB2YWx1ZSA9IHAuZ2V0QXR0cmlidXRlKCd2YWx1ZScpO1xuICAgICAgICBpZiAoIXZhbHVlKSB2YWx1ZSA9IHAudGV4dENvbnRlbnQ7XG4gICAgICAgIGlmICh0eXBlID09IFwiaW50XCIpIHtcbiAgICAgICAgICBvYmpbcC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSBwYXJzZUludCh2YWx1ZSwgMTApO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJmbG9hdFwiKSB7XG4gICAgICAgICAgb2JqW3AuZ2V0QXR0cmlidXRlKCduYW1lJyldID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImJvb2xcIiApIHtcbiAgICAgICAgICBpZiAodmFsdWUgPT0gXCJ0cnVlXCIpIG9ialtwLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHRydWU7XG4gICAgICAgICAgZWxzZSBvYmpbcC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmpbcC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9wcm9wZXJ0aWVzVG9KU09OXG4gICAqIFhNTOWxnuaAp+aDheWgseOCkkpTT07jgavlpInmj5vjgZfjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYXR0clRvSlNPTjogZnVuY3Rpb24oc291cmNlKSB7XG4gICAgdmFyIG9iaiA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWwgPSBzb3VyY2UuYXR0cmlidXRlc1tpXS52YWx1ZTtcbiAgICAgIHZhbCA9IGlzTmFOKHBhcnNlRmxvYXQodmFsKSk/IHZhbDogcGFyc2VGbG9hdCh2YWwpO1xuICAgICAgb2JqW3NvdXJjZS5hdHRyaWJ1dGVzW2ldLm5hbWVdID0gdmFsO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9wcm9wZXJ0aWVzVG9KU09OX3N0clxuICAgKiBYTUzjg5fjg63jg5Hjg4bjgqPjgpJKU09O44Gr5aSJ5o+b44GX44CB5paH5a2X5YiX44Gn6L+U44GX44G+44GZ44CCXG4gICAqXG4gICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2F0dHJUb0pTT05fc3RyOiBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICB2YXIgb2JqID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2UuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbCA9IHNvdXJjZS5hdHRyaWJ1dGVzW2ldLnZhbHVlO1xuICAgICAgb2JqW3NvdXJjZS5hdHRyaWJ1dGVzW2ldLm5hbWVdID0gdmFsO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9wYXJzZVRpbGVzZXRzXG4gICAqIOOCv+OCpOODq+OCu+ODg+ODiOOBruODkeODvOOCueOCkuihjOOBhOOBvuOBmeOAglxuICAgKlxuICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wYXJzZVRpbGVzZXRzOiBmdW5jdGlvbih4bWwpIHtcbiAgICB2YXIgZWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGF0YSA9IFtdO1xuICAgIHZhciB0aWxlc2V0cyA9IHhtbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGlsZXNldCcpO1xuICAgIGVhY2guY2FsbCh0aWxlc2V0cywgZnVuY3Rpb24odGlsZXNldCkge1xuICAgICAgdmFyIHQgPSB7fTtcbiAgICAgIHZhciBwcm9wcyA9IHNlbGYuX3Byb3BlcnRpZXNUb0pTT04odGlsZXNldCk7XG4gICAgICBpZiAocHJvcHMuc3JjKSB7XG4gICAgICAgIHQuaW1hZ2UgPSBwcm9wcy5zcmM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0LmltYWdlID0gdGlsZXNldC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1hZ2UnKVswXS5nZXRBdHRyaWJ1dGUoJ3NvdXJjZScpO1xuICAgICAgfVxuICAgICAgLy/pgI/pgY7oibLoqK3lrprlj5blvpdcbiAgICAgIHQudHJhbnMgPSB0aWxlc2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWFnZScpWzBdLmdldEF0dHJpYnV0ZSgndHJhbnMnKTtcbiAgICAgIGlmICh0LnRyYW5zKSB7XG4gICAgICAgIHQudHJhbnNSID0gcGFyc2VJbnQodC50cmFucy5zdWJzdHJpbmcoMCwgMiksIDE2KTtcbiAgICAgICAgdC50cmFuc0cgPSBwYXJzZUludCh0LnRyYW5zLnN1YnN0cmluZygyLCA0KSwgMTYpO1xuICAgICAgICB0LnRyYW5zQiA9IHBhcnNlSW50KHQudHJhbnMuc3Vic3RyaW5nKDQsIDYpLCAxNik7XG4gICAgICB9XG5cbiAgICAgIGRhdGEucHVzaCh0KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfcGFyc2VMYXllcnNcbiAgICog44Os44Kk44Ok44O85oOF5aCx44Gu44OR44O844K544KS6KGM44GE44G+44GZ44CCXG4gICAqXG4gICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3BhcnNlTGF5ZXJzOiBmdW5jdGlvbih4bWwpIHtcbiAgICB2YXIgZWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoO1xuICAgIHZhciBkYXRhID0gW107XG5cbiAgICB2YXIgbWFwID0geG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwibWFwXCIpWzBdO1xuICAgIHZhciBsYXllcnMgPSBbXTtcbiAgICBlYWNoLmNhbGwobWFwLmNoaWxkTm9kZXMsIGZ1bmN0aW9uKGVsbSkge1xuICAgICAgaWYgKGVsbS50YWdOYW1lID09IFwibGF5ZXJcIiB8fCBlbG0udGFnTmFtZSA9PSBcIm9iamVjdGdyb3VwXCIgfHwgZWxtLnRhZ05hbWUgPT0gXCJpbWFnZWxheWVyXCIpIHtcbiAgICAgICAgbGF5ZXJzLnB1c2goZWxtKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGxheWVycy5lYWNoKGZ1bmN0aW9uKGxheWVyKSB7XG4gICAgICBzd2l0Y2ggKGxheWVyLnRhZ05hbWUpIHtcbiAgICAgICAgY2FzZSBcImxheWVyXCI6XG4gICAgICAgICAgLy/pgJrluLjjg6zjgqTjg6Tjg7xcbiAgICAgICAgICB2YXIgZCA9IGxheWVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdkYXRhJylbMF07XG4gICAgICAgICAgdmFyIGVuY29kaW5nID0gZC5nZXRBdHRyaWJ1dGUoXCJlbmNvZGluZ1wiKTtcbiAgICAgICAgICB2YXIgbCA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwibGF5ZXJcIixcbiAgICAgICAgICAgIG5hbWU6IGxheWVyLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChlbmNvZGluZyA9PSBcImNzdlwiKSB7XG4gICAgICAgICAgICBsLmRhdGEgPSB0aGlzLl9wYXJzZUNTVihkLnRleHRDb250ZW50KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGVuY29kaW5nID09IFwiYmFzZTY0XCIpIHtcbiAgICAgICAgICAgIGwuZGF0YSA9IHRoaXMuX3BhcnNlQmFzZTY0KGQudGV4dENvbnRlbnQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBhdHRyID0gdGhpcy5fYXR0clRvSlNPTihsYXllcik7XG4gICAgICAgICAgbC4kZXh0ZW5kKGF0dHIpO1xuICAgICAgICAgIGwucHJvcGVydGllcyA9IHRoaXMuX3Byb3BlcnRpZXNUb0pTT04obGF5ZXIpO1xuXG4gICAgICAgICAgZGF0YS5wdXNoKGwpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8v44Kq44OW44K444Kn44Kv44OI44Os44Kk44Ok44O8XG4gICAgICAgIGNhc2UgXCJvYmplY3Rncm91cFwiOlxuICAgICAgICAgIHZhciBsID0ge1xuICAgICAgICAgICAgdHlwZTogXCJvYmplY3Rncm91cFwiLFxuICAgICAgICAgICAgb2JqZWN0czogW10sXG4gICAgICAgICAgICBuYW1lOiBsYXllci5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpLFxuICAgICAgICAgICAgeDogcGFyc2VGbG9hdChsYXllci5nZXRBdHRyaWJ1dGUoXCJvZmZzZXR4XCIpKSB8fCAwLFxuICAgICAgICAgICAgeTogcGFyc2VGbG9hdChsYXllci5nZXRBdHRyaWJ1dGUoXCJvZmZzZXR5XCIpKSB8fCAwLFxuICAgICAgICAgICAgYWxwaGE6IGxheWVyLmdldEF0dHJpYnV0ZShcIm9wYWNpdHlcIikgfHwgMSxcbiAgICAgICAgICAgIGNvbG9yOiBsYXllci5nZXRBdHRyaWJ1dGUoXCJjb2xvclwiKSB8fCBudWxsLFxuICAgICAgICAgICAgZHJhd29yZGVyOiBsYXllci5nZXRBdHRyaWJ1dGUoXCJkcmF3b3JkZXJcIikgfHwgbnVsbCxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGwucHJvcGVydGllcyA9IHRoaXMuX3Byb3BlcnRpZXNUb0pTT04obGF5ZXIpO1xuXG4gICAgICAgICAgLy/jg6zjgqTjg6Tjg7zlhoXop6PmnpBcbiAgICAgICAgICBlYWNoLmNhbGwobGF5ZXIuY2hpbGROb2RlcywgZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgICAgICBpZiAoZWxtLm5vZGVUeXBlID09IDMpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBkID0gdGhpcy5fYXR0clRvSlNPTihlbG0pO1xuICAgICAgICAgICAgaWYgKGQuaWQgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgZC5wcm9wZXJ0aWVzID0gdGhpcy5fcHJvcGVydGllc1RvSlNPTihlbG0pO1xuICAgICAgICAgICAgLy/lrZDopoHntKDjga7op6PmnpBcbiAgICAgICAgICAgIGlmIChlbG0uY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgZWxtLmNoaWxkTm9kZXMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUubm9kZVR5cGUgPT0gMykgcmV0dXJuO1xuICAgICAgICAgICAgICAgIC8v5qWV5YaGXG4gICAgICAgICAgICAgICAgaWYgKGUubm9kZU5hbWUgPT0gJ2VsbGlwc2UnKSB7XG4gICAgICAgICAgICAgICAgICBkLmVsbGlwc2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL+WkmuinkuW9olxuICAgICAgICAgICAgICAgIGlmIChlLm5vZGVOYW1lID09ICdwb2x5Z29uJykge1xuICAgICAgICAgICAgICAgICAgZC5wb2x5Z29uID0gW107XG4gICAgICAgICAgICAgICAgICB2YXIgYXR0ciA9IHRoaXMuX2F0dHJUb0pTT05fc3RyKGUpO1xuICAgICAgICAgICAgICAgICAgdmFyIHBsID0gYXR0ci5wb2ludHMuc3BsaXQoXCIgXCIpO1xuICAgICAgICAgICAgICAgICAgcGwuZm9yRWFjaChmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHB0cyA9IHN0ci5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgIGQucG9seWdvbi5wdXNoKHt4OiBwYXJzZUZsb2F0KHB0c1swXSksIHk6IHBhcnNlRmxvYXQocHRzWzFdKX0pO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8v57ea5YiGXG4gICAgICAgICAgICAgICAgaWYgKGUubm9kZU5hbWUgPT0gJ3BvbHlsaW5lJykge1xuICAgICAgICAgICAgICAgICAgZC5wb2x5bGluZSA9IFtdO1xuICAgICAgICAgICAgICAgICAgdmFyIGF0dHIgPSB0aGlzLl9hdHRyVG9KU09OX3N0cihlKTtcbiAgICAgICAgICAgICAgICAgIHZhciBwbCA9IGF0dHIucG9pbnRzLnNwbGl0KFwiIFwiKTtcbiAgICAgICAgICAgICAgICAgIHBsLmZvckVhY2goZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwdHMgPSBzdHIuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgICAgICBkLnBvbHlsaW5lLnB1c2goe3g6IHBhcnNlRmxvYXQocHRzWzBdKSwgeTogcGFyc2VGbG9hdChwdHNbMV0pfSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsLm9iamVjdHMucHVzaChkKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgZGF0YS5wdXNoKGwpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8v44Kk44Oh44O844K444Os44Kk44Ok44O8XG4gICAgICAgIGNhc2UgXCJpbWFnZWxheWVyXCI6XG4gICAgICAgICAgdmFyIGwgPSB7XG4gICAgICAgICAgICB0eXBlOiBcImltYWdlbGF5ZXJcIixcbiAgICAgICAgICAgIG5hbWU6IGxheWVyLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG4gICAgICAgICAgICB4OiBwYXJzZUZsb2F0KGxheWVyLmdldEF0dHJpYnV0ZShcIm9mZnNldHhcIikpIHx8IDAsXG4gICAgICAgICAgICB5OiBwYXJzZUZsb2F0KGxheWVyLmdldEF0dHJpYnV0ZShcIm9mZnNldHlcIikpIHx8IDAsXG4gICAgICAgICAgICBhbHBoYTogbGF5ZXIuZ2V0QXR0cmlidXRlKFwib3BhY2l0eVwiKSB8fCAxLFxuICAgICAgICAgICAgdmlzaWJsZTogKGxheWVyLmdldEF0dHJpYnV0ZShcInZpc2libGVcIikgPT09IHVuZGVmaW5lZCB8fCBsYXllci5nZXRBdHRyaWJ1dGUoXCJ2aXNpYmxlXCIpICE9IDApLFxuICAgICAgICAgIH07XG4gICAgICAgICAgdmFyIGltYWdlRWxtID0gbGF5ZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJpbWFnZVwiKVswXTtcbiAgICAgICAgICBsLmltYWdlID0ge3NvdXJjZTogaW1hZ2VFbG0uZ2V0QXR0cmlidXRlKFwic291cmNlXCIpfTtcblxuICAgICAgICAgIGRhdGEucHVzaChsKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHJldHVybiBkYXRhO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9wZXJzZUNTVlxuICAgKiBDU1bjga7jg5Hjg7zjgrnjgpLooYzjgYTjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcGFyc2VDU1Y6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgZGF0YUxpc3QgPSBkYXRhLnNwbGl0KCcsJyk7XG4gICAgdmFyIGxheWVyID0gW107XG5cbiAgICBkYXRhTGlzdC5lYWNoKGZ1bmN0aW9uKGVsbSwgaSkge1xuICAgICAgdmFyIG51bSA9IHBhcnNlSW50KGVsbSwgMTApIC0gMTtcbiAgICAgIGxheWVyLnB1c2gobnVtKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBsYXllcjtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfcGVyc2VDU1ZcbiAgICogQkFTRTY044Gu44OR44O844K544KS6KGM44GE44G+44GZ44CCXG4gICAqXG4gICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgKiBodHRwOi8vdGhla2Fubm9uLXNlcnZlci5hcHBzcG90LmNvbS9oZXJwaXR5LWRlcnBpdHkuYXBwc3BvdC5jb20vcGFzdGViaW4uY29tLzc1S2tzMFdIXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcGFyc2VCYXNlNjQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgZGF0YUxpc3QgPSBhdG9iKGRhdGEudHJpbSgpKTtcbiAgICB2YXIgcnN0ID0gW107XG5cbiAgICBkYXRhTGlzdCA9IGRhdGFMaXN0LnNwbGl0KCcnKS5tYXAoZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuIGUuY2hhckNvZGVBdCgwKTtcbiAgICB9KTtcblxuICAgIGZvciAodmFyIGk9MCxsZW49ZGF0YUxpc3QubGVuZ3RoLzQ7IGk8bGVuOyArK2kpIHtcbiAgICAgIHZhciBuID0gZGF0YUxpc3RbaSo0XTtcbiAgICAgIHJzdFtpXSA9IHBhcnNlSW50KG4sIDEwKSAtIDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJzdDtcbiAgfSxcbn0pO1xuXG4vL+ODreODvOODgOODvOOBq+i/veWKoFxucGhpbmEuYXNzZXQuQXNzZXRMb2FkZXIuYXNzZXRMb2FkRnVuY3Rpb25zLnRteCA9IGZ1bmN0aW9uKGtleSwgcGF0aCkge1xuICB2YXIgdG14ID0gcGhpbmEuYXNzZXQuVGlsZWRNYXAoKTtcbiAgcmV0dXJuIHRteC5sb2FkKHBhdGgpO1xufTtcbiIsInBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoXCJBcHBsaWNhdGlvblwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJDYW52YXNBcHBcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdXBlckluaXQoe1xuICAgICAgICBxdWVyeTogJyN3b3JsZCcsXG4gICAgICAgIHdpZHRoOiBTQ19XLFxuICAgICAgICBoZWlnaHQ6IFNDX0gsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMSknLFxuICAgICAgfSk7XG4gICAgICB0aGlzLmZwcyA9IDMwO1xuICAgIH0sXG5cbiAgICBfb25Mb2FkQXNzZXRzOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuICB9KTtcblxufSk7IiwiLypcbiAqICBBc3NldExpc3QuanNcbiAqICAyMDE4LzA5LzIwXG4gKiBcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQXNzZXRMaXN0XCIsIHtcbiAgICBfc3RhdGljOiB7XG4gICAgICBsb2FkZWQ6IFtdLFxuICAgICAgaXNMb2FkZWQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICByZXR1cm4gQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdPyB0cnVlOiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgQXNzZXRMaXN0LmxvYWRlZFtvcHRpb25zLmFzc2V0VHlwZV0gPSB0cnVlO1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMuYXNzZXRUeXBlKSB7XG4gICAgICAgICAgY2FzZSBcInNwbGFzaFwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgICBcImFjdG9yNFwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNC5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yMTlcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjE5LnBuZ1wiLFxuICAgICAgICAgICAgICAgIFwiYWN0b3I0MFwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNDAucG5nXCIsXG4gICAgICAgICAgICAgICAgXCJhY3RvcjU1XCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3I1NS5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yNjRcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjY0X2EucG5nXCIsXG4gICAgICAgICAgICAgICAgXCJhY3RvcjY0MlwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNjRfYi5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yMTA4XCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3IxMDgucG5nXCIsXG4gICAgICAgICAgICAgICAgXCJhY3RvcjExMVwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yMTExLnBuZ1wiLFxuICAgICAgICAgICAgICAgIFwiYWN0b3IxMTJcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjExMi5wbmdcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSBcImNvbW1vblwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgICBcImFjdG9yNFwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNC5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yMTlcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjE5LnBuZ1wiLFxuICAgICAgICAgICAgICAgIFwiYWN0b3I0MFwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNDAucG5nXCIsXG4gICAgICAgICAgICAgICAgXCJhY3RvcjU1XCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3I1NS5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yNjRcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjY0X2EucG5nXCIsXG4gICAgICAgICAgICAgICAgXCJhY3RvcjY0MlwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNjRfYi5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yMTA4XCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3IxMDgucG5nXCIsXG4gICAgICAgICAgICAgICAgXCJhY3RvcjExMVwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yMTExLnBuZ1wiLFxuICAgICAgICAgICAgICAgIFwiYWN0b3IxMTJcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjExMi5wbmdcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IFwiaW52YWxpZCBhc3NldFR5cGU6IFwiICsgb3B0aW9ucy5hc3NldFR5cGU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbn0pO1xuIiwiLypcbiAqICBCZW5yaS5qc1xuICogIDIwMTQvMTIvMThcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG4gXG52YXIgdG9SYWQgPSAzLjE0MTU5LzE4MDsgIC8v5byn5bqm5rOVdG/jg6njgrjjgqLjg7PlpInmj5tcbnZhciB0b0RlZyA9IDE4MC8zLjE0MTU5OyAgLy/jg6njgrjjgqLjg7N0b+W8p+W6puazleWkieaPm1xuXG4vL+i3nembouioiOeul1xudmFyIGRpc3RhbmNlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgdmFyIHggPSBmcm9tLngtdG8ueDtcbiAgdmFyIHkgPSBmcm9tLnktdG8ueTtcbiAgcmV0dXJuIE1hdGguc3FydCh4KngreSp5KTtcbn1cblxuLy/ot53pm6LoqIjnrpfvvIjjg6vjg7zjg4jnhKHjgZfniYjvvIlcbnZhciBkaXN0YW5jZVNxID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgdmFyIHggPSBmcm9tLnggLSB0by54O1xuICB2YXIgeSA9IGZyb20ueSAtIHRvLnk7XG4gIHJldHVybiB4KngreSp5O1xufVxuXG4vL+aVsOWApOOBruWItumZkFxudmFyIGNsYW1wID0gZnVuY3Rpb24oeCwgbWluLCBtYXgpIHtcbiAgcmV0dXJuICh4PG1pbik/bWluOigoeD5tYXgpP21heDp4KTtcbn07XG5cbi8v5Lmx5pWw55Sf5oiQXG52YXIgcHJhbmQgPSBwaGluYS51dGlsLlJhbmRvbSgpO1xudmFyIHJhbmQgPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICByZXR1cm4gcHJhbmQucmFuZGludChtaW4sIG1heCk7XG59XG5cbi8v44K/44Kk44OI44Or54Sh44GX44OA44Kk44Ki44Ot44KwXG52YXIgQWR2YW5jZUFsZXJ0ID0gZnVuY3Rpb24oc3RyKSB7XG4gIHZhciB0bXBGcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICB0bXBGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdkYXRhOnRleHQvcGxhaW4sJyk7XG4gIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0bXBGcmFtZSk7XG5cbiAgd2luZG93LmZyYW1lc1swXS53aW5kb3cuYWxlcnQoc3RyKTtcbiAgdG1wRnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0bXBGcmFtZSk7XG59O1xudmFyIEFkdmFuY2VDb25maXJtID0gZnVuY3Rpb24oc3RyKSB7XG4gIHZhciB0bXBGcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICB0bXBGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdkYXRhOnRleHQvcGxhaW4sJyk7XG4gIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0bXBGcmFtZSk7XG5cbiAgdmFyIHJlc3VsdCA9IHdpbmRvdy5mcmFtZXNbMF0ud2luZG93LmNvbmZpcm0oc3RyKTtcbiAgdG1wRnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0bXBGcmFtZSk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvKlxuICogIE1haW5TY2VuZS5qc1xuICogIDIwMTgvMDkvMjBcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiTWFpblNjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiAnRGlzcGxheVNjZW5lJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3VwZXJJbml0KHt3aWR0aDogU0NfVywgaGVpZ2h0OiBTQ19IfSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfSxcbiAgfSk7XG5cbn0pOyIsIi8qXG4gKiAgU2NlbmVGbG93LmpzXG4gKiAgMjAxOC8wOS8yMFxuICpcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgLy/jg6HjgqTjg7Pjgrfjg7zjg7Pjg5Xjg63jg7xcbiAgcGhpbmEuZGVmaW5lKFwiTWFpblNjZW5lRmxvd1wiLCB7XG4gICAgc3VwZXJDbGFzczogXCJNYW5hZ2VyU2NlbmVcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgc3RhcnRMYWJlbCA9IG9wdGlvbnMuc3RhcnRMYWJlbCB8fCBcInNwbGFzaFwiO1xuICAgICAgdGhpcy5zdXBlckluaXQoe1xuICAgICAgICBzdGFydExhYmVsOiBzdGFydExhYmVsLFxuICAgICAgICBzY2VuZXM6IFt7XG4gICAgICAgICAgbGFiZWw6IFwic3BsYXNoXCIsXG4gICAgICAgICAgY2xhc3NOYW1lOiBcIlNwbGFzaFNjZW5lXCIsXG4gICAgICAgIH0se1xuICAgICAgICAgIGxhYmVsOiBcIm1haW5cIixcbiAgICAgICAgICBjbGFzc05hbWU6IFwiTWFpblNjZW5lXCIsXG4gICAgICAgICAgLy8gbmV4dExhYmVsOiBcInRpdGxlXCIsXG4gICAgICAgIH1dLFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxufSk7IiwiLypcbiAqICBTcGxhc2hTY2VuZS5qc1xuICogIDIwMTgvMDkvMjBcbiAqXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZSgnU3BsYXNoU2NlbmUnLCB7XG4gICAgc3VwZXJDbGFzczogJ0Rpc3BsYXlTY2VuZScsXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3VwZXJJbml0KHsgd2lkdGg6IFNDX1csIGhlaWdodDogU0NfSCB9KTtcblxuICAgICAgdGhpcy51bmxvY2sgPSBmYWxzZTtcbiAgICAgIHRoaXMubG9hZGNvbXBsZXRlMSA9IGZhbHNlO1xuICAgICAgdGhpcy5wcm9ncmVzczEgPSAwO1xuXG4gICAgICAvL3ByZWxvYWQgYXNzZXRcbiAgICAgIHZhciBhc3NldHMgPSBBc3NldExpc3QuZ2V0KHsgYXNzZXRUeXBlOiBcInNwbGFzaFwiIH0pO1xuICAgICAgdGhpcy5sb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgICAgdGhpcy5sb2FkZXIubG9hZChhc3NldHMpO1xuICAgICAgdGhpcy5sb2FkZXIub24oJ2xvYWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLmxvYWRjb21wbGV0ZTEgPSB0cnVlO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgIHRoaXMubG9hZGVyLm9uKCdwcm9ncmVzcycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHRoaXMucHJvZ3Jlc3MxID0gTWF0aC5mbG9vcihlLnByb2dyZXNzKjEwMCk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAvL2xvZ29cbiAgICAgIHZhciB0ZXh0dXJlID0gcGhpbmEuYXNzZXQuVGV4dHVyZSgpO1xuICAgICAgdGV4dHVyZS5sb2FkKFNwbGFzaFNjZW5lLmxvZ28pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZTtcbiAgICB9LFxuXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zcHJpdGUgPSBwaGluYS5kaXNwbGF5LlNwcml0ZSh0aGlzLnRleHR1cmUpXG4gICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgLnNldFBvc2l0aW9uKHRoaXMuZ3JpZFguY2VudGVyKCksIHRoaXMuZ3JpZFkuY2VudGVyKCkpXG4gICAgICAuc2V0U2NhbGUoMC4zKTtcbiAgICAgIHRoaXMuc3ByaXRlLmFscGhhID0gMDtcblxuICAgICAgdGhpcy5zcHJpdGUudHdlZW5lci5jbGVhcigpXG4gICAgICAudG8oe2FscGhhOjF9LCA1MDAsICdlYXNlT3V0Q3ViaWMnKVxuICAgICAgLndhaXQoNTAwKVxuICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMudW5sb2NrID0gdHJ1ZTtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAvL+mAsuaNl+OCsuODvOOCuFxuICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICB3aWR0aDogIFNDX1cgKiAwLjEsXG4gICAgICBoZWlnaHQ6IDMsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICBmaWxsOiAncmVkJyxcbiAgICAgIHN0cm9rZTogJ3doaXRlJyxcbiAgICAgIHN0cm9rZVdpZHRoOiAxLFxuICAgICAgZ2F1Z2VDb2xvcjogJ2xpbWUnLFxuICAgICAgY29ybmVyUmFkaXVzOiAzLFxuICAgICAgdmFsdWU6IDAsXG4gICAgICBtYXhWYWx1ZTogMTAwLFxuICAgICAgfTtcbiAgICAgIHRoaXMucHJvZ3Jlc3NHYXVnZSA9IHBoaW5hLnVpLkdhdWdlKG9wdGlvbnMpLmFkZENoaWxkVG8odGhpcykuc2V0UG9zaXRpb24oU0NfVyAqIDAuNSwgU0NfSCAqIDAuOCk7XG4gICAgICB0aGlzLnByb2dyZXNzR2F1Z2UuYmVmb3JlVmFsdWUgPSAwO1xuICAgICAgdGhpcy5wcm9ncmVzc0dhdWdlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoYXQucHJvZ3Jlc3MxID09IHRoaXMuYmVmb3JlVmFsdWUpIHtcbiAgICAgICAgdGhpcy52YWx1ZSsrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoYXQucHJvZ3Jlc3MxO1xuICAgICAgfVxuICAgICAgdGhpcy5iZWZvcmVWYWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudW5sb2NrICYmIHRoaXMubG9hZGNvbXBsZXRlMSkge1xuICAgICAgdGhpcy51bmxvY2sgPSBmYWxzZTtcbiAgICAgIHRoaXMuc3ByaXRlLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAudG8oe2FscGhhOjB9LCA1MDAsICdlYXNlT3V0Q3ViaWMnKVxuICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5leGl0KCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgdGhpcy5wcm9ncmVzc0dhdWdlLnR3ZWVuZXIuY2xlYXIoKS50byh7YWxwaGE6MH0sIDEwLCAnZWFzZU91dEN1YmljJylcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX3N0YXRpYzoge1xuICAgICAgbG9nbzogXCJhc3NldHMvaW1hZ2VzL3BoaW5hanNfbG9nby5wbmdcIixcbiAgICB9LFxuICB9KTtcblxufSk7IiwiLypcbiAqICB0aXRsZXNjZW5lLmpzXG4gKiAgMjAxOC8wOS8yMFxuICpcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiVGl0bGVTY2VuZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJEaXNwbGF5U2NlbmVcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdXBlckluaXQoe3dpZHRoOiBTQ19XLCBoZWlnaHQ6IFNDX0h9KTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuICB9KTtcblxufSk7IiwiLypcbiAqICBDaGFyYWN0ZXIuanNcbiAqICAyMDE4LzA5LzIwXG4gKiAg44Kt44Oj44Op44Kv44K/566h55CG55So44OZ44O844K544Kv44Op44K5XG4gKiAg44Ky44O844Og5YaF44Gu44Kt44Oj44Op44Kv44K/44Gv5YWo44Gm44GT44Gu44Kv44Op44K544GL44KJ5rS+55Sf44GZ44KLXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkNoYXJhY3RlclwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJEaXNwbGF5RWxlbWVudFwiLFxuXG4gICAgY2hhcmFjdGVyVHlwZTogbnVsbCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICB9LFxuICB9KTtcblxufSk7IiwiLypcbiAqICBQbGF5ZXIuanNcbiAqICAyMDE4LzA5LzIwXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIlBsYXllclwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJDaGFyYWN0ZXJcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudFNjZW5lKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdChwYXJlbnRTY2VuZSwge3dpZHRoOiAxNiwgaGVpZ2h0OiAyMH0pO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG4gIH0pO1xuXG59KTtcbiJdfQ==
