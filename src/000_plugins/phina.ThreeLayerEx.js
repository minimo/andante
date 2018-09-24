phina.namespace(function() {

  phina.define('ThreeLayerEx', {
    superClass: 'phina.display.Layer',

    scene: null,
    camera: null,
    light: null,
    renderer: null,

    init: function(options) {
      this.superInit(options);

      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera( 75, options.width / options.height, 1, 10000 );
      this.camera.position.z = 100;

      this.light = new THREE.DirectionalLight( 0xffffff, 1 );
      this.light.position.set( 1, 1, 1 ).normalize();
      this.scene.add( this.light );

      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setClearColor( 0x000000 );
      this.renderer.setSize( options.width, options.height );

      this.on('enterframe', function() {
        this.renderer.render( this.scene, this.camera );
      });

      this.domElement = this.renderer.domElement;
    },

    addScene: function(object) {
      this.scene.add(object);
      return this;
    },
  });
});
