import * as THREE from '/three.module.js';
import * as OIMO from '/oimo.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/loaders/GLTFLoader.js';
import * as glMatrix from '/gl-matrix-min.js';

var world = null;
var box= null;
var sphere = null;
var monkey_ball = null;
var skybox = null;
var camera, scene, light, renderer, canvas, controls,infos, banana_loop;
var body = null,meshes = [],bodys = [];
var antialias = true;
var materialType = 'MeshBasicMaterial';
var geos = {};
var mats = {};
var BananaCluster = [];
var BananasCollected = 0; 
const gltfLoader = new GLTFLoader();

//sets up geometry and calls other setters
async function setup()
{
    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 45, 30000 );
    camera.position.set( -900, 300, 0 );

    
    infos = document.getElementById("info");
    canvas = document.getElementById("canvas");

    renderer = new THREE.WebGLRenderer({ canvas:canvas, precision: "mediump", antialias:antialias });
    renderer.setSize( window.innerWidth, window.innerHeight );

    controls = new OrbitControls( camera, canvas );
    controls.update();
    controls.maxDistance = 2000;
    OrbitControls.enableZoom = false;
    
    scene = new THREE.Scene();

    createSkyBox();
    setupScene();

    world = new OIMO.World({
        timestep:1/20,
        iterations: 4,
        broadphase: 0,
        worldscale: 1,
        info: true,
        gravity: [0,-9.8,0]
    });

    box = world.add({
        type: "box",
        size: [1000,1,1000],
        pos: [0,0,0],
        density: 1000,
        rot: [0,0,0],
        move: true 
    });

    sphere = world.add({
        type: "sphere",
        size:[20],
        pos:[0,50,0],
        density:100,
        move:true
    });
    bodys.push(box);
    bodys.push(sphere);
    geos['sphere'] = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(20,30,10));
    geos['box'] = new THREE.BufferGeometry().fromGeometry( new THREE.BoxGeometry(1000,1,1000));


    // geos['sphere'] = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(1,16,10));
    // geos['box']= new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(1,1,1));

    mats['sph']    = new THREE[materialType]( {shininess: 10, map: basicTexture(0), name:'sph' } );
    mats['box']    = new THREE[materialType]( {shininess: 10, map: basicTexture(2), name:'box' } );


   // bodys[i] = world.add({type:'box', size:[w,h,d], pos:[x,y,z], move:true, world:world});
   // meshs[i] = new THREE.Mesh( geos.box, mats.box );

   // var ground0 = world.add({size:[3, 40, 390], pos:[-180,20,0], world:world});
   var ground = new THREE.Mesh( geos.box, mats.box );
   ground.position.set(0,0,0);

   meshes.push(ground);

    
    meshes.push (new THREE.Mesh( geos.sphere, mats.sph ));
  //  meshes.push (new THREE.Mesh( geos.box, mats.box ))

    console.log(meshes[0],meshes.length, " this is meshes!!!!!");

    
    meshes[0].position.set(0,50,0);
    meshes[0].receiveShadow = true;
    //meshes[1].receiveShadow = true;

    scene.add( meshes[1]);
    scene.add(meshes[0]);

    //sphere.linearVelocity.x 
  
    
    banana_loop = [100,10,0,-100,10,0,0,10,100,0,10,-100];  
    let count = 0;
    for(var i = 0; i < banana_loop.length;i=i+3) 
    {
        var x = banana_loop[i];
        var y = banana_loop[i+1];
        var z = banana_loop[i+2];
       BananaCluster.push( await createBanana(x,y,z,count));

        console.log("BANANA:",x,y,z);
        count++;
    }

    window.addEventListener( 'resize', onWindowResize, false );

    loop();
}

