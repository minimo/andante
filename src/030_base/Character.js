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