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
