var container;
var scene, camera, light, renderer;
var renderSize = new THREE.Vector2(window.innerWidth, window.innerHeight);
// var renderSize = new THREE.Vector2(2448,3264);
var mouse = new THREE.Vector2(0.0,0.0);
var mouseDown = false;
var r2 = 1.5;
var time = 0.0;
var capturer = new CCapture( { framerate: 60, format: 'webm', workersPath: 'js/' } );

init();
animate();

function init(){
	scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera( renderSize.x / - 2, renderSize.x / 2, renderSize.y / 2, renderSize.y / - 2, -10000, 10000 );
    // camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1,10000);
    camera.position.z = 1;
	renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true});
	renderer.setSize( renderSize.x, renderSize.y );
	renderer.setClearColor(0xffffff,1.0);

	container = document.getElementById( 'container' );
	container.appendChild(renderer.domElement);

    gradient = new Gradient(window.innerWidth, window.innerHeight);
    gradient.init();
    // texture = THREE.ImageUtils.loadTexture("assets/textures/arizona-muse-by-steven-klein-for-vogue-us-august-2015.jpg");
    texture = new THREE.Texture(gradient.canvas);
	// texture = THREE.ImageUtils.loadTexture("assets/textures/IMG_4215.JPG");
	texture.minFilter = texture.magFilter = THREE.NearestFilter;
	// shader = new MeshShader();
	// material = new THREE.ShaderMaterial({
		// uniforms: shader.uniforms,
		// vertexShader: shader.vertexShader,
		// fragmentShader: shader.fragmentShader,
		// side: 2,
		// transparent: true
	// });
	// material.uniforms["texture"].value = texture;
	// material.uniforms["resolution"].value = renderSize;
	// material.uniforms["r2"].value = r2;
	// material.uniforms["time"].value = time;
	// geometry = new THREE.PlaneBufferGeometry(renderSize.x, renderSize.y);
	// mesh = new THREE.Mesh(geometry, material);
	// scene.add(mesh);

	var customShaders = new CustomShaders();
    var customShaders2 = new CustomShaders();
    shaders = [ 
        customShaders.flowShader,
        // paintFlow,
       	// customShaders2.reposShader,
        customShaders.diffShader, 
        customShaders2.reposShader,
        customShaders2.paintShader 
        // customShaders.bumpShader
    ];
    fbMaterial = new FeedbackMaterial(renderer, scene, camera, texture, shaders);  
    fbMaterial.init();

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mousedown", onMouseDown);
	document.addEventListener("mouseup", onMouseUp);
    document.addEventListener( 'keydown', function(){screenshot(renderer)}, false );

}

function animate(){
	window.requestAnimationFrame(animate);
	draw();
}

function onMouseMove(event){
	mouse.x = ( event.pageX / renderSize.x ) * 2 - 1;
    mouse.y = - ( event.pageY / renderSize.y ) * 2 + 1;
    for(var i = 0; i < fbMaterial.fbos.length; i++){
      // fbMaterial.fbos[i].material.uniforms.mouse.value = new THREE.Vector2(0.01,0.01);
    }
}
function onMouseDown(){
	mouseDown = true;
    // gradient.jumpForward();
    gradient.sampleColors();
    r2 = Math.random()*2.0;

}
function onMouseUp(){
	mouseDown = false;
	// r2 = 0;
}
function draw(){
	time += 0.01;
	// material.uniforms["time"].value = time;
	// if(mouseDown){
		// r2 += 0.005;
	// r2 = Math.random()*2.0;
	// }
    // mouse.x = ( Math.random()) * 2 - 1;
    // mouse.y = - ( Math.random()) * 2 + 1;

	for(var i = 0; i < fbMaterial.fbos.length; i++){
	  fbMaterial.fbos[i].material.uniforms.time.value = time;
	  if(fbMaterial.fbos[i].material.uniforms["r2"])fbMaterial.fbos[i].material.uniforms["r2"].value = r2;
      // fbMaterial.fbos[i].material.uniforms.mouse.value = new THREE.Vector2(Math.sin(time)*0.01, Math.cos(time)*0.01);
      fbMaterial.fbos[i].material.uniforms.mouse.value = new THREE.Vector2(mouse.x,mouse.y);
      fbMaterial.material.uniforms.mouse.value = new THREE.Vector2(window.innerWidth/2, window.innerHeight/2);

	}
    gradient.update();
    texture.needsUpdate = true;

    fbMaterial.update();
	renderer.render(scene, camera);
	fbMaterial.getNewFrame();
	fbMaterial.swapBuffers();

    capturer.capture( renderer.domElement );
}
function screenshot(renderer) {
    if (event.keyCode == "32") {
        grabScreen(renderer);

        function grabScreen(renderer) {
            var blob = dataURItoBlob(renderer.domElement.toDataURL('image/png'));
            var file = window.URL.createObjectURL(blob);
            var img = new Image();
            img.src = file;
            img.onload = function(e) {
                window.open(this.src);

            }
        }
        function dataURItoBlob(dataURI) {
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {
                type: mimeString
            });
        }

        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    }
    if (event.keyCode == "82") {
                    capturer.start();
    }
    if (event.keyCode == "84") {
        capturer.stop();
        capturer.save(function(blob) {
            window.location = blob;
        });
    }
}
function hslaColor(h,s,l,a)
  {
    return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
  }