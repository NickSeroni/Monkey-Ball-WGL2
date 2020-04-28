import * as THREE from '/three.module.js';
import * as OIMO from '/oimo.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/loaders/GLTFLoader.js';
import * as glMatrix from '/gl-matrix-min.js';
import { oimoObjects, createSkyBox, lightSetup, basicTexture,createBananaArray} from '/sceneSetup.js';

var world = null;
var box= null;
var sphere = null;
var monkey_ball = null;
var bananaArray = null;
var camera, scene, light, renderer, canvas, controls,infos;
var body = null,meshes = [],bodys = [];
var antialias = true;
var materialType = 'MeshPhongMaterial';
var geos = {};
var mats = {};
const gltfLoader = new GLTFLoader();

var CamTarget = {};

//sets up geometry and calls other setters
function setup()
{
    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 45, 30000 );
    camera.position.set( -900, 300, 0 );

    infos = document.getElementById("info");
    canvas = document.getElementById("canvas");

    renderer = new THREE.WebGLRenderer({ canvas:canvas, precision: "mediump", antialias:antialias });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    controls = new OrbitControls( camera, canvas );
    controls.update();
    controls.maxDistance = 300;

    light = lightSetup();

    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x3D4143));
    scene.add(light);
    createSkyBox(scene);

    var oimoObj = oimoObjects(); world = oimoObj[0]; box = oimoObj[1]; sphere = oimoObj[2];
    bodys.push(box);
    bodys.push(sphere);

    CamTarget = new THREE.Vector3(sphere.position.x, sphere.position.y, sphere.position.z);

    geos['sphere'] = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(20,30,10));
    geos['box'] = new THREE.BufferGeometry().fromGeometry( new THREE.BoxGeometry(1000,1,1000));
    mats['sph']    = new THREE[materialType]( {shininess: 10, map: basicTexture(0), name:'sph' } );
    mats['box']    = new THREE[materialType]( {shininess: 10, map: basicTexture(2), name:'box' } );

    var ground = new THREE.Mesh( geos.box, mats.box );
    console.log("GROUND:", ground);
    ground.position.set(0,0,0);
    meshes.push(ground);
    
    meshes.push (new THREE.Mesh( geos.sphere, mats.sph ));
    meshes[0].position.set(0,50,0);
    meshes[0].receiveShadow = true;
    meshes[1].castShadow = true;

    scene.add( meshes[1]);
    scene.add(meshes[0]);

    bananaArray = createBananaArray(scene);
    console.log("BANANA ARRAY: ", bananaArray);

    window.addEventListener( 'resize', onWindowResize, false );

    GamepadSetup();

    loop();
}

function GamepadSetup()
{

    window.addEventListener("gamepadconnected", function(e) {
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
          e.gamepad.index, e.gamepad.id,
          e.gamepad.buttons.length, e.gamepad.axes.length);
      });

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function loop()
{
    box.position.set(0,0,0);
    box.linearVelocity.set(0,0,0);
    keyDown();
 
    var prior_pos = sphere.getPosition()
    world.step();
    
    let x, y, z, mesh, body;

    for(let i = 0; i < meshes.length; i++)
    {
        body = bodys[i];
        mesh = meshes[i];

        if(!body.sleeping){

            mesh.position.copy(body.getPosition());
            mesh.quaternion.copy(body.getQuaternion());
            if(mesh.position.y<-400){
                body.resetPosition(0,0,0);
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

    console.log(sphere.pos.x, sphere.pos.y , sphere.pos.z ,"    Are Sphere positions");
    console.log(sphere.position.x -100, sphere.position.y+25, sphere.position.z ,"    Are the camera positions");

    //console.log(navigator.getGamepads());

    CamTarget.setX(sphere.position.x);
    CamTarget.setY(sphere.position.y);
    CamTarget.setZ(sphere.position.z);

    controls.target = CamTarget;
    controls.update();

    renderer.render(scene,camera);
    requestAnimationFrame(loop);

}

function keyDown()
{
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
}

setup();
