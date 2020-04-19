import * as THREE from '/three.module.js';
import * as OIMO from '/oimo.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/loaders/GLTFLoader.js';

function main() {
    var camera, scene, light, renderer, canvas, controls;
    var meshs = [];
    var grounds = [];

    var isMobile = false;
    var antialias = true;

    var geos = {};
    var mats = {};

    //oimo var
    var world = null;
    var bodys = [];

    var fps = [0,0,0,0];
    var ToRad = 0.0174532925199432957;
    var type = 1;
    var infos;

    init();
    loop();

    function init() {

        var n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)){ isMobile = true;  antialias = false; document.getElementById("MaxNumber").value = 200; }

        infos = document.getElementById("info");

        canvas = document.getElementById("canvas");

        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 5000 );
        camera.position.set( 0, 160, 400 );

        controls = new OrbitControls( camera, canvas );
        controls.target.set(0, 20, 0);
        controls.update();

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({ canvas:canvas, precision: "mediump", antialias:antialias });
        renderer.setSize( window.innerWidth, window.innerHeight );

        var materialType = 'MeshBasicMaterial';
        
        if(!isMobile){

            scene.add( new THREE.AmbientLight( 0x3D4143 ) );
            light = new THREE.DirectionalLight( 0xffffff , 1.4);
            light.position.set( 300, 1000, 500 );
            light.target.position.set( 0, 0, 0 );
            light.castShadow = true;

            var d = 300;
            light.shadow.camera = new THREE.OrthographicCamera( -d, d, d, -d,  500, 1600 );
            light.shadow.bias = 0.0001;
            light.shadow.mapSize.width = light.shadow.mapSize.height = 1024;

            scene.add( light );

            materialType = 'MeshPhongMaterial';

            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFShadowMap;//THREE.BasicShadowMap;
        }

        // background
        var buffgeoBack = new THREE.BufferGeometry();
        buffgeoBack.fromGeometry( new THREE.IcosahedronGeometry(3000,2) );
        var back = new THREE.Mesh( buffgeoBack, new THREE.MeshBasicMaterial( { map:gradTexture([[0.75,0.6,0.4,0.25], ['#1B1D1E','#3D4143','#72797D', '#b0babf']]), side:THREE.BackSide, depthWrite: false, fog:false }  ));
        //back.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(15*ToRad));
        scene.add( back );

        // geometrys
        geos['sphere'] = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(1,16,10));
        geos['box'] = new THREE.BufferGeometry().fromGeometry( new THREE.BoxGeometry(1,1,1));
        geos['cylinder'] = new THREE.BufferGeometry().fromGeometry(new THREE.CylinderGeometry(1,1,1));

        // materials
        mats['sph']    = new THREE[materialType]( {shininess: 10, map: basicTexture(0), name:'sph' } );
        mats['box']    = new THREE[materialType]( {shininess: 10, map: basicTexture(2), name:'box' } );
        mats['cyl']    = new THREE[materialType]( {shininess: 10, map: basicTexture(4), name:'cyl' } );
        mats['ssph']   = new THREE[materialType]( {shininess: 10, map: basicTexture(1), name:'ssph' } );
        mats['sbox']   = new THREE[materialType]( {shininess: 10, map: basicTexture(3), name:'sbox' } );
        mats['scyl']   = new THREE[materialType]( {shininess: 10, map: basicTexture(5), name:'scyl' } );
        mats['ground'] = new THREE[materialType]( {shininess: 10, color:0x3D4143, transparent:true, opacity:0.5 } );

        // events

        window.addEventListener( 'resize', onWindowResize, false );

        // physics

        initOimoPhysics();

    }

    function loop() {

        updateOimoPhysics();
        renderer.render( scene, camera );
        requestAnimationFrame( loop );

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function addStaticBox(size, position, rotation) {
        var mesh = new THREE.Mesh( geos.box, mats.ground );
        mesh.scale.set( size[0], size[1], size[2] );
        mesh.position.set( position[0], position[1], position[2] );
        mesh.rotation.set( rotation[0]*ToRad, rotation[1]*ToRad, rotation[2]*ToRad );
        scene.add( mesh );
        grounds.push(mesh);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    }

    function clearMesh(){
        var i=meshs.length;
        while (i--) scene.remove(meshs[ i ]);
        i = grounds.length;
        while (i--) scene.remove(grounds[ i ]);
        grounds = [];
        meshs = [];
    }

    //----------------------------------
    //  OIMO PHYSICS
    //----------------------------------

    function initOimoPhysics(){

        // world setting:( TimeStep, BroadPhaseType, Iterations )
        // BroadPhaseType can be 
        // 1 : BruteForce
        // 2 : Sweep and prune , the default 
        // 3 : dynamic bounding volume tree

        world = new OIMO.World({info:true, worldscale:100} );
        populate(1);
        //setInterval(updateOimoPhysics, 1000/60);

    }

    function populate(n) {
        var max = document.getElementById("MaxNumber").value;

        if(n===1) type = 1
        else if(n===2) type = 2;
        else if(n===3) type = 3;
        else if(n===4) type = 4;

        // reset old
        clearMesh();
        world.clear();
        bodys=[];

        //add ground
        var ground0 = world.add({size:[40, 40, 390], pos:[-180,20,0], world:world});
        var ground1 = world.add({size:[40, 40, 390], pos:[180,20,0], world:world});
        var ground2 = world.add({size:[400, 80, 400], pos:[0,-40,0], world:world});

        addStaticBox([40, 40, 390], [-180,20,0], [0,0,0]);
        addStaticBox([40, 40, 390], [180,20,0], [0,0,0]);
        addStaticBox([400, 80, 400], [0,-40,0], [0,0,0]);

        //add object
        var x, y, z, w, h, d;
        var i = max;
        var t;
        while (i--){
            if(type===4) t = Math.floor(Math.random()*3)+1;
            else t = type;
            x = -100 + Math.random()*200;
            z = -100 + Math.random()*200;
            y = 100 + Math.random()*1000;
            w = 10 + Math.random()*10;
            h = 10 + Math.random()*10;
            d = 10 + Math.random()*10;

            if(t===1){
                bodys[i] = world.add({type:'sphere', size:[w*0.5], pos:[x,y,z], move:true, world:world});
                meshs[i] = new THREE.Mesh( geos.sphere, mats.sph );
                meshs[i].scale.set( w*0.5, w*0.5, w*0.5 );
            } else if(t===2){
                bodys[i] = world.add({type:'box', size:[w,h,d], pos:[x,y,z], move:true, world:world});
                meshs[i] = new THREE.Mesh( geos.box, mats.box );
                meshs[i].scale.set( w, h, d );
            } else if(t===3){
                bodys[i] = world.add({type:'cylinder', size:[w*0.5,h], pos:[x,y,z], move:true, world:world});
                meshs[i] = new THREE.Mesh( geos.cylinder, mats.cyl );
                meshs[i].scale.set( w*0.5, h, w*0.5 );
            }

            meshs[i].castShadow = true;
            meshs[i].receiveShadow = true;

            scene.add( meshs[i] );
        }
    }

    window.populate = populate;

    function updateOimoPhysics() {
        if(world==null) return;

        world.step();

        var x, y, z, mesh, body, i = bodys.length;

        while (i--){
            body = bodys[i]; body = bodys[i];
            mesh = meshs[i];

            if(!body.sleeping){

                mesh.position.copy(body.getPosition());
                mesh.quaternion.copy(body.getQuaternion());

                // change material
                if(mesh.material.name === 'sbox') mesh.material = mats.box;
                if(mesh.material.name === 'ssph') mesh.material = mats.sph;
                if(mesh.material.name === 'scyl') mesh.material = mats.cyl; 

                // reset position
                if(mesh.position.y<-100){
                    x = -100 + Math.random()*200;
                    z = -100 + Math.random()*200;
                    y = 100 + Math.random()*1000;
                    body.resetPosition(x,y,z);
                }
            } else {
                if(mesh.material.name === 'box') mesh.material = mats.sbox;
                if(mesh.material.name === 'sph') mesh.material = mats.ssph;
                if(mesh.material.name === 'cyl') mesh.material = mats.scyl;
            }
        }

        infos.innerHTML = world.getInfo();
    }

    function gravity(g){
        nG = document.getElementById("gravity").value
        world.gravity = new OIMO.Vec3(0, nG, 0);
    }

    //----------------------------------
    //  TEXTURES
    //----------------------------------

    function gradTexture(color) {
        var c = document.createElement("canvas");
        var ct = c.getContext("2d");
        var size = 1024;
        c.width = 16; c.height = size;
        var gradient = ct.createLinearGradient(0,0,0,size);
        var i = color[0].length;
        while(i--){ gradient.addColorStop(color[0][i],color[1][i]); }
        ct.fillStyle = gradient;
        ct.fillRect(0,0,16,size);
        var texture = new THREE.Texture(c);
        texture.needsUpdate = true;
        return texture;
    }

    function basicTexture(n){
        var canvas = document.createElement( 'canvas' );
        canvas.width = canvas.height = 64;
        var ctx = canvas.getContext( '2d' );
        var color;
        if(n===0) color = "#3884AA";// sphere58AA80
        if(n===1) color = "#61686B";// sphere sleep
        if(n===2) color = "#AA6538";// box
        if(n===3) color = "#61686B";// box sleep
        if(n===4) color = "#AAAA38";// cyl
        if(n===5) color = "#61686B";// cyl sleep
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillRect(32, 32, 32, 32);

        var tx = new THREE.Texture(canvas);
        tx.needsUpdate = true;
        return tx;
    }
//   const canvas = document.querySelector('#test');
//   const renderer = new THREE.WebGLRenderer({canvas});

//   const fov = 45;
//   const aspect = 2;  // the canvas default
//   const near = 0.1;
//   const far = 100;
//   const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//   camera.position.set(0, 10, 20);

//   const controls = new OrbitControls(camera, canvas);
//   controls.target.set(0, 5, 0);
//   controls.update();

//   const scene = new THREE.Scene();
//   scene.background = new THREE.Color('black');

//   {
//     const planeSize = 40;

//     const loader = new THREE.TextureLoader();
//     const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
//     texture.wrapS = THREE.RepeatWrapping;
//     texture.wrapT = THREE.RepeatWrapping;
//     texture.magFilter = THREE.NearestFilter;
//     const repeats = planeSize / 2;
//     texture.repeat.set(repeats, repeats);

//     const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
//     const planeMat = new THREE.MeshPhongMaterial({
//       map: texture,
//       side: THREE.DoubleSide,
//     });
//     const mesh = new THREE.Mesh(planeGeo, planeMat);
//     mesh.rotation.x = Math.PI * -.5;
//     scene.add(mesh);
//   }

//   {
//     const skyColor = 0xB1E1FF;  // light blue
//     const groundColor = 0xB97A20;  // brownish orange
//     const intensity = 1;
//     const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
//     scene.add(light);
//   }

//   {
//     const color = 0xFFFFFF;
//     const intensity = 1;
//     const light = new THREE.DirectionalLight(color, intensity);
//     light.position.set(5, 10, 2);
//     scene.add(light);
//     scene.add(light.target);
//   }

//   function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
//     const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
//     const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
//     const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
//     // compute a unit vector that points in the direction the camera is now
//     // in the xz plane from the center of the box
//     const direction = (new THREE.Vector3())
//         .subVectors(camera.position, boxCenter)
//         .multiply(new THREE.Vector3(1, 0, 1))
//         .normalize();

//     // move the camera to a position distance units way from the center
//     // in whatever direction the camera was from the center already
//     camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

//     // pick some near and far values for the frustum that
//     // will contain the box.
//     camera.near = boxSize / 100;
//     camera.far = boxSize * 100;

//     camera.updateProjectionMatrix();

//     // point the camera to look at the center of the box
//     camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
//   }

//   {
//     const gltfLoader = new GLTFLoader();
//     gltfLoader.load('https://threejsfundamentals.org/threejs/resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
//       const root = gltf.scene;
//       scene.add(root);

//       // compute the box that contains all the stuff
//       // from root and below
//       const box = new THREE.Box3().setFromObject(root);

//       const boxSize = box.getSize(new THREE.Vector3()).length();
//       const boxCenter = box.getCenter(new THREE.Vector3());

//       // set the camera to frame the box
//       frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

//       // update the Trackball controls to handle the new size
//       controls.maxDistance = boxSize * 10;
//       controls.target.copy(boxCenter);
//       controls.update();
//     });
//   }

//   function resizeRendererToDisplaySize(renderer) {
//     const canvas = renderer.domElement;
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;
//     const needResize = canvas.width !== width || canvas.height !== height;
//     if (needResize) {
//       renderer.setSize(width, height, false);
//     }
//     return needResize;
//   }

//   function render() {
//     if (resizeRendererToDisplaySize(renderer)) {
//       const canvas = renderer.domElement;
//       camera.aspect = canvas.clientWidth / canvas.clientHeight;
//       camera.updateProjectionMatrix();
//     }

//     renderer.render(scene, camera);

//     requestAnimationFrame(render);
//   }

//   requestAnimationFrame(render);
}



main();