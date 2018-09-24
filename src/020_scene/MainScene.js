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