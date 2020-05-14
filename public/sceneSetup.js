import * as THREE from '/three.module.js';
import * as OIMO from '/oimo.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/loaders/GLTFLoader.js';




let world = new OIMO.World({
    timestep:1/20,
    iterations: 4,
    broadphase: 0,
    worldscale: 1,
    info: true,
    gravity: [0,-18.6,0]
});

function oimoObjects()
{
    let box = world.add({
        type: "box",
        size: [2000,4,2000],
        pos: [0,0,0],
        density: 100000,
        rot: [0,0,0],
        move: true,
        collidesWith: 0xffffffff & ~ (1 << 1) & ~(1<< 2)
    });

    let sphere = world.add({
        name:'MonkeyBall',
        type: "sphere",
        size:[20],
        pos:[0,50,0],
        density:1000,
        move:true,
        collidesWith: 0xffffffff & ~(1<< 2)

    });

    let back = world.add({
        type: "box",
        size: [3,2000,2000],
        pos: [-1000,500,0],
        density: 10000,
        rot: [0,0,0],
        move: false,
        belongsTo: 1 << 1
    });
    let front = world.add({
        type: "box",
        size: [3,2000,2000],
        pos: [1000,500,0],
        density: 10000,
        rot: [0,0,0],
        move: false,
        belongsTo: 1 << 1
    });
    let left = world.add({
        type: "box",
        size: [2000,2000,3],
        pos: [0,500,-1000],
        density: 10000,
        rot: [0,0,0],
        move: false,
        belongsTo: 1 << 1
    });
    let right = world.add({
        type: "box",
        size: [2000,2000,3],
        pos: [0,500,1000],
        density: 10000,
        rot: [0,0,0],
        move: false,
        belongsTo: 1 << 1
    });

    // let checkBox = world.add({
    // }

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

    var d = 500;
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
function createBanana(x,y,z,name,scene,bananaArray,Physical)
{
    let banana;
    //console.log("SCENE");
    gltfLoader.load('banana.gltf', (gltf) => {
        banana = gltf.scene;
        banana.scale.set(4,4,4);
        banana.position.set(x,y,z);
        banana.name = name;
        banana.traverse( function( node ) {

            if ( node.isMesh ) { node.castShadow = true; }
    
        });
        //console.log("BANANA: ",banana);
        scene.add(banana);
        let obj ={
            name: name,
            banana: banana,
            oimo: Physical
        };
        bananaArray.push(obj);
      });
    //return banana;
}

function createBananaArray(scene)
{
    var bananaArray = [];
    var banana_coords = [];//[100,10,0,-100,10,0,0,10,100,0,10,-100];
    banana_coords.push(100,10,0)
    for(var i = 0; i <29; i++)
    {
        banana_coords.push(Math.floor(Math.random() * 1900) - 1000);
        banana_coords.push(10);
        banana_coords.push(Math.floor(Math.random() * 1900) - 1000);
    }
    let counter = 0;
    let name = "";
    let retval =[];
   
    for(var i = 0; i < banana_coords.length;i=i+3)
    {
        var x = banana_coords[i];
        var y = banana_coords[i+1];
        var z = banana_coords[i+2];
        name = "Banana"+counter;
        let Physical = world.add({
            name: "Banana" + counter,
            type: "cylinder",
            size:[2,10,4],
            pos:[x,y,z],
            density:1,
            move:false,
            belongsTo: 1 << 1,
        });
        
        createBanana(x,y,z,name,scene,bananaArray,Physical);
        //console.log(bananaArray);
        counter++;
    }
    return bananaArray;
}


function test(trackName,scene,meshes)
{
    let track = null;
    return new Promise((resolve, reject) => {
        gltfLoader.load('track1.gltf',(gltf) => {
            track = gltf.scene;
            let temp = [];
            temp.push(track.children[0]);
            track.children = temp;
            track.traverse( function( node ) {
                if ( node.isMesh ) { node.receiveShadow = true;}
            });
            scene.add(track);
            meshes.push(track);
            resolve(meshes);
        });
      });
}

async function createGroundMesh(scene)
{
    var meshes = [];
    let track = null;
    const test1 = await test('track.gltf', scene,meshes);
    console.log(test1);
    return test1;
}

export { oimoObjects,createSkyBox, lightSetup, basicTexture,createBananaArray, createGroundMesh};