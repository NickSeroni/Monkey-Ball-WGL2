import * as THREE from '/three.module.js';
import * as OIMO from '/oimo.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/loaders/GLTFLoader.js';
import * as glMatrix from '/gl-matrix-min.js';
import { oimoObjects, createSkyBox, lightSetup, basicTexture,createBananaArray, createGroundMesh} from '/sceneSetup.js';

var paused = false;

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
var BananaCluster = [];
var BananasCollected = 0; 
var movingGroup = new THREE.Group();
const gltfLoader = new GLTFLoader();

//the maximum degrees that the level can be tilted
var maxTilt = .05;
var userInput = false;
var userInputWait = true;

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

    meshes = await createGroundMesh(scene);
    let ground = meshes[0];
    ground.position.set(0,0,0);
    ground.scale.set(125,1,125);
    console.log("GROUND:", ground);
    var bbox = new THREE.Box3().setFromObject(ground.children[0]);
    console.log(bbox);
    var size = bbox.getSize(new THREE.Vector3());
    console.log(size);
    meshes.push (new THREE.Mesh( geos.sphere, mats.sph ));

    meshes[1].position.set(0,50,0);
    meshes[0].receiveShadow = true;
    meshes[0].castShadow = true;
    meshes[1].receiveShadow = true;
    meshes[1].castShadow = true;

    scene.add( meshes[1]);
    scene.add(meshes[0]);

    movingGroup.add(ground);
    console.log("GROUP",movingGroup);
    bananaArray = createBananaArray(scene,movingGroup);
    scene.add(movingGroup);
    console.log("GROUP",movingGroup);
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
    for(let i = 0; i< bananaArray.length; i++)
    {
        if(world.checkContact( bananaArray[i].name, 'MonkeyBall'))
        {
            //console.log(" IN Deletion!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",bananaArray[i].oimo)
            console.log(bananaArray[0].oimo.position, "-", sphere.position)
            movingGroup.remove(scene.getObjectByName( bananaArray[i].name));
            bananaArray[i].oimo.remove();

            BananasCollected++;
            var counterID = document.getElementById('counter');
            counterID.innerHTML = "Banana Counter: "+ BananasCollected + " / 30";
             console.log(" BANANAS COLLECTED: ",BananasCollected);
            bananaArray.splice(i,1);
            i--;
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
    userInput = false;
    keyDown();

    if (!paused)
    {
        box.position.set(0,0,0);
        box.linearVelocity.set(0,0,0);
        box.angularVelocity.y = 0;
        var prior_pos = sphere.getPosition()
        world.step();
        
        let x, y, z, mesh, body;

        for(let i = 0; i < meshes.length; i++)
        {
            body = bodys[i];
            mesh = meshes[i];

            if(i == 0)
            {  
                movingGroup.position.copy(body.getPosition());
                movingGroup.quaternion.copy(body.getQuaternion());
                // for(let j = 0; j< bananaArray.length; j++){
                //     //if(j == 0)
                //         //console.log(movingGroup.children[j+1].getWorldQuaternion(),bananaArray[j].oimo.getQuaternion());
                //     let pos = movingGroup.children[j+1].getWorldPosition();
                //     let quaternion = movingGroup.children[j+1].getWorldQuaternion();
                //     bananaArray[j].oimo.position.x = pos.x;
                //     bananaArray[j].oimo.position.y = pos.y + 20;
                //     bananaArray[j].oimo.position.z = pos.z;
                //     bananaArray[j].oimo.quaternion.copy(quaternion);
                // }
            }
            else
            {
                if(!body.sleeping){

                    mesh.position.copy(body.getPosition());
                    mesh.quaternion.copy(body.getQuaternion());
                    if(mesh.position.y<-400){
                        body.resetPosition(0,50,0);
                    }
                }
            } 
        }
        

        if (userInput == false && userInputWait == false)
        {
            //Smoothly decrease the rotation of the ground
            let alignment = box.getQuaternion();

            if (alignment["z"] > 0)
            {
                if (alignment["z"] < -box.angularVelocity.z)
                {
                    //box.angularVelocity.z = 0;
                }
                else
                {
                    box.angularVelocity.z -= .004;
                }
            }
            if (alignment["z"] < 0)
            {
                if (alignment["z"] > -box.angularVelocity.z)
                {
                    //box.angularVelocity.z = 0;
                }
                else
                {
                    box.angularVelocity.z += .004;
                }
            }
            if (alignment["x"] > 0)
            {
                if (alignment["x"] < -box.angularVelocity.x)
                {
                    //box.angularVelocity.x = 0;
                }
                else
                {
                    box.angularVelocity.x -= .004;
                }
            }
            if (alignment["x"] < 0)
            {
                if (alignment["x"] > -box.angularVelocity.x)
                {
                    //box.angularVelocity.x = 0;
                }
                else
                {
                    box.angularVelocity.x += .004;
                }
            }
        }
        if(userInput == false)
            userInputWait = false;
        else
            userInputWait = true;
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
            userInput = true;
            
            if (box.getQuaternion()["z"] < -maxTilt)
            {
                box.angularVelocity.z = 0;
            } 
            else if (box.angularVelocity.z > -.05)
            {
                box.angularVelocity.z -= .0004;
            }

            //console.log("New Rotation: " + box.getQuaternion());
        }
        if(event.key == 's')
        {
            userInput = true;

            if (box.getQuaternion()["z"] > maxTilt)
            {
                box.angularVelocity.z = 0;
            }
            else if (box.angularVelocity.z < .05)
            {
                box.angularVelocity.z += .0004;
            }
            //console.log("New Rotation: " + box.getQuaternion());
        }
        if(event.key == 'a')
        {
            userInput = true;

            if (box.getQuaternion()["x"] < -maxTilt)
            {
                box.angularVelocity.x = 0;
            }
            else if (box.angularVelocity.x > -.05)
            {
                box.angularVelocity.x -= .0004;

            }
            //console.log("New Rotation: " + box.getQuaternion());
        }
        if(event.key == 'd')
        {
            userInput = true;

            if (box.getQuaternion()["x"] > maxTilt)
            {
                box.angularVelocity.x = 0;
            }
            else if (box.angularVelocity.x < .05)
            {
                box.angularVelocity.x += .0004;
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
        if(event.key == 'p')
        {
            //allows us to pause the game
            paused = !paused;
        } 
        if(event.key=='i')
        {
            sphere.linearVelocity.x +=.01;
        } 
        if(event.key == 'k')
        {
            sphere.linearVelocity.x -=.01;
        }
        if(event.key == 'l')
        {
            sphere.linearVelocity.z += .01
        }
        if(event.key == 'j')
        {
            sphere.linearVelocity.z -= .01
        }
        if(event.key == 'm')
        {
            
            box.angularVelocity.x =0;
            box.angularVelocity.z =0;
        } 
        if(event.key == 'r')
        {
            sphere.position.x = 0;
            sphere.position.y = 50;
            sphere.position.z = 0;
        }

    });
}

setup();
export { BananaCounter };
