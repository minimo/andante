/*
 *  SceneFlow.js
 *  2018/09/20
 *
 */

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
