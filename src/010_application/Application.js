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