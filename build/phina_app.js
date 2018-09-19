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

  var tw  = width || this.width;      // tw
  var th  = height || this.height;    // th
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
 *     p1 = phina.geom.Vector2(100, 100);
 *     p2 = phina.geom.Vector2(200, 200);
 *     p3 = phina.geom.Vector2(150, 240);
 *     p4 = phina.geom.Vector2(200, 100);
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
 *     rect = phina.geom.Rect(120, 130, 40, 50);
 *     p1 = phina.geom.Vector2(100, 100);
 *     p2 = phina.geom.Vector2(200, 200);
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
    var r1 = phina.geom.Vector2(rect.left, rect.top);     //左上
    var r2 = phina.geom.Vector2(rect.right, rect.top);    //右上
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
//                    resolve(self);
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

phina.globalize();

phina.main(function() {
  const app = GameApp({
    startLabel: 'main',
  });
  app.enableStats();
  app.run();
});

phina.define("MainScene", {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit();
  },
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAwMF9wbHVnaW5zL3BoaW5hLmFzc2V0bG9hZGVyZXguanMiLCIwMDBfcGx1Z2lucy9waGluYS5leHRlbnNpb24uanMiLCIwMDBfcGx1Z2lucy9waGluYS50aWxlZG1hcC5qcyIsIjAwMF9wbHVnaW5zL3NvdW5kc2V0LmpzIiwiMDEwX2FwcGxpY2F0aW9uL0FwcGxpY2F0aW9uLmpzIiwiMDIwX3NjZW5lL01haW5TY2VuZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdG5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwaGluYV9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogIHBoaW5hLmFzc2V0bG9hZGVyZXguanNcbiAqICAyMDE2LzExLzI1XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxucGhpbmEuZXh0ZW5zaW9uID0gcGhpbmEuZXh0ZW5zaW9uIHx8IHt9O1xuXG4vL+ODkOODg+OCr+OCsOODqeOCpuODs+ODieOBp+OCouOCu+ODg+ODiOiqreOBv+i+vOOBv1xucGhpbmEuZGVmaW5lKFwicGhpbmEuZXh0ZW5zaW9uLkFzc2V0TG9hZGVyRXhcIiwge1xuXG4gICAgLy/pgLLmjZdcbiAgICBsb2FkcHJvZ3Jlc3M6IDAsXG5cbiAgICAvL+iqreOBv+i+vOOBv+e1guS6huODleODqeOCsFxuICAgIGxvYWRjb21wbGV0ZTogZmFsc2UsXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgbG9hZDogZnVuY3Rpb24oYXNzZXRzLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLl9vbkxvYWRBc3NldHMgPSBjYWxsYmFjayB8fCBmdW5jdGlvbigpe307XG4gICAgICAgIHZhciBsb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgICAgICBsb2FkZXIubG9hZChhc3NldHMpO1xuICAgICAgICBsb2FkZXIub24oJ2xvYWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRjb21wbGV0ZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9vbkxvYWRBc3NldHMoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgbG9hZGVyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRwcm9ncmVzcyA9IGUucHJvZ3Jlc3M7XG4gICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqICBwaGluYS5leHRlbnNpb24uanNcbiAqICAyMDE2LzExLzI1XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxucGhpbmEuZXh0ZW5zaW9uID0gcGhpbmEuZXh0ZW5zaW9uIHx8IHt9O1xuXG4vL3NldEFscGhh44KS6L+95YqgXG5waGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50LnByb3RvdHlwZS5zZXRBbHBoYSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHRoaXMuYWxwaGEgPSB2YWw7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL+OCueODl+ODqeOCpOODiOapn+iDveaLoeW8tVxucGhpbmEuZGlzcGxheS5TcHJpdGUucHJvdG90eXBlLnNldEZyYW1lVHJpbW1pbmcgPSBmdW5jdGlvbih4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHRoaXMuX2ZyYW1lVHJpbVggPSB4IHx8IDA7XG4gIHRoaXMuX2ZyYW1lVHJpbVkgPSB5IHx8IDA7XG4gIHRoaXMuX2ZyYW1lVHJpbVdpZHRoID0gd2lkdGggfHwgdGhpcy5pbWFnZS5kb21FbGVtZW50LndpZHRoIC0gdGhpcy5fZnJhbWVUcmltWDtcbiAgdGhpcy5fZnJhbWVUcmltSGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMuaW1hZ2UuZG9tRWxlbWVudC5oZWlnaHQgLSB0aGlzLl9mcmFtZVRyaW1ZO1xuICByZXR1cm4gdGhpcztcbn1cblxucGhpbmEuZGlzcGxheS5TcHJpdGUucHJvdG90eXBlLnNldEZyYW1lSW5kZXggPSBmdW5jdGlvbihpbmRleCwgd2lkdGgsIGhlaWdodCkge1xuICB2YXIgc3ggPSB0aGlzLl9mcmFtZVRyaW1YIHx8IDA7XG4gIHZhciBzeSA9IHRoaXMuX2ZyYW1lVHJpbVkgfHwgMDtcbiAgdmFyIHN3ID0gdGhpcy5fZnJhbWVUcmltV2lkdGggIHx8ICh0aGlzLmltYWdlLmRvbUVsZW1lbnQud2lkdGgtc3gpO1xuICB2YXIgc2ggPSB0aGlzLl9mcmFtZVRyaW1IZWlnaHQgfHwgKHRoaXMuaW1hZ2UuZG9tRWxlbWVudC5oZWlnaHQtc3kpO1xuXG4gIHZhciB0dyAgPSB3aWR0aCB8fCB0aGlzLndpZHRoOyAgICAgIC8vIHR3XG4gIHZhciB0aCAgPSBoZWlnaHQgfHwgdGhpcy5oZWlnaHQ7ICAgIC8vIHRoXG4gIHZhciByb3cgPSB+fihzdyAvIHR3KTtcbiAgdmFyIGNvbCA9IH5+KHNoIC8gdGgpO1xuICB2YXIgbWF4SW5kZXggPSByb3cqY29sO1xuICBpbmRleCA9IGluZGV4JW1heEluZGV4O1xuXG4gIHZhciB4ICAgPSBpbmRleCVyb3c7XG4gIHZhciB5ICAgPSB+fihpbmRleC9yb3cpO1xuICB0aGlzLnNyY1JlY3QueCA9IHN4K3gqdHc7XG4gIHRoaXMuc3JjUmVjdC55ID0gc3kreSp0aDtcbiAgdGhpcy5zcmNSZWN0LndpZHRoICA9IHR3O1xuICB0aGlzLnNyY1JlY3QuaGVpZ2h0ID0gdGg7XG5cbiAgdGhpcy5fZnJhbWVJbmRleCA9IGluZGV4O1xuXG4gIHJldHVybiB0aGlzO1xufVxuXG4vL+OCqOODrOODoeODs+ODiOWQjOWjq+OBruaOpeinpuWIpOWumlxucGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudC5wcm90b3R5cGUuaXNIaXRFbGVtZW50ID0gZnVuY3Rpb24oZWxtKSB7XG4gICAgLy/oh6rliIbjgajjg4bjgrnjg4jlr77osaHjgpLjgrDjg63jg7zjg5Djg6vjgbjlpInmj5tcbiAgICB2YXIgcCA9IHRoaXMuZ2xvYmFsVG9Mb2NhbChlbG0pO1xuICAgIHZhciB0YXJnZXQgPSBwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50KHt3aWR0aDogZWxtLndpZHRoLCBoZWlnaHQ6IGVsbS5oZWlnaHR9KS5zZXRQb3NpdGlvbihwLngsIHAueSk7XG5cbiAgICBpZiAodGhpcy5ib3VuZGluZ1R5cGUgPT0gJ3JlY3QnKSB7XG4gICAgICAgIGlmIChlbG0uYm91bmRpbmdUeXBlID09ICdyZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RSZWN0UmVjdCh0aGlzLCB0YXJnZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RSZWN0Q2lyY2xlKHRoaXMsIHRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZWxtLmJvdW5kaW5nVHlwZSA9PSAncmVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0Q2llY2xlUmVjdCh0aGlzLCB0YXJnZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RDaXJjbGVDaXJjbGUodGhpcywgdGFyZ2V0KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy/lrZDopoHntKDlhajjgabliIfjgorpm6LjgZdcbnBoaW5hLmFwcC5FbGVtZW50LnByb3RvdHlwZS5yZW1vdmVDaGlsZHJlbiA9IGZ1bmN0aW9uKGJlZ2luSW5kZXgpIHtcbiAgICBiZWdpbkluZGV4ID0gYmVnaW5JbmRleCB8fCAwO1xuICAgIHZhciB0ZW1wQ2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuLnNsaWNlKCk7XG4gICAgdmFyIGxlbiA9IGxlbiA9IHRlbXBDaGlsZHJlbi5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IGJlZ2luSW5kZXg7IGkgPCBsZW47ICsraSkge1xuICAgICAgICB0ZW1wQ2hpbGRyZW5baV0ucmVtb3ZlKCk7XG4gICAgfVxuICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcbn1cblxuLyoqXG4gKiBAbWV0aG9kIHRlc3RMaW5lTGluZVxuICogQHN0YXRpY1xuICogMuOBpOOBrue3muWIhuOBjOmHjeOBquOBo+OBpuOBhOOCi+OBi+OBqeOBhuOBi+OCkuWIpOWumuOBl+OBvuOBmVxuICog5Y+C6ICD77yaaHR0cDovL3d3dzVkLmJpZ2xvYmUubmUuanAvfnRvbW95YTAzL3NodG1sL2FsZ29yaXRobS9JbnRlcnNlY3Rpb24uaHRtXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqICAgICBwMSA9IHBoaW5hLmdlb20uVmVjdG9yMigxMDAsIDEwMCk7XG4gKiAgICAgcDIgPSBwaGluYS5nZW9tLlZlY3RvcjIoMjAwLCAyMDApO1xuICogICAgIHAzID0gcGhpbmEuZ2VvbS5WZWN0b3IyKDE1MCwgMjQwKTtcbiAqICAgICBwNCA9IHBoaW5hLmdlb20uVmVjdG9yMigyMDAsIDEwMCk7XG4gKiBwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0TGluZUxpbmUocDEsIHAyLCBwMywgcDQpOyAvLyA9PiB0cnVlXG4gKlxuICogQHBhcmFtIHtwaGluYS5nZW9tLlZlY3RvcjJ9IHAxIOe3muWIhjHjga7nq6/jga7luqfmqJlcbiAqIEBwYXJhbSB7cGhpbmEuZ2VvbS5WZWN0b3IyfSBwMiDnt5rliIYx44Gu56uv44Gu5bqn5qiZXG4gKiBAcGFyYW0ge3BoaW5hLmdlb20uVmVjdG9yMn0gcDMg57ea5YiGMuOBruerr+OBruW6p+aomVxuICogQHBhcmFtIHtwaGluYS5nZW9tLlZlY3RvcjJ9IHA0IOe3muWIhjLjga7nq6/jga7luqfmqJlcbiAqIEByZXR1cm4ge0Jvb2xlYW59IOe3muWIhjHjgajnt5rliIYy44GM6YeN44Gq44Gj44Gm44GE44KL44GL44Gp44GG44GLXG4gKi9cbnBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RMaW5lTGluZSA9IGZ1bmN0aW9uKHAxLCBwMiwgcDMsIHA0KSB7XG4gIC8v5ZCM5LiA77y477y56Lu45LiK44Gr5LmX44Gj44Gm44KL5aC05ZCI44Gu6Kqk5Yik5a6a5Zue6YG/XG4gIGlmIChwMS54ID09IHAyLnggJiYgcDEueCA9PSBwMy54ICYmIHAxLnggPT0gcDQueCkge1xuICAgIHZhciBtaW4gPSBNYXRoLm1pbihwMS55LCBwMi55KTtcbiAgICB2YXIgbWF4ID0gTWF0aC5tYXgocDEueSwgcDIueSk7XG4gICAgaWYgKG1pbiA8PSBwMy55ICYmIHAzLnkgPD0gbWF4IHx8IG1pbiA8PSBwNC55ICYmIHA0LnkgPD0gbWF4KSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHAxLnkgPT0gcDIueSAmJiBwMS55ID09IHAzLnkgJiYgcDEueSA9PSBwNC55KSB7XG4gICAgdmFyIG1pbiA9IE1hdGgubWluKHAxLngsIHAyLngpO1xuICAgIHZhciBtYXggPSBNYXRoLm1heChwMS54LCBwMi54KTtcbiAgICBpZiAobWluIDw9IHAzLnggJiYgcDMueCA8PSBtYXggfHwgbWluIDw9IHA0LnggJiYgcDQueCA8PSBtYXgpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgYSA9IChwMS54IC0gcDIueCkgKiAocDMueSAtIHAxLnkpICsgKHAxLnkgLSBwMi55KSAqIChwMS54IC0gcDMueCk7XG4gIHZhciBiID0gKHAxLnggLSBwMi54KSAqIChwNC55IC0gcDEueSkgKyAocDEueSAtIHAyLnkpICogKHAxLnggLSBwNC54KTtcbiAgdmFyIGMgPSAocDMueCAtIHA0LngpICogKHAxLnkgLSBwMy55KSArIChwMy55IC0gcDQueSkgKiAocDMueCAtIHAxLngpO1xuICB2YXIgZCA9IChwMy54IC0gcDQueCkgKiAocDIueSAtIHAzLnkpICsgKHAzLnkgLSBwNC55KSAqIChwMy54IC0gcDIueCk7XG4gIHJldHVybiBhICogYiA8PSAwICYmIGMgKiBkIDw9IDA7XG59XG5cbi8qKlxuICogQG1ldGhvZCB0ZXN0UmVjdExpbmVcbiAqIEBzdGF0aWNcbiAqIOefqeW9ouOBqOe3muWIhuOBjOmHjeOBquOBo+OBpuOBhOOCi+OBi+OBqeOBhuOBi+OCkuWIpOWumuOBl+OBvuOBmVxuICpcbiAqICMjIyBFeGFtcGxlXG4gKiAgICAgcmVjdCA9IHBoaW5hLmdlb20uUmVjdCgxMjAsIDEzMCwgNDAsIDUwKTtcbiAqICAgICBwMSA9IHBoaW5hLmdlb20uVmVjdG9yMigxMDAsIDEwMCk7XG4gKiAgICAgcDIgPSBwaGluYS5nZW9tLlZlY3RvcjIoMjAwLCAyMDApO1xuICogcGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdFJlY3RMaW5lKHJlY3QsIHAxLCBwMik7IC8vID0+IHRydWVcbiAqXG4gKiBAcGFyYW0ge3BoaW5hLmdlb20uUmVjdH0gcmVjdCDnn6nlvaLpoJjln5/jgqrjg5bjgrjjgqfjgq/jg4hcbiAqIEBwYXJhbSB7cGhpbmEuZ2VvbS5WZWN0b3IyfSBwMSDnt5rliIbjga7nq6/jga7luqfmqJlcbiAqIEBwYXJhbSB7cGhpbmEuZ2VvbS5WZWN0b3IyfSBwMiDnt5rliIbjga7nq6/jga7luqfmqJlcbiAqIEByZXR1cm4ge0Jvb2xlYW59IOefqeW9ouOBqOe3muWIhuOBjOmHjeOBquOBo+OBpuOBhOOCi+OBi+OBqeOBhuOBi1xuICovXG5waGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0UmVjdExpbmUgPSBmdW5jdGlvbihyZWN0LCBwMSwgcDIpIHtcbiAgICAvL+WMheWQq+WIpOWumihwMeOBjOWQq+OBvuOCjOOBpuOCjOOBsOiJr+OBhOOBruOBp3Ay44Gu5Yik5a6a44Gv44GX44Gq44GE77yJXG4gICAgaWYgKHJlY3QubGVmdCA8PSBwMS54ICYmIHAxLnggPD0gcmVjdC5yaWdodCAmJiByZWN0LnRvcCA8PSBwMS55ICYmIHAxLnkgPD0gcmVjdC5ib3R0b20gKSByZXR1cm4gdHJ1ZTtcblxuICAgIC8v55+p5b2i44Gu77yU54K5XG4gICAgdmFyIHIxID0gcGhpbmEuZ2VvbS5WZWN0b3IyKHJlY3QubGVmdCwgcmVjdC50b3ApOyAgICAgLy/lt6bkuIpcbiAgICB2YXIgcjIgPSBwaGluYS5nZW9tLlZlY3RvcjIocmVjdC5yaWdodCwgcmVjdC50b3ApOyAgICAvL+WPs+S4ilxuICAgIHZhciByMyA9IHBoaW5hLmdlb20uVmVjdG9yMihyZWN0LnJpZ2h0LCByZWN0LmJvdHRvbSk7IC8v5Y+z5LiLXG4gICAgdmFyIHI0ID0gcGhpbmEuZ2VvbS5WZWN0b3IyKHJlY3QubGVmdCwgcmVjdC5ib3R0b20pOyAgLy/lt6bkuItcblxuICAgIC8v55+p5b2i44Gu77yU6L6644KS44Gq44GZ57ea5YiG44Go44Gu5o6l6Kem5Yik5a6aXG4gICAgaWYgKHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RMaW5lTGluZShwMSwgcDIsIHIxLCByMikpIHJldHVybiB0cnVlO1xuICAgIGlmIChwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0TGluZUxpbmUocDEsIHAyLCByMiwgcjMpKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAocGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdExpbmVMaW5lKHAxLCBwMiwgcjMsIHI0KSkgcmV0dXJuIHRydWU7XG4gICAgaWYgKHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RMaW5lTGluZShwMSwgcDIsIHIxLCByNCkpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbn1cblxuXG4vL+WGhuW8p+OBruaPj+eUu1xucGhpbmEuZGVmaW5lKCdwaGluYS5kaXNwbGF5LkFyY1NoYXBlJywge1xuICBzdXBlckNsYXNzOiAncGhpbmEuZGlzcGxheS5TaGFwZScsXG5cbiAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSAoe30pLiRzYWZlKG9wdGlvbnMsIHtcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgIGZpbGw6ICdyZWQnLFxuICAgICAgc3Ryb2tlOiAnI2FhYScsXG4gICAgICBzdHJva2VXaWR0aDogNCxcbiAgICAgIHJhZGl1czogMzIsXG4gICAgICBzdGFydEFuZ2xlOiAwLFxuICAgICAgZW5kQW5nbGU6IDI3MCxcblxuICAgICAgYW50aWNsb2Nrd2lzZTogZmFsc2UsXG4gICAgfSk7XG4gICAgdGhpcy5zdXBlckluaXQob3B0aW9ucyk7XG5cbiAgICB0aGlzLnJhZGl1cyA9IG9wdGlvbnMucmFkaXVzO1xuICAgIHRoaXMuc3RhcnRBbmdsZSA9IG9wdGlvbnMuc3RhcnRBbmdsZTtcbiAgICB0aGlzLmVuZEFuZ2xlID0gb3B0aW9ucy5lbmRBbmdsZTtcbiAgICB0aGlzLmFudGljbG9ja3dpc2UgPSBvcHRpb25zLmFudGljbG9ja3dpc2U7XG5cbiAgICB0aGlzLnNldEJvdW5kaW5nVHlwZSgnY2lyY2xlJyk7XG4gIH0sXG5cbiAgcHJlcmVuZGVyOiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICBjYW52YXMuZmlsbFBpZSgwLCAwLCB0aGlzLnJhZGl1cywgdGhpcy5zdGFydEFuZ2xlLCB0aGlzLmVuZEFuZ2xlKTtcbiAgfSxcbn0pO1xuIiwiLypcbiAqICBwaGluYS50aWxlZG1hcC5qc1xuICogIDIwMTYvMDkvMTBcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG4vKipcbiAqIEBjbGFzcyBwaGluYS5hc3NldC5UaWxlZE1hcFxuICogQGV4dGVuZHMgcGhpbmEuYXNzZXQuQXNzZXRcbiAqICMgVGlsZWRNYXBFZGl0b3LjgafkvZzmiJDjgZfjgZ90bXjjg5XjgqHjgqTjg6vjgpLoqq3jgb/ovrzjgb/jgq/jg6njgrlcbiAqL1xucGhpbmEuZGVmaW5lKFwicGhpbmEuYXNzZXQuVGlsZWRNYXBcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuYXNzZXQuQXNzZXRcIixcblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBpbWFnZVxuICAgICAqIOS9nOaIkOOBleOCjOOBn+ODnuODg+ODl+eUu+WDj1xuICAgICAqL1xuICAgIGltYWdlOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IHRpbGVzZXRzXG4gICAgICog44K/44Kk44Or44K744OD44OI5oOF5aCxXG4gICAgICovXG4gICAgdGlsZXNldHM6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgbGF5ZXJzXG4gICAgICog44Os44Kk44Ok44O85oOF5aCx44GM5qC857SN44GV44KM44Gm44GE44KL6YWN5YiXXG4gICAgICovXG4gICAgbGF5ZXJzOiBudWxsLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgfSxcblxuICAgIF9sb2FkOiBmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIC8v44OR44K55oqc44GN5Ye644GXXG4gICAgICAgIHRoaXMucGF0aCA9IFwiXCI7XG4gICAgICAgIHZhciBsYXN0ID0gdGhpcy5zcmMubGFzdEluZGV4T2YoXCIvXCIpO1xuICAgICAgICBpZiAobGFzdCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMucGF0aCA9IHRoaXMuc3JjLnN1YnN0cmluZygwLCBsYXN0KzEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/ntYLkuobplqLmlbDkv53lrZhcbiAgICAgICAgdGhpcy5fcmVzb2x2ZSA9IHJlc29sdmU7XG5cbiAgICAgICAgLy8gbG9hZFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciB4bWwgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgeG1sLm9wZW4oJ0dFVCcsIHRoaXMuc3JjKTtcbiAgICAgICAgeG1sLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHhtbC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgaWYgKFsyMDAsIDIwMSwgMF0uaW5kZXhPZih4bWwuc3RhdHVzKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB4bWwucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gKG5ldyBET01QYXJzZXIoKSkucGFyc2VGcm9tU3RyaW5nKGRhdGEsIFwidGV4dC94bWxcIik7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YVR5cGUgPSBcInhtbFwiO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9wYXJzZShkYXRhKTtcbi8vICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNlbGYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgeG1sLnNlbmQobnVsbCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0TWFwRGF0YVxuICAgICAqIOaMh+WumuOBl+OBn+ODnuODg+ODl+ODrOOCpOODpOODvOOCkumFjeWIl+OBqOOBl+OBpuWPluW+l+OBl+OBvuOBmeOAglxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGxheWVyTmFtZSDlr77osaHjg6zjgqTjg6Tjg7zlkI1cbiAgICAgKi9cbiAgICBnZXRNYXBEYXRhOiBmdW5jdGlvbihsYXllck5hbWUpIHtcbiAgICAgICAgLy/jg6zjgqTjg6Tjg7zmpJzntKJcbiAgICAgICAgdmFyIGRhdGEgPSBudWxsO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxheWVyc1tpXS5uYW1lID09IGxheWVyTmFtZSkge1xuICAgICAgICAgICAgICAgIC8v44Kz44OU44O844KS6L+U44GZXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGF5ZXJzW2ldLmRhdGEuY29uY2F0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0T2JqZWN0R3JvdXBcbiAgICAgKiDjgqrjg5bjgrjjgqfjgq/jg4jjgrDjg6vjg7zjg5fjgpLlj5blvpfjgZfjgb7jgZlcbiAgICAgKlxuICAgICAqIOOCsOODq+ODvOODl+aMh+WumuOBjOeEoeOBhOWgtOWQiOOAgeWFqOODrOOCpOODpOODvOOCkumFjeWIl+OBq+OBl+OBpui/lOOBl+OBvuOBmeOAglxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGdyb3VucE5hbWUg5a++6LGh44Kq44OW44K444Kn44Kv44OI44Kw44Or44O844OX5ZCNXG4gICAgICovXG4gICAgZ2V0T2JqZWN0R3JvdXA6IGZ1bmN0aW9uKGdyb3VwTmFtZSkge1xuICAgICAgICBncm91cE5hbWUgPSBncm91cE5hbWUgfHwgbnVsbDtcbiAgICAgICAgdmFyIGxzID0gW107XG4gICAgICAgIHZhciBsZW4gPSB0aGlzLmxheWVycy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxheWVyc1tpXS50eXBlID09IFwib2JqZWN0Z3JvdXBcIikge1xuICAgICAgICAgICAgICAgIGlmIChncm91cE5hbWUgPT0gbnVsbCB8fCBncm91cE5hbWUgPT0gdGhpcy5sYXllcnNbaV0ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAvL+ODrOOCpOODpOODvOaDheWgseOCkuOCr+ODreODvOODs+OBmeOCi1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqID0gdGhpcy5fY2xvbmVPYmplY3RMYXllcih0aGlzLmxheWVyc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChncm91cE5hbWUgIT09IG51bGwpIHJldHVybiBvYmo7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxzLnB1c2gob2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0TWFwSW1hZ2VcbiAgICAgKiDjg57jg4Pjg5fjgqTjg6Hjg7zjgrjjga7kvZzmiJBcbiAgICAgKlxuICAgICAqIOikh+aVsOOBruODnuODg+ODl+ODrOOCpOODpOODvOOCkuaMh+WumuWHuuadpeOBvuOBmeOAglxuICAgICAqIOaPj+eUu+mghuW6j+OBr1RpbGVkTWFwRWRpdG9y5YG044Gn44Gu5oyH5a6a6aCG44Gn44Gv54Sh44GP44CB5byV5pWw44Gu6aCG5bqP44Go44Gq44KK44G+44GZ77yI56ys5LiA5byV5pWw44GM5LiA55Wq5LiL44Go44Gq44KL77yJXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gIOWvvuixoeODrOOCpOODpOODvOWQjVxuICAgICAqL1xuICAgIGdldEltYWdlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgIHZhciBudW1MYXllciA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxheWVyc1tpXS50eXBlID09IFwibGF5ZXJcIiB8fCB0aGlzLmxheWVyc1tpXS50eXBlID09IFwiaW1hZ2VsYXllclwiKSBudW1MYXllcisrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1MYXllciA9PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgICB2YXIgZ2VuZXJhdGVkID0gZmFsc2U7XG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMud2lkdGggKiB0aGlzLnRpbGV3aWR0aDtcbiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMuaGVpZ2h0ICogdGhpcy50aWxlaGVpZ2h0O1xuICAgICAgICB2YXIgY2FudmFzID0gcGhpbmEuZ3JhcGhpY3MuQ2FudmFzKCkuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZmluZCA9IGFyZ3MuaW5kZXhPZih0aGlzLmxheWVyc1tpXS5uYW1lKTtcbiAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSAwIHx8IGZpbmQgPj0gMCkge1xuICAgICAgICAgICAgICAgIC8v44Oe44OD44OX44Os44Kk44Ok44O8XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLnR5cGUgPT0gXCJsYXllclwiICYmIHRoaXMubGF5ZXJzW2ldLnZpc2libGUgIT0gXCIwXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxheWVyID0gdGhpcy5sYXllcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXBkYXRhID0gbGF5ZXIuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gbGF5ZXIud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSBsYXllci5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gbGF5ZXIub3BhY2l0eSB8fCAxLjA7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IG1hcGRhdGFbY291bnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8v44Oe44OD44OX44OB44OD44OX44KS6YWN572uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE1hcENoaXAoY2FudmFzLCBpbmRleCwgeCAqIHRoaXMudGlsZXdpZHRoLCB5ICogdGhpcy50aWxlaGVpZ2h0LCBvcGFjaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL+OCquODluOCuOOCp+OCr+ODiOOCsOODq+ODvOODl1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxheWVyc1tpXS50eXBlID09IFwib2JqZWN0Z3JvdXBcIiAmJiB0aGlzLmxheWVyc1tpXS52aXNpYmxlICE9IFwiMFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXllciA9IHRoaXMubGF5ZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9IGxheWVyLm9wYWNpdHkgfHwgMS4wO1xuICAgICAgICAgICAgICAgICAgICBsYXllci5vYmplY3RzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUuZ2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0TWFwQ2hpcChjYW52YXMsIGUuZ2lkLCBlLngsIGUueSwgb3BhY2l0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8v44Kk44Oh44O844K444Os44Kk44Ok44O8XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLnR5cGUgPT0gXCJpbWFnZWxheWVyXCIgJiYgdGhpcy5sYXllcnNbaV0udmlzaWJsZSAhPSBcIjBcIikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGVuID0gdGhpcy5sYXllcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ2ltYWdlJywgdGhpcy5sYXllcnNbaV0uaW1hZ2Uuc291cmNlKTtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLmNvbnRleHQuZHJhd0ltYWdlKGltYWdlLmRvbUVsZW1lbnQsIHRoaXMubGF5ZXJzW2ldLngsIHRoaXMubGF5ZXJzW2ldLnkpO1xuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZ2VuZXJhdGVkKSByZXR1cm4gbnVsbDtcblxuICAgICAgICB2YXIgdGV4dHVyZSA9IHBoaW5hLmFzc2V0LlRleHR1cmUoKTtcbiAgICAgICAgdGV4dHVyZS5kb21FbGVtZW50ID0gY2FudmFzLmRvbUVsZW1lbnQ7XG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIF9jbG9uZU9iamVjdExheWVyXG4gICAgICog5byV5pWw44Go44GX44Gm5rih44GV44KM44Gf44Kq44OW44K444Kn44Kv44OI44Os44Kk44Ok44O844KS44Kv44Ot44O844Oz44GX44Gm6L+U44GX44G+44GZ44CCXG4gICAgICpcbiAgICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jbG9uZU9iamVjdExheWVyOiBmdW5jdGlvbihzcmNMYXllcikge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge30uJHNhZmUoc3JjTGF5ZXIpO1xuICAgICAgICByZXN1bHQub2JqZWN0cyA9IFtdO1xuICAgICAgICAvL+ODrOOCpOODpOODvOWGheOCquODluOCuOOCp+OCr+ODiOOBruOCs+ODlOODvFxuICAgICAgICBzcmNMYXllci5vYmplY3RzLmZvckVhY2goZnVuY3Rpb24ob2JqKXtcbiAgICAgICAgICAgIHZhciByZXNPYmogPSB7XG4gICAgICAgICAgICAgICAgcHJvcGVydGllczoge30uJHNhZmUob2JqLnByb3BlcnRpZXMpLFxuICAgICAgICAgICAgfS4kZXh0ZW5kKG9iaik7XG4gICAgICAgICAgICBpZiAob2JqLmVsbGlwc2UpIHJlc09iai5lbGxpcHNlID0gb2JqLmVsbGlwc2U7XG4gICAgICAgICAgICBpZiAob2JqLmdpZCkgcmVzT2JqLmdpZCA9IG9iai5naWQ7XG4gICAgICAgICAgICBpZiAob2JqLnBvbHlnb24pIHJlc09iai5wb2x5Z29uID0gb2JqLnBvbHlnb24uY2xvbmUoKTtcbiAgICAgICAgICAgIGlmIChvYmoucG9seWxpbmUpIHJlc09iai5wb2x5bGluZSA9IG9iai5wb2x5bGluZS5jbG9uZSgpO1xuICAgICAgICAgICAgcmVzdWx0Lm9iamVjdHMucHVzaChyZXNPYmopO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBfcGFyc2VcbiAgICAgKiDlj5blvpfjgZfjgZ9UaWxlZE1hcEVkaXTjga7jg4fjg7zjgr/jgpLjg5Hjg7zjgrnjgZfjgb7jgZnjgIJcbiAgICAgKlxuICAgICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BhcnNlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8v44K/44Kk44Or5bGe5oCn5oOF5aCx5Y+W5b6XXG4gICAgICAgIHZhciBtYXAgPSBkYXRhLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtYXAnKVswXTtcbiAgICAgICAgdmFyIGF0dHIgPSB0aGlzLl9hdHRyVG9KU09OKG1hcCk7XG4gICAgICAgIHRoaXMuJGV4dGVuZChhdHRyKTtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzID0gdGhpcy5fcHJvcGVydGllc1RvSlNPTihtYXApO1xuXG4gICAgICAgIC8v44K/44Kk44Or44K744OD44OI5Y+W5b6XXG4gICAgICAgIHRoaXMudGlsZXNldHMgPSB0aGlzLl9wYXJzZVRpbGVzZXRzKGRhdGEpO1xuXG4gICAgICAgIC8v44K/44Kk44Or44K744OD44OI5oOF5aCx6KOc5a6MXG4gICAgICAgIHZhciBkZWZhdWx0QXR0ciA9IHtcbiAgICAgICAgICAgIHRpbGV3aWR0aDogMzIsXG4gICAgICAgICAgICB0aWxlaGVpZ2h0OiAzMixcbiAgICAgICAgICAgIHNwYWNpbmc6IDAsXG4gICAgICAgICAgICBtYXJnaW46IDAsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudGlsZXNldHMuY2hpcHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRpbGVzZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvL+OCv+OCpOODq+OCu+ODg+ODiOWxnuaAp+aDheWgseWPluW+l1xuICAgICAgICAgICAgdmFyIGF0dHIgPSB0aGlzLl9hdHRyVG9KU09OKGRhdGEuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3RpbGVzZXQnKVtpXSk7XG4gICAgICAgICAgICBhdHRyLiRzYWZlKGRlZmF1bHRBdHRyKTtcbiAgICAgICAgICAgIGF0dHIuZmlyc3RnaWQtLTtcbiAgICAgICAgICAgIHRoaXMudGlsZXNldHNbaV0uJGV4dGVuZChhdHRyKTtcblxuICAgICAgICAgICAgLy/jg57jg4Pjg5fjg4Hjg4Pjg5fjg6rjgrnjg4jkvZzmiJBcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcy50aWxlc2V0c1tpXTtcbiAgICAgICAgICAgIHRoaXMudGlsZXNldHNbaV0ubWFwQ2hpcCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgciA9IGF0dHIuZmlyc3RnaWQ7IHIgPCBhdHRyLmZpcnN0Z2lkK2F0dHIudGlsZWNvdW50OyByKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hpcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IHQuaW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgIHg6ICgociAtIGF0dHIuZmlyc3RnaWQpICUgdC5jb2x1bW5zKSAqICh0LnRpbGV3aWR0aCArIHQuc3BhY2luZykgKyB0Lm1hcmdpbixcbiAgICAgICAgICAgICAgICAgICAgeTogTWF0aC5mbG9vcigociAtIGF0dHIuZmlyc3RnaWQpIC8gdC5jb2x1bW5zKSAqICh0LnRpbGVoZWlnaHQgKyB0LnNwYWNpbmcpICsgdC5tYXJnaW4sXG4gICAgICAgICAgICAgICAgfS4kc2FmZShhdHRyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVzZXRzLmNoaXBzW3JdID0gY2hpcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Os44Kk44Ok44O85Y+W5b6XXG4gICAgICAgIHRoaXMubGF5ZXJzID0gdGhpcy5fcGFyc2VMYXllcnMoZGF0YSk7XG5cbiAgICAgICAgLy/jgqTjg6Hjg7zjgrjjg4fjg7zjgr/oqq3jgb/ovrzjgb9cbiAgICAgICAgdGhpcy5fY2hlY2tJbWFnZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIF9jaGVja0ltYWdlXG4gICAgICog44Ki44K744OD44OI44Gr54Sh44GE44Kk44Oh44O844K444OH44O844K/44KS44OB44Kn44OD44Kv44GX44Gm6Kqt44G/6L6844G/44KS6KGM44GE44G+44GZ44CCXG4gICAgICpcbiAgICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jaGVja0ltYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICB2YXIgaW1hZ2VTb3VyY2UgPSBbXTtcbiAgICAgICAgdmFyIGxvYWRJbWFnZSA9IFtdO1xuXG4gICAgICAgIC8v5LiA6Kan5L2c5oiQXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50aWxlc2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG9iaiA9IHtcbiAgICAgICAgICAgICAgICBpbWFnZTogdGhpcy50aWxlc2V0c1tpXS5pbWFnZSxcbiAgICAgICAgICAgICAgICB0cmFuc1I6IHRoaXMudGlsZXNldHNbaV0udHJhbnNSLFxuICAgICAgICAgICAgICAgIHRyYW5zRzogdGhpcy50aWxlc2V0c1tpXS50cmFuc0csXG4gICAgICAgICAgICAgICAgdHJhbnNCOiB0aGlzLnRpbGVzZXRzW2ldLnRyYW5zQixcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbWFnZVNvdXJjZS5wdXNoKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLmltYWdlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IHRoaXMubGF5ZXJzW2ldLmltYWdlLnNvdXJjZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2UucHVzaChvYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/jgqLjgrvjg4Pjg4jjgavjgYLjgovjgYvnorroqo1cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZVNvdXJjZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGltYWdlID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgnaW1hZ2UnLCBpbWFnZVNvdXJjZVtpXS5pbWFnZSk7XG4gICAgICAgICAgICBpZiAoaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAvL+OCouOCu+ODg+ODiOOBq+OBguOCi1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL+OBquOBi+OBo+OBn+OBruOBp+ODreODvOODieODquOCueODiOOBq+i/veWKoFxuICAgICAgICAgICAgICAgIGxvYWRJbWFnZS5wdXNoKGltYWdlU291cmNlW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v5LiA5ous44Ot44O844OJXG4gICAgICAgIC8v44Ot44O844OJ44Oq44K544OI5L2c5oiQXG4gICAgICAgIHZhciBhc3NldHMgPSB7XG4gICAgICAgICAgICBpbWFnZTogW11cbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2FkSW1hZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIC8v44Kk44Oh44O844K444Gu44OR44K544KS44Oe44OD44OX44Go5ZCM44GY44Gr44GZ44KLXG4gICAgICAgICAgICBhc3NldHMuaW1hZ2VbbG9hZEltYWdlW2ldLmltYWdlXSA9IHRoaXMucGF0aCtsb2FkSW1hZ2VbaV0uaW1hZ2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvYWRJbWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgICAgICAgICAgbG9hZGVyLmxvYWQoYXNzZXRzKTtcbiAgICAgICAgICAgIGxvYWRlci5vbignbG9hZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAvL+mAj+mBjuiJsuioreWumuWPjeaYoFxuICAgICAgICAgICAgICAgIGxvYWRJbWFnZS5mb3JFYWNoKGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIGVsbS5pbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbG0udHJhbnNSICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByID0gZWxtLnRyYW5zUiwgZyA9IGVsbS50cmFuc0csIGIgPSBlbG0udHJhbnNCO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuZmlsdGVyKGZ1bmN0aW9uKHBpeGVsLCBpbmRleCwgeCwgeSwgYml0bWFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBiaXRtYXAuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGl4ZWxbMF0gPT0gciAmJiBwaXhlbFsxXSA9PSBnICYmIHBpeGVsWzJdID09IGIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtpbmRleCszXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvL+iqreOBv+i+vOOBv+e1guS6hlxuICAgICAgICAgICAgICAgIHRoYXQuX3Jlc29sdmUodGhhdCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/oqq3jgb/ovrzjgb/ntYLkuoZcbiAgICAgICAgICAgIHRoaXMuX3Jlc29sdmUodGhhdCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBfc2V0TWFwQ2hpcFxuICAgICAqIOOCreODo+ODs+ODkOOCueOBruaMh+WumuOBl+OBn+W6p+aomeOBq+ODnuODg+ODl+ODgeODg+ODl+OBruOCpOODoeODvOOCuOOCkuOCs+ODlOODvOOBl+OBvuOBmeOAglxuICAgICAqXG4gICAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0TWFwQ2hpcDogZnVuY3Rpb24oY2FudmFzLCBpbmRleCwgeCwgeSwgb3BhY2l0eSkge1xuICAgICAgICAvL+OCv+OCpOODq+OCu+ODg+ODiOOBi+OCieODnuODg+ODl+ODgeODg+ODl+OCkuWPluW+l1xuICAgICAgICB2YXIgY2hpcCA9IHRoaXMudGlsZXNldHMuY2hpcHNbaW5kZXhdO1xuICAgICAgICBpZiAoIWNoaXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIGNoaXAuaW1hZ2UpO1xuICAgICAgICBpZiAoIWltYWdlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjaGlwLmltYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMuY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICBpbWFnZS5kb21FbGVtZW50LFxuICAgICAgICAgICAgY2hpcC54ICsgY2hpcC5tYXJnaW4sIGNoaXAueSArIGNoaXAubWFyZ2luLFxuICAgICAgICAgICAgY2hpcC50aWxld2lkdGgsIGNoaXAudGlsZWhlaWdodCxcbiAgICAgICAgICAgIHgsIHksXG4gICAgICAgICAgICBjaGlwLnRpbGV3aWR0aCwgY2hpcC50aWxlaGVpZ2h0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBfcHJvcGVydGllc1RvSlNPTlxuICAgICAqIFhNTOODl+ODreODkeODhuOCo+OCkkpTT07jgavlpInmj5vjgZfjgb7jgZnjgIJcbiAgICAgKlxuICAgICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3Byb3BlcnRpZXNUb0pTT046IGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICB2YXIgcHJvcGVydGllcyA9IGVsbS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInByb3BlcnRpZXNcIilbMF07XG4gICAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgICAgaWYgKHByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IHByb3BlcnRpZXMuY2hpbGROb2Rlcy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgdmFyIHAgPSBwcm9wZXJ0aWVzLmNoaWxkTm9kZXNba107XG4gICAgICAgICAgICBpZiAocC50YWdOYW1lID09PSBcInByb3BlcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAvL3Byb3BlcnR544GrdHlwZeaMh+WumuOBjOOBguOBo+OBn+OCieWkieaPm1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gcC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBwLmdldEF0dHJpYnV0ZSgndmFsdWUnKTtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSB2YWx1ZSA9IHAudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJpbnRcIikge1xuICAgICAgICAgICAgICAgICAgICBvYmpbcC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSBwYXJzZUludCh2YWx1ZSwgMTApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImZsb2F0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3AuZ2V0QXR0cmlidXRlKCduYW1lJyldID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiYm9vbFwiICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJ0cnVlXCIpIG9ialtwLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGVsc2Ugb2JqW3AuZ2V0QXR0cmlidXRlKCduYW1lJyldID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3AuZ2V0QXR0cmlidXRlKCduYW1lJyldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgX3Byb3BlcnRpZXNUb0pTT05cbiAgICAgKiBYTUzlsZ7mgKfmg4XloLHjgpJKU09O44Gr5aSJ5o+b44GX44G+44GZ44CCXG4gICAgICpcbiAgICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRyVG9KU09OOiBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gc291cmNlLmF0dHJpYnV0ZXNbaV0udmFsdWU7XG4gICAgICAgICAgICB2YWwgPSBpc05hTihwYXJzZUZsb2F0KHZhbCkpPyB2YWw6IHBhcnNlRmxvYXQodmFsKTtcbiAgICAgICAgICAgIG9ialtzb3VyY2UuYXR0cmlidXRlc1tpXS5uYW1lXSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIF9wcm9wZXJ0aWVzVG9KU09OX3N0clxuICAgICAqIFhNTOODl+ODreODkeODhuOCo+OCkkpTT07jgavlpInmj5vjgZfjgIHmloflrZfliJfjgafov5TjgZfjgb7jgZnjgIJcbiAgICAgKlxuICAgICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dHJUb0pTT05fc3RyOiBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gc291cmNlLmF0dHJpYnV0ZXNbaV0udmFsdWU7XG4gICAgICAgICAgICBvYmpbc291cmNlLmF0dHJpYnV0ZXNbaV0ubmFtZV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBfcGFyc2VUaWxlc2V0c1xuICAgICAqIOOCv+OCpOODq+OCu+ODg+ODiOOBruODkeODvOOCueOCkuihjOOBhOOBvuOBmeOAglxuICAgICAqXG4gICAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGFyc2VUaWxlc2V0czogZnVuY3Rpb24oeG1sKSB7XG4gICAgICAgIHZhciBlYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgICAgdmFyIHRpbGVzZXRzID0geG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0aWxlc2V0Jyk7XG4gICAgICAgIGVhY2guY2FsbCh0aWxlc2V0cywgZnVuY3Rpb24odGlsZXNldCkge1xuICAgICAgICAgICAgdmFyIHQgPSB7fTtcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IHNlbGYuX3Byb3BlcnRpZXNUb0pTT04odGlsZXNldCk7XG4gICAgICAgICAgICBpZiAocHJvcHMuc3JjKSB7XG4gICAgICAgICAgICAgICAgdC5pbWFnZSA9IHByb3BzLnNyYztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdC5pbWFnZSA9IHRpbGVzZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltYWdlJylbMF0uZ2V0QXR0cmlidXRlKCdzb3VyY2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v6YCP6YGO6Imy6Kit5a6a5Y+W5b6XXG4gICAgICAgICAgICB0LnRyYW5zID0gdGlsZXNldC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1hZ2UnKVswXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zJyk7XG4gICAgICAgICAgICBpZiAodC50cmFucykge1xuICAgICAgICAgICAgICAgIHQudHJhbnNSID0gcGFyc2VJbnQodC50cmFucy5zdWJzdHJpbmcoMCwgMiksIDE2KTtcbiAgICAgICAgICAgICAgICB0LnRyYW5zRyA9IHBhcnNlSW50KHQudHJhbnMuc3Vic3RyaW5nKDIsIDQpLCAxNik7XG4gICAgICAgICAgICAgICAgdC50cmFuc0IgPSBwYXJzZUludCh0LnRyYW5zLnN1YnN0cmluZyg0LCA2KSwgMTYpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkYXRhLnB1c2godCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBfcGFyc2VMYXllcnNcbiAgICAgKiDjg6zjgqTjg6Tjg7zmg4XloLHjga7jg5Hjg7zjgrnjgpLooYzjgYTjgb7jgZnjgIJcbiAgICAgKlxuICAgICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BhcnNlTGF5ZXJzOiBmdW5jdGlvbih4bWwpIHtcbiAgICAgICAgdmFyIGVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaDtcbiAgICAgICAgdmFyIGRhdGEgPSBbXTtcblxuICAgICAgICB2YXIgbWFwID0geG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwibWFwXCIpWzBdO1xuICAgICAgICB2YXIgbGF5ZXJzID0gW107XG4gICAgICAgIGVhY2guY2FsbChtYXAuY2hpbGROb2RlcywgZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgICAgICBpZiAoZWxtLnRhZ05hbWUgPT0gXCJsYXllclwiIHx8IGVsbS50YWdOYW1lID09IFwib2JqZWN0Z3JvdXBcIiB8fCBlbG0udGFnTmFtZSA9PSBcImltYWdlbGF5ZXJcIikge1xuICAgICAgICAgICAgICAgIGxheWVycy5wdXNoKGVsbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVycy5lYWNoKGZ1bmN0aW9uKGxheWVyKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGxheWVyLnRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwibGF5ZXJcIjpcbiAgICAgICAgICAgICAgICAgICAgLy/pgJrluLjjg6zjgqTjg6Tjg7xcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSBsYXllci5nZXRFbGVtZW50c0J5VGFnTmFtZSgnZGF0YScpWzBdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW5jb2RpbmcgPSBkLmdldEF0dHJpYnV0ZShcImVuY29kaW5nXCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibGF5ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGxheWVyLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVuY29kaW5nID09IFwiY3N2XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGwuZGF0YSA9IHRoaXMuX3BhcnNlQ1NWKGQudGV4dENvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVuY29kaW5nID09IFwiYmFzZTY0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGwuZGF0YSA9IHRoaXMuX3BhcnNlQmFzZTY0KGQudGV4dENvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHIgPSB0aGlzLl9hdHRyVG9KU09OKGxheWVyKTtcbiAgICAgICAgICAgICAgICAgICAgbC4kZXh0ZW5kKGF0dHIpO1xuICAgICAgICAgICAgICAgICAgICBsLnByb3BlcnRpZXMgPSB0aGlzLl9wcm9wZXJ0aWVzVG9KU09OKGxheWVyKTtcblxuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gobCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgLy/jgqrjg5bjgrjjgqfjgq/jg4jjg6zjgqTjg6Tjg7xcbiAgICAgICAgICAgICAgICBjYXNlIFwib2JqZWN0Z3JvdXBcIjpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGwgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdGdyb3VwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGxheWVyLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwYXJzZUZsb2F0KGxheWVyLmdldEF0dHJpYnV0ZShcIm9mZnNldHhcIikpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBwYXJzZUZsb2F0KGxheWVyLmdldEF0dHJpYnV0ZShcIm9mZnNldHlcIikpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHBoYTogbGF5ZXIuZ2V0QXR0cmlidXRlKFwib3BhY2l0eVwiKSB8fCAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IGxheWVyLmdldEF0dHJpYnV0ZShcImNvbG9yXCIpIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3b3JkZXI6IGxheWVyLmdldEF0dHJpYnV0ZShcImRyYXdvcmRlclwiKSB8fCBudWxsLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBsLnByb3BlcnRpZXMgPSB0aGlzLl9wcm9wZXJ0aWVzVG9KU09OKGxheWVyKTtcblxuICAgICAgICAgICAgICAgICAgICAvL+ODrOOCpOODpOODvOWGheino+aekFxuICAgICAgICAgICAgICAgICAgICBlYWNoLmNhbGwobGF5ZXIuY2hpbGROb2RlcywgZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxtLm5vZGVUeXBlID09IDMpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkID0gdGhpcy5fYXR0clRvSlNPTihlbG0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGQuaWQgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgZC5wcm9wZXJ0aWVzID0gdGhpcy5fcHJvcGVydGllc1RvSlNPTihlbG0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/lrZDopoHntKDjga7op6PmnpBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbG0uY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbG0uY2hpbGROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUubm9kZVR5cGUgPT0gMykgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL+alleWGhlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5ub2RlTmFtZSA9PSAnZWxsaXBzZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQuZWxsaXBzZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy/lpJrop5LlvaJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUubm9kZU5hbWUgPT0gJ3BvbHlnb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkLnBvbHlnb24gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhdHRyID0gdGhpcy5fYXR0clRvSlNPTl9zdHIoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGwgPSBhdHRyLnBvaW50cy5zcGxpdChcIiBcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbC5mb3JFYWNoKGZ1bmN0aW9uKHN0cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwdHMgPSBzdHIuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQucG9seWdvbi5wdXNoKHt4OiBwYXJzZUZsb2F0KHB0c1swXSksIHk6IHBhcnNlRmxvYXQocHRzWzFdKX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy/nt5rliIZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUubm9kZU5hbWUgPT0gJ3BvbHlsaW5lJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZC5wb2x5bGluZSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHIgPSB0aGlzLl9hdHRyVG9KU09OX3N0cihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbCA9IGF0dHIucG9pbnRzLnNwbGl0KFwiIFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsLmZvckVhY2goZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB0cyA9IHN0ci5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZC5wb2x5bGluZS5wdXNoKHt4OiBwYXJzZUZsb2F0KHB0c1swXSksIHk6IHBhcnNlRmxvYXQocHRzWzFdKX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbC5vYmplY3RzLnB1c2goZCk7XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKGwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIC8v44Kk44Oh44O844K444Os44Kk44Ok44O8XG4gICAgICAgICAgICAgICAgY2FzZSBcImltYWdlbGF5ZXJcIjpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGwgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImltYWdlbGF5ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGxheWVyLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBwYXJzZUZsb2F0KGxheWVyLmdldEF0dHJpYnV0ZShcIm9mZnNldHhcIikpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBwYXJzZUZsb2F0KGxheWVyLmdldEF0dHJpYnV0ZShcIm9mZnNldHlcIikpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHBoYTogbGF5ZXIuZ2V0QXR0cmlidXRlKFwib3BhY2l0eVwiKSB8fCAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogKGxheWVyLmdldEF0dHJpYnV0ZShcInZpc2libGVcIikgPT09IHVuZGVmaW5lZCB8fCBsYXllci5nZXRBdHRyaWJ1dGUoXCJ2aXNpYmxlXCIpICE9IDApLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2VFbG0gPSBsYXllci5nZXRFbGVtZW50c0J5VGFnTmFtZShcImltYWdlXCIpWzBdO1xuICAgICAgICAgICAgICAgICAgICBsLmltYWdlID0ge3NvdXJjZTogaW1hZ2VFbG0uZ2V0QXR0cmlidXRlKFwic291cmNlXCIpfTtcblxuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gobCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBfcGVyc2VDU1ZcbiAgICAgKiBDU1bjga7jg5Hjg7zjgrnjgpLooYzjgYTjgb7jgZnjgIJcbiAgICAgKlxuICAgICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BhcnNlQ1NWOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBkYXRhTGlzdCA9IGRhdGEuc3BsaXQoJywnKTtcbiAgICAgICAgdmFyIGxheWVyID0gW107XG5cbiAgICAgICAgZGF0YUxpc3QuZWFjaChmdW5jdGlvbihlbG0sIGkpIHtcbiAgICAgICAgICAgIHZhciBudW0gPSBwYXJzZUludChlbG0sIDEwKSAtIDE7XG4gICAgICAgICAgICBsYXllci5wdXNoKG51bSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBsYXllcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBfcGVyc2VDU1ZcbiAgICAgKiBCQVNFNjTjga7jg5Hjg7zjgrnjgpLooYzjgYTjgb7jgZnjgIJcbiAgICAgKlxuICAgICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgICAqIGh0dHA6Ly90aGVrYW5ub24tc2VydmVyLmFwcHNwb3QuY29tL2hlcnBpdHktZGVycGl0eS5hcHBzcG90LmNvbS9wYXN0ZWJpbi5jb20vNzVLa3MwV0hcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9wYXJzZUJhc2U2NDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgZGF0YUxpc3QgPSBhdG9iKGRhdGEudHJpbSgpKTtcbiAgICAgICAgdmFyIHJzdCA9IFtdO1xuXG4gICAgICAgIGRhdGFMaXN0ID0gZGF0YUxpc3Quc3BsaXQoJycpLm1hcChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gZS5jaGFyQ29kZUF0KDApO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKHZhciBpPTAsbGVuPWRhdGFMaXN0Lmxlbmd0aC80OyBpPGxlbjsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbiA9IGRhdGFMaXN0W2kqNF07XG4gICAgICAgICAgICByc3RbaV0gPSBwYXJzZUludChuLCAxMCkgLSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJzdDtcbiAgICB9LFxufSk7XG5cbi8v44Ot44O844OA44O844Gr6L+95YqgXG5waGluYS5hc3NldC5Bc3NldExvYWRlci5hc3NldExvYWRGdW5jdGlvbnMudG14ID0gZnVuY3Rpb24oa2V5LCBwYXRoKSB7XG4gICAgdmFyIHRteCA9IHBoaW5hLmFzc2V0LlRpbGVkTWFwKCk7XG4gICAgcmV0dXJuIHRteC5sb2FkKHBhdGgpO1xufTtcbiIsIi8qXG4gKiAgU291bmRTZXQuanNcbiAqICAyMDE0LzExLzI4XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxucGhpbmEuZXh0ZW5zaW9uID0gcGhpbmEuZXh0ZW5zaW9uIHx8IHt9O1xuXG4vL+OCteOCpuODs+ODieeuoeeQhlxucGhpbmEuZGVmaW5lKFwicGhpbmEuZXh0ZW5zaW9uLlNvdW5kU2V0XCIsIHtcblxuICAgIC8v44K144Km44Oz44OJ44GM5qC857SN44GV44KM44KL6YWN5YiXXG4gICAgZWxlbWVudHM6IG51bGwsXG5cbiAgICAvL+WGjeeUn+S4re+8ou+8p++8rVxuICAgIGJnbTogbnVsbCxcbiAgICBiZ21Jc1BsYXk6IGZhbHNlLFxuXG4gICAgLy/jg57jgrnjgr/jg7zjg5zjg6rjg6Xjg7zjg6BcbiAgICB2b2x1bWVCR006IDAuNSxcbiAgICB2b2x1bWVTRTogMC41LFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICB9LFxuXG4gICAgLy/nmbvpjLLmuIjjgb/jgqLjgrvjg4Pjg4joqq3jgb/ovrzjgb9cbiAgICByZWFkQXNzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmFzc2V0cy5zb3VuZCkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoXCJzb3VuZFwiLCBrZXkpO1xuICAgICAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIHBoaW5hLmFzc2V0LlNvdW5kKSB0aGlzLmFkZChrZXkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8v44K144Km44Oz44OJ6L+95YqgXG4gICAgYWRkOiBmdW5jdGlvbihuYW1lLCB1cmwpIHtcbiAgICAgICAgaWYgKG5hbWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG51bGw7XG4gICAgICAgIHVybCA9IHVybCB8fCBudWxsO1xuICAgICAgICBpZiAodGhpcy5maW5kKG5hbWUpKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICB2YXIgZSA9IHBoaW5hLmV4dGVuc2lvbi5Tb3VuZEVsZW1lbnQobmFtZSk7XG4gICAgICAgIGlmICghZS5tZWRpYSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLmVsZW1lbnRzLnB1c2goZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvL+OCteOCpuODs+ODieaknOe0olxuICAgIGZpbmQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnRzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5lbGVtZW50c1tpXS5uYW1lID09IG5hbWUpIHJldHVybiB0aGlzLmVsZW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvL+OCteOCpuODs+ODieOCku+8ou+8p++8reOBqOOBl+OBpuWGjeeUn1xuICAgIHBsYXlCR006IGZ1bmN0aW9uKG5hbWUsIGxvb3AsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChsb29wID09PSB1bmRlZmluZWQpIGxvb3AgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5iZ20pIHtcbiAgICAgICAgICAgIHRoaXMuYmdtLnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMuYmdtSXNQbGF5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLmZpbmQobmFtZSk7XG4gICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgdm9sID0gdGhpcy52b2x1bWVCR00gKiBlbGVtZW50Ll92b2x1bWU7XG4gICAgICAgICAgICBlbGVtZW50Lm1lZGlhLnZvbHVtZSA9IHZvbDtcbiAgICAgICAgICAgIGVsZW1lbnQucGxheShsb29wLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB0aGlzLmJnbSA9IGVsZW1lbnQ7XG4gICAgICAgICAgICB0aGlzLmJnbUlzUGxheSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hZGQobmFtZSkpIHRoaXMucGxheUJHTShuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/vvKLvvKfvvK3lgZzmraJcbiAgICBzdG9wQkdNOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuYmdtKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5iZ21Jc1BsYXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJnbS5zdG9wKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5iZ21Jc1BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYmdtID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/vvKLvvKfvvK3kuIDmmYLlgZzmraJcbiAgICBwYXVzZUJHTTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmJnbSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmdtSXNQbGF5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iZ20ucGF1c2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJnbUlzUGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL++8ou+8p++8reWGjemWi1xuICAgIHJlc3VtZUJHTTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmJnbSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmJnbUlzUGxheSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmdtLnZvbHVtZSA9IHRoaXMudm9sdW1lQkdNO1xuICAgICAgICAgICAgICAgIHRoaXMuYmdtLnJlc3VtZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYmdtSXNQbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/vvKLvvKfvvK3jg57jgrnjgr/jg7zjg5zjg6rjg6Xjg7zjg6DoqK3lrppcbiAgICBzZXRWb2x1bWVCR006IGZ1bmN0aW9uKHZvbCkge1xuICAgICAgICB0aGlzLnZvbHVtZUJHTSA9IHZvbDtcbiAgICAgICAgaWYgKHRoaXMuYmdtKSB7XG4gICAgICAgICAgICB0aGlzLmJnbS5wYXVzZSgpO1xuICAgICAgICAgICAgdGhpcy5iZ20uc2V0Vm9sdW1lKHRoaXMudm9sdW1lQkdNICogdGhpcy5iZ20uX3ZvbHVtZSk7XG4gICAgICAgICAgICB0aGlzLmJnbS5yZXN1bWUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/jgqLjgrvjg4Pjg4jjgpLmjIflrprjgZfjgabjg5zjg6rjg6Xjg7zjg6DjgpLoqK3lrppcbiAgICBzZXRWb2x1bWU6IGZ1bmN0aW9uKG5hbWUsIHZvbCkge1xuICAgICAgICB2YXIgbWVkaWEgPSB0aGlzLmZpbmQobmFtZSk7XG4gICAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICAgICAgbWVkaWEuc2V0Vm9sdW1lKHZvbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v44K144Km44Oz44OJ44KS44K144Km44Oz44OJ44Ko44OV44Kn44Kv44OI44Go44GX44Gm5YaN55SfXG4gICAgcGxheVNFOiBmdW5jdGlvbihuYW1lLCBsb29wLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXMuZmluZChuYW1lKTtcbiAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciB2b2wgPSB0aGlzLnZvbHVtZVNFICogZWxlbWVudC5fdm9sdW1lO1xuICAgICAgICAgICAgZWxlbWVudC5tZWRpYS52b2x1bWUgPSB2b2w7XG4gICAgICAgICAgICBlbGVtZW50LnBsYXkobG9vcCwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuYWRkKG5hbWUpKSB0aGlzLnBsYXlTRShuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/jg6vjg7zjg5flho3nlJ/jgZfjgabjgYTjgotTReOCkuWBnOatolxuICAgIHN0b3BTRTogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB2YXIgbWVkaWEgPSB0aGlzLmZpbmQobmFtZSk7XG4gICAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICAgICAgbWVkaWEuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL++8ou+8p++8reS4gOaZguWBnOatolxuICAgIHBhdXNlQkdNOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuYmdtKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5iZ21Jc1BsYXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJnbS5wYXVzZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYmdtSXNQbGF5ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v77yz77yl44Oe44K544K/44O844Oc44Oq44Ol44O844Og6Kit5a6aXG4gICAgc2V0Vm9sdW1lU0U6IGZ1bmN0aW9uKHZvbCkge1xuICAgICAgICB0aGlzLnZvbHVtZVNFID0gdm9sO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxufSk7XG5cbi8vU291bmRFbGVtZW50IEJhc2ljXG5waGluYS5kZWZpbmUoXCJwaGluYS5leHRlbnNpb24uU291bmRFbGVtZW50XCIsIHtcbiAgICAvL+OCteOCpuODs+ODieWQjVxuICAgIG5hbWU6IG51bGwsXG5cbiAgICAvL++8te+8su+8rFxuICAgIHVybDogbnVsbCxcblxuICAgIC8v44K144Km44Oz44OJ5pys5L2TXG4gICAgbWVkaWE6IG51bGwsXG5cbiAgICAvL+ODnOODquODpeODvOODoFxuICAgIF92b2x1bWU6IDEsXG5cbiAgICAvL+WGjeeUn+e1guS6huaZguOBruOCs+ODvOODq+ODkOODg+OCr+mWouaVsFxuICAgIGNhbGxiYWNrOiBudWxsLFxuXG4gICAgLy/lho3nlJ/kuK3jg5Xjg6njgrBcbiAgICBwbGF5aW5nOiBmYWxzZSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5tZWRpYSA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoXCJzb3VuZFwiLCBuYW1lKTtcbiAgICAgICAgaWYgKHRoaXMubWVkaWEpIHtcbiAgICAgICAgICAgIHRoaXMubWVkaWEudm9sdW1lID0gMTtcbiAgICAgICAgICAgIHRoaXMubWVkaWEub24oJ2VuZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWVkaWEubG9vcCkgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2spIHRoaXMuY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcImFzc2V0IG5vdCBmb3VuZC4gXCIrbmFtZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy/jgrXjgqbjg7Pjg4njga7lho3nlJ9cbiAgICBwbGF5OiBmdW5jdGlvbihsb29wLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAobG9vcCA9PT0gdW5kZWZpbmVkKSBsb29wID0gZmFsc2VcbiAgICAgICAgaWYgKCF0aGlzLm1lZGlhKSByZXR1cm4gdGhpcztcblxuICAgICAgICAvL+ODq+ODvOODl+WGjeeUn+OBruWgtOWQiOWkmumHjeWGjeeUn+OCkuemgeatolxuICAgICAgICBpZiAobG9vcCAmJiB0aGlzLnBsYXlpbmcpIHJldHVybjtcblxuICAgICAgICB0aGlzLm1lZGlhLmxvb3AgPSBsb29wO1xuICAgICAgICB0aGlzLm1lZGlhLnBsYXkoKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/jgrXjgqbjg7Pjg4nlho3nlJ/lho3plotcbiAgICByZXN1bWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMubWVkaWEpIHJldHVybiB0aGlzO1xuICAgICAgICB0aGlzLm1lZGlhLnJlc3VtZSgpO1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/jgrXjgqbjg7Pjg4nkuIDmmYLlgZzmraJcbiAgICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMubWVkaWEpIHJldHVybiB0aGlzO1xuICAgICAgICB0aGlzLm1lZGlhLnBhdXNlKCk7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvL+OCteOCpuODs+ODieWBnOatolxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMubWVkaWEpIHJldHVybiB0aGlzO1xuICAgICAgICB0aGlzLm1lZGlhLnN0b3AoKTtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+ODnOODquODpeODvOODoOioreWumlxuICAgIHNldFZvbHVtZTogZnVuY3Rpb24odm9sKSB7XG4gICAgICAgIGlmICghdGhpcy5tZWRpYSkgcmV0dXJuIHRoaXM7XG4gICAgICAgIGlmICh2b2wgPT09IHVuZGVmaW5lZCkgdm9sID0gMC41O1xuICAgICAgICB0aGlzLl92b2x1bWUgPSB2b2w7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfYWNjZXNzb3I6IHtcbiAgICAgICAgdm9sdW1lOiB7XG4gICAgICAgICAgICBcImdldFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3ZvbHVtZTsgfSxcbiAgICAgICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKHZvbCkgeyB0aGlzLnNldFZvbHVtZSh2b2wpOyB9XG4gICAgICAgIH0sXG4gICAgICAgIGxvb3A6IHtcbiAgICAgICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5tZWRpYS5sb29wOyB9LFxuICAgICAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24oZikgeyB0aGlzLm1lZGlhLmxvb3AgPSBmOyB9XG4gICAgICAgIH0sXG4gICAgfVxufSk7XG4iLCJwaGluYS5nbG9iYWxpemUoKTtcblxucGhpbmEubWFpbihmdW5jdGlvbigpIHtcbiAgY29uc3QgYXBwID0gR2FtZUFwcCh7XG4gICAgc3RhcnRMYWJlbDogJ21haW4nLFxuICB9KTtcbiAgYXBwLmVuYWJsZVN0YXRzKCk7XG4gIGFwcC5ydW4oKTtcbn0pO1xuIiwicGhpbmEuZGVmaW5lKFwiTWFpblNjZW5lXCIsIHtcbiAgc3VwZXJDbGFzczogJ0Rpc3BsYXlTY2VuZScsXG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gIH0sXG59KTtcbiJdfQ==
