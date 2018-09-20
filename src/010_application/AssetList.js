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
