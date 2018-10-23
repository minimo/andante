/*
 *  Character.js
 *  2018/09/20
 *  キャラクタ管理用ベースクラス
 *  ゲーム内のキャラクタは全てこのクラスから派生する
 */

phina.namespace(function() {

  phina.define("Character", {
    superClass: "phina.three.Object3D",

    characterType: null,
    threeObject: null,

    init: function() {
      this.superInit();
    },

  });

});
