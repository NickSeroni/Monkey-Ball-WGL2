import * as THREE from '/three.module.js';
import * as OIMO from '/oimo.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/loaders/GLTFLoader.js';

var camera, scene, light, renderer, canvas, controls;
var meshs = [];
var grounds = [];

// var isMobile = false;
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

function Init()
{
        infos = document.getElementById("info");

        canvas = document.getElementById("canvas");

        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 5000 );
        camera.position.set( 0, 160, 400 );

        controls = new THREE.OrbitControls( camera, canvas );
        controls.target.set(0, 20, 0);
        controls.update();

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({ canvas:canvas, precision: "mediump", antialias:antialias });
        renderer.setSize( window.innerWidth, window.innerHeight );

        var materialType = 'MeshBasicMaterial';
        
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

        window.addEventListener( 'resize', onWindowResize, false );
        initOimoPhysics();
}

function loop() 
{
    updateOimoPhysics();
    renderer.render( scene, camera );
    requestAnimationFrame( loop );
}

//Adds to the scene a mesh at position, of size and of rotation converted to Radians
//also adds it to the ground which is just a programmer design choice
function addStaticBox(size, position, rotation) 
{
    var mesh = new THREE.Mesh( geos.box, mats.ground );
    mesh.scale.set( size[0], size[1], size[2] );
    mesh.position.set( position[0], position[1], position[2] );
    mesh.rotation.set( rotation[0]*ToRad, rotation[1]*ToRad, rotation[2]*ToRad );
    scene.add( mesh );
    grounds.push(mesh);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
}

//clears the mesh from the ground and scene
function clearMesh()
{
    var i=meshs.length;
    while (i--) scene.remove(meshs[i]);
    i = grounds.length;
    while (i--) scene.remove(grounds[i]);
    grounds = [];
    meshs = [];
}

function initOimoPhysics()
{

    // world setting:( TimeStep, BroadPhaseType, Iterations )
    // BroadPhaseType can be 
    // 1 : BruteForce
    // 2 : Sweep and prune , the default 
    // 3 : dynamic bounding volume tree

    world = new OIMO.World({info:true, worldscale:100} );
    populate(1);
    //setInterval(updateOimoPhysics, 1000/60);

}


//reorients and resizes camera when the page's size is modified
function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

Init();