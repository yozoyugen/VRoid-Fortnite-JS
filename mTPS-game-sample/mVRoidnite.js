import * as THREE from 'three';
//import * as THREE from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { VRMLoaderPlugin, MToonMaterialLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { MToonNodeMaterial } from '@pixiv/three-vrm/nodes';
import { createVRMAnimationClip, VRMAnimationLoaderPlugin, VRMLookAtQuaternionProxy } from "@pixiv/three-vrm-animation";
import { GUI } from '/mTPS-game-sample/lib/lil-gui.module.min.js';
import RAPIER from '@dimforge/rapier3d-compat'

//--- my build function
import * as BUILD from '/mTPS-game-sample/mBuild.module.js';
import * as VROID from '/mTPS-game-sample/mVRoid.module.js';
//console.log("BUILD:", BUILD);


await RAPIER.init();
console.log("RAPIER:");

/*const btn = document.getElementById("start");
btn.addEventListener("click", mbuttonAction, false);
function mbuttonAction(){
    console.log("mbuttonAction")
    init()
}*/


game();

//window.addEventListener('DOMContentLoaded', init);
async function game() {

    window.onkeydown = function(e) {
        //console.log("e.keyCode:", e.keyCode, ", e.ctrlKey:", e.ctrlKey);
        //console.log("e.ctrlKey:", e.ctrlKey);

        if (e.keyCode == 9){
            //console.log("Disable Tab!");
          return false; // Disable Tab!
        }
     
        if( (e.keyCode == 32) ) {
          //  console.log("Space");
          return false; // Disable Space!
        }
    
        //if( (e.keyCode == 17) ){            
        //    return false; // Disable Control
        //}

        if( e.ctrlKey && e.keyCode == 87 ) {
            console.log("window.onkeydown::  Ctrl + W");
          //e.stopPropagation(); // does not work
          e.preventDefault(); // This works when fullscreen & pointer locked
        }

        if( e.ctrlKey && e.keyCode == 32 ) {
          //  console.log("Ctrl + space");
          //e.stopPropagation(); // does not work
          //e.preventDefault();
        }
          
        //if( (e.keyCode == 16) ) 
        //  return false; // Disable Shift

        // if (e.key == "Escape")
        //   return false;
        //console.log("e.keyCode:");
    }

    window.addEventListener('keydown', function (event) {
        //console.log("e.keyCode:", event.key, ", e.ctrlKey:", event.ctrlKey);
        if (event.ctrlKey && event.key == 87) {  // -> does not work 
            console.log('addEventListener:: Ctrl + W');
            alert("Ctrl+W is blocked");
            event.preventDefault();
        }
    });

    window.addEventListener('beforeunload', function (event) {
        //console.log("fullscreen:",document.fullscreenElement);

        //console.log( window.screen.width, window.outerWidth)
        //console.log( window.screen.height, window.outerHeight)
        //myFunc()
  

        if ( true ) {  //true
            console.log("beforeunload:: event.preventDefault()");
            //alert("Ctrl+W is blocked");
            event.preventDefault();  // This causes alert when fullscreen
        }
    });

    //alert("Ctrl+W is blocked");

    /*function myFunc() {
        const target = document;
        if (
            (target.webkitFullscreenElement &&
                target.webkitFullscreenElement !== null) ||
            (target.mozFullScreenElement &&
                target.mozFullScreenElement !== null) ||
            (target.msFullscreenElement &&
                target.msFullscreenElement !== null) ||
            (target.fullscreenElement && target.fullscreenElement !== null)
        ) {
            console.log("フルスクリーンです");
            return true;
        } else {
            console.log("フルスクリーンじゃないです");
            return false;
        }
    }*/  // does not work. always return false


    var  img_emote1 = new Image();  
        img_emote1.src = '/mTPS-game-sample/image/emote_gangnam.png';
    var  img_emote2 = new Image();  
        img_emote2.src = '/mTPS-game-sample/image/emote_running.png';

    let arrayEmoteIcon = new Array(1);
        arrayEmoteIcon[0] = img_emote1;
        arrayEmoteIcon[1] = img_emote2;
    
    let mArrayAudio = [];

    function loadAudio(url) {
        return fetch(url,{mode: 'cors'})
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => {
              //mode: 'cors'
              //credentials: 'omit'
            return new Promise((resolve, reject) => {
              audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                resolve(audioBuffer);
              }, (err) => {
                reject(err);
              });
            });
          });
      }
      
    function loadAudios() {
        let promises = [
            loadAudio('/mTPS-game-sample/sound/bullet-hit-001.mp3'),
            loadAudio('/mTPS-game-sample/sound/handgun.mp3'),
            loadAudio('/mTPS-game-sample/sound/build-destory.mp3'),
            loadAudio('/mTPS-game-sample/sound/sliding.mp3'),
            loadAudio('/mTPS-game-sample/sound/build01.mp3'),
            loadAudio('/mTPS-game-sample/sound/axeSwing.mp3'), //5
            loadAudio('/mTPS-game-sample/sound/axeHit.mp3'),
            loadAudio('/mTPS-game-sample/sound/edit-start.mp3'),
            loadAudio('/mTPS-game-sample/sound/edit-end.mp3'),
            loadAudio('/mTPS-game-sample/sound/edit-select.mp3'),
            loadAudio('/mTPS-game-sample/sound/open-door.mp3'), //10
            loadAudio('/mTPS-game-sample/sound/gun-equip.mp3'), 
            loadAudio('/mTPS-game-sample/sound/shotgun.mp3'), 
            loadAudio('/mTPS-game-sample/sound/shotgun-reload.mp3'), 
            loadAudio('/mTPS-game-sample/sound/ammo-empty.mp3'),
            loadAudio('/mTPS-game-sample/sound/AR-reload-all.mp3'), 
            loadAudio('/mTPS-game-sample/sound/player-damaged.mp3'), 
        ];
        Promise.all(promises).then(audioBuffers => {
            
            for(var i=0;i<audioBuffers.length;i++){
                mArrayAudio[i] = audioBuffers[i];
                console.log(audioBuffers[i])
            }
            console.log("sound loaded")
        });    
    
    }
    loadAudios()

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    function mPlayAudioBuffer(audioBuffer, volume = 1.0, loop = false) {
        const audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        //console.log("volume:"+volume);

        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume;
        gainNode.connect(audioContext.destination);
        audioSource.connect(gainNode);
        audioSource.loop = loop;
        audioSource.start();
    }

    const textureLoader = new THREE.TextureLoader();
    const firingTexture = textureLoader.load('/mTPS-game-sample/image/fire4.jpg');

    
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    const canvas2d = document.querySelector( '#canvas-2d' );
    const canvasDamage = document.querySelector( '#canvas-damage' );
        canvasDamage.style.visibility ="hidden";
    const canvasEmote = document.querySelector( '#canvas-emote' );
        canvasEmote.style.visibility ="hidden";        

    
    let mJumpVelocity = 11; //6;
    let g_scale = 2.6; //20.0
    const gravity = new RAPIER.Vector3(0.0, -9.81*g_scale, 0.0)
    const world = new RAPIER.World(gravity)
    const world_temp = new RAPIER.World(gravity)
    const world_edit = new RAPIER.World(gravity)
    
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    const canvas3d = document.querySelector( '#canvas' );
    const renderer = new THREE.WebGLRenderer({    
        canvas: canvas3d, //document.querySelector('#canvas')
        antialias: true
    });
    //const renderer = new THREE.WebGPURenderer({    
    //    canvas: canvas3d, //document.querySelector('#canvas')
    //    antialias: true
    //});
    //const main_canvas = document.querySelector( '#main_canvas' );
    //let width = document.getElementById('main_canvas').getBoundingClientRect().width;
    //let height = document.getElementById('main_canvas').getBoundingClientRect().height;
    
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.setClearColor(new THREE.Color('darkblue')); //'gray'
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.gammaOutput = true;
    //renderer.shadowMap.enabled = false;
    //renderer.info.autoReset = false;
    console.log(window.devicePixelRatio);
    console.log(width+", "+height);

    let resolution;
    resolution = new THREE.Vector2();
    renderer.getSize(resolution);
 
    const scene = new THREE.Scene();

    /*let mScale = 1;
    let grid_size = mScale*5;
    let gridH_size = mScale*4;
    let buildThick = grid_size*0.04;
    let slope_ang = Math.acos(grid_size / Math.sqrt(grid_size*grid_size+gridH_size*gridH_size) )
    let grid_num = 10;
    let tol = 1E-5;*/
    let mScale = BUILD.mScale;
    let grid_size = BUILD.grid_size;
    let gridH_size = BUILD.gridH_size;
    let buildThick = BUILD.buildThick;
    let slope_ang = BUILD.slope_ang;
    let grid_num = BUILD.grid_num;
    let tol = BUILD.tol;

 
    let camera = new THREE.PerspectiveCamera(80, width / height, mScale*0.01, mScale * 100);
    let mCameraOffset = new Object();
    mCameraOffset.dx = mScale*0.5//  0.5;
    mCameraOffset.dy = mScale*0.6; //1.4
    mCameraOffset.dz = mScale*1.4; //1000*1.6;
    
    function mSetCameraPosition(camera, offset, player){

        if(!player.playerMesh){
            return
        }

        let playerRight = player.playerMesh.getObjectByName("Right");
        let playerPiv0 = player.playerMesh.getObjectByName("Piv0");
        let playerPiv1 = player.playerMesh.getObjectByName("Piv1");
        let playerPiv2 = player.playerMesh.getObjectByName("Piv2");

        let p = player.playerMesh.position //model.position;
        let dx = offset.dx; // 1000*0.1;
        let dy = offset.dy; //1000*1.4;
        let dz = offset.dz; //1000*1.6;
        if(c_player.isCrouch || c_player.isSliding){
            dy *= 0.5
        }
       
        if(playerRight){
            //let dir = new THREE.Vector3();
            //playerRight.getWorldDirection(dir)
            //console.log("dir:", dir);
            let {hit, ray} = mPlayerRayHit(world, playerRight);
            if (hit != null) {
                //console.log("hit.timeOfImpact:", hit.timeOfImpact);
                if(hit.timeOfImpact < offset.dx - playerRadius){
                    //console.log("hit.timeOfImpact:", hit.timeOfImpact);
                    dx = hit.timeOfImpact + playerRadius;
                }
            }
        }
        playerPiv1.position.x = -dx;

        if(playerPiv1){
            let sign = -1;
            if(props.frontView){
                sign = 1;
            }
            let {hit, ray} = mPlayerRayHit(world, playerPiv1, sign);
            if (hit != null) {
                //console.log("hit.timeOfImpact:", hit.timeOfImpact);
                if(hit.timeOfImpact < offset.dz){
                    dz = hit.timeOfImpact;
                }
            }
        }

        if(playerPiv2){
            playerPiv2.position.z = -dz + 0.001;
            let cp = playerPiv2.getWorldPosition(new THREE.Vector3());
            //console.log("cp:", cp);
            camera.position.set(cp.x, cp.y, cp.z);
            camera.rotation.order = "YXZ";
            camera.rotation.y =  player.angle + Math.PI;
            camera.rotation.x = player.angle2;
            //console.log("camera.rotation.y:", camera.rotation.y);

            if(props.frontView){
                playerPiv1.position.y = dy/2
                playerPiv2.position.z = dz*1.0
                let cp = playerPiv2.getWorldPosition(new THREE.Vector3());
                //console.log("cp:", cp);
                camera.position.set(cp.x, cp.y, cp.z);
                camera.rotation.order = "YXZ";
                camera.rotation.y =  player.angle;
                camera.rotation.x = player.angle2;
            }
        }
        //console.log("camera.position:", camera.position);

        //playerPiv1.position.y = dy;
        playerPiv0.position.y = dy;
        
    }

    //--- Light ---//
    let light_pos0 = new THREE.Vector3();
    light_pos0.x = 0;
    light_pos0.y = gridH_size* grid_num;
    light_pos0.z = grid_size*3;
    const light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(light_pos0.x, light_pos0.y, light_pos0.z);
    light.intensity = 1; 
    light.castShadow = true; //false; //
    console.log("light.shadow.camera:%o", light.shadow.camera);
    let s_ = grid_size * grid_num *0.3;
    light.shadow.camera.top *= s_;
    light.shadow.camera.bottom *= s_;
    light.shadow.camera.left *= s_;
    light.shadow.camera.right *= s_;
    light.shadow.mapSize.width = 1024 * 8
    light.shadow.mapSize.height = 1024 * 8
    //light.shadow.camera.near = gridH_size*grid_num
    light.shadow.camera.far = gridH_size*grid_num*1.3;
    light.shadow.bias = -0.005;  //-0.0005;
    scene.add(light);
    //const light = new THREE.SpotLight(0xffffff, 400, 100, Math.PI / 4, 1);
    //light.castShadow = true;
    //scene.add(light);

    const light2 = new THREE.DirectionalLight(0xFFFFFF);
    light2.position.set(grid_size*3, gridH_size* grid_num, -grid_size*3);
    //light2.intensity = 2; 
    light2.intensity = 1; 
    scene.add(light2);

    /*const light3 = new THREE.DirectionalLight(0xFFFFFF);
    light2.position.set(grid_size*3, gridH_size* grid_num, 0);
    light2.intensity = 0.1; 
    scene.add(light2);*/

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0) //0.5
    scene.add(ambientLight);


    //--- Environment ---//
    //new THREE.RGBELoader()
    new RGBELoader()
        .setPath( 'image/' )
        .load( 'quarry_01_1k.hdr', function ( texture ) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
        } );
     

    //--- Global Axis ---//
    const size = grid_size*0.1;
    let gAxes = new THREE.AxesHelper(size);
    gAxes.position.x =  0;
    gAxes.position.y = mScale*0.1; 
    scene.add(gAxes);
    
    //--- Grid ---//
    const grid = new THREE.GridHelper( grid_size*grid_num*2, grid_num*2, "white", "white" );
    grid.material.opacity = 0.5;
    grid.material.transparent = true;
    scene.add( grid );

    //--- ground
    const mesh = new THREE.Mesh( new THREE.PlaneGeometry( grid_size*grid_num*2, grid_size*grid_num*2 ), new THREE.MeshPhongMaterial( { color: '#1010ff' } ) );//, depthWrite: false #'#010190'
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add( mesh );
        const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.5, 0))
        const floorShape = RAPIER.ColliderDesc.cuboid(grid_size*grid_num, 0.5, grid_size*grid_num)
        world.createCollider(floorShape, floorBody)

    
    let ArrayMesh = [];
    let ArrayBody = [];
    let mMaterial = new THREE.MeshLambertMaterial({color: 0x6699FF});
    mMaterial.transparent = true;
    mMaterial.opacity = 1.0;

    
    let ArrayBuild = {}; //[]; // should use object?
    let build_id = 0;

    function mAddBuild(col, mesh, body, edgePoints=null, player_id = -1){

        let position = new Object();
            position.x = body.translation().x;
            position.y = body.translation().y;
            position.z = body.translation().z;

        let b = new Object();
        b.build_id = build_id;
        b.position = position;
        b.buildType = mesh.buildType;
        b.dirType = mesh.dirType;
        b.editType = 0;
        b.doorDir = 1;
        b.buildMesh = mesh; // Group ?
        b.body = body;
        //b.collider = col; // Array ?
        b.collider = [];
            b.collider.push(col);
        b.maxHealth = 150;
        b.health = 150;
        b.edgePoints = edgePoints;
        b.player_id = player_id;
        //ArrayBuild[col.handle] = b;
        b.wallEditGridSelected = new Array(9).fill(false);
        b.floorEditGridSelected = new Array(4).fill(false);
        b.slopeEditGridSelected = new Array(8).fill(true);
        b.slopeGridSelectOrder = [];
        b.coneEditGridSelected = new Array(4).fill(false);
        b.lastEditGridSelected = [];
        ArrayBuild[build_id] = b;
        build_id += 1; 
    }


    function mCreateWall(px, py, pz, type="z", player_id = -1){
        let Lx = grid_size;
        let Ly = gridH_size;
        let Lz = buildThick;
        if(type == "x"){
            Lz = grid_size;
            Lx = buildThick;
        }
    
        let wallMesh = BUILD.mCreateWallMesh(Lx, Ly, Lz, type);
        scene.add(wallMesh)

        //let {wallBody, col} = mCreateWallBodyCollider(world, px, py, pz, type);
        let {wallBody, col} = BUILD.mCreateWallBodyCollider(world, px, py, pz, type);
        col.build_id = build_id;
            //console.log("col:%o", col);
        ArrayMesh.push(wallMesh);
        ArrayBody.push(wallBody);
        
        mAddBuild(col, wallMesh, wallBody, BUILD.mCreateWallEdgePoints(px, py, pz, type), player_id)
        //build_id += 1; 
    }

    world.timestep = 0.0
    world.step()
    

    function mCreateSlope(px, py, pz, type="z-", player_id = -1){
        console.log("mCreateSlope:"+type)
        let L = Math.sqrt(grid_size*grid_size+gridH_size*gridH_size)
            //console.log("L:"+L)
        let Lx = grid_size
        let Ly = buildThick
        let Lz = L
        if( type==="x+" || type==="x-" ){
            Lz = grid_size
            Lx = L
        }
        //console.log("L:"+Lx+", "+Ly+", "+Lz)

        let slopeMesh = BUILD.mCreateSlopeMesh(Lx, Ly, Lz, type);
        scene.add(slopeMesh)

        //let {slopeBody, col} = mCreateSlopeBodyCollider(world, px, py, pz, type);
        let {slopeBody, col} = BUILD.mCreateSlopeBodyCollider(world, px, py, pz, type);
        col.build_id = build_id;

        ArrayMesh.push(slopeMesh);
        ArrayBody.push(slopeBody);

        //console.log("slopeCollider.handle:", slopeCollider.handle)

        mAddBuild(col, slopeMesh, slopeBody, BUILD.mCreateSlopeEdgePoints(px, py, pz, type), player_id)
        //build_id += 1; 
    }


    function mCreateFloor(px, py, pz, player_id = -1){    
        
        let floorMesh = BUILD.mCreateFloorMesh();
        scene.add(floorMesh)

        //let {floorBody, col} = mCreateFloorBodyCollider(world, px, py, pz);
        let {floorBody, col} = BUILD.mCreateFloorBodyCollider(world, px, py, pz);
        col.build_id = build_id;

        ArrayMesh.push(floorMesh);
        ArrayBody.push(floorBody);

        mAddBuild(col, floorMesh, floorBody, BUILD.mCreateFloorEdgePoints(px, py, pz), player_id)
        //build_id += 1; 
    }

    
    function mCreateCone(px, py, pz, player_id = -1){    
        
        let geometry = BUILD.mCreateConeGeometry();
        //console.log("geometry:", geometry.attributes);
        //let vertices = geometry.attributes.position.array;
        //let indices = geometry.attributes.index.array;
        
        let coneMesh = BUILD.mCreateConeMesh(geometry);
        scene.add(coneMesh)

        //let {coneBody, col} = mCreateConeBodyCollider(world, px, py, pz);
        let {coneBody, col} = BUILD.mCreateConeBodyCollider(world, px, py, pz);
        col.build_id = build_id;

        ArrayMesh.push(coneMesh);
        ArrayBody.push(coneBody);

        mAddBuild(col, coneMesh, coneBody, BUILD.mCreateConeEdgePoints(px, py, pz), player_id)
        //build_id += 1; 
    }


    mCreateWall(-grid_size*2+grid_size/2, gridH_size/2, -grid_size*2)
    mCreateWall(-grid_size*3+grid_size/2, gridH_size/2, -grid_size*2)
    for(var i=0; i<grid_num; i++){
        mCreateWall(grid_size*(-i), gridH_size/2, grid_size*1+grid_size/2, "x")
    }
    for(var i=-grid_num; i<grid_num; i++){
        mCreateWall(grid_size*i+grid_size/2, gridH_size/2, -grid_size*grid_num)
    }
    
    mCreateSlope(-grid_size*5+grid_size/2, gridH_size/2, -grid_size*1+grid_size/2, "z+")

    mCreateSlope(-grid_size*4+grid_size/2, gridH_size/2, -grid_size*2+grid_size/2)
    mCreateSlope(-grid_size*4+grid_size/2, gridH_size*1+gridH_size/2, -grid_size*3+grid_size/2)
    mCreateSlope(-grid_size*4+grid_size/2, gridH_size*2+gridH_size/2, -grid_size*4+grid_size/2)

    mCreateSlope(-grid_size*4+grid_size/2, gridH_size*0+gridH_size/2, grid_size*3+grid_size/2, "x+")
    mCreateFloor(-grid_size*3+grid_size/2, gridH_size*1, grid_size*3+grid_size/2)
    mCreateFloor(-grid_size*3+grid_size/2, gridH_size*1, grid_size*4+grid_size/2)
    mCreateSlope(-grid_size*4+grid_size/2, gridH_size*1+gridH_size/2, grid_size*4+grid_size/2, "x-")
    mCreateFloor(-grid_size*5+grid_size/2, gridH_size*2, grid_size*3+grid_size/2)
    mCreateFloor(-grid_size*5+grid_size/2, gridH_size*2, grid_size*4+grid_size/2)
    
    mCreateSlope(-grid_size*4+grid_size/2, gridH_size*2+gridH_size/2, grid_size*3+grid_size/2, "x+")
    mCreateFloor(-grid_size*3+grid_size/2, gridH_size*3, grid_size*3+grid_size/2)
    mCreateFloor(-grid_size*3+grid_size/2, gridH_size*3, grid_size*4+grid_size/2)
    mCreateSlope(-grid_size*4+grid_size/2, gridH_size*3+gridH_size/2, grid_size*4+grid_size/2, "x-")
    mCreateFloor(-grid_size*5+grid_size/2, gridH_size*4, grid_size*3+grid_size/2)
    mCreateFloor(-grid_size*5+grid_size/2, gridH_size*4, grid_size*4+grid_size/2)

    mCreateFloor(-grid_size*4+grid_size/2, gridH_size*3, -grid_size*5+grid_size/2)
    mCreateFloor(-grid_size*3+grid_size/2, gridH_size, -grid_size*3+grid_size/2)

    mCreateCone(grid_size*1+grid_size/2, gridH_size/2, grid_size/2);
    mCreateCone(grid_size*2+grid_size/2, gridH_size/2, grid_size/2);
    mCreateCone(grid_size*3+grid_size/2, gridH_size/2, grid_size/2);
    mCreateCone(grid_size*4+grid_size/2, gridH_size/2, grid_size/2);
    mCreateCone(grid_size*5+grid_size/2, gridH_size/2, grid_size/2);

    console.log("Terrain build END")


    let playerRadius = 0.3 * mScale; //0.35 * mScale;
    let myPlayerId = 1;

    //--- My player
    let myPlayerMesh = new THREE.Group();
    scene.add( myPlayerMesh );

        function mSetPivot(pMesh, myPlayer=true){
            let playerRight = new THREE.Group();
            let playerPiv0 = new THREE.Group();
            let playerPiv1 = new THREE.Group();
            let playerPiv2 = new THREE.Group();
        
            playerRight.name = "Right"
            playerPiv0.name = "Piv0"
            playerPiv1.name = "Piv1"
            playerPiv2.name = "Piv2"

            playerRight.position.set(-playerRadius-tol, 0, 0);
            playerRight.rotation.y = -Math.PI/2;
            pMesh.add(playerRight);
            
            //playerPiv1.position.set(-mCameraOffset.dx, mCameraOffset.dy, 0);
            //pMesh.add(playerPiv1);

            playerPiv0.position.set( 0, mCameraOffset.dy, 0);
            pMesh.add(playerPiv0);

            playerPiv1.position.set(-mCameraOffset.dx, 0, 0);
            playerPiv0.add(playerPiv1);
            
            let ax = new THREE.AxesHelper(mScale*0.2);
            ax.visible = false;
            playerPiv1.add(ax);

            playerPiv2.position.set(0, 0, -mCameraOffset.dz);
            playerPiv1.add(playerPiv2);
        }

        mSetPivot(myPlayerMesh)

        //--- Collider, mesh for collider        
        let playerCapsuleH = playerRadius*3.3; //playerRadius*3;
        let playerCapsuleSquatH = playerRadius*2.0;
        let dy_squat = -(playerCapsuleH-playerCapsuleSquatH)/2
        

        function mSetPlayerCollider(player){
            let pos = player.initPosition;

            let ArrayPlayerCollider = [];
            let playerColliderMesh = new THREE.Group();
            const playerColliderStandMesh = new THREE.Mesh(new THREE.CapsuleGeometry(playerRadius, playerCapsuleH), new THREE.MeshBasicMaterial({color: "cyan", wireframe: true}))
            playerColliderStandMesh.name = "stand";
            playerColliderMesh.add(playerColliderStandMesh);
            const playerColliderSquatMesh = new THREE.Mesh(new THREE.CapsuleGeometry(playerRadius, playerCapsuleSquatH), new THREE.MeshBasicMaterial({color: 'red', wireframe: true}))
            playerColliderSquatMesh.name = "squat";
            playerColliderSquatMesh.position.set(0, dy_squat, 0); //-playerRadius*0.75
            playerColliderSquatMesh.visible = false
            playerColliderMesh.add(playerColliderSquatMesh)
            playerColliderMesh.visible = false;

            scene.add(playerColliderMesh)
            ArrayMesh.push(playerColliderMesh);

            //const playerBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, playerRadius*5, 0).lockRotations())
            const playerBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(pos.x, pos.y, pos.z).lockRotations())
            const playerStandShape = RAPIER.ColliderDesc.capsule(playerCapsuleH/2, playerRadius).setMass(1).setRestitution(0.0).setFriction(0.0)  //2.0
            playerStandShape.setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS)
            let playerStandCollider = world.createCollider(playerStandShape, playerBody);
            playerStandCollider.player_id = player.player_id;
            //playerStandCollider.setEnabled(false);
            ArrayPlayerCollider.push(playerStandCollider);
            console.log("playerStandCollider.handle:", playerStandCollider)

            const playerSquatShape = RAPIER.ColliderDesc.capsule(playerCapsuleSquatH/2, playerRadius).setMass(1.0).setTranslation(0.0, dy_squat, 0.0).setRestitution(0.0).setFriction(0.0) //2.0
            playerSquatShape.setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS)
            let playerSquatCollider = world.createCollider(playerSquatShape, playerBody);
            playerSquatCollider.player_id = player.player_id;
            playerSquatCollider.setEnabled(false);
            ArrayPlayerCollider.push(playerSquatCollider);

            ArrayBody.push(playerBody);
            //playerBody.setLinearDamping(1.0);

            player.playerCollider = ArrayPlayerCollider;
            player.playerBody = playerBody;
            player.playerColliderMesh = playerColliderMesh;
        }

        //--- Object
        let c_player = new Object();
        c_player.player_id = myPlayerId; //1;
        c_player.playerMesh = myPlayerMesh;

        
        function mInitPlayer(player){
            player.model = null;
            player.angle_offset_init = 0; //Math.PI;
            player.angle_offset = c_player.angle_offset_init;
            player.angle = 0; //Math.PI;
            player.angle2 = 0;
            player.height = playerRadius * 5;
            player.isMoving = false;
            player.moveStartTime = -1;
            player.isGrounded = false;
            player.isJump = false;
            player.lastJumpTime = -1;
            player.lastGroundedTime = -1;
            player.isCrouch = false;
            player.slidingPressedTime = -1;
            player.isSliding = false;
            player.weapon = 0;
            player.weaponChange = false;
            player.weaponChangedTime = -1;
            player.weaponIsReady = true;
            player.nowSwing = false;
            player.isAiming = false;
            player.isFiring = false;
            player.lastFiringTime = -1;
            player.firingMesh = null;
            player.recoilAng = 0;
            player.mode = 1; // 1:shoot, 2:build, 3:edit
            player.buildType = 0;
            player.buildTemp = null;
            player.zWallTemp = null;
            player.xWallTemp = null;
            player.FloorTemp = null;
            player.zSlopeTemp = null;
            player.xSlopeTemp = null;
            player.ConeTemp = null;
            player.frontView = false;
            player.edit_build_id = -1;
            player.zWallGrid = null;
            player.xWallGrid = null;
            player.FloorGrid = null;
            player.SlopeGrid = null;
            player.slopeGridSelectOrder = [];
            player.ConeGrid = null;
            player.editCollider = new Object();
            player.editSelectMode = false;
            player.nowEdit = false;
            player.displayDamage = 0;
            player.receivedDamage = false;
            player.health = 100; //maxHealth;
            player.shield = 100; //maxShield;
            player.ammoInMagagine = [0, 5, 30];
            player.nowReloading = false;
            player.reloadStartTime = -1;
            player.isEmote = false;
            player.emoteStartAngle = 0;
            player.emoteIndex = 0;

            player.vrm = null;
        }

        mInitPlayer(c_player);
        c_player.initPosition = new THREE.Vector3(5,5,-5);
        
        mSetPlayerCollider(c_player)

        //--- VRM model
        async function mSetVRM(player, characterType=0){
            let {vrm, arrayActionVRM, mixerVRM} = await VROID.mCreateVRM(characterType);
            let modelVRM = vrm.scene;
            modelVRM.position.set(0, -playerRadius*2.5, 0);
            player.playerMesh.add(modelVRM);  
            
            player.vrm = vrm;
            player.model = modelVRM;
            player.angle_offset_init = -Math.PI;
            player.arrayAction = arrayActionVRM;
            player.mixerVRM = mixerVRM;
            modelVRM.visible = true;
        }

        await mSetVRM(c_player)


    //--- Bot player
    let botMesh = new THREE.Group();
    scene.add( botMesh );

        mSetPivot(botMesh, false)

        let bot_player = new Object();
        bot_player.player_id = 2;
        bot_player.playerMesh = botMesh;
        
        mInitPlayer(bot_player);
        bot_player.initPosition = new THREE.Vector3(2.5, 5, 2.5);
        mSetPlayerCollider(bot_player)

        await mSetVRM(bot_player, 1)

        bot_player.weapon = 2;
       


    //let array_player = [];
    //array_player.push(c_player);
    //array_player.push(bot_player);
    let array_player = {};
    array_player[c_player.player_id] = c_player;
    array_player[bot_player.player_id] = bot_player;


    let characterController = world.createCharacterController(0.2); // does not work
    //characterController.enableSnapToGround(2);


    function mPlayerIsNotGrounded(player){
        //console.log("mPlayerIsNotGrounded")
        if(player.playerBody && player.playerCollider){
            //player.playerBody.setGravityScale(1/g_scale, true);
            player.playerCollider[0].setFriction(0.0)
        }

        if(player.player_id == myPlayerId){
            camera.zoom = 1; 
            camera.updateProjectionMatrix();
        }
        
    }

    function mPlayerIsGrounded(player){
        //console.log("mPlayerIsGrounded")    
        if(player.playerBody && player.playerCollider){
            //player.playerBody.setGravityScale(1.0, true);
            //player.playerCollider[0].setFriction(1.0) //2.0
            let v = player.playerBody.linvel();
            let vp_mag = Math.sqrt(v.x*v.x + v.z*v.z);
            //console.log("vp_mag:", vp_mag)
            if( vp_mag < 0.1 ){
                player.playerCollider[0].setFriction(2.0)
                player.playerCollider[1].setFriction(2.0)
            }else{
                player.playerCollider[0].setFriction(0.0)
                player.playerCollider[1].setFriction(0.0)
            }
        }
    }

    //--- Key event ---//
    var keyEnabledArray = Array(222).fill(true);
    let movement = {'forward': false, 'back': false, 'left': false, 'right': false};
    //let lastJumpTime = -1; //performance.now();

    $(document).on( 'keydown keyup', (event) => {  

        //console.log("key:"+ event.key)
        
        if(event.key === 'p'  && event.type === 'keydown'){
            if(document.pointerLockElement==null){ //(!mPointLock){
                //ElementRequestPointerLock(canvas2d);
                mEnablePointerLock(canvas2d);
            }
            else{
                DocumentExitPointerLock(document);
            }
        }
        
    
        const KeyToCommand = {
            'W': 'forward',
            'S': 'back',
            'A': 'left',
            'D': 'right',
        };
        const command = KeyToCommand[event.key.toUpperCase()];
        //console.log('command:'+ command +', '+ event.type)
        if(command){
            //console.log('command:'+ command +', '+ event.type)
            if(event.type === 'keydown'){
                movement[command] = true;
            }else{ /* keyup */
                movement[command] = false;    
            }
            //console.log('movement:%o', movement)
            let m = movement.forward + movement.back + movement.left + movement.right;
            //console.log('m:', m)
            
            if( m > 0){
                if(!c_player.isMoving){
                    c_player.moveStartTime = new Date().getTime();
                }
                c_player.isMoving = true;
            }else{
                c_player.isMoving = false;
            }
            
            
        }

        if(event.key === ' '  && event.type === 'keydown'){
            //console.log('space');
            
            if(c_player && c_player.isGrounded ){
                c_player.isJump = true;
            }
            
        }

        if( (event.key === 'Shift' || event.key === 'Control')  && event.type === 'keydown'){
            if(c_player.slidingPressedTime < 0 && movement.forward){
                c_player.slidingPressedTime = new Date().getTime();
                c_player.isSliding = false;
            }
            //c_player.isSliding = false;
            //console.log('c_player.slidingPressedTime:'+c_player.slidingPressedTime);
        }
        if( (event.key === 'Shift' || event.key === 'Control')  && event.type === 'keyup'){
            //console.log('Shift');
            c_player.slidingPressedTime = -1;
            //console.log('c_player.isSliding:'+c_player.isSliding);
            if( !c_player.isSliding ){
                if(c_player && c_player.isGrounded ){
                    if(c_player.isCrouch){
                        c_player.isCrouch = false;
                        //mSetPlayerColliderCrouch(false)
                        mSetPlayerColliderCrouch(c_player)
                    }else{
                        c_player.isCrouch = true;
                        //mSetPlayerColliderCrouch(true)
                        mSetPlayerColliderCrouch(c_player)
                    }
                    //console.log('c_player.isCrouch:', c_player.isCrouch);
                }
            }else{
                c_player.isSliding = false;
                //mSetPlayerColliderCrouch(false)
                c_player.isCrouch = false
                mSetPlayerColliderCrouch(c_player)
            }
            //console.log('playerSquatCollider:', playerSquatCollider);
            
        }


        if(keyEnabledArray[event.keyCode])
        {
    
            if(event.key.toUpperCase() === 'F'  && event.type === 'keydown'){
                if(c_player){
                    mWeaponMode(0)
                }
            }
        
            if(event.key === '1'  && event.type === 'keydown'){
                if(c_player){
                    mWeaponMode(1)
                }
            }

            if(event.key === '2'  && event.type === 'keydown'){
                if(c_player){
                    mWeaponMode(2)
                }
            }

            if(event.key.toUpperCase() === 'Q'  && event.type === 'keydown'){
                mBuildModeWall()
            }

            if(event.key.toUpperCase() === 'Z'  && event.type === 'keydown'){
                mBuildModeFloor()
            }

            if(event.key.toUpperCase() === 'C'  && event.type === 'keydown'){
                mBuildModeSlope()
            }

            if(event.key.toUpperCase() === 'TAB'  && event.type === 'keydown'){
                mBuildModeCone()
            }

            if(event.key.toUpperCase() === 'E'  && event.type === 'keydown'){
                mEditMode()
            }

            if(event.key.toUpperCase() === 'B'  && event.type === 'keydown'){
                //if(!c_player.isEmote){
                    canvasEmote.style.visibility ="visible";
                    DocumentExitPointerLock(document);
                //}
            }

            

            if(event.key.toUpperCase() === 'R'  && event.type === 'keydown'){
                if(c_player.ammoInMagagine[c_player.weapon] < mWeaponMagagineSize[c_player.weapon]){
                    if(!c_player.nowReloading){
                        c_player.nowReloading = true;
                        c_player.reloadStartTime = new Date().getTime();
                        if(c_player.weapon==2){
                            mPlayAudioBuffer(mArrayAudio[15])
                        }
                    }
                    
                }else{
                    console.log("No need to reload.")
                }
                
            }

        } //if(keyEnabledArray[event.keyCode])

        if(keyEnabledArray[event.keyCode] && event.type === 'keydown') {
            keyEnabledArray[event.keyCode] = false;
            //console.log('keydown:'+event.keyCode+","+keyEnabledArray[event.keyCode])
        }
    
        if( event.type === 'keyup') {
            keyEnabledArray[event.keyCode] = true;
            //console.log('keyup:'+event.keyCode+","+keyEnabledArray[event.keyCode])
        }


        if(event.key.toUpperCase() === 'B'  && event.type === 'keyup'){
            //if(c_player.isEmote){

            //}else{
                console.log("canvasEmote: hidden");
                //canvasEmote.style.visibility ="hidden";
                //c_player.isEmote = true;
                //c_player.emoteStartAngle = c_player.angle;
                mStartEmote()
            //}
        }
    
    });

    function mStartEmote(){
        if(canvasEmote.style.visibility=="visible"){
            canvasEmote.style.visibility ="hidden";
            if(!c_player.isEmote){
                c_player.mode = 4;
                c_player.isEmote = true;
                c_player.emoteStartAngle = c_player.angle;
            }

            if(c_player.emoteIndex != mEmoteIndex && mEmoteIndex <= 1){
                c_player.emoteIndex = mEmoteIndex;
                //mDrawCanvasEmote()
            }
            mEnablePointerLock(canvas2d);
        }
    }

    function mQuitEmote(){
        if(c_player.isEmote){
            c_player.isEmote = false;
            c_player.playerMesh.rotation.y = c_player.angle
            c_player.playerMesh.getObjectByName("Piv0").rotation.y = 0; 
        }
    }

    //function mSetPlayerColliderCrouch(isCrouch){
        //console.log("mSetPlayerColliderCrouch:", isCrouch)
    function mSetPlayerColliderCrouch(player){        
        console.log("mSetPlayerColliderCrouch:", player.isCrouch)
        let isCrouch = player.isCrouch;
        if(player.isSliding){
            isCrouch = true;
        }
        /*playerStandCollider.setEnabled(!isCrouch)
        playerSquatCollider.setEnabled(isCrouch)
        playerColliderStandMesh.visible = !isCrouch
        playerColliderSquatMesh.visible = isCrouch*/
        //console.log("playerCollider.isEnabled:", playerCollider.isEnabled() )
        //console.log("playerSquatCollider.isEnabled:", playerSquatCollider.isEnabled() )
        player.playerCollider[0].setEnabled(!isCrouch)
        player.playerCollider[1].setEnabled(isCrouch)
        player.playerColliderMesh.getObjectByName("stand").visible = !isCrouch
        player.playerColliderMesh.getObjectByName("squat").visible = isCrouch
    }


    function mCanselReload(){
        c_player.nowReloading = false;
        mDisplayAmmo(false, true);
    }

    function mWeaponMode(weapon){
        mQuitEmote();
        if(c_player.mode == 3){
            mFinishEditMode();
        }
        c_player.mode = 1;
        if(c_player.weapon != weapon){ //weapon change
            c_player.weaponChange = true;
            c_player.weaponChangedTime = new Date().getTime();
            c_player.weaponIsReady = false;
            c_player.lastFiringTime = -1;
             mCanselReload()

            if(weapon==0){
                mPlayAudioBuffer(mArrayAudio[5])
            }else if(weapon==1){
                mPlayAudioBuffer(mArrayAudio[11])
            }else if(weapon==2){
                mPlayAudioBuffer(mArrayAudio[11])
            }

            c_player.weapon = weapon;
            mDisplayAmmo()
        }
        c_player.weapon = weapon;
        if(c_player.buildTemp != null){
            c_player.buildTemp.visible = false;
        }
        console.log('c_player.weapon:', c_player.weapon, ", ", c_player.weaponChange);
    }

    function mBuildModeWall(){
        if(c_player){
            mQuitEmote();
            if(c_player.mode == 3){
                mFinishEditMode();
            }
            c_player.mode = 2;
            c_player.buildType = 0;
            c_player.weapon = 0;
            mCanselReload()
            //console.log('c_player.weapon:', c_player.weapon);
        }
    }

    function mBuildModeFloor(){
        if(c_player){
            mQuitEmote();
            if(c_player.mode == 3){
                mFinishEditMode();
            }
            c_player.mode = 2;
            c_player.buildType = 1;
            c_player.weapon = 0;
            mCanselReload()
            //console.log('c_player.weapon:', c_player.weapon);
        }
    }

    function mBuildModeSlope(){
        if(c_player){
            mQuitEmote();
            if(c_player.mode == 3){
                mFinishEditMode();
            }
            c_player.mode = 2;
            c_player.buildType = 2;
            c_player.weapon = 0;
            mCanselReload()
            //console.log('c_player.weapon:', c_player.weapon);
        }
    }
    
    function mBuildModeCone(){
        if(c_player){
            mQuitEmote();
            if(c_player.mode == 3){
                mFinishEditMode();
            }
            c_player.mode = 2;
            c_player.buildType = 3;
            c_player.weapon = 0;
             mCanselReload()
            //console.log('c_player.weapon:', c_player.weapon);
        }
    }

    function mEditMode(){
        mQuitEmote();
        //if( mJudgeEdit(c_player, ArrayBuild, world) && c_player.mode != 3 ){
        if( BUILD.mJudgeEdit(c_player, ArrayBuild, world) && c_player.mode != 3 ){
            c_player.lastMode = c_player.mode;
            c_player.mode = 3;
            mCanselReload()

            mPlayAudioBuffer(mArrayAudio[7])
            if(c_player.edit_build_type == 0){
                //mSetWallEditGrid(c_player, ArrayBuild, world_edit);
                BUILD.mSetWallEditGrid(c_player, ArrayBuild, world_edit);
            }else if(c_player.edit_build_type == 1){
                BUILD.mSetFloorEditGrid(c_player, ArrayBuild, world_edit);
            }else if(c_player.edit_build_type == 2){
                BUILD.mSetSlopeEditGrid(c_player, ArrayBuild, world_edit);
            }else if(c_player.edit_build_type == 3){
                BUILD.mSetConeEditGrid(c_player, ArrayBuild, world_edit);
            }
            
        }else if(c_player.mode == 3){
            mFinishEditMode();
        }
        console.log('c_player.mode:', c_player.mode);
    }

    function mFinishEditMode(){

        BUILD.mApplyEditShape(c_player, ArrayBuild, scene, world)
        c_player.nowEdit = false;
        
        if(c_player.edit_build_type == 0){
            c_player.zWallGrid.visible = false;
            c_player.xWallGrid.visible = false;
        }else if(c_player.edit_build_type == 1){
            c_player.FloorGrid.visible = false;
        }else if(c_player.edit_build_type == 2){
            c_player.SlopeGrid.visible = false;
        }else if(c_player.edit_build_type == 3){
            c_player.ConeGrid.visible = false;
        }
        
        let b = ArrayBuild[c_player.edit_build_id];
        if(b==null){
            return;
        }
        b.buildMesh.visible = true;
        console.log("b.buildMesh:", b.buildMesh);
        mPlayAudioBuffer(mArrayAudio[8])

        if( b.buildType==0 && 
            (b.editType==5 || b.editType==6 || b.editType==7 || b.editType==13 ||b.editType==14)  ){
            mPlayAudioBuffer(mArrayAudio[10]); // open door
        }

        c_player.mode = c_player.lastMode;
        if(c_player.mode == 1 && c_player.weapon==0){
            c_player.weaponChange = true;
            mPlayAudioBuffer(mArrayAudio[5])
        }
    }

    //--- Mouse event ---//
    var mMouseSenseX = 0.00065*1; //0.00065 at 10%
    var mMouseSenseY = 0.00065*1; //
    

    BUILD.mInitBuildTemp(c_player);
    scene.add(c_player.zWallTemp);
    scene.add(c_player.xWallTemp);
    scene.add(c_player.FloorTemp);
    scene.add(c_player.zSlopeTemp);
    scene.add(c_player.xSlopeTemp);
    scene.add(c_player.ConeTemp);

    BUILD.mInitEditGrid(c_player);
    scene.add(c_player.zWallGrid);
    scene.add(c_player.xWallGrid);
    scene.add(c_player.FloorGrid);
    scene.add(c_player.SlopeGrid);
    scene.add(c_player.ConeGrid);

    BUILD.mInitEditCollider(c_player, world_edit);


    canvas2d.addEventListener('mousemove', function(e)
    {
        //console.log("mousemove:");
        
        if(c_player){

            var ang_ = (e.movementX) * mMouseSenseX * Math.PI/2;
            var ang2_ = (e.movementY) * mMouseSenseY * Math.PI/2;
    
            if(camera.zoom > 1 ){
                ang_ *= 0.5;
                ang2_ *= 0.5
            }            

            //console.log("ang_:"+ang_);
            c_player.angle -= ang_;
            c_player.angle2 -= ang2_;
            if(c_player.angle >= Math.PI*2.0){
                c_player.angle -= Math.PI*2.0;
            }
            if(c_player.angle < 0){
                c_player.angle += Math.PI*2.0;
            }
            c_player.angle2 = Math.max(-Math.PI/2, c_player.angle2);
            c_player.angle2 = Math.min( Math.PI/2, c_player.angle2);
            //console.log("c_player.angle:"+c_player.angle/Math.PI*180);
            //console.log("c_player.angle2:"+c_player.angle2/Math.PI*180);
            //c_player.weaponMesh.rotation.x = -c_player.angle2;

            let playerPiv1 = c_player.playerMesh.getObjectByName("Piv1"); 
            playerPiv1.rotation.x = -c_player.angle2;
            if(props.frontView){
                playerPiv1.rotation.x = c_player.angle2;
            }
        }
        
    });

    canvas2d.addEventListener('mousedown', function(e)
    {
        console.log('mousedown:', e.button)

        if(document.pointerLockElement==null){
            //mPlayAudioBuffer(mArrayAudio[1])
            mEnablePointerLock(canvas2d)
        }

        if(c_player){

            if(c_player.mode==1){ //(mMode==1){
                if(e.button==0){
                    if((c_player.weapon!=5) ){ // (c_player.weapon<=3)   //(c_player.weapon<=4)||(c_player.weapon==6)
                        //movement['shoot'] = true;
                        //ws.send("shoot " + 1);
                        c_player.isFiring = true;
                        //c_player.lastFiringTime = -1;
                        //console.log("c_player.isFiring:"+c_player.isFiring);
                        if(c_player.weapon!=0 && c_player.ammoInMagagine[c_player.weapon]<=0){
                            mPlayAudioBuffer(mArrayAudio[14])
                        }
                    }
                    
                }//    
                else if(e.button==2){
                    if(c_player.isGrounded){
                        if(!props.frontView){
                            camera.zoom = 2; //1.001;
                            camera.updateProjectionMatrix();
                            //c_player.model.visible = false;
                            //c_player.weaponMesh.visible = true;
                        }else{
                            camera.zoom = 2; //1.001;
                            camera.updateProjectionMatrix();
                        }
                        c_player.isAiming = true;
                    }
                }                
            }

            if(e.button==0){ 
                //mDoBuild(c_player.buildTemp)
                c_player.nowTouboBuild = true;
            }
           
            if( (e.button==2) ){
                //ws.send('scope '+ 1)
            }

            if( (e.button==4) ){
                mWeaponMode(1)
            }

            if( (e.button==3) ){
                mWeaponMode(2)
            }

            if(c_player.mode == 3){
                if(e.button==0){
                    //mSetEditSelectMode(c_player, ArrayBuild, world_edit)
                    BUILD.mSetEditSelectMode(c_player, ArrayBuild, world_edit)
                    c_player.nowEdit = true;
                }
                else if(e.button==2){
                    BUILD.mResetEdit(c_player, ArrayBuild)
                    mFinishEditMode()
                }
            }

        }//c_player

    });

    canvas2d.addEventListener('mouseup', function(e)
    {
        if(c_player){

            if(e.button==0){
                //movement['shoot'] = false;
                //socket.emit('movement', movement);
                //ws.send("shoot " + 0);
                c_player.isFiring = false;
                //c_player.lastFiringTime = new Date().getTime();
                //console.log("c_player.isFiring:"+c_player.isFiring);
                c_player.nowTouboBuild = false;
            }//

            if(e.button==2){
                camera.zoom = 1;
                camera.updateProjectionMatrix();
                //socket.emit('readyShoot', 0);
                //c_player.model.visible = true;
                //c_player.weaponMesh.visible = false;
                c_player.isAiming = false;
            }

            if(c_player.mode == 3){
                if(e.button==0){
                    c_player.nowEdit = false;
                    mFinishEditMode();
                }
            }

        }//
    });

    canvas2d.addEventListener('mousewheel', function(e)
    {
        var v_ = e.wheelDelta;
        if(v_<0){ // down(win)    up(mac)
            //console.log('wheel down:');  
            mBuildModeFloor()
        }else if(v_>0){ //up(win)  down(mac)
            mBuildModeSlope()
        }
        //console.log('wheel:'+v_);  
    });

    let mEmoteIndex = 0;
    canvasEmote.addEventListener('mousemove', function(e)
    {
        var rect = e.target.getBoundingClientRect()
        //console.log('x,y:' + [e.clientX, e.clientY] );  
        var W_ = rect.width
        var H_ = rect.height
        //console.log('W_, H_:' + [W_, H_] );  
        var p0x = W_/2
        var p0y = H_/2
        var p1x = e.clientX
        var p1y = e.clientY
        //console.log('p1x, p1y:' + [p1x, p1y] );

        var px = p1x - p0x
        var py = p1y - p0y
        var r = Math.sqrt( px*px + py*py )
        if( r < H_/8 || r > H_/2 * 0.8){
            return;
        }

        let ang = Math.atan2(py, px);
        if(ang < 0){
            ang += Math.PI * 2;
        }
        console.log('ang:', ang/Math.PI*180);

        let n = 8;
        let emoteIndex = Math.floor( (ang + Math.PI*2 /n /2) / (Math.PI*2 /n) );
        emoteIndex = emoteIndex % n;
        console.log('emoteIndex:', emoteIndex);
        //mEmoteIndex = emoteIndex;

        //if(c_player.emoteIndex != emoteIndex){
        //    c_player.emoteIndex = emoteIndex;
        //    mDrawCanvasEmote()
        //}
        if(mEmoteIndex != emoteIndex){
            mEmoteIndex = emoteIndex;
            mDrawCanvasEmote();
        }

    });

    canvasEmote.addEventListener('mousedown', function(e)
    {
        //canvasEmote.style.visibility ="hidden";
        //mEnablePointerLock(canvas2d);
        mStartEmote()
    })



    const gui = new GUI();
    let props = {
        //showAxes: true,
        showCollision: false,
        showShadow: true,
        //rayCast: false,
        //hitSound: false,
        //pointerLock: false,
        frontView: false,
        hitMarker: false,
        botAction: false,
        botSleep: true,
    };
    //gui.add( props, 'showAxes').name('Show axes')
    gui.add( props, 'showCollision').name('Show collision').onChange( value => {
        c_player.playerColliderMesh.visible = value;
        bot_player.playerColliderMesh.visible = value;
    })
    gui.add( props, 'showShadow').name('Show shadow').onChange( value => {
        light.castShadow = value;
        renderer.shadowMap.enabled = value;
    })
    //gui.add( props, 'rayCast').name('Ray cast').onChange( value => {     
    //    })
    //gui.add( props, 'hitSound').name('Hit sound').onChange( value => {    
    //    })
    gui.add( props, 'frontView').name('Front View').onChange( value => {
        c_player.frontView = value;
    })
    gui.add( props, 'hitMarker').name('Hit marker').onChange( value => {    
        if(!value){
            let n = ArrayHitMesh.length;
            for(var i=0; i<n; i++){
                let delMesh = ArrayHitMesh[0];
                scene.remove(delMesh);
                ArrayHitMesh.shift();
            }
        }
    })
    /*gui.add( props, 'botAction').name('Bot Action').onChange( value => {
        
        if(value){
            bot_player.arrayAction[15].stop();
            bot_player.shield = 100;
            bot_player.health = 100;
            bot_player.playerBody.setEnabled(true);
        }
        bot_player.isFiring = value;

    })*/
    gui.add( props, 'botSleep').name('Sleep Bot').onChange( value => {
        
    })

    function mSetBotAction(value){
        if(value){
            bot_player.arrayAction[15].stop();
            bot_player.shield = 100;
            bot_player.health = 100;
            bot_player.playerBody.setEnabled(true);
        }
        bot_player.isFiring = value;
    }

    const clock = new THREE.Clock();
    let delta
    let player_speed = mScale * 5.5; // 5 [/ms]
    let last_game_time = new Date().getTime(); //[ms]
    let current_game_time = new Date().getTime(); //[ms]
    //let playerLastPosition = new THREE.Vector3(0,0,0)
    let playerNewPosition = new THREE.Vector3(0,0,0)
    let playerMoveDirection = new THREE.Vector3(0,0,0)
    let playerPlaneMoveDistance = new THREE.Vector3(0,0,0)
    let t = 0;
    let lastGroundedTime = -1; //performance.now();
    let camera_dir = new THREE.Vector3();
    let eventQueue = new RAPIER.EventQueue(true);
    let ArrayHitMesh = new Array();
    let mHitMaterial = new THREE.MeshBasicMaterial({color: 'orange'})
    let displayDamageTime = -1;
    let mWeaponInterval = [550, 1500, 150,];
    let mWeaponPlayerDamage = [20, 100, 30,];
    let mWeaponBuildDamage = [75, 75, 30,];
    let mWeaponRecoilAng = [0, Math.PI/60, Math.PI/360,];
    let mWeaponRecoilDuration = [1, 300, 100,];
    let mWeaponReadyDuration = [500, 500, 500,];
    let mWeaponMagagineSize = [0, 5, 30,];
    let mWeaponReloadDuration = [0, 1000, 3000,];
    let mWeaponDistance = [2, grid_size*5, grid_size*20,];

    /*const flashTexture = textureLoader.load('/mTPS-game-sample/image/flash2.png');
    let flashMaterial = new THREE.MeshBasicMaterial({map: flashTexture, side:THREE.DoubleSide});
    //flashMaterial.opacity = 0.99;
    flashMaterial.transparent = true;
    flashMaterial.depthWrite = false; // This solved problem of transparancy texture's drawing distance
    let flashMesh = new THREE.Mesh( new THREE.PlaneGeometry( 1300, 764 ), flashMaterial);
    flashMesh.scale.set(0.001, 0.001, 0.001);
    flashMesh.name = "Flash";
    scene.add(flashMesh);*/
  
    let node_vertices = [];
    let colors = [];
    colors.push( 255, 255, 255 );
    colors.push( 255, 255, 255 );

    //mPlayAudioBuffer(mArrayAudio[1])

    tick();
    function tick() {

        if(t%100 == 0){
            //renderer.info.reset()
            //console.log("draw call:", renderer.info.render.calls)
            //renderer.info.autoReset = false;
            //console.log("renderer.info:", renderer.info)
            //renderer.info.reset()
            //console.log("renderer.info:", renderer.info)
        }
        

        stats.begin();

        if (world==null){
            return
        }
        
        //console.log("Loop:")

        delta = clock.getDelta()
        world.timestep = Math.min(delta, 0.01)
        world.step(eventQueue)
        //world.step()
            //console.log("delta:%o", delta)
            //console.log("world:%o", world)
            //console.log("d_world:"+dt_world)

        //playerNewPosition.copy(playerBody.translation())
        playerNewPosition.copy(c_player.playerBody.translation())

        for(var i = 0; i < ArrayMesh.length; i++){
            ArrayMesh[i].position.copy(ArrayBody[i].translation())
            ArrayMesh[i].quaternion.copy(ArrayBody[i].rotation())
        }
        
        c_player.playerMesh.position.copy(c_player.playerBody.translation())
        bot_player.playerMesh.position.copy(bot_player.playerBody.translation())
        //playerMesh.position.copy(playerBody.translation())
        //playerMesh.quaternion.copy(playerBody.rotation())
        //console.log("playerBody.translation:%o", playerBody.translation())
        
        
        //if( t%100 == 0){
            c_player.playerBody.wakeUp();
            bot_player.playerBody.wakeUp();
            c_player.isGrounded = false;
            bot_player.isGrounded = false;
            
            
            eventQueue.drainContactForceEvents(event => {
                //console.log("event:")
                let handle1 = event.collider1(); // Handle of the first collider involved in the event.
                let handle2 = event.collider2(); // Handle of the second collider involved in the event.
                // Handle the contact force event. 
                //console.log("contact:%o, %o", handle1, handle2)
                //console.log("contact:%o", event.totalForce())
                let time_now = new Date().getTime(); //performance.now();
                /*for(var i = 0; i < c_player.playerCollider.length; i++){ //ArrayPlayerCollider.length
                    let h = c_player.playerCollider[i].handle
                    if(handle1==h || handle2==h){
                        //console.log("contact:%o", event.totalForce())
                        if( Math.abs(event.totalForce().y) > 1 && time_now > c_player.lastJumpTime + 100  ){ // 
                            c_player.lastGroundedTime = time_now;
                            c_player.isGrounded = true;
                        }
                    }
                } //i  */

                //for(var j = 0; j < array_player.length; j++){
                    //let player = array_player[j];
                Object.values(array_player).forEach((player) => {
                    for(var i = 0; i < player.playerCollider.length; i++){ 
                        let h = player.playerCollider[i].handle
                        if(handle1==h || handle2==h){
                            //console.log("contact:%o", event.totalForce())
                            if( Math.abs(event.totalForce().y) > 1 && time_now > player.lastJumpTime + 100  ){ // 
                                player.lastGroundedTime = time_now;
                                player.isGrounded = true;
                            }
                        }
                    } //i
                    //if(player.player_id != myPlayerId){
                    //    console.log("contact:%o", event.totalForce())
                    //}
                });
            });
            
            //console.log("c_player.isGrounded:", c_player.isGrounded)
            //console.log("c_player.isOnSlope:", c_player.isOnSlope)
        //}


        //}

        current_game_time = new Date().getTime();
        let dt = current_game_time - last_game_time;
        //console.log("dt:"+dt);
        last_game_time = current_game_time;

        t += 1;
          
        c_player.movement = movement;
        bot_player.movement = [];
        //bot_player.isGrounded = true;
        //bot_player.isFiring = true;

        VROID.mSetPlayerAnimation(c_player, delta)
        VROID.mSetPlayerAnimation(bot_player, delta)

        if(bot_player.health > 0 && props.botSleep == false){
            // bot action
            mSetBotDirection(bot_player, c_player);
            if(bot_player.ammoInMagagine[bot_player.weapon] <= 0 && bot_player.nowReloading==false){
                mPlayAudioBuffer(mArrayAudio[15], 0.2)
                bot_player.nowReloading = true;
                bot_player.reloadStartTime = new Date().getTime();
            }
        }
        //mSetBotDirection(bot_player, c_player);
        //bot_player.isAiming = true;
        

        if (c_player != null){  //if (playerMesh != null){

            //console.log('c_player.isGrounded:', c_player.isGrounded);

            if( c_player.playerBody.translation().y < -gridH_size ){ // init
                c_player.playerBody.setTranslation({ x: 0.0, y: gridH_size, z: 1.0 }, true)
            }
    
            if(current_game_time > c_player.lastGroundedTime + 20 && c_player.playerBody.linvel().y < -1  ){ // Fall
                //console.log("Fall:")
                c_player.isGrounded = false;
                //c_player.isOnSlope = false;
                mPlayerIsNotGrounded(c_player)
            }else{
                //c_player.isGrounded = true;
            }

            if( c_player.isGrounded ){
                mPlayerIsGrounded(c_player)
                //c_player.lastGroundedTime = current_game_time //currentTime
            }

            if(c_player.isJump){
                //console.log('jump');
                c_player.isGrounded = false;
                //c_player.isOnSlope = false;
                c_player.isCrouch = false;
                mPlayerIsNotGrounded(c_player)
                let vx = c_player.playerBody.linvel().x;
                let vy = c_player.playerBody.linvel().y;
                let vz = c_player.playerBody.linvel().z;
                //playerBody.setLinvel({ x: vx, y: 0, z: vz}, true);
                c_player.playerBody.applyImpulse({ x: 0.0, y: mJumpVelocity, z: 0.0 }, true);
                c_player.lastJumpTime = new Date().getTime(); // performance.now();
                
                c_player.isJump = false;
            }

            if( current_game_time > c_player.slidingPressedTime + 300 && c_player.slidingPressedTime > 0 ){
                if( !c_player.isSliding ){
                    console.log('sliding play');
                    mPlayAudioBuffer(mArrayAudio[3], 1, false);
                }
                c_player.isSliding = true;
                //mSetPlayerColliderCrouch(true)
                mSetPlayerColliderCrouch(c_player)
                //c_player.slidingPressedTime = -1;
            }
            
            let move_num = movement.forward + movement.back + movement.left + movement.right;
                //console.log("move_num:"+move_num);
            let dis = player_speed * dt;
            let spd = player_speed;
            if(move_num == 2){
                dis /= Math.sqrt(2);
                spd /= Math.sqrt(2);
            }else if(move_num==0){
                spd = 0;
            }

            if(c_player.isCrouch){
                spd /= 2;
            }

            if(move_num==1 && !movement.forward){
                spd *= 0.7;
            }

            let m_time = current_game_time - c_player.moveStartTime;
            if( m_time >= 0 &&  
                m_time <= 500){
                spd = spd * m_time / 500;
            }

            
            let a1 = c_player.angle;
            let s = c_player.playerBody.linvel();
            //console.log("playerBody.linvel():%o", playerBody.linvel());
            let move_angle = 0;
            let s_mag = Math.sqrt(s.x*s.x+s.y*s.y+s.z*s.z);
            if(s_mag > 0.1){  //1
                //move_angle = Math.acos(Math.sqrt(s.x*s.x+s.z*s.z) / s_mag );
                move_angle = Math.asin( s.y / s_mag );
                move_angle = Math.max(move_angle, -slope_ang);
                move_angle = Math.min(move_angle, slope_ang);
            }
            //console.log("move_angle:", move_angle/Math.PI*180, ", s.y:", s.y);

            if(s.y < -10){
                c_player.playerBody.setLinvel({ x: s.x, y: -10, z: s.z}, true);
                s = c_player.playerBody.linvel();
            }

            let input_sx = 0;
            let input_sz = 0;
            if(movement.forward){
                input_sz += spd * Math.cos(a1);
                input_sx += spd * Math.sin(a1);
            }
            if(movement.back){
                input_sz += -spd * Math.cos(a1);
                input_sx += -spd * Math.sin(a1);
            }
            if(movement.left){
                input_sx +=  spd * Math.cos(a1);
                input_sz += -spd * Math.sin(a1);
            }
            if(movement.right){
                input_sx += -spd * Math.cos(a1);
                input_sz +=  spd * Math.sin(a1);
            }

            if(c_player.isGrounded){
                //console.log('input');
                c_player.playerBody.setLinvel({ x: input_sx, y: s.y, z: input_sz}, true);
                //console.log('input_sz:', input_sz, ", s.z:", s.z);

                //let ctr_collider = playerStandCollider;
                let ctr_collider = c_player.playerCollider[0];
                if(c_player.isCrouch || c_player.isSliding){
                    //ctr_collider = playerSquatCollider;
                    ctr_collider = c_player.playerCollider[1];
                }
                //let desiredTranslation = new RAPIER.Vector3(input_sx*delta, s.y*delta, input_sz*delta);
                let desiredTranslation = new RAPIER.Vector3(input_sx*delta, 
                                                            Math.sqrt(input_sx*input_sx+input_sz*input_sz)*Math.tan(move_angle) *delta, 
                                                            input_sz*delta);
                let characterController = world.createCharacterController(0.0); //->does not work
                characterController.setMaxSlopeClimbAngle(60 * Math.PI / 180);
                //characterController.enableSnapToGround(0.1); //->does not work
                //characterController.enableAutostep(0.5, 0.2, true); //->does not work
                characterController.computeColliderMovement(
                    ctr_collider,    // The collider we would like to move.
                    desiredTranslation, // The movement we would like to apply if there wasn’t any obstacle.
                );
                // Read the result.
                let correctedMovement = characterController.computedMovement();
                //console.log("correctedMovement:", correctedMovement);
                //console.log("correctedMovement:", correctedMovement.x);
                
                if(delta>0){
                    //console.log("correctedMovement:", correctedMovement);
                    //console.log("correctedVel:", correctedMovement.z/delta);
                    let vx = correctedMovement.x/delta;
                    let vy = correctedMovement.y/delta;
                    let vz = correctedMovement.z/delta;
                    //let vmag = Math.sqrt(vx*vx+vy*vy+vz*vz);
                        //console.log("vmag:", vmag);
                    //let vpmag = Math.sqrt(vx*vx+vz*vz);
                        //console.log("vpmag:", vpmag);
                    //let desiremag = Math.sqrt(input_sx*input_sx+input_sz*input_sz);
                        //console.log("desiremag:", desiremag);
                    //let a = 1.0;
                    //if(desiremag > 4.9){
                        //a = desiremag / vpmag;
                        //console.log("vpmag:", vpmag);
                        //console.log("desiremag:", desiremag);
                        //console.log("a:", a);
                    //}
                    //c_player.playerBody.setLinvel({ x: vx*a, y: vy*a, z: vz*a}, true);
                    c_player.playerBody.setLinvel({ x: vx, y: vy, z: vz}, true); // Input the velocity of correctedMovement
                }

                //if(input_sz==0 && input_sx==0){ //prevent hop on slope climbing
                //    c_player.playerBody.setLinvel({ x: 0, y: 0, z: 0}, true);
                //}

            }else{
                let s2x = s.x + input_sx*delta;
                let s2z = s.z + input_sz*delta;
                let s2_mag = Math.sqrt(s2x*s2x+s2z*s2z);
                let sc = 1.0;
                if(s2_mag > player_speed){
                    sc = player_speed / s2_mag;
                    s2x *= sc;
                    s2z *= sc;
                }
                c_player.playerBody.setLinvel({ x: s2x, y: s.y, z: s2z}, true);
            }


            c_player.angle_offset = c_player.angle_offset_init;
            if(c_player.model){
                //c_player.model.rotation.y = 0;
                c_player.model.rotation.y = c_player.angle_offset_init;
            }
            
            if( !c_player.isAiming && !c_player.isFiring ){
                if(movement.forward && movement.right){
                    c_player.model.rotation.y +=  -Math.PI/4;
                }else if(movement.forward && movement.left){
                    c_player.model.rotation.y +=  Math.PI/4;
                }else if(movement.back && movement.right){
                    c_player.model.rotation.y +=  Math.PI/4;
                }else if(movement.back && movement.left){
                    c_player.model.rotation.y +=  -Math.PI/4;
                }
            }
            //console.log("c_player.model.rotation.y:"+ c_player.model.rotation.y/Math.PI*180)

            //playerMesh.rotation.y = c_player.angle - c_player.angle_offset;
            if(!c_player.isEmote){
                c_player.playerMesh.rotation.y = c_player.angle
            }else{
                c_player.playerMesh.getObjectByName("Piv0").rotation.y = c_player.angle - c_player.emoteStartAngle; 
            }
            

            let playerPiv1 = c_player.playerMesh.getObjectByName("Piv1"); 

            //--- Axe ---//
            if( c_player.mode == 1 && c_player.weapon != 0 ){
                c_player.nowSwing = false;
            }
            if( c_player.mode == 1 && c_player.weaponIsReady &&
                c_player.weapon == 0 && c_player.isFiring && current_game_time > c_player.lastFiringTime + 550){
                mPlayAudioBuffer(mArrayAudio[5])
                c_player.lastFiringTime = new Date().getTime();
                c_player.nowSwing = true;
            }

            if( c_player.mode == 1 && c_player.weapon == 0 && c_player.nowSwing && current_game_time > c_player.lastFiringTime + 100){
                c_player.nowSwing = false;

                let {hit, ray} = mPlayerRayHit(world, playerPiv1);
                let hitPoint;
                if (hit != null) {
                    hitPoint = ray.pointAt(hit.timeOfImpact); // Same as: `ray.origin + ray.dir * toi`
                    //console.log("Collider", hit.collider, "hit at point", hitPoint);
                    console.log("hit.timeOfImpact:", hit.timeOfImpact);
                    if(hit.timeOfImpact >= 0  && hit.timeOfImpact <= 2 ){  //mCameraOffset.dz
                        mCreateHitMarker(hitPoint, c_player.weapon);
                        mPlayAudioBuffer(mArrayAudio[6]);
                        //node_vertices.push(hitPoint.x, hitPoint.y, hitPoint.z);
                        mHitDamage(hit, c_player);
                    }else{

                    }

                }

            }

            
            //for(var i=0; i<array_player.length; i++){
            Object.values(array_player).forEach((player) => {

                if(player.health<=0){
                    return;
                }
                //console.log("player.player_id:", player.player_id);
                
                let vol = 1;
                if(player.player_id != myPlayerId){
                    vol = 0.2;
                }

                //let player = array_player[i];
                let playerPiv1 = player.playerMesh.getObjectByName("Piv1"); 
                let muzzlePos = player.playerMesh.getObjectByName("MuzzlePos")
                //console.log("muzzlePos:", muzzlePos, ", ", i);
                if(muzzlePos==null){
                    //continue;
                    return;
                }

                if(current_game_time >= player.weaponChangedTime + mWeaponReadyDuration[player.weapon]){
                    player.weaponIsReady = true;
                }
                
                if( player.nowReloading && current_game_time > player.reloadStartTime + mWeaponReloadDuration[player.weapon]){
                    if(player.weapon==1){
                        player.ammoInMagagine[player.weapon] += 1;
                        player.reloadStartTime = new Date().getTime();
                        mPlayAudioBuffer(mArrayAudio[13], vol)
                        //mDisplayAmmo()
                    }else{
                        player.ammoInMagagine[player.weapon] = mWeaponMagagineSize[player.weapon];
                    }
                    mDisplayAmmo()
                    
                    if(player.ammoInMagagine[player.weapon] == mWeaponMagagineSize[player.weapon]){
                        player.nowReloading = false;
                    }
                    console.log("player.ammoInMagagine[player.weapon]:", player.ammoInMagagine[player.weapon])
                }
                //console.log("player.nowReloading:", player.nowReloading)

                
                //--- Shotgun, Scar ---//
                node_vertices = [];             
                if( player.mode == 1 && player.weaponIsReady &&
                    (player.weapon == 1 || player.weapon == 2) && player.isFiring && current_game_time > player.lastFiringTime + mWeaponInterval[player.weapon]){

                    //player.lastFiringTime = new Date().getTime();

                    if(player.ammoInMagagine[player.weapon]<=0){
                        //mPlayAudioBuffer(mArrayAudio[14], vol)
                        return;
                    }

                    player.ammoInMagagine[player.weapon] -= 1;
                    mDisplayAmmo()

                    if(player.weapon == 2){
                        mPlayAudioBuffer(mArrayAudio[1], vol)
                    }else if(player.weapon == 1){
                        mPlayAudioBuffer(mArrayAudio[12], vol)
                    }
                    
                    player.lastFiringTime = new Date().getTime();

                    //node_vertices = [];             
                    //let muzzlePos = player.playerMesh.getObjectByName("MuzzlePos")
                    let wp = muzzlePos.getWorldPosition(new THREE.Vector3());
                    node_vertices.push(wp.x, 
                        wp.y, 
                        wp.z);

                    let flashMesh = player.playerMesh.getObjectByName("Flash");
                    //console.log("flashMesh:", flashMesh, ", ", player.player_id);
                    flashMesh.visible = true;
                    //muzzlePos.rotation.z += Math.PI/2;
                    muzzlePos.rotation.x += Math.PI/2;
                    
                    let piv = playerPiv1;
                    //if(player.player_id != myPlayerId){
                    //    piv = muzzlePos;
                    //}

                    //let {hit, ray} = mPlayerRayHit(world, playerPiv1);
                    let {hit, ray} = mPlayerRayHit(world, piv);

                    let hitPoint;
                    if (hit != null) {
                        hitPoint = ray.pointAt(hit.timeOfImpact); // Same as: `ray.origin + ray.dir * toi`
                        //console.log("Collider", hit.collider, "hit at point", hitPoint);
                        console.log("hit.timeOfImpact:", hit.timeOfImpact);
                        if(hit.timeOfImpact >= 0 ){  //mCameraOffset.dz
                            mCreateHitMarker(hitPoint, player.weapon);
                            //mPlayAudioBuffer(mArrayAudio[0], 0.5);
                            node_vertices.push(hitPoint.x, hitPoint.y, hitPoint.z);
                            mHitDamage(hit, player);
                        }else{

                        }

                    }else{
                        //let p0 = camera.position;
                        //let d = camera_dir; 
                        let p0 = playerPiv1.getWorldPosition(new THREE.Vector3());
                        let d = playerPiv1.getWorldDirection(new THREE.Vector3());
                        //console.log("d:", d, ", d2:", d2);
                        let L = grid_size * grid_num;
                        //console.log("L:", L);
                        node_vertices.push(p0.x + d.x * L, p0.y + d.y * L, p0.z + d.z * L);
                    }
                    
                    if(node_vertices.length > 3){
                        mCreateFiringMesh(node_vertices, player)
                    }

                    //--- Recoil
                    let d = -0.01;
                    if(player.weapon == 1){
                        d = -0.05;
                    }
                    let pMesh = player.playerMesh.getObjectByName("Player")
                    pMesh.position.z = d;     
                    let weaponMesh = player.playerMesh.getObjectByName("Weapon")
                    weaponMesh.position.x = d;   

                }

                if( current_game_time > player.lastFiringTime + 50){
                    if(player.firingMesh!=null){
                        scene.remove(player.firingMesh);
                        player.firingMesh = null;
                    }
                    let weaponMesh = player.playerMesh.getObjectByName("Weapon")
                    weaponMesh.position.x = 0;   
                    let pMesh = player.playerMesh.getObjectByName("Player")
                    pMesh.position.z = 0;     

                    //flashMaterial.visible = false;
                    let flashMesh = player.playerMesh.getObjectByName("Flash")
                    flashMesh.visible = false;
                }

                if( current_game_time < player.lastFiringTime + mWeaponRecoilDuration[player.weapon]){
                    let dt = (current_game_time - player.lastFiringTime);
                    let r = mWeaponRecoilDuration[player.weapon];
                    let a = mWeaponRecoilAng[player.weapon] * Math.cos(Math.PI/2*dt/r);
                    player.angle2 -= player.recoilAng;
                    player.angle2 += a;
                    player.recoilAng = a;
                }else{
                    player.angle2 -= player.recoilAng;
                    player.recoilAng = 0;
                }
         

            });


            //--- Build ---//
            if(c_player.mode == 2){
                BUILD.mSetBuildTemp(c_player);

                if(c_player.buildTemp){
                    //mDrawBuildTemp(c_player.buildTemp)
                    mDrawBuildTemp(c_player)
                }

                if(c_player.nowTouboBuild){
                    //mDoBuild(c_player.buildTemp)
                    mDoBuild(c_player)
                }
            }
            
            //console.log("ArrayBuild:%o", ArrayBuild)

            //--- Edit ---//
            if(c_player.mode == 3){
                //mSelectEditGrid(c_player);
                if( BUILD.mSelectEditGrid(c_player, ArrayBuild, world_edit) ){
                    mPlayAudioBuffer(mArrayAudio[9]);
                }
            }


            mSetCameraPosition(camera, mCameraOffset, c_player); //playerMesh
            light.position.set(light_pos0.x + playerNewPosition.x, 
                               light_pos0.y + playerNewPosition.y, 
                               light_pos0.z + playerNewPosition.z);
 
        } //if (playerMesh != null)


        //--- Only for my player 
        if(current_game_time > displayDamageTime + 500 ){
            c_player.displayDamage = 0;
        }
        mDisplayDamage(c_player.displayDamage)

        if(c_player.nowReloading && c_player.weapon==2){
            mDisplayAmmo(true)
        }


        //stats.begin();

        renderer.render(scene, camera);
        requestAnimationFrame(tick);

        stats.end();
    }

    function mPlayerRayHit(world_, piv_, sign_=1){
        let dir = new THREE.Vector3();
        piv_.getWorldDirection(dir)
        //let cp = camera_.position;
        let cp = piv_.getWorldPosition(new THREE.Vector3());
        let ray = new RAPIER.Ray({ x: cp.x, y: cp.y, z: cp.z }, 
                                 { x: dir.x*sign_, y: dir.y*sign_, z: dir.z*sign_ });
        let maxToi = grid_size*grid_num*2;
        let solid = false;
        let hit = world_.castRay(ray, maxToi, solid);
        return {hit: hit, ray: ray};
    }

    function mCreateFiringMesh(vertices, player){
        //let t1 = new Date().getTime();
        const point1 = new THREE.Vector3(vertices[0], vertices[1], vertices[2]);
        const point2 = new THREE.Vector3(vertices[3], vertices[4], vertices[5]);
        const distance = point1.distanceTo(point2); 
        //console.log("point1:", point1);
        //console.log("point2:", point2);
        //console.log("distance:", distance);
        const direction = new THREE.Vector3().subVectors(point2, point1);
        direction.normalize();
        //console.log("direction:", direction);
        const radius = 0.015; // Example radius
        const height = distance;
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 6, 1); 
        //const material = new THREE.MeshStandardMaterial({ color: "orange" }); // Example material
        const material = new THREE.MeshStandardMaterial({ map: firingTexture, side: THREE.DoubleSide }); // Example material
        material.transparent = true;
        material.opacity = 0.8;
        const cylinder = new THREE.Mesh(geometry, material);
        const cylinderDefaultAxis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(cylinderDefaultAxis, direction);
        cylinder.applyQuaternion(quaternion);
        cylinder.position.copy(point1).add(direction.multiplyScalar(height / 2));
        if(player.firingMesh != null){
            scene.remove( player.firingMesh );
        }
        player.firingMesh = cylinder;
        scene.add( player.firingMesh );
        let t2 = new Date().getTime();
        //console.log("t:", t2-t1)
    }

    function mCreateHitMarker(hitPoint, weapon=1){
        let R = playerRadius*0.1;
        if(weapon==0){
            R = playerRadius*0.2;
        }

        if(props.hitMarker){
            const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(R), new THREE.MeshBasicMaterial({color: 'orange'}))
            hitMesh.position.set(hitPoint.x, hitPoint.y, hitPoint.z);
            ArrayHitMesh.push(hitMesh);
            scene.add(hitMesh)
            if(ArrayHitMesh.length>100){
                let delMesh = ArrayHitMesh[0];
                scene.remove(delMesh);
                ArrayHitMesh.shift();
            }
        }else{

        }
    }

    //let displayDamageTime = -1;
    function mHitDamage(hit, player){
        // player : shooting player

        let weapon = player.weapon;
        let d = mWeaponBuildDamage[weapon];
        let L = hit.timeOfImpact;
        console.log("L:", L);
        let WL = mWeaponDistance[weapon];

        if(L >= WL){
            return;
        }

        let C = 1.0 - Math.floor( L / WL * 10) * 0.1;
        C = Math.max(0,C);
        console.log("C:", C);

        if(weapon!=0){
            d *= C;
            d = Math.round(d);
        }
        console.log("d:", d);

        //console.log("Collider:", hit.collider)
        //let b = ArrayBuild[hit.collider.handle];
        let b = ArrayBuild[hit.collider.build_id];
            console.log("b:%o", b);

        if(b!=null){ // Build damage
            //console.log("ArrayBuild:%o", ArrayBuild);
            mPlayAudioBuffer(mArrayAudio[0], 0.5);
            b.health -= d;
            //b.buildMesh.material.opacity = b.health / b.maxHealth * 0.5 + 0.5;
            if( b.buildMesh.isMesh ){
                b.buildMesh.material.opacity = b.health / b.maxHealth * 0.7 + 0.3;
            }else if( b.buildMesh.isGroup ){
                for(var i=0; i<b.buildMesh.children.length; i++){
                    b.buildMesh.children[i].material.opacity = b.health / b.maxHealth * 0.7 + 0.3;
                }
            }
            //console.log("b.buildMesh.material.opacity:%o", b.buildMesh.material.opacity);
            if(b.health<=0){
                mDestroyBuild(b);
            }
        }

        let p = array_player[hit.collider.player_id]; // player who recieved damage 

        //if( hit.collider.player_id == bot_player.player_id ){
        if(p!=null){
            //console.log("bot_player damage");
            //if(weapon==0){
            //    d = 20;
            //}

            if(p.player_id==bot_player.player_id && props.botAction==false && props.botSleep==false){
                //let c = gui.controllers;
                //c[4].setValue(true);
                
                props.botAction = true;
                mSetBotAction(props.botAction)
            }

            if(player.player_id==myPlayerId){
                displayDamageTime = new Date().getTime();
            }

            d = mWeaponPlayerDamage[player.weapon]

            if(weapon!=0){
                d *= C;
                d = Math.round(d);
            }
            console.log("d:", d);       
            //c_player.displayDamage = d;
            //bot_player.receivedDamage = true;
            player.displayDamage = d;
            p.receivedDamage = true;

            if(p.shield > 0){
                p.shield -= d;
                if(p.shield < 0){
                    d = -p.shield;
                    p.shield = 0.0;
                } else{
                    d = 0.0;
                }
            }
            p.health -= d;
            p.health = Math.max(0.0, p.health);  
            console.log("p.health:", p.health, ", p.shield:", p.shield);
            
            if(p.player_id==myPlayerId){
                mPlayAudioBuffer(mArrayAudio[16])
                mUpdateHealthGauge(); 
                canvasDamage.style.visibility ="visible";
                setTimeout(() => {
                    canvasDamage.style.visibility ="hidden";
                }, 100);

            }

            if(p.health <= 0){
                mPlayerDead(p)
            }

        }
    }

    function mPlayerDead(player){
        console.log("mPlayerDead:")
        props.botAction = false;
        //let c = gui.controllers;
        //console.log("c:", c)
        //c[4].setValue(false);
        mSetBotAction(props.botAction)

        player.playerBody.setEnabled(false);
        scene.remove(player.firingMesh);
        player.firingMesh = null;
        player.playerMesh.getObjectByName("Flash").visible = false;

        if(player.player_id == myPlayerId){
            
        }

        mRespawnPlayer(player);
    }

    function mRespawnPlayer(player){
        setTimeout(() => {
            player.arrayAction[15].stop();
            player.shield = 100;
            player.health = 100;
            player.playerBody.setEnabled(true);
            player.playerBody.setTranslation({ x: player.initPosition.x, y: player.initPosition.y, z: player.initPosition.z}, true);
            mUpdateHealthGauge()
        }, 3000);
    }

    function mDisplayDamage(d){
        var W_ = canvas2d.width;
        var H_ = canvas2d.height;
        //console.log("canvas2d:"+W_+", "+H_)

        const context2d = canvas2d.getContext('2d');
        let f_ = H_ * 0.1;
        let x_ = W_/2 + 10;
        let y_ = H_/2 - 10 - 0;
        context2d.clearRect(x_, y_+5, W_/4, -H_/4);
        if(d <= 0){
            return;
        } 
        let cTime_ = new Date().getTime();
        let t_ = (cTime_ - displayDamageTime) * 0.1;
        let c_ = "cyan"; //"white"
        let a_ = 1.0 - (cTime_ - displayDamageTime)/500;
        context2d.globalAlpha = a_;
        //let v_ = c_player.displayDamageValue
        context2d.font = "bold " + f_ * a_ +"px 'MS PGothic', san-serif";
        context2d.fillStyle = c_;
        context2d.fillText( d, x_+t_,y_-t_);
        context2d.strokeStyle = "black";
        context2d.strokeText( d, x_+t_,y_-t_);
        context2d.globalAlpha = 1.0;

    }

    function mDisplayAmmo(reload_=false, del=false){
        console.log("mDisplayAmmo:", reload_)
        var W_ = canvas2d.width;
        var H_ = canvas2d.height;
        //console.log("canvas2d:"+W_+", "+H_)

        const context2d = canvas2d.getContext('2d');
        // origin -> top left
        let x_ = W_/2 //+ 10;
        let y_ = H_/2 //+ 10 - 0;
        let R_ = H_ / 20;
        context2d.clearRect(x_+5, y_+5, R_*3, R_*3);
        if(del){
            return;
        } 

        if(c_player.weapon==0){
            return;
        }

        if(reload_ && c_player.weapon==2){
            context2d.lineWidth = H_/100;
            context2d.strokeStyle = "rgba(0,0,0,0.3)";
            let e_a = Math.PI/2;
            context2d.beginPath();
            context2d.arc(x_+R_, y_+R_, R_, 0, e_a );
            context2d.stroke();

            context2d.strokeStyle = "white";
            //context2d.strokeStyle = "red";

            let c_t = new Date().getTime();
            let s_t = c_player.reloadStartTime;

            let d = Math.PI/2 * (c_t-s_t)/mWeaponReloadDuration[c_player.weapon];
            d = Math.max(0.1, d);  // ? noise line will be appeared 
            d = Math.min(Math.PI/2, d);
            //console.log("d:", d)

            context2d.beginPath();
            context2d.arc(x_+R_, y_+R_, R_, e_a - d, e_a );  // ? noise line will be appeared 
            //context2d.arc(x_+R_, y_+R_, R_, e_a - d, e_a );
            context2d.stroke();
            

            context2d.lineWidth = 1;
            return
        }

        let a = mWeaponMagagineSize[c_player.weapon];
        let n = mWeaponMagagineSize[c_player.weapon] * 2;
        let d = Math.PI/2 / n;

        context2d.lineWidth = H_/100;
        context2d.strokeStyle = "white";
        for(var i=0; i < a; i++){
            let e_a = Math.PI/2 - d * 2 * i;
            if(c_player.ammoInMagagine[c_player.weapon] <= i ){
                context2d.strokeStyle = "rgba(0,0,0,0.3)";
            }
            context2d.beginPath();
            context2d.arc(x_+R_, y_+R_, R_, e_a - d, e_a );
            context2d.stroke();
        }
        context2d.lineWidth = 1;
        
        console.log("mDisplayAmmo:")
    }
    //mDisplayAmmo()

    function mUpdateHealthGauge(){

        const context2d = canvas2d.getContext('2d');
        let W_ = canvas2d.width;
        let H_ = canvas2d.height;

        let maxHealth = 100;
        let maxShield = 100;
        let p_health = c_player.health;
        let p_shield = c_player.shield;

        // life gauge
        let w_ = canvas2d.width / 6;
        let w2_ = w_ * p_health / maxHealth;
        let h_ = canvas2d.height / 30; //20
        let x_ = canvas2d.width / 25;
        let y_ = canvas2d.height - h_*2;
        //console.log('life:'+[x_,y_,w_,w2_,h_]);

        context2d.clearRect(0, H_*3/4, W_/3, H_/4);

        context2d.lineWidth = 1;
        context2d.strokeStyle = 'black';
        context2d.fillStyle='green'; 
        //if(mInStorm==1){
        //    context.fillStyle='red';
        //}
        context2d.fillRect(x_,y_,w2_,h_);
        context2d.strokeRect(x_,y_,w_,h_);
        
        // shield gauge
        let h2_ = canvas2d.height / 40;
        context2d.fillStyle='cyan'; 
        w2_ = w_ * p_shield / maxShield;
        let y2_ = canvas2d.height - h_*2 - h2_;
        context2d.fillRect(x_,y2_,w2_,h2_);
        context2d.strokeRect(x_,y2_,w_,h2_);
        
        let f_ = h_*0.5;
        context2d.font = f_ + 'px Bold Arial';
        context2d.fillStyle="white"
        context2d.fillText( c_player.health, x_+w_, y_ +f_);
        context2d.fillText( c_player.shield, x_+w_, y2_ +f_);
    }

    function mDestroyBuild(b){
        if(b!=null){
            scene.remove(b.buildMesh);
            b.buildMesh = null;
            //world.removeCollider(b.collider);
            for(var i=0; i<b.collider.length; i++){
                world.removeCollider(b.collider[i]);
            }
            mPlayAudioBuffer(mArrayAudio[2], 2.0);

            //ArrayBuild.slice(i, 1)
            delete ArrayBuild[b.build_id]
        }
    }

    function mCheckBuildIsAvailable(player){
        let build = player.buildTemp;
        let judge = true;

        let L = grid_size * grid_num;
        let nearestType = -1;
        let n_px = -1;
        let n_py = -1;
        let n_pz = -1;
        let playerPiv1 = player.playerMesh.getObjectByName("Piv1"); 

        if( true ){
            let {hit, ray} = mPlayerRayHit(world, playerPiv1);
            //let {hit, ray} = mPlayerRayHit(world_temp, playerPiv1);
            if (hit != null) {
                //console.log("hit.timeOfImpact:", hit.timeOfImpact);
                L = hit.timeOfImpact;
                let b = ArrayBuild[hit.collider.build_id];
                //console.log("b:", b);    
                let hitPoint = ray.pointAt(hit.timeOfImpact);
                if(b!=null){
                    nearestType = b.buildType;
                    n_py = hitPoint.y;
                }
                
            }else{
                return judge;
            }
            //console.log("hit.timeOfImpact:", L);
            //console.log("n_py:", n_py);
            //console.log("buildType:", nearestType);
        }

        let px = build.position.x;
        let py = build.position.y;
        let pz = build.position.z;
        let type = build.type;
        let L2 = grid_size * grid_num;
        //console.log("build:", [px, py, pz, type]);
        let c = null;
        let tempType = -1;

        if(build.buildType == 0){
            tempType = 0;
            //let {wallBody, col} = mCreateWallBodyCollider(world_temp, px, py, pz, type);
            let {wallBody, col} = BUILD.mCreateWallBodyCollider(world_temp, px, py, pz, type);
            col.build_id = 1000;
            c = col;
            //console.log("c:", c);
            //console.log("world_temp:", world_temp);
            
        }else if(build.buildType == 1){
            tempType = 1;
            //let {floorBody, col} = mCreateFloorBodyCollider(world_temp, px, py, pz);
            let {floorBody, col} = BUILD.mCreateFloorBodyCollider(world_temp, px, py, pz);
            col.build_id = 1000;
            c = col;
        }else if(build.buildType == 2){
            tempType = 2;
            //let {slopeBody, col} = mCreateSlopeBodyCollider(world_temp, px, py, pz, type);
            let {slopeBody, col} = BUILD.mCreateSlopeBodyCollider(world_temp, px, py, pz, type);
            col.build_id = 1000;
            c = col;
        }else if(build.buildType == 3){
            tempType = 3;
            //let {coneBody, col} = mCreateConeBodyCollider(world_temp, px, py, pz);
            let {coneBody, col} = BUILD.mCreateConeBodyCollider(world_temp, px, py, pz);
            col.build_id = 1000;
            c = col;
        }
            
        world_temp.timestep = 0.0
        world_temp.step()
        
        let {hit, ray} = mPlayerRayHit(world_temp, playerPiv1);
        //let {hit, ray} = mPlayerRayHit(world, playerPiv1);
        if (hit != null) {
            //hitPoint = ray.pointAt(hit.timeOfImpact); 
            //console.log("hit.timeOfImpact:", hit.timeOfImpact);
            L2 = hit.timeOfImpact;
        }else{
            //L2 = 
        }
        //console.log("build_temp, L2:", L2);

        //if( (nearestType==0 || nearestType==1) && L2 > grid_size  && L < L2 ){
        //    // build_temp is not available because not nearest
        //    judge = false;
        //}
        if(nearestType==0){
            /*if(tempType==0 && L < L2){
                judge = false;
            }else if(tempType==1 && L < L2){
                judge = false;
            }*/
            if( L < L2 ){
                judge = false;
            }
            
        }else if(nearestType==1){
            if(tempType==0 && 
                ( (c_player.angle2 <= 0 && n_py > py) || (c_player.angle2 > 0 && n_py < py ) ) ){
                judge = false;
            }else if(tempType==2  && ( c_player.angle2 > 0 && n_py < py ) ){
                judge = false;
            }

        }else if(nearestType==2){
            if(tempType==2  && ( (c_player.angle2 > 0 && n_py < py) || L < L2 ) ){
                judge = false;
            }

        }else if(nearestType==3){
            if(tempType==0  && ( c_player.angle2 < 0 && n_py > py ) ){
                judge = false;
            }else if(tempType==2  && ( c_player.angle2 < 0 && n_py > py ) ){
                judge = false;
            }
        }
        
        if(c != null){
            world_temp.removeCollider(c);
        }
            

        return judge;
    }


    function mDrawBuildTemp(player){
        let build = player.buildTemp;
        //console.log("mCheckBuildIsUnique:", mCheckBuildIsUnique(build));
        //console.log("mCheckBuildIsConnected:", mCheckBuildIsConnected(build));

        //if( mCheckBuildIsUnique(build) &&  mCheckBuildIsConnected(build) ){
        if( BUILD.mCheckBuildIsUnique(build, ArrayBuild) &&  BUILD.mCheckBuildIsConnected(build, ArrayBuild) ){
            build.visible = true;
        }      
        
        if(!mCheckBuildIsAvailable(player)){
            build.visible = false;
        }

    }

    function mDoBuild(player){
        let build = player.buildTemp;
        if( !build.visible ){
            return;
        }

        let px = build.position.x;
        let py = build.position.y;
        let pz = build.position.z;
        let player_id = player.player_id;

        if( build.buildType == 0 ){
            let type = build.type;
            mCreateWall(px, py, pz, type, player_id);
        }else if( build.buildType == 1 ){
            mCreateFloor(px, py, pz, player_id);
        }else if( build.buildType == 2 ){
            let type = build.type;
            mCreateSlope(px, py, pz, type, player_id);
        }else if( build.buildType == 3 ){
            mCreateCone(px, py, pz, player_id);
        }
        mPlayAudioBuffer(mArrayAudio[4])

    }


    function mSetBotDirection(bot_p, target_p){
        let playerPiv1 = bot_player.playerMesh.getObjectByName("Piv1"); 
        const point1 = playerPiv1.getWorldPosition(new THREE.Vector3())
        const point2 = target_p.playerMesh.position;
        const direction = new THREE.Vector3().subVectors(point2, point1);
        direction.normalize();
        //console.log("direction:", direction);

        let a1 = Math.atan2(direction.x, direction.z);
        //console.log("a1:", a1/Math.PI*180);
        bot_p.playerMesh.rotation.y = a1;

        let a2 = Math.atan2(direction.y, Math.sqrt(direction.z*direction.z+direction.x*direction.x) );
        playerPiv1.rotation.x = -a2;
        bot_player.angle2 = a2;
    }
    //console.log("Math.atan2(1,0)", Math.atan2(1,0)) //-> PI/2
    //console.log("Math.atan2(0,1)", Math.atan2(0,1))


    onResize();
    window.addEventListener('resize', onResize);
    function onResize() {
        console.log("onResize")
        width = document.getElementById('main_canvas').getBoundingClientRect().width;
        height = document.getElementById('main_canvas').getBoundingClientRect().height;

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);

        renderer.getSize(resolution);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        //console.log(width);

        canvas2d.setAttribute("width", width);
        canvas2d.setAttribute("height", height);

        mDraw2Dcontext()
        mDrawCanvasDamage()
        mUpdateHealthGauge()
        mDisplayAmmo()
        mDrawCanvasEmote();
    }

    //Pointer lock
    //let mPointLock = false;
    function ElementRequestPointerLock(element){
        //mPointLock = true;
        var list = [
            "requestPointerLock",
            "webkitRequestPointerLock",
            "mozRequestPointerLock"
        ];
        var i;
        var num = list.length;
        for(i=0;i < num;i++){
            if(element[list[i]]){
                element[list[i]]();
                return true;
            }
        }
        return false;
    }

    function DocumentExitPointerLock(document_obj){
        //mPointLock = false;
        var list = [
            "exitPointerLock",
            "webkitExitPointerLock",
            "mozExitPointerLock"
        ];
        var i;
        var num = list.length;
        for(i=0;i < num;i++){
            if(document_obj[list[i]]){
                document_obj[list[i]]();
                return true;
            }
        }
        return false;
    }

    function mEnablePointerLock(canvas_){
        setTimeout(() => {
            ElementRequestPointerLock(canvas_); //->needs action to enable pointer lock
        }, 600);
    }
    
    //--- canvas damage
    function mDrawCanvasDamage(){
        console.log("mDrawCanvasDamage")

        canvasDamage.setAttribute("width", width);
        canvasDamage.setAttribute("height", height);
        let W_ = canvasDamage.width;
        let H_ = canvasDamage.height;
        console.log("canvasDamage:"+W_+", "+H_)

        const contextDamage = canvasDamage.getContext('2d');
        //const gradient = contextDamage.createLinearGradient(0, 0, W_, H_);
        const gradient = contextDamage.createRadialGradient(W_/2, H_/2, 0, W_/2, H_/2, H_/2);

        // Add three color stops
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        //gradient.addColorStop(0.5, "cyan");
        gradient.addColorStop(1, "rgba(255, 0, 0, 0.3)");

        // Set the fill style and draw a rectangle
        contextDamage.fillStyle = gradient;
        contextDamage.fillRect(0, 0, W_, H_);
    }

    //--- canvas emote
    function mDrawCanvasEmote(){
        console.log("mDrawCanvasEmote")

        if(!c_player){
            return;
        }

        canvasEmote.setAttribute("width", width);
        canvasEmote.setAttribute("height", height);
        let W_ = canvasEmote.width;
        let H_ = canvasEmote.height;
        console.log("canvasEmote:"+W_+", "+H_)

        const contextEmote = canvasEmote.getContext('2d');
        contextEmote.clearRect(0, 0, W_, H_);

        let PI = Math.PI
        let n = 8
        let r = H_/4
        let ro = 5
        let d = H_/8  
        let da = 2*PI/8/2;

        contextEmote.lineWidth = 5;
        contextEmote.fillStyle = 'rgb(55,55,55)' 
        contextEmote.strokeStyle = 'rgb(255,255,255)'
        
        //let mEmoteIndex = 0
        
        for(var i=0;i<n;i++){
            contextEmote.fillStyle = 'rgb(55,55,55)' 
            if(i==mEmoteIndex){
                contextEmote.fillStyle = 'rgb(14, 102, 235)' 
            }
            //let x = W_/2 + ro *Math.cos(2*PI/8*(2*i+1)/2)
            //let y = H_/2 + ro *Math.sin(2*PI/8*(2*i+1)/2)
            let x = W_/2 + ro *Math.cos(2*PI/8*i)
            let y = H_/2 + ro *Math.sin(2*PI/8*i)
            contextEmote.beginPath();
            //contextEmote.arc(x, y, r+d/2, 2*PI/8*i, 2*PI/8*(i+1), false);
            //contextEmote.arc(x, y, r-d/2, 2*PI/8*(i+1), 2*PI/8*i, true);
            contextEmote.arc(x, y, r+d/2, 2*PI/8*i-da, 2*PI/8*i+da, false);
            contextEmote.arc(x, y, r-d/2, 2*PI/8*i+da, 2*PI/8*i-da, true);
            contextEmote.closePath();
            contextEmote.fill();

            //if( (mPointerAngle >= 2*PI/8*i) && (mPointerAngle < 2*PI/8*(i+1)) && (i+1<=EMOTE_NUM) ){
            //    contextEmote.stroke();
            //    mEmoteIndex = i+1
            //}

            x = W_/2 + (r+ro) *Math.cos(2*PI/8*i)
            y = H_/2 + (r+ro) *Math.sin(2*PI/8*i)
            if( i==0 || i==1 ){
                contextEmote.drawImage(arrayEmoteIcon[i], x-d/2, y-d/2, d, d);
            }
        
        }//
        
    }


    //--- Description
    function mDraw2Dcontext(){
        console.log("mDraw2Dcontext")

        var W_ = canvas2d.width;
        var H_ = canvas2d.height;
        //console.log("canvas2d:"+W_+", "+H_)

        const context2d = canvas2d.getContext('2d');
        let fontSize = W_/100;
        context2d.font = fontSize + 'px Bold Arial';
        context2d.fillStyle = "white"
        //context2d.textAlign = "center"
        let array_string = [
            "Pointer lock: Click view",
            "Move: WASD",
            "Jump: Space",
            "Crouch: Shift",
            "Sliding: Shift(long)",
            "View direction: Mouse move", 
            "Shoot: Left click", 
            "ADS: Right click",
            "Weapon Axe: F",
            "Weapon Shot gun: 1", 
            "Weapon Scar: 2", 
            "Reload: R",
            "Wall: Q", 
            "Floor: Z or wheel down", 
            "Slope: C or wheel up",
            "Cone: TAB",
            "Edit: E",
            "Reset edit: Right click",
            "(Edit release on)",
            "",
            "***VS bot mini game***",
            "Check off [Sleep Bot]",
            "Shoot the bot then it starts",
            "Be careful, she is strong.",
        ]

        context2d.fillStyle = "rgba(0, 0, 0, 0.5)"
        context2d.fillRect(10, 80, 250, fontSize*1.1*(array_string.length+1));
        context2d.fillStyle = "white"

        for(var i=0; i<array_string.length; i++){
            context2d.fillText(array_string[i], 10, 100 + fontSize*1.1 * i);
        }
        
        let w_ = W_ / 50;
        context2d.strokeStyle = "white"
        context2d.lineWidth = 1;
        context2d.beginPath();
        context2d.moveTo(W_/2, H_/2-w_);
        context2d.lineTo(W_/2, H_/2+w_);
        context2d.moveTo(W_/2-w_, H_/2);
        context2d.lineTo(W_/2+w_, H_/2);
        context2d.closePath();
        context2d.stroke();
    }
    //mDraw2Dcontext()

}//init