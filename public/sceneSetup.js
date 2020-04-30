import * as THREE from '/three.module.js';
import * as OIMO from '/oimo.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/loaders/GLTFLoader.js';


function oimoObjects()
{
    let world = new OIMO.World({
        timestep:1/20,
        iterations: 4,
        broadphase: 0,
        worldscale: 1,
        info: true,
        gravity: [0,-9.8,0]
    });

    let box = world.add({
        type: "box",
        size: [1000,1,1000],
        pos: [0,0,0],
        density: 1000,
        rot: [0,0,0],
        move: true 
    });

    let sphere = world.add({
        type: "sphere",
        size:[20],
        pos:[0,50,0],
        density:100,
        move:true
    });

    return [world,box,sphere];
}

function createSkyBox(scene) {
    let matArray = [];
    let texture_front = new THREE.TextureLoader().load('images/skybox_ft.jpg');
    let texture_back = new THREE.TextureLoader().load('images/skybox_bk.jpg');
    let texture_bottom = new THREE.TextureLoader().load('images/skybox_dn.jpg');
    let texture_top = new THREE.TextureLoader().load('images/skybox_up.jpg');
    let texture_left = new THREE.TextureLoader().load('images/skybox_lf.jpg');
    let texture_right = new THREE.TextureLoader().load('images/skybox_rt.jpg');

    matArray.push(new THREE.MeshBasicMaterial({map: texture_front}));
    matArray.push(new THREE.MeshBasicMaterial({map: texture_back}));
    matArray.push(new THREE.MeshBasicMaterial({map: texture_top}));
    matArray.push(new THREE.MeshBasicMaterial({map: texture_bottom}));
    matArray.push(new THREE.MeshBasicMaterial({map: texture_right}));
    matArray.push(new THREE.MeshBasicMaterial({map: texture_left}));

    for(let i = 0; i < 6; i++)
    {
        matArray[i].side = THREE.BackSide;
    }
    let skyBoxGeometry = new THREE.BoxGeometry(10000,10000,10000);
    let skybox = new THREE.Mesh(skyBoxGeometry,matArray);
    skybox.rotateY( Math.PI );
    scene.add(skybox);
}

function lightSetup()
{
    let light = new THREE.DirectionalLight( 0xffffff , 1.4);
    light.position.set( -700, 1000, 900 );
    light.target.position.set( 0, 0, 0 );
    light.castShadow = true;

    var d = 300;
    light.shadow.camera = new THREE.OrthographicCamera( -d, d, d, -d,  500, 1600 );
    light.shadow.bias = 0.0001;
    light.shadow.mapSize.width = light.shadow.mapSize.height = 1024;

    return light;
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

const gltfLoader = new GLTFLoader();
function createBanana(x,y,z,name,scene,bananaArray)
{
    let banana;
    console.log("SCENE");
    gltfLoader.load('banana.gltf', (gltf) => {
        banana = gltf.scene;
        banana.scale.set(2,2,2);
        banana.position.set(x,y,z);
        banana.name = name;
        banana.traverse( function( node ) {

            if ( node.isMesh ) { node.castShadow = true; }
    
        } );
        console.log("BANANA: ",banana);
        scene.add(banana);
        bananaArray.push(banana);
      });
    return banana;
}

function createBananaArray(scene)
{
    var bananaArray = [];
    var banana_coords = [100,10,0,-100,10,0,0,10,100,0,10,-100];
    let counter = 0;
    let name = "";
    for(var i = 0; i < banana_coords.length;i=i+3)
    {
        var x = banana_coords[i];
        var y = banana_coords[i+1];
        var z = banana_coords[i+2];
        name = "Banana"+counter;
        createBanana(x,y,z,name,scene,bananaArray); 
        counter++;
    }
    return bananaArray;
}

export { oimoObjects,createSkyBox, lightSetup, basicTexture,createBananaArray};