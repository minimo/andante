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