function createBanana(x,y,z,count)
{
    return new Promise((resolve,reject)=>{
   // let retval= [x,y,z];
    gltfLoader.load('banana.gltf', (gltf) => {
        var root = gltf.scene;
        root.scale.set(2,2,2);
        root.position.set(x,y,z);
        root.name== "Banana"+count;
        console.log("ROOT: ",root);
        console.log(root,"  inside of GTLF loader")
        scene.add(root);
        console.log(scene.getObjectByName("Banana"+count));
        resolve(root);
      });
     
    });
     
}

function BananaCounter()
{
    
    // root = gltf.scene;
    // root.scale.set(2,2,2);
    // root.position.set(x,y,z);

    console.log(BananaCluster,"     BananaCluster");
    for(let i = 0; i< BananaCluster.length; i++)
    {

        console.log(BananaCluster,"                ", sphere.position.x );
        if(BananaCluster[i].position.x - sphere.position.x <= 0 && BananaCluster[i].position.x -sphere.position.x >= sphere.size)
        {
            console.log(" IN Deletion!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            scene.remove(BananaCluster[i]);
            BananasCollected++;
        }
    }
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function createSkyBox() {
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
    skybox = new THREE.Mesh(skyBoxGeometry,matArray);
    scene.add(skybox);
}

function setupScene()
{
    
    scene.add( new THREE.AmbientLight( 0x3D4143 ) );
    light = new THREE.DirectionalLight( 0xffffff , 1.4);
    light.position.set( 700, 1400, -900 );
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
    box.position.set(0,0,0);
    box.linearVelocity.set(0,0,0);
    
    document.addEventListener('keydown', function(event) 
    {
        if(event.key == 'w')
        {

            if (box.angularVelocity.z > -.2)
            {
                box.angularVelocity.z -= .06;
            }
            //console.log("New Rotation: " + box.getQuaternion());
        }
        if(event.key == 's')
        {

            if (box.angularVelocity.z < .2)
            {
                box.angularVelocity.z += .06;
            }
            //console.log("New Rotation: " + box.getQuaternion());
        }
        if(event.key == 'a')
        {
            if (box.angularVelocity.x > -.2)
            {
                box.angularVelocity.x -= .06;

            }
            //console.log("New Rotation: " + box.getQuaternion());
        }
        if(event.key == 'd')
        {
            if (box.angularVelocity.x < .2)
            {
                box.angularVelocity.x += .06;
            }
            //console.log("New Rotation: " + box.getQuaternion());
        }
        if(event.key == 'x')
        {

            if(!(sphere.linearVelocity.y >= -40))
            {
               sphere.linearVelocity.y -=.1;
            };
        }   

    });
 
    //console.log("the velocity is ", sphere.linearVelocity.x)
    var prior_pos = sphere.getPosition()
    world.step();
    
   let  x, y, z, mesh, body

    for(let i = 0; i < meshes.length; i++)
    {
        body = bodys[i];
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

    //Smoothly decrease the rotation of the ground
    if (box.angularVelocity.z > 0)
    {
        box.angularVelocity.z -= .003;
    }
    if (box.angularVelocity.z < 0)
    {
        box.angularVelocity.z += .003;
    }
    if (box.angularVelocity.x > 0)
    {
        box.angularVelocity.x -= .003;
    }
    if (box.angularVelocity.x < 0)
    {
        box.angularVelocity.x += .003;
    }

    if(prior_pos != sphere.getPosition)
    {
        //console.log(sphere.getPosition());
    }
    else
    {
        process.exit(1);
    }
    //console.log(sphere.pos.x, sphere.pos.y , sphere.pos.z ,"    Are Sphere positions");
    //console.log(sphere.position.x -100, sphere.position.y+25, sphere.position.z ,"    Are the camera positions");
    camera.position.set(sphere.position.x -300, sphere.position.y+40, sphere.position.z);
    //controls.update();
//    renderer.setSize( window.innerWidth, window.innerHeight );

    BananaCounter();
    console.log(BananasCollected,"   How many Bananas have I collected?");

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



