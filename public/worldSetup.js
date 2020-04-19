import * as THREE from '/three.module.js';
import * as OIMO from '/oimo.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/loaders/GLTFLoader.js';


var world = null;
var box= null;
var sphere = null;
var camera, scene, light, renderer, canvas, controls,infos;
var body = null,meshes = [];
var antialias = true;
var materialType = 'MeshBasicMaterial';
var geos = {};
var mats = {};


//sets up geometry and calls other setters
function setup()
{

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.set( 0, 20, 100 );

    
    infos = document.getElementById("info");
    canvas = document.getElementById("canvas");

    controls = new OrbitControls( camera, canvas );
    controls.target.set(0, 20, 0);
    controls.update();

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ canvas:canvas, precision: "mediump", antialias:antialias });
    renderer.setSize( window.innerWidth, window.innerHeight );

    setupScene();

    var buffgeoBack = new THREE.BufferGeometry();
    buffgeoBack.fromGeometry( new THREE.IcosahedronGeometry(3000,2) );
    var back = new THREE.Mesh( buffgeoBack, new THREE.MeshBasicMaterial( { map:gradTexture([[0.75,0.6,0.4,0.25], ['#1B1D1E','#3D4143','#72797D', '#b0babf']]), side:THREE.BackSide, depthWrite: false, fog:false }  ));
    //back.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(15*ToRad));
    scene.add(back);

    world = new OIMO.World({
        timestep:1/60,
        iterations: 8,
        broadphase: 2,
        worldscale: 1,
        info: true,
        gravity: [0,-9.8,0]
    });

    box = world.add({
        type: "box",
        size: [1000,1,1000],
        pos: [0,0,0],
        density: 1,
        move: false 
    });

    sphere = world.add({
        type: "sphere",
        size:[10],
        pos:[0,50,0],
        density:1,
        move:true
    });
     

    geos['sphere'] = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(10,30,10));
    geos['box'] = new THREE.BufferGeometry().fromGeometry( new THREE.BoxGeometry(1000,1,1000));


    // geos['sphere'] = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(1,16,10));
    // geos['box']= new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(1,1,1));

    mats['sph']    = new THREE[materialType]( {shininess: 10, map: basicTexture(0), name:'sph' } );
    mats['box']    = new THREE[materialType]( {shininess: 10, map: basicTexture(2), name:'box' } );


   // bodys[i] = world.add({type:'box', size:[w,h,d], pos:[x,y,z], move:true, world:world});
   //eshs[i] = new THREE.Mesh( geos.box, mats.box );


   // var ground0 = world.add({size:[3, 40, 390], pos:[-180,20,0], world:world});
   var ground = new THREE.Mesh( geos.box, mats.box );
   ground.position.set(0,0,0);

    
    meshes.push (new THREE.Mesh( geos.sphere, mats.sph ));
  //  meshes.push (new THREE.Mesh( geos.box, mats.box ))

    console.log(meshes[0],meshes.length, " this is meshes!!!!!");

    
    meshes[0].position.set(0,50,0);
    meshes[0].receiveShadow = true;
    //meshes[1].receiveShadow = true;

    scene.add( meshes[0]);
    scene.add(ground);

    //sphere.linearVelocity.x 
    loop();
}


function setupScene()
{
    
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

function loop()
{
    
    document.addEventListener('keydown', function(event) 
    {
        if(event.key == 'w')
        {
            if(!(sphere.linearVelocity.x >= 20))
            {
                sphere.linearVelocity.x +=.01;
            }
        }
        if(event.key == 's')
        {
            if(!(sphere.linearVelocity.x <= -20))
            {
                sphere.linearVelocity.x -=.01;
            }
        }
        if(event.key == 'a')
        {
             if(!(sphere.linearVelocity.z <= -20))
            {
                sphere.linearVelocity.z -=.01;
            }
        }
        if(event.key == 'd')
        {
            if(!(sphere.linearVelocity.z >= 20))
            {
               sphere.linearVelocity.z +=.01;
            }
        }

    });

    console.log("the velocity is ", sphere.linearVelocity.x)
    var prior_pos = sphere.getPosition()
    world.step();
    
   let  x, y, z, mesh, body


    body = sphere;
    for(let i = 0; i < meshes.length; i++)
    {

      //  console.log("In function LOOP:: ",meshes[i],"    ",i,"  length is ", meshes.length);
        mesh = meshes[i];

        if(!body.sleeping){

            mesh.position.copy(body.getPosition());
            mesh.quaternion.copy(body.getQuaternion());

            // change material
            //if(mesh.material.name === 'sbox') mesh.material = mats.box;
            //if(mesh.material.name === 'ssph') mesh.material = mats.sph;
            //if(mesh.material.name === 'scyl') mesh.material = mats.cyl; 

            // reset position
            if(mesh.position.y<-100){
                x = -100 + Math.random()*200;
                z = -100 + Math.random()*200;
                y = 100 + Math.random()*1000;
                body.resetPosition(x,y,z);
            }
        }
    }

    if(prior_pos != sphere.getPosition)
    {
        console.log(sphere.getPosition());
    }
    else
    {
        process.exit(1);
    }
    renderer.render(scene,camera);
    requestAnimationFrame(loop);

    
}

//copied from test.js warrents a further look into these two 
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
setup();



