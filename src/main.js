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
