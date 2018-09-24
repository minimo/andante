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
      this.fps = 60;
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

phina.namespace(function() {

  phina.define('ThreeLayerEx', {
    superClass: 'phina.display.Layer',

    scene: null,
    camera: null,
    light: null,
    renderer: null,

    init: function(options) {
      this.superInit(options);

      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera( 75, options.width / options.height, 1, 10000 );
      this.camera.position.z = 100;

      this.light = new THREE.DirectionalLight( 0xffffff, 1 );
      this.light.position.set( 1, 1, 1 ).normalize();
      this.scene.add( this.light );

      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setClearColor( 0x000000 );
      this.renderer.setSize( options.width, options.height );

      this.on('enterframe', function() {
        this.renderer.render( this.scene, this.camera );
      });

      this.domElement = this.renderer.domElement;
    },

    addScene: function(object) {
      this.scene.add(object);
      return this;
    },
  });
});

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
    const loader = phina.asset.AssetLoader();
    loader.load(assets);
    loader.on('load', e => {
      this.loadcomplete = true;
      this._onLoadAssets();
    });
    loader.onprogress = e => {
      this.loadprogress = e.progress;
    };
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

  var x   = index % row;
  var y   = ~~(index / row);
  this.srcRect.x = sx + x * tw;
  this.srcRect.y = sy + y * th;
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
  const tempChildren = this.children.slice();
  const len = tempChildren.length;
  for (let i = beginIndex; i < len; ++i) {
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
    const last = this.src.lastIndexOf("/");
    if (last > 0) {
      this.path = this.src.substring(0, last+1);
    }

    //終了関数保存
    this._resolve = resolve;

    // load
    const self = this;
    const xml = new XMLHttpRequest();
    xml.open('GET', this.src);
    xml.onreadystatechange = function() {
      if (xml.readyState === 4) {
        if ([200, 201, 0].indexOf(xml.status) !== -1) {
          var data = xml.responseText;
          data = (new DOMParser()).parseFromString(data, "text/xml");
          self.dataType = "xml";
          self.data = data;
          self._parse(data);
          // resolve(self);
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
    const ls = [];
    const len = this.layers.length;
    for (let i = 0; i < len; i++) {
      if (this.layers[i].type == "objectgroup") {
        if (groupName == null || groupName == this.layers[i].name) {
          //レイヤー情報をクローンする
          const obj = this._cloneObjectLayer(this.layers[i]);
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
    let numLayer = 0;
    for (var i = 0; i < this.layers.length; i++) {
      if (this.layers[i].type == "layer" || this.layers[i].type == "imagelayer") numLayer++;
    }
    if (numLayer == 0) return null;

    let generated = false;
    const width = this.width * this.tilewidth;
    const height = this.height * this.tileheight;
    const canvas = phina.graphics.Canvas().setSize(width, height);

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
          const layer = this.layers[i];
          const opacity = layer.opacity || 1.0;
          layer.objects.forEach(e => {
            if (e.gid) {
              this._setMapChip(canvas, e.gid, e.x, e.y, opacity);
            }
          });
          generated = true;
        }
        //イメージレイヤー
        if (this.layers[i].type == "imagelayer" && this.layers[i].visible != "0") {
          var image = phina.asset.AssetManager.get('image', this.layers[i].image.source);
          canvas.context.drawImage(image.domElement, this.layers[i].x, this.layers[i].y);
          generated = true;
        }
      }
    }

    if (!generated) return null;

    const texture = phina.asset.Texture();
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
    let result = {}.$safe(srcLayer);
    result.objects = [];
    //レイヤー内オブジェクトのコピー
    srcLayer.objects.forEach(function(obj){
      const resObj = {
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
    const map = data.getElementsByTagName('map')[0];
    const attr = this._attrToJSON(map);
    this.$extend(attr);
    this.properties = this._propertiesToJSON(map);

    //タイルセット取得
    this.tilesets = this._parseTilesets(data);

    //タイルセット情報補完
    const defaultAttr = {
      tilewidth: 32,
      tileheight: 32,
      spacing: 0,
      margin: 0,
    };
    this.tilesets.chips = [];
    for (var i = 0; i < this.tilesets.length; i++) {
      //タイルセット属性情報取得
      const attr = this._attrToJSON(data.getElementsByTagName('tileset')[i]);
      attr.$safe(defaultAttr);
      attr.firstgid--;
      this.tilesets[i].$extend(attr);

      //マップチップリスト作成
      var t = this.tilesets[i];
      this.tilesets[i].mapChip = [];
      for (var r = attr.firstgid; r < attr.firstgid+attr.tilecount; r++) {
        const chip = {
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
    const that = this;
    const imageSource = [];
    const loadImage = [];

    //一覧作成
    for (var i = 0; i < this.tilesets.length; i++) {
      const obj = {
        image: this.tilesets[i].image,
        transR: this.tilesets[i].transR,
        transG: this.tilesets[i].transG,
        transB: this.tilesets[i].transB,
      };
      imageSource.push(obj);
    }
    for (var i = 0; i < this.layers.length; i++) {
      if (this.layers[i].image) {
        const obj = {
          image: this.layers[i].image.source
        };
        imageSource.push(obj);
      }
    }

    //アセットにあるか確認
    for (var i = 0; i < imageSource.length; i++) {
      const image = phina.asset.AssetManager.get('image', imageSource[i].image);
      if (image) {
        //アセットにある
      } else {
        //なかったのでロードリストに追加
        loadImage.push(imageSource[i]);
      }
    }

    //一括ロード
    //ロードリスト作成
    const assets = {
      image: []
    };
    for (var i = 0; i < loadImage.length; i++) {
      //イメージのパスをマップと同じにする
      assets.image[loadImage[i].image] = this.path+loadImage[i].image;
    }
    if (loadImage.length) {
      const loader = phina.asset.AssetLoader();
      loader.load(assets);
      loader.on('load', () => {
        //透過色設定反映
        loadImage.forEach(elm => {
          var image = phina.asset.AssetManager.get('image', elm.image);
          if (elm.transR !== undefined) {
            const r = elm.transR, g = elm.transG, b = elm.transB;
            image.filter(function(pixel, index, x, y, bitmap) {
              const data = bitmap.data;
              if (pixel[0] == r && pixel[1] == g && pixel[2] == b) {
                data[index+3] = 0;
              }
            });
          }
        });
        //読み込み終了
        that._resolve(that);
      });
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
    const chip = this.tilesets.chips[index];
    if (!chip) {
      return;
    }
    const image = phina.asset.AssetManager.get('image', chip.image);
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
    const properties = elm.getElementsByTagName("properties")[0];
    const obj = {};
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
    const obj = {};
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
    const obj = {};
    for (var i = 0; i < source.attributes.length; i++) {
      const val = source.attributes[i].value;
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
    const each = Array.prototype.forEach;
    const self = this;
    const data = [];
    const tilesets = xml.getElementsByTagName('tileset');
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
    const each = Array.prototype.forEach;
    const data = [];

    const map = xml.getElementsByTagName("map")[0];
    const layers = [];
    each.call(map.childNodes, function(elm) {
      if (elm.tagName == "layer" || elm.tagName == "objectgroup" || elm.tagName == "imagelayer") {
        layers.push(elm);
      }
    });

    layers.each(layer => {
      switch (layer.tagName) {
        case "layer":
          //通常レイヤー
          const d = layer.getElementsByTagName('data')[0];
          const encoding = d.getAttribute("encoding");
          const l = {
            type: "layer",
            name: layer.getAttribute("name"),
          };

          if (encoding == "csv") {
            l.data = this._parseCSV(d.textContent);
          } else if (encoding == "base64") {
            l.data = this._parseBase64(d.textContent);
          }

          const attr = this._attrToJSON(layer);
          l.$extend(attr);
          l.properties = this._propertiesToJSON(layer);

          data.push(l);
          break;

        //オブジェクトレイヤー
        case "objectgroup":
          const l = {
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
          each.call(layer.childNodes, elm => {
            if (elm.nodeType == 3) return;
            const d = this._attrToJSON(elm);
            if (d.id === undefined) return;
            d.properties = this._propertiesToJSON(elm);
            //子要素の解析
            if (elm.childNodes.length) {
              elm.childNodes.forEach(e => {
                if (e.nodeType == 3) return;
                //楕円
                if (e.nodeName == 'ellipse') {
                  d.ellipse = true;
                }
                //多角形
                if (e.nodeName == 'polygon') {
                  d.polygon = [];
                  const attr = this._attrToJSON_str(e);
                  const pl = attr.points.split(" ");
                  pl.forEach(function(str) {
                    var pts = str.split(",");
                    d.polygon.push({x: parseFloat(pts[0]), y: parseFloat(pts[1])});
                  });
                }
                //線分
                if (e.nodeName == 'polyline') {
                  d.polyline = [];
                  const attr = this._attrToJSON_str(e);
                  const pl = attr.points.split(" ");
                  pl.forEach(function(str) {
                    const pts = str.split(",");
                    d.polyline.push({x: parseFloat(pts[0]), y: parseFloat(pts[1])});
                  });
                }
              });
            }
            l.objects.push(d);
          });

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
    });
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
    const dataList = data.split(',');
    const layer = [];

    dataList.each((elm, i) => {
      const num = parseInt(elm, 10) - 1;
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
    const dataList = atob(data.trim());
    const rst = [];

    dataList = dataList.split('').map(e => e.charCodeAt(0));

    for (var i = 0, len = dataList.length / 4; i < len; ++i) {
      const n = dataList[i * 4];
      rst[i] = parseInt(n, 10) - 1;
    }

    return rst;
  },
});

//アセットローダーに登録
phina.asset.AssetLoader.register("tmx", (key, path) => {
  const tmx = phina.asset.TiledMap();
  return tmx.load(path);
});

/*
 *  MainScene.js
 *  2018/09/20
 */

phina.namespace(function() {

  phina.define("MainScene", {
    superClass: 'DisplayScene',
    init: function() {
      this.superInit({ width: SC_W, height: SC_H });

      this.threeLayer = ThreeLayerEx({ width: SC_W, height: SC_H })
        .addChildTo(this)
        .setPosition(SC_W * 0.5, SC_H * 0.5);

      this.camera = this.threeLayer.camera;
      this.camera.position.z = 100;

      this.spriteLayer = DisplayElement().addChildTo(this);

      this.setupCharacters();
    },

    update: function() {
    },

    setupCharacters: function() {
      var parser = new vox.Parser();
      parser.parse("assets/vox/elf.vox")
        .then(data => {
          var builder = new vox.MeshBuilder(data, {
            voxelSize: 1.0,
            vertexColor: false,
            optimizeFaces: true,
          });
          var mesh = builder.createMesh();
          this.threeLayer.scene.add(mesh);
        });
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
      const assets = AssetList.get({ assetType: "splash" });
      this.loader = phina.asset.AssetLoader();
      this.loader.load(assets);
      this.loader.on('load', () => this.loadcomplete1 = true);
      this.loader.on('progress', e => this.progress1 = Math.floor(e.progress * 100));

      //logo
      const texture = phina.asset.Texture();
      texture.load(SplashScene.logo).then(() => this._init());
      this.texture = texture;
    },

    _init: function() {
      this.sprite = phina.display.Sprite(this.texture)
        .addChildTo(this)
        .setPosition(this.gridX.center(), this.gridY.center())
      this.sprite.alpha = 0;

      this.sprite.tweener.clear()
        .to({ alpha: 1 }, 500, 'easeOutCubic')
        .wait(500)
        .call(() => this.unlock = true);

      var that = this;
      //進捗ゲージ
      var options = {
        width: SC_W * 0.3,
        height: 10,
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
          .call(() => this.exit());
        this.progressGauge.tweener.clear().to({ alpha:0 }, 10, 'easeOutCubic')
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
    superClass: "Object3D",

    characterType: null,
    threeObject: null,

    init: function() {
      this.superInit();
    },

  });

});

/*
 *  Object3D.js
 *  2018/09/20
 *  Three.jsオブジェクト管理クラス
 */

phina.namespace(function() {

  phina.define("Object3D", {
    superClass: "phina.app.Element",

    _obj: null,

    init: function(options) {
      this.superInit();

      options = ({}).$safe(options, {
        position: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        rotation: new THREE.Euler(0),
      });

      this._obj = options.threeObject;

      this.position.copy(options.position);
      this.scale.copy(options.scale);
      this.rotation.copy(options.rotation);
    },

    _accessor: {
      x: {
        "get": function()   { return this.position.x; },
        "set": function(v)  { this.position.x = v; }
      },
      y: {
        "get": function()   { return this.position.y; },
        "set": function(v)  { this.position.y = v; }
      },
      z: {
        "get": function()   { return this.position.z; },
        "set": function(v)  { this.position.z = v; }
      },
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCIwMTBfYXBwbGljYXRpb24vQXBwbGljYXRpb24uanMiLCIwMTBfYXBwbGljYXRpb24vQXNzZXRMaXN0LmpzIiwiMDEwX2FwcGxpY2F0aW9uL2JlbnJpLmpzIiwiMDAwX3BsdWdpbnMvcGhpbmEuVGhyZWVMYXllckV4LmpzIiwiMDAwX3BsdWdpbnMvcGhpbmEuYXNzZXRsb2FkZXJleC5qcyIsIjAwMF9wbHVnaW5zL3BoaW5hLmV4dGVuc2lvbi5qcyIsIjAwMF9wbHVnaW5zL3BoaW5hLnRpbGVkbWFwLmpzIiwiMDIwX3NjZW5lL01haW5TY2VuZS5qcyIsIjAyMF9zY2VuZS9NYWluU2NlbmVGbG93LmpzIiwiMDIwX3NjZW5lL1NwbGFzaFNjZW5lLmpzIiwiMDIwX3NjZW5lL1RpdGxlU2NlbmUuanMiLCIwMzBfYmFzZS9DaGFyYWN0ZXIuanMiLCIwMzBfYmFzZS9PYmplY3QzRC5qcyIsIjA0MF9wbGF5ZXIvUGxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InBoaW5hX2FwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiAgbWFpbi5qc1xuICogIDIwMTgvMDkvMjBcbiAqL1xuXG5waGluYS5nbG9iYWxpemUoKTtcblxuY29uc3QgU0NfVyA9IDY0MDtcbmNvbnN0IFNDX0ggPSAxMTM2O1xuXG5sZXQgYXBwO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIGFwcCA9IEFwcGxpY2F0aW9uKCk7XG4gIGFwcC5yZXBsYWNlU2NlbmUoTWFpblNjZW5lRmxvdygpKTtcblxuICBhcHAucnVuKCk7XG4vLyAgYXBwLmVuYWJsZVN0YXRzKCk7XG59O1xuIiwicGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkFwcGxpY2F0aW9uXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcIkNhbnZhc0FwcFwiLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgIHF1ZXJ5OiAnI3dvcmxkJyxcbiAgICAgICAgd2lkdGg6IFNDX1csXG4gICAgICAgIGhlaWdodDogU0NfSCxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgwLCAwLCAwLCAxKScsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuZnBzID0gNjA7XG4gICAgfSxcblxuICAgIF9vbkxvYWRBc3NldHM6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG4gIH0pO1xuXG59KTsiLCIvKlxuICogIEFzc2V0TGlzdC5qc1xuICogIDIwMTgvMDkvMjBcbiAqIFxuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoXCJBc3NldExpc3RcIiwge1xuICAgIF9zdGF0aWM6IHtcbiAgICAgIGxvYWRlZDogW10sXG4gICAgICBpc0xvYWRlZDogZnVuY3Rpb24oYXNzZXRUeXBlKSB7XG4gICAgICAgIHJldHVybiBBc3NldExpc3QubG9hZGVkW2Fzc2V0VHlwZV0/IHRydWU6IGZhbHNlO1xuICAgICAgfSxcbiAgICAgIGdldDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBBc3NldExpc3QubG9hZGVkW29wdGlvbnMuYXNzZXRUeXBlXSA9IHRydWU7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5hc3NldFR5cGUpIHtcbiAgICAgICAgICBjYXNlIFwic3BsYXNoXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICAgIFwiYWN0b3I0XCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3I0LnBuZ1wiLFxuICAgICAgICAgICAgICAgIFwiYWN0b3IxOVwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yMTkucG5nXCIsXG4gICAgICAgICAgICAgICAgXCJhY3RvcjQwXCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3I0MC5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yNTVcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjU1LnBuZ1wiLFxuICAgICAgICAgICAgICAgIFwiYWN0b3I2NFwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNjRfYS5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yNjQyXCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3I2NF9iLnBuZ1wiLFxuICAgICAgICAgICAgICAgIFwiYWN0b3IxMDhcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjEwOC5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yMTExXCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3IxMTEucG5nXCIsXG4gICAgICAgICAgICAgICAgXCJhY3RvcjExMlwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yMTEyLnBuZ1wiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlIFwiY29tbW9uXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICAgIFwiYWN0b3I0XCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3I0LnBuZ1wiLFxuICAgICAgICAgICAgICAgIFwiYWN0b3IxOVwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yMTkucG5nXCIsXG4gICAgICAgICAgICAgICAgXCJhY3RvcjQwXCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3I0MC5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yNTVcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjU1LnBuZ1wiLFxuICAgICAgICAgICAgICAgIFwiYWN0b3I2NFwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yNjRfYS5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yNjQyXCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3I2NF9iLnBuZ1wiLFxuICAgICAgICAgICAgICAgIFwiYWN0b3IxMDhcIjogIFwiYXNzZXRzL2ltYWdlcy9hY3RvcjEwOC5wbmdcIixcbiAgICAgICAgICAgICAgICBcImFjdG9yMTExXCI6ICBcImFzc2V0cy9pbWFnZXMvYWN0b3IxMTEucG5nXCIsXG4gICAgICAgICAgICAgICAgXCJhY3RvcjExMlwiOiAgXCJhc3NldHMvaW1hZ2VzL2FjdG9yMTEyLnBuZ1wiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgXCJpbnZhbGlkIGFzc2V0VHlwZTogXCIgKyBvcHRpb25zLmFzc2V0VHlwZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxufSk7XG4iLCIvKlxuICogIEJlbnJpLmpzXG4gKiAgMjAxNC8xMi8xOFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cbiBcbnZhciB0b1JhZCA9IDMuMTQxNTkvMTgwOyAgLy/lvKfluqbms5V0b+ODqeOCuOOCouODs+WkieaPm1xudmFyIHRvRGVnID0gMTgwLzMuMTQxNTk7ICAvL+ODqeOCuOOCouODs3Rv5byn5bqm5rOV5aSJ5o+bXG5cbi8v6Led6Zui6KiI566XXG52YXIgZGlzdGFuY2UgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICB2YXIgeCA9IGZyb20ueC10by54O1xuICB2YXIgeSA9IGZyb20ueS10by55O1xuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCt5KnkpO1xufVxuXG4vL+i3nembouioiOeul++8iOODq+ODvOODiOeEoeOBl+eJiO+8iVxudmFyIGRpc3RhbmNlU3EgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICB2YXIgeCA9IGZyb20ueCAtIHRvLng7XG4gIHZhciB5ID0gZnJvbS55IC0gdG8ueTtcbiAgcmV0dXJuIHgqeCt5Knk7XG59XG5cbi8v5pWw5YCk44Gu5Yi26ZmQXG52YXIgY2xhbXAgPSBmdW5jdGlvbih4LCBtaW4sIG1heCkge1xuICByZXR1cm4gKHg8bWluKT9taW46KCh4Pm1heCk/bWF4OngpO1xufTtcblxuLy/kubHmlbDnlJ/miJBcbnZhciBwcmFuZCA9IHBoaW5hLnV0aWwuUmFuZG9tKCk7XG52YXIgcmFuZCA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gIHJldHVybiBwcmFuZC5yYW5kaW50KG1pbiwgbWF4KTtcbn1cblxuLy/jgr/jgqTjg4jjg6vnhKHjgZfjg4DjgqTjgqLjg63jgrBcbnZhciBBZHZhbmNlQWxlcnQgPSBmdW5jdGlvbihzdHIpIHtcbiAgdmFyIHRtcEZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIHRtcEZyYW1lLnNldEF0dHJpYnV0ZSgnc3JjJywgJ2RhdGE6dGV4dC9wbGFpbiwnKTtcbiAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKHRtcEZyYW1lKTtcblxuICB3aW5kb3cuZnJhbWVzWzBdLndpbmRvdy5hbGVydChzdHIpO1xuICB0bXBGcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRtcEZyYW1lKTtcbn07XG52YXIgQWR2YW5jZUNvbmZpcm0gPSBmdW5jdGlvbihzdHIpIHtcbiAgdmFyIHRtcEZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIHRtcEZyYW1lLnNldEF0dHJpYnV0ZSgnc3JjJywgJ2RhdGE6dGV4dC9wbGFpbiwnKTtcbiAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKHRtcEZyYW1lKTtcblxuICB2YXIgcmVzdWx0ID0gd2luZG93LmZyYW1lc1swXS53aW5kb3cuY29uZmlybShzdHIpO1xuICB0bXBGcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRtcEZyYW1lKTtcblxuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsInBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ1RocmVlTGF5ZXJFeCcsIHtcbiAgICBzdXBlckNsYXNzOiAncGhpbmEuZGlzcGxheS5MYXllcicsXG5cbiAgICBzY2VuZTogbnVsbCxcbiAgICBjYW1lcmE6IG51bGwsXG4gICAgbGlnaHQ6IG51bGwsXG4gICAgcmVuZGVyZXI6IG51bGwsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdChvcHRpb25zKTtcblxuICAgICAgdGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gICAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSggNzUsIG9wdGlvbnMud2lkdGggLyBvcHRpb25zLmhlaWdodCwgMSwgMTAwMDAgKTtcbiAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSAxMDA7XG5cbiAgICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCggMHhmZmZmZmYsIDEgKTtcbiAgICAgIHRoaXMubGlnaHQucG9zaXRpb24uc2V0KCAxLCAxLCAxICkubm9ybWFsaXplKCk7XG4gICAgICB0aGlzLnNjZW5lLmFkZCggdGhpcy5saWdodCApO1xuXG4gICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0Q2xlYXJDb2xvciggMHgwMDAwMDAgKTtcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSggb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQgKTtcblxuICAgICAgdGhpcy5vbignZW50ZXJmcmFtZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlciggdGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEgKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmRvbUVsZW1lbnQgPSB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQ7XG4gICAgfSxcblxuICAgIGFkZFNjZW5lOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIHRoaXMuc2NlbmUuYWRkKG9iamVjdCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICB9KTtcbn0pO1xuIiwiLypcbiAqICBwaGluYS5hc3NldGxvYWRlcmV4LmpzXG4gKiAgMjAxNi8xMS8yNVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmV4dGVuc2lvbiA9IHBoaW5hLmV4dGVuc2lvbiB8fCB7fTtcblxuLy/jg5Djg4Pjgq/jgrDjg6njgqbjg7Pjg4njgafjgqLjgrvjg4Pjg4joqq3jgb/ovrzjgb9cbnBoaW5hLmRlZmluZShcInBoaW5hLmV4dGVuc2lvbi5Bc3NldExvYWRlckV4XCIsIHtcblxuICAvL+mAsuaNl1xuICBsb2FkcHJvZ3Jlc3M6IDAsXG5cbiAgLy/oqq3jgb/ovrzjgb/ntYLkuobjg5Xjg6njgrBcbiAgbG9hZGNvbXBsZXRlOiBmYWxzZSxcblxuICBpbml0OiBmdW5jdGlvbigpIHtcbiAgfSxcblxuICBsb2FkOiBmdW5jdGlvbihhc3NldHMsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fb25Mb2FkQXNzZXRzID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKXt9O1xuICAgIGNvbnN0IGxvYWRlciA9IHBoaW5hLmFzc2V0LkFzc2V0TG9hZGVyKCk7XG4gICAgbG9hZGVyLmxvYWQoYXNzZXRzKTtcbiAgICBsb2FkZXIub24oJ2xvYWQnLCBlID0+IHtcbiAgICAgIHRoaXMubG9hZGNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgIHRoaXMuX29uTG9hZEFzc2V0cygpO1xuICAgIH0pO1xuICAgIGxvYWRlci5vbnByb2dyZXNzID0gZSA9PiB7XG4gICAgICB0aGlzLmxvYWRwcm9ncmVzcyA9IGUucHJvZ3Jlc3M7XG4gICAgfTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbn0pO1xuIiwiLypcbiAqICBwaGluYS5leHRlbnNpb24uanNcbiAqICAyMDE2LzExLzI1XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxucGhpbmEuZXh0ZW5zaW9uID0gcGhpbmEuZXh0ZW5zaW9uIHx8IHt9O1xuXG4vL3NldEFscGhh44KS6L+95YqgXG5waGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50LnByb3RvdHlwZS5zZXRBbHBoYSA9IGZ1bmN0aW9uKHZhbCkge1xuICB0aGlzLmFscGhhID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8v44K544OX44Op44Kk44OI5qmf6IO95ouh5by1XG5waGluYS5kaXNwbGF5LlNwcml0ZS5wcm90b3R5cGUuc2V0RnJhbWVUcmltbWluZyA9IGZ1bmN0aW9uKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgdGhpcy5fZnJhbWVUcmltWCA9IHggfHwgMDtcbiAgdGhpcy5fZnJhbWVUcmltWSA9IHkgfHwgMDtcbiAgdGhpcy5fZnJhbWVUcmltV2lkdGggPSB3aWR0aCB8fCB0aGlzLmltYWdlLmRvbUVsZW1lbnQud2lkdGggLSB0aGlzLl9mcmFtZVRyaW1YO1xuICB0aGlzLl9mcmFtZVRyaW1IZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy5pbWFnZS5kb21FbGVtZW50LmhlaWdodCAtIHRoaXMuX2ZyYW1lVHJpbVk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5waGluYS5kaXNwbGF5LlNwcml0ZS5wcm90b3R5cGUuc2V0RnJhbWVJbmRleCA9IGZ1bmN0aW9uKGluZGV4LCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBzeCA9IHRoaXMuX2ZyYW1lVHJpbVggfHwgMDtcbiAgdmFyIHN5ID0gdGhpcy5fZnJhbWVUcmltWSB8fCAwO1xuICB2YXIgc3cgPSB0aGlzLl9mcmFtZVRyaW1XaWR0aCAgfHwgKHRoaXMuaW1hZ2UuZG9tRWxlbWVudC53aWR0aC1zeCk7XG4gIHZhciBzaCA9IHRoaXMuX2ZyYW1lVHJpbUhlaWdodCB8fCAodGhpcy5pbWFnZS5kb21FbGVtZW50LmhlaWdodC1zeSk7XG5cbiAgdmFyIHR3ICA9IHdpZHRoIHx8IHRoaXMud2lkdGg7ICAgIC8vIHR3XG4gIHZhciB0aCAgPSBoZWlnaHQgfHwgdGhpcy5oZWlnaHQ7ICAvLyB0aFxuICB2YXIgcm93ID0gfn4oc3cgLyB0dyk7XG4gIHZhciBjb2wgPSB+fihzaCAvIHRoKTtcbiAgdmFyIG1heEluZGV4ID0gcm93KmNvbDtcbiAgaW5kZXggPSBpbmRleCVtYXhJbmRleDtcblxuICB2YXIgeCAgID0gaW5kZXggJSByb3c7XG4gIHZhciB5ICAgPSB+fihpbmRleCAvIHJvdyk7XG4gIHRoaXMuc3JjUmVjdC54ID0gc3ggKyB4ICogdHc7XG4gIHRoaXMuc3JjUmVjdC55ID0gc3kgKyB5ICogdGg7XG4gIHRoaXMuc3JjUmVjdC53aWR0aCAgPSB0dztcbiAgdGhpcy5zcmNSZWN0LmhlaWdodCA9IHRoO1xuXG4gIHRoaXMuX2ZyYW1lSW5kZXggPSBpbmRleDtcblxuICByZXR1cm4gdGhpcztcbn1cblxuLy/jgqjjg6zjg6Hjg7Pjg4jlkIzlo6vjga7mjqXop6bliKTlrppcbnBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnQucHJvdG90eXBlLmlzSGl0RWxlbWVudCA9IGZ1bmN0aW9uKGVsbSkge1xuICAvL+iHquWIhuOBqOODhuOCueODiOWvvuixoeOCkuOCsOODreODvOODkOODq+OBuOWkieaPm1xuICB2YXIgcCA9IHRoaXMuZ2xvYmFsVG9Mb2NhbChlbG0pO1xuICB2YXIgdGFyZ2V0ID0gcGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudCh7d2lkdGg6IGVsbS53aWR0aCwgaGVpZ2h0OiBlbG0uaGVpZ2h0fSkuc2V0UG9zaXRpb24ocC54LCBwLnkpO1xuXG4gIGlmICh0aGlzLmJvdW5kaW5nVHlwZSA9PSAncmVjdCcpIHtcbiAgICBpZiAoZWxtLmJvdW5kaW5nVHlwZSA9PSAncmVjdCcpIHtcbiAgICAgIHJldHVybiBwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0UmVjdFJlY3QodGhpcywgdGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RSZWN0Q2lyY2xlKHRoaXMsIHRhcmdldCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChlbG0uYm91bmRpbmdUeXBlID09ICdyZWN0Jykge1xuICAgICAgcmV0dXJuIHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RDaWVjbGVSZWN0KHRoaXMsIHRhcmdldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0Q2lyY2xlQ2lyY2xlKHRoaXMsIHRhcmdldCk7XG4gICAgfVxuICB9XG59XG5cbi8v5a2Q6KaB57Sg5YWo44Gm5YiH44KK6Zui44GXXG5waGluYS5hcHAuRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlQ2hpbGRyZW4gPSBmdW5jdGlvbihiZWdpbkluZGV4KSB7XG4gIGJlZ2luSW5kZXggPSBiZWdpbkluZGV4IHx8IDA7XG4gIGNvbnN0IHRlbXBDaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW4uc2xpY2UoKTtcbiAgY29uc3QgbGVuID0gdGVtcENoaWxkcmVuLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IGJlZ2luSW5kZXg7IGkgPCBsZW47ICsraSkge1xuICAgIHRlbXBDaGlsZHJlbltpXS5yZW1vdmUoKTtcbiAgfVxuICB0aGlzLmNoaWxkcmVuID0gW107XG59XG5cbi8qKlxuICogQG1ldGhvZCB0ZXN0TGluZUxpbmVcbiAqIEBzdGF0aWNcbiAqIDLjgaTjga7nt5rliIbjgYzph43jgarjgaPjgabjgYTjgovjgYvjganjgYbjgYvjgpLliKTlrprjgZfjgb7jgZlcbiAqIOWPguiAg++8mmh0dHA6Ly93d3c1ZC5iaWdsb2JlLm5lLmpwL350b21veWEwMy9zaHRtbC9hbGdvcml0aG0vSW50ZXJzZWN0aW9uLmh0bVxuICpcbiAqICMjIyBFeGFtcGxlXG4gKiAgIHAxID0gcGhpbmEuZ2VvbS5WZWN0b3IyKDEwMCwgMTAwKTtcbiAqICAgcDIgPSBwaGluYS5nZW9tLlZlY3RvcjIoMjAwLCAyMDApO1xuICogICBwMyA9IHBoaW5hLmdlb20uVmVjdG9yMigxNTAsIDI0MCk7XG4gKiAgIHA0ID0gcGhpbmEuZ2VvbS5WZWN0b3IyKDIwMCwgMTAwKTtcbiAqIHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RMaW5lTGluZShwMSwgcDIsIHAzLCBwNCk7IC8vID0+IHRydWVcbiAqXG4gKiBAcGFyYW0ge3BoaW5hLmdlb20uVmVjdG9yMn0gcDEg57ea5YiGMeOBruerr+OBruW6p+aomVxuICogQHBhcmFtIHtwaGluYS5nZW9tLlZlY3RvcjJ9IHAyIOe3muWIhjHjga7nq6/jga7luqfmqJlcbiAqIEBwYXJhbSB7cGhpbmEuZ2VvbS5WZWN0b3IyfSBwMyDnt5rliIYy44Gu56uv44Gu5bqn5qiZXG4gKiBAcGFyYW0ge3BoaW5hLmdlb20uVmVjdG9yMn0gcDQg57ea5YiGMuOBruerr+OBruW6p+aomVxuICogQHJldHVybiB7Qm9vbGVhbn0g57ea5YiGMeOBqOe3muWIhjLjgYzph43jgarjgaPjgabjgYTjgovjgYvjganjgYbjgYtcbiAqL1xucGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdExpbmVMaW5lID0gZnVuY3Rpb24ocDEsIHAyLCBwMywgcDQpIHtcbiAgLy/lkIzkuIDvvLjvvLnou7jkuIrjgavkuZfjgaPjgabjgovloLTlkIjjga7oqqTliKTlrprlm57pgb9cbiAgaWYgKHAxLnggPT0gcDIueCAmJiBwMS54ID09IHAzLnggJiYgcDEueCA9PSBwNC54KSB7XG4gIHZhciBtaW4gPSBNYXRoLm1pbihwMS55LCBwMi55KTtcbiAgdmFyIG1heCA9IE1hdGgubWF4KHAxLnksIHAyLnkpO1xuICBpZiAobWluIDw9IHAzLnkgJiYgcDMueSA8PSBtYXggfHwgbWluIDw9IHA0LnkgJiYgcDQueSA8PSBtYXgpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHAxLnkgPT0gcDIueSAmJiBwMS55ID09IHAzLnkgJiYgcDEueSA9PSBwNC55KSB7XG4gIHZhciBtaW4gPSBNYXRoLm1pbihwMS54LCBwMi54KTtcbiAgdmFyIG1heCA9IE1hdGgubWF4KHAxLngsIHAyLngpO1xuICBpZiAobWluIDw9IHAzLnggJiYgcDMueCA8PSBtYXggfHwgbWluIDw9IHA0LnggJiYgcDQueCA8PSBtYXgpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGEgPSAocDEueCAtIHAyLngpICogKHAzLnkgLSBwMS55KSArIChwMS55IC0gcDIueSkgKiAocDEueCAtIHAzLngpO1xuICB2YXIgYiA9IChwMS54IC0gcDIueCkgKiAocDQueSAtIHAxLnkpICsgKHAxLnkgLSBwMi55KSAqIChwMS54IC0gcDQueCk7XG4gIHZhciBjID0gKHAzLnggLSBwNC54KSAqIChwMS55IC0gcDMueSkgKyAocDMueSAtIHA0LnkpICogKHAzLnggLSBwMS54KTtcbiAgdmFyIGQgPSAocDMueCAtIHA0LngpICogKHAyLnkgLSBwMy55KSArIChwMy55IC0gcDQueSkgKiAocDMueCAtIHAyLngpO1xuICByZXR1cm4gYSAqIGIgPD0gMCAmJiBjICogZCA8PSAwO1xufVxuXG4vKipcbiAqIEBtZXRob2QgdGVzdFJlY3RMaW5lXG4gKiBAc3RhdGljXG4gKiDnn6nlvaLjgajnt5rliIbjgYzph43jgarjgaPjgabjgYTjgovjgYvjganjgYbjgYvjgpLliKTlrprjgZfjgb7jgZlcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICogICByZWN0ID0gcGhpbmEuZ2VvbS5SZWN0KDEyMCwgMTMwLCA0MCwgNTApO1xuICogICBwMSA9IHBoaW5hLmdlb20uVmVjdG9yMigxMDAsIDEwMCk7XG4gKiAgIHAyID0gcGhpbmEuZ2VvbS5WZWN0b3IyKDIwMCwgMjAwKTtcbiAqIHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RSZWN0TGluZShyZWN0LCBwMSwgcDIpOyAvLyA9PiB0cnVlXG4gKlxuICogQHBhcmFtIHtwaGluYS5nZW9tLlJlY3R9IHJlY3Qg55+p5b2i6aCY5Z+f44Kq44OW44K444Kn44Kv44OIXG4gKiBAcGFyYW0ge3BoaW5hLmdlb20uVmVjdG9yMn0gcDEg57ea5YiG44Gu56uv44Gu5bqn5qiZXG4gKiBAcGFyYW0ge3BoaW5hLmdlb20uVmVjdG9yMn0gcDIg57ea5YiG44Gu56uv44Gu5bqn5qiZXG4gKiBAcmV0dXJuIHtCb29sZWFufSDnn6nlvaLjgajnt5rliIbjgYzph43jgarjgaPjgabjgYTjgovjgYvjganjgYbjgYtcbiAqL1xucGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdFJlY3RMaW5lID0gZnVuY3Rpb24ocmVjdCwgcDEsIHAyKSB7XG4gIC8v5YyF5ZCr5Yik5a6aKHAx44GM5ZCr44G+44KM44Gm44KM44Gw6Imv44GE44Gu44GncDLjga7liKTlrprjga/jgZfjgarjgYTvvIlcbiAgaWYgKHJlY3QubGVmdCA8PSBwMS54ICYmIHAxLnggPD0gcmVjdC5yaWdodCAmJiByZWN0LnRvcCA8PSBwMS55ICYmIHAxLnkgPD0gcmVjdC5ib3R0b20gKSByZXR1cm4gdHJ1ZTtcblxuICAvL+efqeW9ouOBru+8lOeCuVxuICB2YXIgcjEgPSBwaGluYS5nZW9tLlZlY3RvcjIocmVjdC5sZWZ0LCByZWN0LnRvcCk7ICAgLy/lt6bkuIpcbiAgdmFyIHIyID0gcGhpbmEuZ2VvbS5WZWN0b3IyKHJlY3QucmlnaHQsIHJlY3QudG9wKTsgIC8v5Y+z5LiKXG4gIHZhciByMyA9IHBoaW5hLmdlb20uVmVjdG9yMihyZWN0LnJpZ2h0LCByZWN0LmJvdHRvbSk7IC8v5Y+z5LiLXG4gIHZhciByNCA9IHBoaW5hLmdlb20uVmVjdG9yMihyZWN0LmxlZnQsIHJlY3QuYm90dG9tKTsgIC8v5bem5LiLXG5cbiAgLy/nn6nlvaLjga7vvJTovrrjgpLjgarjgZnnt5rliIbjgajjga7mjqXop6bliKTlrppcbiAgaWYgKHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RMaW5lTGluZShwMSwgcDIsIHIxLCByMikpIHJldHVybiB0cnVlO1xuICBpZiAocGhpbmEuZ2VvbS5Db2xsaXNpb24udGVzdExpbmVMaW5lKHAxLCBwMiwgcjIsIHIzKSkgcmV0dXJuIHRydWU7XG4gIGlmIChwaGluYS5nZW9tLkNvbGxpc2lvbi50ZXN0TGluZUxpbmUocDEsIHAyLCByMywgcjQpKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHBoaW5hLmdlb20uQ29sbGlzaW9uLnRlc3RMaW5lTGluZShwMSwgcDIsIHIxLCByNCkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG5cblxuLy/lhoblvKfjga7mj4/nlLtcbnBoaW5hLmRlZmluZSgncGhpbmEuZGlzcGxheS5BcmNTaGFwZScsIHtcbiAgc3VwZXJDbGFzczogJ3BoaW5hLmRpc3BsYXkuU2hhcGUnLFxuXG4gIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gKHt9KS4kc2FmZShvcHRpb25zLCB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICBmaWxsOiAncmVkJyxcbiAgICAgIHN0cm9rZTogJyNhYWEnLFxuICAgICAgc3Ryb2tlV2lkdGg6IDQsXG4gICAgICByYWRpdXM6IDMyLFxuICAgICAgc3RhcnRBbmdsZTogMCxcbiAgICAgIGVuZEFuZ2xlOiAyNzAsXG5cbiAgICAgIGFudGljbG9ja3dpc2U6IGZhbHNlLFxuICAgIH0pO1xuICAgIHRoaXMuc3VwZXJJbml0KG9wdGlvbnMpO1xuXG4gICAgdGhpcy5yYWRpdXMgPSBvcHRpb25zLnJhZGl1cztcbiAgICB0aGlzLnN0YXJ0QW5nbGUgPSBvcHRpb25zLnN0YXJ0QW5nbGU7XG4gICAgdGhpcy5lbmRBbmdsZSA9IG9wdGlvbnMuZW5kQW5nbGU7XG4gICAgdGhpcy5hbnRpY2xvY2t3aXNlID0gb3B0aW9ucy5hbnRpY2xvY2t3aXNlO1xuXG4gICAgdGhpcy5zZXRCb3VuZGluZ1R5cGUoJ2NpcmNsZScpO1xuICB9LFxuXG4gIHByZXJlbmRlcjogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgY2FudmFzLmZpbGxQaWUoMCwgMCwgdGhpcy5yYWRpdXMsIHRoaXMuc3RhcnRBbmdsZSwgdGhpcy5lbmRBbmdsZSk7XG4gIH0sXG59KTtcbiIsIi8qXG4gKiAgcGhpbmEudGlsZWRtYXAuanNcbiAqICAyMDE2LzA5LzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxuLyoqXG4gKiBAY2xhc3MgcGhpbmEuYXNzZXQuVGlsZWRNYXBcbiAqIEBleHRlbmRzIHBoaW5hLmFzc2V0LkFzc2V0XG4gKiAjIFRpbGVkTWFwRWRpdG9y44Gn5L2c5oiQ44GX44GfdG1444OV44Kh44Kk44Or44KS6Kqt44G/6L6844G/44Kv44Op44K5XG4gKi9cbnBoaW5hLmRlZmluZShcInBoaW5hLmFzc2V0LlRpbGVkTWFwXCIsIHtcbiAgc3VwZXJDbGFzczogXCJwaGluYS5hc3NldC5Bc3NldFwiLFxuXG4gIC8qKlxuICAgKiBAcHJvcGVydHkgaW1hZ2VcbiAgICog5L2c5oiQ44GV44KM44Gf44Oe44OD44OX55S75YOPXG4gICAqL1xuICBpbWFnZTogbnVsbCxcblxuICAvKipcbiAgICogQHByb3BlcnR5IHRpbGVzZXRzXG4gICAqIOOCv+OCpOODq+OCu+ODg+ODiOaDheWgsVxuICAgKi9cbiAgdGlsZXNldHM6IG51bGwsXG5cbiAgLyoqXG4gICAqIEBwcm9wZXJ0eSBsYXllcnNcbiAgICog44Os44Kk44Ok44O85oOF5aCx44GM5qC857SN44GV44KM44Gm44GE44KL6YWN5YiXXG4gICAqL1xuICBsYXllcnM6IG51bGwsXG5cbiAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdXBlckluaXQoKTtcbiAgfSxcblxuICBfbG9hZDogZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgIC8v44OR44K55oqc44GN5Ye644GXXG4gICAgdGhpcy5wYXRoID0gXCJcIjtcbiAgICBjb25zdCBsYXN0ID0gdGhpcy5zcmMubGFzdEluZGV4T2YoXCIvXCIpO1xuICAgIGlmIChsYXN0ID4gMCkge1xuICAgICAgdGhpcy5wYXRoID0gdGhpcy5zcmMuc3Vic3RyaW5nKDAsIGxhc3QrMSk7XG4gICAgfVxuXG4gICAgLy/ntYLkuobplqLmlbDkv53lrZhcbiAgICB0aGlzLl9yZXNvbHZlID0gcmVzb2x2ZTtcblxuICAgIC8vIGxvYWRcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCB4bWwgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4bWwub3BlbignR0VUJywgdGhpcy5zcmMpO1xuICAgIHhtbC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh4bWwucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICBpZiAoWzIwMCwgMjAxLCAwXS5pbmRleE9mKHhtbC5zdGF0dXMpICE9PSAtMSkge1xuICAgICAgICAgIHZhciBkYXRhID0geG1sLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICBkYXRhID0gKG5ldyBET01QYXJzZXIoKSkucGFyc2VGcm9tU3RyaW5nKGRhdGEsIFwidGV4dC94bWxcIik7XG4gICAgICAgICAgc2VsZi5kYXRhVHlwZSA9IFwieG1sXCI7XG4gICAgICAgICAgc2VsZi5kYXRhID0gZGF0YTtcbiAgICAgICAgICBzZWxmLl9wYXJzZShkYXRhKTtcbiAgICAgICAgICAvLyByZXNvbHZlKHNlbGYpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICB4bWwuc2VuZChudWxsKTtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBnZXRNYXBEYXRhXG4gICAqIOaMh+WumuOBl+OBn+ODnuODg+ODl+ODrOOCpOODpOODvOOCkumFjeWIl+OBqOOBl+OBpuWPluW+l+OBl+OBvuOBmeOAglxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbGF5ZXJOYW1lIOWvvuixoeODrOOCpOODpOODvOWQjVxuICAgKi9cbiAgZ2V0TWFwRGF0YTogZnVuY3Rpb24obGF5ZXJOYW1lKSB7XG4gICAgLy/jg6zjgqTjg6Tjg7zmpJzntKJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmxheWVyc1tpXS5uYW1lID09IGxheWVyTmFtZSkge1xuICAgICAgICAvL+OCs+ODlOODvOOCkui/lOOBmVxuICAgICAgICByZXR1cm4gdGhpcy5sYXllcnNbaV0uZGF0YS5jb25jYXQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgZ2V0T2JqZWN0R3JvdXBcbiAgICog44Kq44OW44K444Kn44Kv44OI44Kw44Or44O844OX44KS5Y+W5b6X44GX44G+44GZXG4gICAqXG4gICAqIOOCsOODq+ODvOODl+aMh+WumuOBjOeEoeOBhOWgtOWQiOOAgeWFqOODrOOCpOODpOODvOOCkumFjeWIl+OBq+OBl+OBpui/lOOBl+OBvuOBmeOAglxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZ3JvdW5wTmFtZSDlr77osaHjgqrjg5bjgrjjgqfjgq/jg4jjgrDjg6vjg7zjg5flkI1cbiAgICovXG4gIGdldE9iamVjdEdyb3VwOiBmdW5jdGlvbihncm91cE5hbWUpIHtcbiAgICBncm91cE5hbWUgPSBncm91cE5hbWUgfHwgbnVsbDtcbiAgICBjb25zdCBscyA9IFtdO1xuICAgIGNvbnN0IGxlbiA9IHRoaXMubGF5ZXJzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5sYXllcnNbaV0udHlwZSA9PSBcIm9iamVjdGdyb3VwXCIpIHtcbiAgICAgICAgaWYgKGdyb3VwTmFtZSA9PSBudWxsIHx8IGdyb3VwTmFtZSA9PSB0aGlzLmxheWVyc1tpXS5uYW1lKSB7XG4gICAgICAgICAgLy/jg6zjgqTjg6Tjg7zmg4XloLHjgpLjgq/jg63jg7zjg7PjgZnjgotcbiAgICAgICAgICBjb25zdCBvYmogPSB0aGlzLl9jbG9uZU9iamVjdExheWVyKHRoaXMubGF5ZXJzW2ldKTtcbiAgICAgICAgICBpZiAoZ3JvdXBOYW1lICE9PSBudWxsKSByZXR1cm4gb2JqO1xuICAgICAgICB9XG4gICAgICAgIGxzLnB1c2gob2JqKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIGdldE1hcEltYWdlXG4gICAqIOODnuODg+ODl+OCpOODoeODvOOCuOOBruS9nOaIkFxuICAgKlxuICAgKiDopIfmlbDjga7jg57jg4Pjg5fjg6zjgqTjg6Tjg7zjgpLmjIflrprlh7rmnaXjgb7jgZnjgIJcbiAgICog5o+P55S76aCG5bqP44GvVGlsZWRNYXBFZGl0b3LlgbTjgafjga7mjIflrprpoIbjgafjga/nhKHjgY/jgIHlvJXmlbDjga7poIbluo/jgajjgarjgorjgb7jgZnvvIjnrKzkuIDlvJXmlbDjgYzkuIDnlarkuIvjgajjgarjgovvvIlcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9ICDlr77osaHjg6zjgqTjg6Tjg7zlkI1cbiAgICovXG4gIGdldEltYWdlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgbGV0IG51bUxheWVyID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5sYXllcnNbaV0udHlwZSA9PSBcImxheWVyXCIgfHwgdGhpcy5sYXllcnNbaV0udHlwZSA9PSBcImltYWdlbGF5ZXJcIikgbnVtTGF5ZXIrKztcbiAgICB9XG4gICAgaWYgKG51bUxheWVyID09IDApIHJldHVybiBudWxsO1xuXG4gICAgbGV0IGdlbmVyYXRlZCA9IGZhbHNlO1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy53aWR0aCAqIHRoaXMudGlsZXdpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuaGVpZ2h0ICogdGhpcy50aWxlaGVpZ2h0O1xuICAgIGNvbnN0IGNhbnZhcyA9IHBoaW5hLmdyYXBoaWNzLkNhbnZhcygpLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZmluZCA9IGFyZ3MuaW5kZXhPZih0aGlzLmxheWVyc1tpXS5uYW1lKTtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSAwIHx8IGZpbmQgPj0gMCkge1xuICAgICAgICAvL+ODnuODg+ODl+ODrOOCpOODpOODvFxuICAgICAgICBpZiAodGhpcy5sYXllcnNbaV0udHlwZSA9PSBcImxheWVyXCIgJiYgdGhpcy5sYXllcnNbaV0udmlzaWJsZSAhPSBcIjBcIikge1xuICAgICAgICAgIHZhciBsYXllciA9IHRoaXMubGF5ZXJzW2ldO1xuICAgICAgICAgIHZhciBtYXBkYXRhID0gbGF5ZXIuZGF0YTtcbiAgICAgICAgICB2YXIgd2lkdGggPSBsYXllci53aWR0aDtcbiAgICAgICAgICB2YXIgaGVpZ2h0ID0gbGF5ZXIuaGVpZ2h0O1xuICAgICAgICAgIHZhciBvcGFjaXR5ID0gbGF5ZXIub3BhY2l0eSB8fCAxLjA7XG4gICAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgdmFyIGluZGV4ID0gbWFwZGF0YVtjb3VudF07XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8v44Oe44OD44OX44OB44OD44OX44KS6YWN572uXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0TWFwQ2hpcChjYW52YXMsIGluZGV4LCB4ICogdGhpcy50aWxld2lkdGgsIHkgKiB0aGlzLnRpbGVoZWlnaHQsIG9wYWNpdHkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGdlbmVyYXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy/jgqrjg5bjgrjjgqfjgq/jg4jjgrDjg6vjg7zjg5dcbiAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLnR5cGUgPT0gXCJvYmplY3Rncm91cFwiICYmIHRoaXMubGF5ZXJzW2ldLnZpc2libGUgIT0gXCIwXCIpIHtcbiAgICAgICAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJzW2ldO1xuICAgICAgICAgIGNvbnN0IG9wYWNpdHkgPSBsYXllci5vcGFjaXR5IHx8IDEuMDtcbiAgICAgICAgICBsYXllci5vYmplY3RzLmZvckVhY2goZSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5naWQpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc2V0TWFwQ2hpcChjYW52YXMsIGUuZ2lkLCBlLngsIGUueSwgb3BhY2l0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZ2VuZXJhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvL+OCpOODoeODvOOCuOODrOOCpOODpOODvFxuICAgICAgICBpZiAodGhpcy5sYXllcnNbaV0udHlwZSA9PSBcImltYWdlbGF5ZXJcIiAmJiB0aGlzLmxheWVyc1tpXS52aXNpYmxlICE9IFwiMFwiKSB7XG4gICAgICAgICAgdmFyIGltYWdlID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgnaW1hZ2UnLCB0aGlzLmxheWVyc1tpXS5pbWFnZS5zb3VyY2UpO1xuICAgICAgICAgIGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZShpbWFnZS5kb21FbGVtZW50LCB0aGlzLmxheWVyc1tpXS54LCB0aGlzLmxheWVyc1tpXS55KTtcbiAgICAgICAgICBnZW5lcmF0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFnZW5lcmF0ZWQpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgdGV4dHVyZSA9IHBoaW5hLmFzc2V0LlRleHR1cmUoKTtcbiAgICB0ZXh0dXJlLmRvbUVsZW1lbnQgPSBjYW52YXMuZG9tRWxlbWVudDtcbiAgICByZXR1cm4gdGV4dHVyZTtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfY2xvbmVPYmplY3RMYXllclxuICAgKiDlvJXmlbDjgajjgZfjgabmuKHjgZXjgozjgZ/jgqrjg5bjgrjjgqfjgq/jg4jjg6zjgqTjg6Tjg7zjgpLjgq/jg63jg7zjg7PjgZfjgabov5TjgZfjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfY2xvbmVPYmplY3RMYXllcjogZnVuY3Rpb24oc3JjTGF5ZXIpIHtcbiAgICBsZXQgcmVzdWx0ID0ge30uJHNhZmUoc3JjTGF5ZXIpO1xuICAgIHJlc3VsdC5vYmplY3RzID0gW107XG4gICAgLy/jg6zjgqTjg6Tjg7zlhoXjgqrjg5bjgrjjgqfjgq/jg4jjga7jgrPjg5Tjg7xcbiAgICBzcmNMYXllci5vYmplY3RzLmZvckVhY2goZnVuY3Rpb24ob2JqKXtcbiAgICAgIGNvbnN0IHJlc09iaiA9IHtcbiAgICAgICAgcHJvcGVydGllczoge30uJHNhZmUob2JqLnByb3BlcnRpZXMpLFxuICAgICAgfS4kZXh0ZW5kKG9iaik7XG4gICAgICBpZiAob2JqLmVsbGlwc2UpIHJlc09iai5lbGxpcHNlID0gb2JqLmVsbGlwc2U7XG4gICAgICBpZiAob2JqLmdpZCkgcmVzT2JqLmdpZCA9IG9iai5naWQ7XG4gICAgICBpZiAob2JqLnBvbHlnb24pIHJlc09iai5wb2x5Z29uID0gb2JqLnBvbHlnb24uY2xvbmUoKTtcbiAgICAgIGlmIChvYmoucG9seWxpbmUpIHJlc09iai5wb2x5bGluZSA9IG9iai5wb2x5bGluZS5jbG9uZSgpO1xuICAgICAgcmVzdWx0Lm9iamVjdHMucHVzaChyZXNPYmopO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX3BhcnNlXG4gICAqIOWPluW+l+OBl+OBn1RpbGVkTWFwRWRpdOOBruODh+ODvOOCv+OCkuODkeODvOOCueOBl+OBvuOBmeOAglxuICAgKlxuICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wYXJzZTogZnVuY3Rpb24oZGF0YSkge1xuICAgIC8v44K/44Kk44Or5bGe5oCn5oOF5aCx5Y+W5b6XXG4gICAgY29uc3QgbWFwID0gZGF0YS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbWFwJylbMF07XG4gICAgY29uc3QgYXR0ciA9IHRoaXMuX2F0dHJUb0pTT04obWFwKTtcbiAgICB0aGlzLiRleHRlbmQoYXR0cik7XG4gICAgdGhpcy5wcm9wZXJ0aWVzID0gdGhpcy5fcHJvcGVydGllc1RvSlNPTihtYXApO1xuXG4gICAgLy/jgr/jgqTjg6vjgrvjg4Pjg4jlj5blvpdcbiAgICB0aGlzLnRpbGVzZXRzID0gdGhpcy5fcGFyc2VUaWxlc2V0cyhkYXRhKTtcblxuICAgIC8v44K/44Kk44Or44K744OD44OI5oOF5aCx6KOc5a6MXG4gICAgY29uc3QgZGVmYXVsdEF0dHIgPSB7XG4gICAgICB0aWxld2lkdGg6IDMyLFxuICAgICAgdGlsZWhlaWdodDogMzIsXG4gICAgICBzcGFjaW5nOiAwLFxuICAgICAgbWFyZ2luOiAwLFxuICAgIH07XG4gICAgdGhpcy50aWxlc2V0cy5jaGlwcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50aWxlc2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgLy/jgr/jgqTjg6vjgrvjg4Pjg4jlsZ7mgKfmg4XloLHlj5blvpdcbiAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLl9hdHRyVG9KU09OKGRhdGEuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3RpbGVzZXQnKVtpXSk7XG4gICAgICBhdHRyLiRzYWZlKGRlZmF1bHRBdHRyKTtcbiAgICAgIGF0dHIuZmlyc3RnaWQtLTtcbiAgICAgIHRoaXMudGlsZXNldHNbaV0uJGV4dGVuZChhdHRyKTtcblxuICAgICAgLy/jg57jg4Pjg5fjg4Hjg4Pjg5fjg6rjgrnjg4jkvZzmiJBcbiAgICAgIHZhciB0ID0gdGhpcy50aWxlc2V0c1tpXTtcbiAgICAgIHRoaXMudGlsZXNldHNbaV0ubWFwQ2hpcCA9IFtdO1xuICAgICAgZm9yICh2YXIgciA9IGF0dHIuZmlyc3RnaWQ7IHIgPCBhdHRyLmZpcnN0Z2lkK2F0dHIudGlsZWNvdW50OyByKyspIHtcbiAgICAgICAgY29uc3QgY2hpcCA9IHtcbiAgICAgICAgICBpbWFnZTogdC5pbWFnZSxcbiAgICAgICAgICB4OiAoKHIgLSBhdHRyLmZpcnN0Z2lkKSAlIHQuY29sdW1ucykgKiAodC50aWxld2lkdGggKyB0LnNwYWNpbmcpICsgdC5tYXJnaW4sXG4gICAgICAgICAgeTogTWF0aC5mbG9vcigociAtIGF0dHIuZmlyc3RnaWQpIC8gdC5jb2x1bW5zKSAqICh0LnRpbGVoZWlnaHQgKyB0LnNwYWNpbmcpICsgdC5tYXJnaW4sXG4gICAgICAgIH0uJHNhZmUoYXR0cik7XG4gICAgICAgIHRoaXMudGlsZXNldHMuY2hpcHNbcl0gPSBjaGlwO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8v44Os44Kk44Ok44O85Y+W5b6XXG4gICAgdGhpcy5sYXllcnMgPSB0aGlzLl9wYXJzZUxheWVycyhkYXRhKTtcblxuICAgIC8v44Kk44Oh44O844K444OH44O844K/6Kqt44G/6L6844G/XG4gICAgdGhpcy5fY2hlY2tJbWFnZSgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9jaGVja0ltYWdlXG4gICAqIOOCouOCu+ODg+ODiOOBq+eEoeOBhOOCpOODoeODvOOCuOODh+ODvOOCv+OCkuODgeOCp+ODg+OCr+OBl+OBpuiqreOBv+i+vOOBv+OCkuihjOOBhOOBvuOBmeOAglxuICAgKlxuICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jaGVja0ltYWdlOiBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB0aGF0ID0gdGhpcztcbiAgICBjb25zdCBpbWFnZVNvdXJjZSA9IFtdO1xuICAgIGNvbnN0IGxvYWRJbWFnZSA9IFtdO1xuXG4gICAgLy/kuIDopqfkvZzmiJBcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGlsZXNldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgaW1hZ2U6IHRoaXMudGlsZXNldHNbaV0uaW1hZ2UsXG4gICAgICAgIHRyYW5zUjogdGhpcy50aWxlc2V0c1tpXS50cmFuc1IsXG4gICAgICAgIHRyYW5zRzogdGhpcy50aWxlc2V0c1tpXS50cmFuc0csXG4gICAgICAgIHRyYW5zQjogdGhpcy50aWxlc2V0c1tpXS50cmFuc0IsXG4gICAgICB9O1xuICAgICAgaW1hZ2VTb3VyY2UucHVzaChvYmopO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5sYXllcnNbaV0uaW1hZ2UpIHtcbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIGltYWdlOiB0aGlzLmxheWVyc1tpXS5pbWFnZS5zb3VyY2VcbiAgICAgICAgfTtcbiAgICAgICAgaW1hZ2VTb3VyY2UucHVzaChvYmopO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8v44Ki44K744OD44OI44Gr44GC44KL44GL56K66KqNXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZVNvdXJjZS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIGltYWdlU291cmNlW2ldLmltYWdlKTtcbiAgICAgIGlmIChpbWFnZSkge1xuICAgICAgICAvL+OCouOCu+ODg+ODiOOBq+OBguOCi1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/jgarjgYvjgaPjgZ/jga7jgafjg63jg7zjg4njg6rjgrnjg4jjgavov73liqBcbiAgICAgICAgbG9hZEltYWdlLnB1c2goaW1hZ2VTb3VyY2VbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8v5LiA5ous44Ot44O844OJXG4gICAgLy/jg63jg7zjg4njg6rjgrnjg4jkvZzmiJBcbiAgICBjb25zdCBhc3NldHMgPSB7XG4gICAgICBpbWFnZTogW11cbiAgICB9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9hZEltYWdlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvL+OCpOODoeODvOOCuOOBruODkeOCueOCkuODnuODg+ODl+OBqOWQjOOBmOOBq+OBmeOCi1xuICAgICAgYXNzZXRzLmltYWdlW2xvYWRJbWFnZVtpXS5pbWFnZV0gPSB0aGlzLnBhdGgrbG9hZEltYWdlW2ldLmltYWdlO1xuICAgIH1cbiAgICBpZiAobG9hZEltYWdlLmxlbmd0aCkge1xuICAgICAgY29uc3QgbG9hZGVyID0gcGhpbmEuYXNzZXQuQXNzZXRMb2FkZXIoKTtcbiAgICAgIGxvYWRlci5sb2FkKGFzc2V0cyk7XG4gICAgICBsb2FkZXIub24oJ2xvYWQnLCAoKSA9PiB7XG4gICAgICAgIC8v6YCP6YGO6Imy6Kit5a6a5Y+N5pigXG4gICAgICAgIGxvYWRJbWFnZS5mb3JFYWNoKGVsbSA9PiB7XG4gICAgICAgICAgdmFyIGltYWdlID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgnaW1hZ2UnLCBlbG0uaW1hZ2UpO1xuICAgICAgICAgIGlmIChlbG0udHJhbnNSICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBlbG0udHJhbnNSLCBnID0gZWxtLnRyYW5zRywgYiA9IGVsbS50cmFuc0I7XG4gICAgICAgICAgICBpbWFnZS5maWx0ZXIoZnVuY3Rpb24ocGl4ZWwsIGluZGV4LCB4LCB5LCBiaXRtYXApIHtcbiAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGJpdG1hcC5kYXRhO1xuICAgICAgICAgICAgICBpZiAocGl4ZWxbMF0gPT0gciAmJiBwaXhlbFsxXSA9PSBnICYmIHBpeGVsWzJdID09IGIpIHtcbiAgICAgICAgICAgICAgICBkYXRhW2luZGV4KzNdID0gMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy/oqq3jgb/ovrzjgb/ntYLkuoZcbiAgICAgICAgdGhhdC5fcmVzb2x2ZSh0aGF0KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL+iqreOBv+i+vOOBv+e1guS6hlxuICAgICAgdGhpcy5fcmVzb2x2ZSh0aGF0KTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX3NldE1hcENoaXBcbiAgICog44Kt44Oj44Oz44OQ44K544Gu5oyH5a6a44GX44Gf5bqn5qiZ44Gr44Oe44OD44OX44OB44OD44OX44Gu44Kk44Oh44O844K444KS44Kz44OU44O844GX44G+44GZ44CCXG4gICAqXG4gICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3NldE1hcENoaXA6IGZ1bmN0aW9uKGNhbnZhcywgaW5kZXgsIHgsIHksIG9wYWNpdHkpIHtcbiAgICAvL+OCv+OCpOODq+OCu+ODg+ODiOOBi+OCieODnuODg+ODl+ODgeODg+ODl+OCkuWPluW+l1xuICAgIGNvbnN0IGNoaXAgPSB0aGlzLnRpbGVzZXRzLmNoaXBzW2luZGV4XTtcbiAgICBpZiAoIWNoaXApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaW1hZ2UgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCdpbWFnZScsIGNoaXAuaW1hZ2UpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKGNoaXAuaW1hZ2UpO1xuICAgIH1cbiAgICBjYW52YXMuY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgICBpbWFnZS5kb21FbGVtZW50LFxuICAgICAgY2hpcC54ICsgY2hpcC5tYXJnaW4sIGNoaXAueSArIGNoaXAubWFyZ2luLFxuICAgICAgY2hpcC50aWxld2lkdGgsIGNoaXAudGlsZWhlaWdodCxcbiAgICAgIHgsIHksXG4gICAgICBjaGlwLnRpbGV3aWR0aCwgY2hpcC50aWxlaGVpZ2h0KTtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfcHJvcGVydGllc1RvSlNPTlxuICAgKiBYTUzjg5fjg63jg5Hjg4bjgqPjgpJKU09O44Gr5aSJ5o+b44GX44G+44GZ44CCXG4gICAqXG4gICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3Byb3BlcnRpZXNUb0pTT046IGZ1bmN0aW9uKGVsbSkge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBlbG0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwcm9wZXJ0aWVzXCIpWzBdO1xuICAgIGNvbnN0IG9iaiA9IHt9O1xuICAgIGlmIChwcm9wZXJ0aWVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgcHJvcGVydGllcy5jaGlsZE5vZGVzLmxlbmd0aDsgaysrKSB7XG4gICAgICB2YXIgcCA9IHByb3BlcnRpZXMuY2hpbGROb2Rlc1trXTtcbiAgICAgIGlmIChwLnRhZ05hbWUgPT09IFwicHJvcGVydHlcIikge1xuICAgICAgICAvL3Byb3BlcnR544GrdHlwZeaMh+WumuOBjOOBguOBo+OBn+OCieWkieaPm1xuICAgICAgICB2YXIgdHlwZSA9IHAuZ2V0QXR0cmlidXRlKCd0eXBlJyk7XG4gICAgICAgIHZhciB2YWx1ZSA9IHAuZ2V0QXR0cmlidXRlKCd2YWx1ZScpO1xuICAgICAgICBpZiAoIXZhbHVlKSB2YWx1ZSA9IHAudGV4dENvbnRlbnQ7XG4gICAgICAgIGlmICh0eXBlID09IFwiaW50XCIpIHtcbiAgICAgICAgICBvYmpbcC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSBwYXJzZUludCh2YWx1ZSwgMTApO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJmbG9hdFwiKSB7XG4gICAgICAgICAgb2JqW3AuZ2V0QXR0cmlidXRlKCduYW1lJyldID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImJvb2xcIiApIHtcbiAgICAgICAgICBpZiAodmFsdWUgPT0gXCJ0cnVlXCIpIG9ialtwLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHRydWU7XG4gICAgICAgICAgZWxzZSBvYmpbcC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmpbcC5nZXRBdHRyaWJ1dGUoJ25hbWUnKV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9wcm9wZXJ0aWVzVG9KU09OXG4gICAqIFhNTOWxnuaAp+aDheWgseOCkkpTT07jgavlpInmj5vjgZfjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYXR0clRvSlNPTjogZnVuY3Rpb24oc291cmNlKSB7XG4gICAgY29uc3Qgb2JqID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2UuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbCA9IHNvdXJjZS5hdHRyaWJ1dGVzW2ldLnZhbHVlO1xuICAgICAgdmFsID0gaXNOYU4ocGFyc2VGbG9hdCh2YWwpKT8gdmFsOiBwYXJzZUZsb2F0KHZhbCk7XG4gICAgICBvYmpbc291cmNlLmF0dHJpYnV0ZXNbaV0ubmFtZV0gPSB2YWw7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX3Byb3BlcnRpZXNUb0pTT05fc3RyXG4gICAqIFhNTOODl+ODreODkeODhuOCo+OCkkpTT07jgavlpInmj5vjgZfjgIHmloflrZfliJfjgafov5TjgZfjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYXR0clRvSlNPTl9zdHI6IGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgIGNvbnN0IG9iaiA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHZhbCA9IHNvdXJjZS5hdHRyaWJ1dGVzW2ldLnZhbHVlO1xuICAgICAgb2JqW3NvdXJjZS5hdHRyaWJ1dGVzW2ldLm5hbWVdID0gdmFsO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9wYXJzZVRpbGVzZXRzXG4gICAqIOOCv+OCpOODq+OCu+ODg+ODiOOBruODkeODvOOCueOCkuihjOOBhOOBvuOBmeOAglxuICAgKlxuICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wYXJzZVRpbGVzZXRzOiBmdW5jdGlvbih4bWwpIHtcbiAgICBjb25zdCBlYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3QgZGF0YSA9IFtdO1xuICAgIGNvbnN0IHRpbGVzZXRzID0geG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0aWxlc2V0Jyk7XG4gICAgZWFjaC5jYWxsKHRpbGVzZXRzLCBmdW5jdGlvbih0aWxlc2V0KSB7XG4gICAgICB2YXIgdCA9IHt9O1xuICAgICAgdmFyIHByb3BzID0gc2VsZi5fcHJvcGVydGllc1RvSlNPTih0aWxlc2V0KTtcbiAgICAgIGlmIChwcm9wcy5zcmMpIHtcbiAgICAgICAgdC5pbWFnZSA9IHByb3BzLnNyYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHQuaW1hZ2UgPSB0aWxlc2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWFnZScpWzBdLmdldEF0dHJpYnV0ZSgnc291cmNlJyk7XG4gICAgICB9XG4gICAgICAvL+mAj+mBjuiJsuioreWumuWPluW+l1xuICAgICAgdC50cmFucyA9IHRpbGVzZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltYWdlJylbMF0uZ2V0QXR0cmlidXRlKCd0cmFucycpO1xuICAgICAgaWYgKHQudHJhbnMpIHtcbiAgICAgICAgdC50cmFuc1IgPSBwYXJzZUludCh0LnRyYW5zLnN1YnN0cmluZygwLCAyKSwgMTYpO1xuICAgICAgICB0LnRyYW5zRyA9IHBhcnNlSW50KHQudHJhbnMuc3Vic3RyaW5nKDIsIDQpLCAxNik7XG4gICAgICAgIHQudHJhbnNCID0gcGFyc2VJbnQodC50cmFucy5zdWJzdHJpbmcoNCwgNiksIDE2KTtcbiAgICAgIH1cblxuICAgICAgZGF0YS5wdXNoKHQpO1xuICAgIH0pO1xuICAgIHJldHVybiBkYXRhO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9wYXJzZUxheWVyc1xuICAgKiDjg6zjgqTjg6Tjg7zmg4XloLHjga7jg5Hjg7zjgrnjgpLooYzjgYTjgb7jgZnjgIJcbiAgICpcbiAgICog5YaF6YOo44Gn5L2/55So44GX44Gm44GE44KL6Zai5pWw44Gn44GZ44CCXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcGFyc2VMYXllcnM6IGZ1bmN0aW9uKHhtbCkge1xuICAgIGNvbnN0IGVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaDtcbiAgICBjb25zdCBkYXRhID0gW107XG5cbiAgICBjb25zdCBtYXAgPSB4bWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJtYXBcIilbMF07XG4gICAgY29uc3QgbGF5ZXJzID0gW107XG4gICAgZWFjaC5jYWxsKG1hcC5jaGlsZE5vZGVzLCBmdW5jdGlvbihlbG0pIHtcbiAgICAgIGlmIChlbG0udGFnTmFtZSA9PSBcImxheWVyXCIgfHwgZWxtLnRhZ05hbWUgPT0gXCJvYmplY3Rncm91cFwiIHx8IGVsbS50YWdOYW1lID09IFwiaW1hZ2VsYXllclwiKSB7XG4gICAgICAgIGxheWVycy5wdXNoKGVsbSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsYXllcnMuZWFjaChsYXllciA9PiB7XG4gICAgICBzd2l0Y2ggKGxheWVyLnRhZ05hbWUpIHtcbiAgICAgICAgY2FzZSBcImxheWVyXCI6XG4gICAgICAgICAgLy/pgJrluLjjg6zjgqTjg6Tjg7xcbiAgICAgICAgICBjb25zdCBkID0gbGF5ZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2RhdGEnKVswXTtcbiAgICAgICAgICBjb25zdCBlbmNvZGluZyA9IGQuZ2V0QXR0cmlidXRlKFwiZW5jb2RpbmdcIik7XG4gICAgICAgICAgY29uc3QgbCA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwibGF5ZXJcIixcbiAgICAgICAgICAgIG5hbWU6IGxheWVyLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChlbmNvZGluZyA9PSBcImNzdlwiKSB7XG4gICAgICAgICAgICBsLmRhdGEgPSB0aGlzLl9wYXJzZUNTVihkLnRleHRDb250ZW50KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGVuY29kaW5nID09IFwiYmFzZTY0XCIpIHtcbiAgICAgICAgICAgIGwuZGF0YSA9IHRoaXMuX3BhcnNlQmFzZTY0KGQudGV4dENvbnRlbnQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLl9hdHRyVG9KU09OKGxheWVyKTtcbiAgICAgICAgICBsLiRleHRlbmQoYXR0cik7XG4gICAgICAgICAgbC5wcm9wZXJ0aWVzID0gdGhpcy5fcHJvcGVydGllc1RvSlNPTihsYXllcik7XG5cbiAgICAgICAgICBkYXRhLnB1c2gobCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy/jgqrjg5bjgrjjgqfjgq/jg4jjg6zjgqTjg6Tjg7xcbiAgICAgICAgY2FzZSBcIm9iamVjdGdyb3VwXCI6XG4gICAgICAgICAgY29uc3QgbCA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0Z3JvdXBcIixcbiAgICAgICAgICAgIG9iamVjdHM6IFtdLFxuICAgICAgICAgICAgbmFtZTogbGF5ZXIuZ2V0QXR0cmlidXRlKFwibmFtZVwiKSxcbiAgICAgICAgICAgIHg6IHBhcnNlRmxvYXQobGF5ZXIuZ2V0QXR0cmlidXRlKFwib2Zmc2V0eFwiKSkgfHwgMCxcbiAgICAgICAgICAgIHk6IHBhcnNlRmxvYXQobGF5ZXIuZ2V0QXR0cmlidXRlKFwib2Zmc2V0eVwiKSkgfHwgMCxcbiAgICAgICAgICAgIGFscGhhOiBsYXllci5nZXRBdHRyaWJ1dGUoXCJvcGFjaXR5XCIpIHx8IDEsXG4gICAgICAgICAgICBjb2xvcjogbGF5ZXIuZ2V0QXR0cmlidXRlKFwiY29sb3JcIikgfHwgbnVsbCxcbiAgICAgICAgICAgIGRyYXdvcmRlcjogbGF5ZXIuZ2V0QXR0cmlidXRlKFwiZHJhd29yZGVyXCIpIHx8IG51bGwsXG4gICAgICAgICAgfTtcbiAgICAgICAgICBsLnByb3BlcnRpZXMgPSB0aGlzLl9wcm9wZXJ0aWVzVG9KU09OKGxheWVyKTtcblxuICAgICAgICAgIC8v44Os44Kk44Ok44O85YaF6Kej5p6QXG4gICAgICAgICAgZWFjaC5jYWxsKGxheWVyLmNoaWxkTm9kZXMsIGVsbSA9PiB7XG4gICAgICAgICAgICBpZiAoZWxtLm5vZGVUeXBlID09IDMpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGQgPSB0aGlzLl9hdHRyVG9KU09OKGVsbSk7XG4gICAgICAgICAgICBpZiAoZC5pZCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICBkLnByb3BlcnRpZXMgPSB0aGlzLl9wcm9wZXJ0aWVzVG9KU09OKGVsbSk7XG4gICAgICAgICAgICAvL+WtkOimgee0oOOBruino+aekFxuICAgICAgICAgICAgaWYgKGVsbS5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBlbG0uY2hpbGROb2Rlcy5mb3JFYWNoKGUgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLm5vZGVUeXBlID09IDMpIHJldHVybjtcbiAgICAgICAgICAgICAgICAvL+alleWGhlxuICAgICAgICAgICAgICAgIGlmIChlLm5vZGVOYW1lID09ICdlbGxpcHNlJykge1xuICAgICAgICAgICAgICAgICAgZC5lbGxpcHNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy/lpJrop5LlvaJcbiAgICAgICAgICAgICAgICBpZiAoZS5ub2RlTmFtZSA9PSAncG9seWdvbicpIHtcbiAgICAgICAgICAgICAgICAgIGQucG9seWdvbiA9IFtdO1xuICAgICAgICAgICAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuX2F0dHJUb0pTT05fc3RyKGUpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgcGwgPSBhdHRyLnBvaW50cy5zcGxpdChcIiBcIik7XG4gICAgICAgICAgICAgICAgICBwbC5mb3JFYWNoKGZ1bmN0aW9uKHN0cikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHRzID0gc3RyLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICAgICAgZC5wb2x5Z29uLnB1c2goe3g6IHBhcnNlRmxvYXQocHRzWzBdKSwgeTogcGFyc2VGbG9hdChwdHNbMV0pfSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy/nt5rliIZcbiAgICAgICAgICAgICAgICBpZiAoZS5ub2RlTmFtZSA9PSAncG9seWxpbmUnKSB7XG4gICAgICAgICAgICAgICAgICBkLnBvbHlsaW5lID0gW107XG4gICAgICAgICAgICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5fYXR0clRvSlNPTl9zdHIoZSk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBwbCA9IGF0dHIucG9pbnRzLnNwbGl0KFwiIFwiKTtcbiAgICAgICAgICAgICAgICAgIHBsLmZvckVhY2goZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHB0cyA9IHN0ci5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgIGQucG9seWxpbmUucHVzaCh7eDogcGFyc2VGbG9hdChwdHNbMF0pLCB5OiBwYXJzZUZsb2F0KHB0c1sxXSl9KTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsLm9iamVjdHMucHVzaChkKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGRhdGEucHVzaChsKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvL+OCpOODoeODvOOCuOODrOOCpOODpOODvFxuICAgICAgICBjYXNlIFwiaW1hZ2VsYXllclwiOlxuICAgICAgICAgIHZhciBsID0ge1xuICAgICAgICAgICAgdHlwZTogXCJpbWFnZWxheWVyXCIsXG4gICAgICAgICAgICBuYW1lOiBsYXllci5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpLFxuICAgICAgICAgICAgeDogcGFyc2VGbG9hdChsYXllci5nZXRBdHRyaWJ1dGUoXCJvZmZzZXR4XCIpKSB8fCAwLFxuICAgICAgICAgICAgeTogcGFyc2VGbG9hdChsYXllci5nZXRBdHRyaWJ1dGUoXCJvZmZzZXR5XCIpKSB8fCAwLFxuICAgICAgICAgICAgYWxwaGE6IGxheWVyLmdldEF0dHJpYnV0ZShcIm9wYWNpdHlcIikgfHwgMSxcbiAgICAgICAgICAgIHZpc2libGU6IChsYXllci5nZXRBdHRyaWJ1dGUoXCJ2aXNpYmxlXCIpID09PSB1bmRlZmluZWQgfHwgbGF5ZXIuZ2V0QXR0cmlidXRlKFwidmlzaWJsZVwiKSAhPSAwKSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciBpbWFnZUVsbSA9IGxheWVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW1hZ2VcIilbMF07XG4gICAgICAgICAgbC5pbWFnZSA9IHtzb3VyY2U6IGltYWdlRWxtLmdldEF0dHJpYnV0ZShcInNvdXJjZVwiKX07XG5cbiAgICAgICAgICBkYXRhLnB1c2gobCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX3BlcnNlQ1NWXG4gICAqIENTVuOBruODkeODvOOCueOCkuihjOOBhOOBvuOBmeOAglxuICAgKlxuICAgKiDlhoXpg6jjgafkvb/nlKjjgZfjgabjgYTjgovplqLmlbDjgafjgZnjgIJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wYXJzZUNTVjogZnVuY3Rpb24oZGF0YSkge1xuICAgIGNvbnN0IGRhdGFMaXN0ID0gZGF0YS5zcGxpdCgnLCcpO1xuICAgIGNvbnN0IGxheWVyID0gW107XG5cbiAgICBkYXRhTGlzdC5lYWNoKChlbG0sIGkpID0+IHtcbiAgICAgIGNvbnN0IG51bSA9IHBhcnNlSW50KGVsbSwgMTApIC0gMTtcbiAgICAgIGxheWVyLnB1c2gobnVtKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBsYXllcjtcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfcGVyc2VDU1ZcbiAgICogQkFTRTY044Gu44OR44O844K544KS6KGM44GE44G+44GZ44CCXG4gICAqXG4gICAqIOWGhemDqOOBp+S9v+eUqOOBl+OBpuOBhOOCi+mWouaVsOOBp+OBmeOAglxuICAgKiBodHRwOi8vdGhla2Fubm9uLXNlcnZlci5hcHBzcG90LmNvbS9oZXJwaXR5LWRlcnBpdHkuYXBwc3BvdC5jb20vcGFzdGViaW4uY29tLzc1S2tzMFdIXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcGFyc2VCYXNlNjQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBjb25zdCBkYXRhTGlzdCA9IGF0b2IoZGF0YS50cmltKCkpO1xuICAgIGNvbnN0IHJzdCA9IFtdO1xuXG4gICAgZGF0YUxpc3QgPSBkYXRhTGlzdC5zcGxpdCgnJykubWFwKGUgPT4gZS5jaGFyQ29kZUF0KDApKTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhTGlzdC5sZW5ndGggLyA0OyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNvbnN0IG4gPSBkYXRhTGlzdFtpICogNF07XG4gICAgICByc3RbaV0gPSBwYXJzZUludChuLCAxMCkgLSAxO1xuICAgIH1cblxuICAgIHJldHVybiByc3Q7XG4gIH0sXG59KTtcblxuLy/jgqLjgrvjg4Pjg4jjg63jg7zjg4Djg7zjgavnmbvpjLJcbnBoaW5hLmFzc2V0LkFzc2V0TG9hZGVyLnJlZ2lzdGVyKFwidG14XCIsIChrZXksIHBhdGgpID0+IHtcbiAgY29uc3QgdG14ID0gcGhpbmEuYXNzZXQuVGlsZWRNYXAoKTtcbiAgcmV0dXJuIHRteC5sb2FkKHBhdGgpO1xufSk7XG4iLCIvKlxuICogIE1haW5TY2VuZS5qc1xuICogIDIwMTgvMDkvMjBcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiTWFpblNjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiAnRGlzcGxheVNjZW5lJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3VwZXJJbml0KHsgd2lkdGg6IFNDX1csIGhlaWdodDogU0NfSCB9KTtcblxuICAgICAgdGhpcy50aHJlZUxheWVyID0gVGhyZWVMYXllckV4KHsgd2lkdGg6IFNDX1csIGhlaWdodDogU0NfSCB9KVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyAqIDAuNSwgU0NfSCAqIDAuNSk7XG5cbiAgICAgIHRoaXMuY2FtZXJhID0gdGhpcy50aHJlZUxheWVyLmNhbWVyYTtcbiAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSAxMDA7XG5cbiAgICAgIHRoaXMuc3ByaXRlTGF5ZXIgPSBEaXNwbGF5RWxlbWVudCgpLmFkZENoaWxkVG8odGhpcyk7XG5cbiAgICAgIHRoaXMuc2V0dXBDaGFyYWN0ZXJzKCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIHNldHVwQ2hhcmFjdGVyczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGFyc2VyID0gbmV3IHZveC5QYXJzZXIoKTtcbiAgICAgIHBhcnNlci5wYXJzZShcImFzc2V0cy92b3gvZWxmLnZveFwiKVxuICAgICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgICB2YXIgYnVpbGRlciA9IG5ldyB2b3guTWVzaEJ1aWxkZXIoZGF0YSwge1xuICAgICAgICAgICAgdm94ZWxTaXplOiAxLjAsXG4gICAgICAgICAgICB2ZXJ0ZXhDb2xvcjogZmFsc2UsXG4gICAgICAgICAgICBvcHRpbWl6ZUZhY2VzOiB0cnVlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHZhciBtZXNoID0gYnVpbGRlci5jcmVhdGVNZXNoKCk7XG4gICAgICAgICAgdGhpcy50aHJlZUxheWVyLnNjZW5lLmFkZChtZXNoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICB9KTtcblxufSk7IiwiLypcbiAqICBTY2VuZUZsb3cuanNcbiAqICAyMDE4LzA5LzIwXG4gKlxuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICAvL+ODoeOCpOODs+OCt+ODvOODs+ODleODreODvFxuICBwaGluYS5kZWZpbmUoXCJNYWluU2NlbmVGbG93XCIsIHtcbiAgICBzdXBlckNsYXNzOiBcIk1hbmFnZXJTY2VuZVwiLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICBzdGFydExhYmVsID0gb3B0aW9ucy5zdGFydExhYmVsIHx8IFwic3BsYXNoXCI7XG4gICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgIHN0YXJ0TGFiZWw6IHN0YXJ0TGFiZWwsXG4gICAgICAgIHNjZW5lczogW3tcbiAgICAgICAgICBsYWJlbDogXCJzcGxhc2hcIixcbiAgICAgICAgICBjbGFzc05hbWU6IFwiU3BsYXNoU2NlbmVcIixcbiAgICAgICAgfSx7XG4gICAgICAgICAgbGFiZWw6IFwibWFpblwiLFxuICAgICAgICAgIGNsYXNzTmFtZTogXCJNYWluU2NlbmVcIixcbiAgICAgICAgICAvLyBuZXh0TGFiZWw6IFwidGl0bGVcIixcbiAgICAgICAgfV0sXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG59KTsiLCIvKlxuICogIFNwbGFzaFNjZW5lLmpzXG4gKiAgMjAxOC8wOS8yMFxuICpcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKCdTcGxhc2hTY2VuZScsIHtcbiAgICBzdXBlckNsYXNzOiAnRGlzcGxheVNjZW5lJyxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdXBlckluaXQoeyB3aWR0aDogU0NfVywgaGVpZ2h0OiBTQ19IIH0pO1xuXG4gICAgICB0aGlzLnVubG9jayA9IGZhbHNlO1xuICAgICAgdGhpcy5sb2FkY29tcGxldGUxID0gZmFsc2U7XG4gICAgICB0aGlzLnByb2dyZXNzMSA9IDA7XG5cbiAgICAgIC8vcHJlbG9hZCBhc3NldFxuICAgICAgY29uc3QgYXNzZXRzID0gQXNzZXRMaXN0LmdldCh7IGFzc2V0VHlwZTogXCJzcGxhc2hcIiB9KTtcbiAgICAgIHRoaXMubG9hZGVyID0gcGhpbmEuYXNzZXQuQXNzZXRMb2FkZXIoKTtcbiAgICAgIHRoaXMubG9hZGVyLmxvYWQoYXNzZXRzKTtcbiAgICAgIHRoaXMubG9hZGVyLm9uKCdsb2FkJywgKCkgPT4gdGhpcy5sb2FkY29tcGxldGUxID0gdHJ1ZSk7XG4gICAgICB0aGlzLmxvYWRlci5vbigncHJvZ3Jlc3MnLCBlID0+IHRoaXMucHJvZ3Jlc3MxID0gTWF0aC5mbG9vcihlLnByb2dyZXNzICogMTAwKSk7XG5cbiAgICAgIC8vbG9nb1xuICAgICAgY29uc3QgdGV4dHVyZSA9IHBoaW5hLmFzc2V0LlRleHR1cmUoKTtcbiAgICAgIHRleHR1cmUubG9hZChTcGxhc2hTY2VuZS5sb2dvKS50aGVuKCgpID0+IHRoaXMuX2luaXQoKSk7XG4gICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgIH0sXG5cbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNwcml0ZSA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKHRoaXMudGV4dHVyZSlcbiAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMuZ3JpZFguY2VudGVyKCksIHRoaXMuZ3JpZFkuY2VudGVyKCkpXG4gICAgICB0aGlzLnNwcml0ZS5hbHBoYSA9IDA7XG5cbiAgICAgIHRoaXMuc3ByaXRlLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAudG8oeyBhbHBoYTogMSB9LCA1MDAsICdlYXNlT3V0Q3ViaWMnKVxuICAgICAgICAud2FpdCg1MDApXG4gICAgICAgIC5jYWxsKCgpID0+IHRoaXMudW5sb2NrID0gdHJ1ZSk7XG5cbiAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgIC8v6YCy5o2X44Ky44O844K4XG4gICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgd2lkdGg6IFNDX1cgKiAwLjMsXG4gICAgICAgIGhlaWdodDogMTAsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgZmlsbDogJ3JlZCcsXG4gICAgICAgIHN0cm9rZTogJ3doaXRlJyxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDEsXG4gICAgICAgIGdhdWdlQ29sb3I6ICdsaW1lJyxcbiAgICAgICAgY29ybmVyUmFkaXVzOiAzLFxuICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgbWF4VmFsdWU6IDEwMCxcbiAgICAgIH07XG4gICAgICB0aGlzLnByb2dyZXNzR2F1Z2UgPSBwaGluYS51aS5HYXVnZShvcHRpb25zKS5hZGRDaGlsZFRvKHRoaXMpLnNldFBvc2l0aW9uKFNDX1cgKiAwLjUsIFNDX0ggKiAwLjgpO1xuICAgICAgdGhpcy5wcm9ncmVzc0dhdWdlLmJlZm9yZVZhbHVlID0gMDtcbiAgICAgIHRoaXMucHJvZ3Jlc3NHYXVnZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGF0LnByb2dyZXNzMSA9PSB0aGlzLmJlZm9yZVZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWUrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGF0LnByb2dyZXNzMTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYmVmb3JlVmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnVubG9jayAmJiB0aGlzLmxvYWRjb21wbGV0ZTEpIHtcbiAgICAgICAgdGhpcy51bmxvY2sgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zcHJpdGUudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgLnRvKHthbHBoYTowfSwgNTAwLCAnZWFzZU91dEN1YmljJylcbiAgICAgICAgICAuY2FsbCgoKSA9PiB0aGlzLmV4aXQoKSk7XG4gICAgICAgIHRoaXMucHJvZ3Jlc3NHYXVnZS50d2VlbmVyLmNsZWFyKCkudG8oeyBhbHBoYTowIH0sIDEwLCAnZWFzZU91dEN1YmljJylcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX3N0YXRpYzoge1xuICAgICAgbG9nbzogXCJhc3NldHMvaW1hZ2VzL3BoaW5hanNfbG9nby5wbmdcIixcbiAgICB9LFxuICB9KTtcblxufSk7IiwiLypcbiAqICB0aXRsZXNjZW5lLmpzXG4gKiAgMjAxOC8wOS8yMFxuICpcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiVGl0bGVTY2VuZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJEaXNwbGF5U2NlbmVcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdXBlckluaXQoe3dpZHRoOiBTQ19XLCBoZWlnaHQ6IFNDX0h9KTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuICB9KTtcblxufSk7IiwiLypcbiAqICBDaGFyYWN0ZXIuanNcbiAqICAyMDE4LzA5LzIwXG4gKiAg44Kt44Oj44Op44Kv44K/566h55CG55So44OZ44O844K544Kv44Op44K5XG4gKiAg44Ky44O844Og5YaF44Gu44Kt44Oj44Op44Kv44K/44Gv5YWo44Gm44GT44Gu44Kv44Op44K544GL44KJ5rS+55Sf44GZ44KLXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkNoYXJhY3RlclwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJPYmplY3QzRFwiLFxuXG4gICAgY2hhcmFjdGVyVHlwZTogbnVsbCxcbiAgICB0aHJlZU9iamVjdDogbnVsbCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICB9LFxuXG4gIH0pO1xuXG59KTtcbiIsIi8qXG4gKiAgT2JqZWN0M0QuanNcbiAqICAyMDE4LzA5LzIwXG4gKiAgVGhyZWUuanPjgqrjg5bjgrjjgqfjgq/jg4jnrqHnkIbjgq/jg6njgrlcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiT2JqZWN0M0RcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuYXBwLkVsZW1lbnRcIixcblxuICAgIF9vYmo6IG51bGwsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdCgpO1xuXG4gICAgICBvcHRpb25zID0gKHt9KS4kc2FmZShvcHRpb25zLCB7XG4gICAgICAgIHBvc2l0aW9uOiBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSxcbiAgICAgICAgc2NhbGU6IG5ldyBUSFJFRS5WZWN0b3IzKDEsIDEsIDEpLFxuICAgICAgICByb3RhdGlvbjogbmV3IFRIUkVFLkV1bGVyKDApLFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX29iaiA9IG9wdGlvbnMudGhyZWVPYmplY3Q7XG5cbiAgICAgIHRoaXMucG9zaXRpb24uY29weShvcHRpb25zLnBvc2l0aW9uKTtcbiAgICAgIHRoaXMuc2NhbGUuY29weShvcHRpb25zLnNjYWxlKTtcbiAgICAgIHRoaXMucm90YXRpb24uY29weShvcHRpb25zLnJvdGF0aW9uKTtcbiAgICB9LFxuXG4gICAgX2FjY2Vzc29yOiB7XG4gICAgICB4OiB7XG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkgICB7IHJldHVybiB0aGlzLnBvc2l0aW9uLng7IH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKHYpICB7IHRoaXMucG9zaXRpb24ueCA9IHY7IH1cbiAgICAgIH0sXG4gICAgICB5OiB7XG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkgICB7IHJldHVybiB0aGlzLnBvc2l0aW9uLnk7IH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKHYpICB7IHRoaXMucG9zaXRpb24ueSA9IHY7IH1cbiAgICAgIH0sXG4gICAgICB6OiB7XG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkgICB7IHJldHVybiB0aGlzLnBvc2l0aW9uLno7IH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKHYpICB7IHRoaXMucG9zaXRpb24ueiA9IHY7IH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbn0pO1xuIiwiLypcbiAqICBQbGF5ZXIuanNcbiAqICAyMDE4LzA5LzIwXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIlBsYXllclwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJDaGFyYWN0ZXJcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudFNjZW5lKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdChwYXJlbnRTY2VuZSwge3dpZHRoOiAxNiwgaGVpZ2h0OiAyMH0pO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG4gIH0pO1xuXG59KTtcbiJdfQ==
