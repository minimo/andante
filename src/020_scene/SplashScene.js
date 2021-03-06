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