import * as THREE from '/three.module.js';
import * as OIMO from '/oimo.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/loaders/GLTFLoader.js';
import * as glMatrix from '/gl-matrix-min.js';
import { oimoObjects, createSkyBox, lightSetup, basicTexture,createBananaArray, createTrack} from '/sceneSetup.js';

var paused = false;

var world = null;
var box= null;
var trackObjects = null;
var sphere = null;
var monkey_ball = null;
var bananaArray = null;
var camera, scene, light, renderer, canvas, controls,infos;
var body = null,meshes = [],bodys = [];
var antialias = true;
var materialType = 'MeshPhongMaterial';
var geos = {};
var mats = {};
var BananaCluster = [];
var BananasCollected = 0;
var trackBodys = [];
var trackMeshes = [];
var trackBodyOriginal = [];
//the maximum degrees that the level can be tilted
var maxTilt = 15;

var CamTarget = {};

//sets up geometry and calls other setters
async function setup()
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
    controls.maxDistance = 1000;

    light = lightSetup();

    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x3D4143));
    scene.add(light);
    createSkyBox(scene);

    var oimoObj = oimoObjects(); world = oimoObj[0]; box = oimoObj[1]; sphere = oimoObj[2];

    CamTarget = new THREE.Vector3(sphere.position.x, sphere.position.y, sphere.position.z);

    geos['sphere'] = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(20,30,10));
    geos['box'] = new THREE.BufferGeometry().fromGeometry( new THREE.BoxGeometry(480,1,480));
    mats['sph']    = new THREE[materialType]( {shininess: 10, map: basicTexture(0), name:'sph' } );
    mats['box']    = new THREE[materialType]( {shininess: 10, map: basicTexture(2), name:'box' } );

    //var ground = new THREE.Mesh( geos.box, mats.box );
    console.log("WORLD",world);
    trackObjects = await createTrack(scene, world);
    trackMeshes = trackObjects[1].children;
    trackBodys = trackObjects[0];
    for(var i = 0; i < trackBodys.length; i++)
    {
        let temp = [];
        temp.push(trackBodys[i].position.x);
        temp.push(trackBodys[i].position.y);
        temp.push(trackBodys[i].position.z);
        trackBodyOriginal.push(temp);
    }
    world = trackObjects[2];
    console.log("WORLD",world);
    console.log(trackBodys[0]);
    console.log("TRACKMESHES",trackMeshes);
    console.log("TRACKBODIES",trackBodys);
    //bodys.push(box);
    bodys.push(sphere);
    //console.log("GROUND:", ground);
    //ground.position.set(0,0,0);
    //meshes.push(ground);

    meshes.push (new THREE.Mesh( geos.sphere, mats.sph ));
    meshes[0].position.set(0,100,0);
    meshes[0].receiveShadow = true;
    meshes[0].castShadow = true;
    scene.add(meshes[0]);
    //scene.add(meshes[0]);

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

function BananaCounter()
{

    //console.log(bananaArray,"     BananaCluster");
    for(let i = 0; i< bananaArray.length; i++)
    {
        //console.log(bananaArray,"                ", sphere.position.x );
        if(world.getContact(bananaArray[i].oimo, sphere));
        {
        //     console.log(" IN Deletion!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        //     scene.remove(BananaCluster[i].banana);
        //     scene.remove(BananaCluster[i].oimo);
            BananasCollected++;
            //system("pause");
        }
    }
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function loop()
{
    keyDown();

    if (!paused)
    {
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

        for(let i = 0; i < trackMeshes.length; i++)
        {
            body = trackBodys[i];
            mesh = trackMeshes[i];
            var temp = [trackBodyOriginal[i][0],trackBodyOriginal[i][1],trackBodyOriginal[i][2]];
            body.position.x = temp[0];
            body.position.y = temp[1];
            body.position.z = temp[2];
            body.linearVelocity.set(0,0,0);
            mesh.position.copy(body.getPosition());
            mesh.quaternion.copy(body.getQuaternion());
        }

        //Smoothly decrease the rotation of the ground
        
        if (trackBodys[0].angularVelocity.z > 0)
        {
            trackBodys[0].angularVelocity.z -= .003;
        } 
        if (trackBodys[0].angularVelocity.z < 0)
        {
            trackBodys[0].angularVelocity.z += .003;
        }
        if (trackBodys[0].angularVelocity.x > 0)
        {
            trackBodys[0].angularVelocity.x -= .003;
        }
        if (trackBodys[0].angularVelocity.x < 0)
        {
            trackBodys[0].angularVelocity.x += .003;
        }

        if(prior_pos != sphere.getPosition)
        {
            //console.log(sphere.getPosition());
        }
        else
        {
            process.exit(1);
        }

        // console.log(sphere.pos.x, sphere.pos.y , sphere.pos.z ,"    Are Sphere positions");
        // console.log(sphere.position.x -100, sphere.position.y+25, sphere.position.z ,"    Are the camera positions");

        //console.log(navigator.getGamepads());
        BananaCounter();
        CamTarget.setX(sphere.position.x);
        CamTarget.setY(sphere.position.y);
        CamTarget.setZ(sphere.position.z);

        controls.target = CamTarget;
        controls.update();
    }
    renderer.render(scene,camera);
    requestAnimationFrame(loop);

}

function keyDown()
{
    document.addEventListener('keydown', function(event)
    {
        if(event.key == 'w')
        {
            
            if (trackBodys[0].angularVelocity.z > -.2)
            {
                trackBodys[0].angularVelocity.z -= .06;
            }
            console.log("New Rotation: " + trackBodys[0].getQuaternion());

        }
        if(event.key == 's')
        {
            if (trackBodys[0].angularVelocity.z < .2)
            {
                trackBodys[0].angularVelocity.z += .06;
            }
            console.log("New Rotation: " + trackBodys[0].getQuaternion());
        }
        if(event.key == 'a')
        {
            if (trackBodys[0].angularVelocity.x > -.2)
            {
                trackBodys[0].angularVelocity.x -= .06;
            }
            console.log("New Rotation: " + trackBodys[0].getQuaternion());
        }
        if(event.key == 'd')
        {
            if (trackBodys[0].angularVelocity.x < .2)
            {
                trackBodys[0].angularVelocity.x += .06;
            }
            console.log("New Rotation: " + trackBodys[0].getQuaternion());
        }

        if(event.key == "i")
        {
            if (sphere.linearVelocity.x < 20)
            {
                sphere.linearVelocity.x += 5;
            }
        }

        if(event.key == "j")
        {
            if (sphere.linearVelocity.z < 20)
            {
                sphere.linearVelocity.z += 5;
            }
        }

        if(event.key == "k")
        {
            if (sphere.linearVelocity.x > -20)
            {
                sphere.linearVelocity.x -= 5;
            }
        }

        if(event.key == "l")
        {
            if (sphere.linearVelocity.z > -20)
            {
                sphere.linearVelocity.z -= 5;
            }
        }
    });
}

setup();
