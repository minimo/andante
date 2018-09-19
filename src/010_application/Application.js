phina.globalize();

phina.main(function() {
  const app = GameApp({
    startLabel: 'main',
  });
  app.enableStats();
  app.run();
});
