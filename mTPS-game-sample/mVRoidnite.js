import * as THREE from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
//import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
//import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
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

//--- VRM model
const loaderGLTF = VROID.loaderGLTF; 
//const gltfVrm = VROID.gltfVrm;
//    console.log("gltfVrm:", gltfVrm);
let vrm = VROID.vrm;
let arrayGltfVrma = VROID.arrayGltfVrma;


game();

//window.addEventListener('DOMContentLoaded', init);
function game() {

    window.onkeydown = function(e) {
        if (e.keyCode == 9)
          return false; // Disable Tab!
     
        if( (e.keyCode == 32) ) 
          return false; // Disable Space!
    
        // if (e.key == "Escape")
        //   return false;
    }

    //const textureLoader = new THREE.TextureLoader();
    //const buildTexture = textureLoader.load('/mTPS-game-sample/image/ch01_woodplank_long_dif.png');
    //const buildTempTexture = textureLoader.load('/mTPS-game-sample/image/build_temp.png');

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

    
    let g_scale = 20.0; //20.0
    const gravity = new RAPIER.Vector3(0.0, -9.81*g_scale, 0.0)
    const world = new RAPIER.World(gravity)
    const world_temp = new RAPIER.World(gravity)
    const world_edit = new RAPIER.World(gravity)
    
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    const canvas3d = document.querySelector( '#canvas' );
    //const renderer = new THREE.WebGLRenderer({
    const renderer = new THREE.WebGPURenderer({    
        canvas: canvas3d, //document.querySelector('#canvas')
        antialias: true
    });
    //const main_canvas = document.querySelector( '#main_canvas' );
    //let width = document.getElementById('main_canvas').getBoundingClientRect().width;
    //let height = document.getElementById('main_canvas').getBoundingClientRect().height;
    
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.setClearColor(new THREE.Color('darkblue')); //'gray'
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
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
    mCameraOffset.dz = mScale*1.6; //1000*1.6;
    
    function mSetCameraPosition(camera, offset, player){

        if(!player.playerMesh){
            return
        }

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

        // weapon
        playerPiv1.position.y = dy;
        //weaponMesh.position.z = -dz;
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5) //0.5
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


    //--- Character model ---//
    let playerMesh = new THREE.Group();
    let playerRadius = 0.3 * mScale; //0.35 * mScale;
    let playerRight = new THREE.Group();
    let playerPiv1 = new THREE.Group();
    let playerPiv2 = new THREE.Group();
    
    let c_player = new Object();
    c_player.player_id = 1;
    c_player.model = null;
    c_player.angle_offset_init = 0; //Math.PI;
    c_player.angle_offset = c_player.angle_offset_init;
    c_player.angle = 0; //Math.PI;
    c_player.angle2 = 0;
    c_player.height = playerRadius * 5;
    c_player.isMoving = false;
    c_player.moveStartTime = -1;
    c_player.isGrounded = false;
    //c_player.isOnSlope = false;
    c_player.isJump = false;
    c_player.isCrouch = false;
    c_player.slidingPressedTime = -1;
    c_player.isSliding = false;
    c_player.weapon = 0;
    c_player.nowSwing = false;
    c_player.isAiming = false;
    c_player.isFiring = false;
    c_player.lastFiringTime = -1;
    c_player.firingMesh = null;
    c_player.mode = 1; // 1:shoot, 2:build, 3:edit
    c_player.buildType = 0;
    c_player.buildTemp = null;
    c_player.zWallTemp = null;
    c_player.xWallTemp = null;
    c_player.FloorTemp = null;
    c_player.zSlopeTemp = null;
    c_player.xSlopeTemp = null;
    c_player.ConeTemp = null;
    c_player.playerMesh = playerMesh;
    c_player.frontView = false;
    c_player.edit_build_id = -1;
    c_player.zWallGrid = null;
    c_player.xWallGrid = null;
    c_player.FloorGrid = null;
    c_player.SlopeGrid = null;
    c_player.slopeGridSelectOrder = [];
    c_player.ConeGrid = null;
    c_player.editCollider = new Object();
    c_player.editSelectMode = false;
    c_player.nowEdit = false;
    c_player.weaponChange = false;


    let mixer;
    let props, lastAnimID;
    let arrayAction; // = new Array(30); //[];
    let model_scale;

    //--- FBX model
    let modelFBX = null;
    let arrayActionFBX = new Array(30); //[];
    let mAnimOrder = {Idle:0, RunForward:1, RunBack:2, RunLeft:3, RunRight:4, 
                    Jump:5, 
                    CrouchIdle:6, CrouchForward:7, CrouchBack:8,  CrouchLeft:9,  CrouchRight:10,  
                    Slide:11,
                    ShootIdle:12, ShootStand: 13, ShootCrouch:14 };
    model_scale = mScale*0.01;  // 10;
    
    
    scene.add( playerMesh );
    playerRight.position.set(-playerRadius-tol, 0, 0);
    playerRight.rotation.y = -Math.PI/2;
    playerMesh.add(playerRight);
    
    playerPiv1.position.set(-mCameraOffset.dx, mCameraOffset.dy, 0);
    playerMesh.add(playerPiv1);
    
    let ax = new THREE.AxesHelper(mScale*0.2);
    ax.visible = false;
    playerPiv1.add(ax);

    playerPiv2.position.set(0, 0, -mCameraOffset.dz);
    playerPiv1.add(playerPiv2);

    
    //--- VRM model
    let modelVRM = VROID.modelVRM;
    modelVRM.position.set(0, -playerRadius*2.5, 0);
    playerMesh.add(modelVRM);  

    // load VRMA
    let arrayActionVRM = VROID.arrayActionVRM;
    let mixerVRM = VROID.mixerVRM;
    
    c_player.model = modelVRM;
    c_player.angle_offset_init = -Math.PI;
    //arrayAction = arrayActionVRM;
    c_player.arrayAction = arrayActionVRM;
    c_player.mixerVRM = mixerVRM;
    c_player.vrm = vrm;
    modelVRM.visible = true;

    //c_player.weaponMesh = VROID.weaponMesh;
     

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

    //--- Cube
    const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mMaterial)
    cubeMesh.castShadow = true
    scene.add(cubeMesh)
        const cubeBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(grid_size*0, 1, -grid_size))
        const cubeShape = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setMass(1).setRestitution(0.0).setFriction(0.0)
        world.createCollider(cubeShape, cubeBody)
    ArrayMesh.push(cubeMesh);
    ArrayBody.push(cubeBody);

    const cubeMesh1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mMaterial)
    cubeMesh1.castShadow = true
    scene.add(cubeMesh1)
        const cubeBody1 = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(grid_size*1, 0.5, -grid_size))
        const cubeShape1 = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setMass(1).setRestitution(0.0).setFriction(0.0)
        world.createCollider(cubeShape1, cubeBody1)
    ArrayMesh.push(cubeMesh1);
    ArrayBody.push(cubeBody1);

    const cubeMesh2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mMaterial)
    cubeMesh2.castShadow = true
    scene.add(cubeMesh2)
        const cubeBody2 = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(grid_size*2, playerRadius*3.5+0.6, -grid_size))
        const cubeShape2 = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setMass(1).setRestitution(0.0).setFriction(0.0)
        world.createCollider(cubeShape2, cubeBody2)
    ArrayMesh.push(cubeMesh2);
    ArrayBody.push(cubeBody2);

    let ArrayBuild = {}; //[]; // should use object?
    let build_id = 0;

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

        //const wallBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))
        //const wallShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(1).setRestitution(0.0).setFriction(0.0)
        //let col = world.createCollider(wallShape, wallBody);
        //let {wallBody, wallShape} = mCreateWallBodyShape(world, px, py, pz, type);
        //let col = world.createCollider(wallShape, wallBody)
        let {wallBody, col} = mCreateWallBodyCollider(world, px, py, pz, type);
        //let {wallBody_, col_} = mCreateWallBodyCollider(world_temp, px, py, pz, type);
        col.build_id = build_id;
            //console.log("col:%o", col);
        ArrayMesh.push(wallMesh);
        ArrayBody.push(wallBody);
        
        mAddBuild(col, wallMesh, wallBody, BUILD.mCreateWallEdgePoints(px, py, pz, type), player_id)
        //build_id += 1; 
    }

    //function mCreateWallBodyShape(world_, px, py, pz, type){
    function mCreateWallBodyCollider(world_, px, py, pz, type){
        let Lx = grid_size;
        let Ly = gridH_size;
        let Lz = buildThick;
        if(type == "x"){
            Lz = grid_size;
            Lx = buildThick;
        }

        let wallBody = world_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))
        let wallShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(1).setRestitution(0.0).setFriction(0.0)
        let col = world_.createCollider(wallShape, wallBody);
        //console.log("world:", world_)

        //return {wallBody: wallBody, wallShape: wallShape};
        return {wallBody: wallBody, col: col};
    }


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

    
    mCreateWall(-grid_size*2+grid_size/2, gridH_size/2, -grid_size*2)
    mCreateWall(-grid_size*3+grid_size/2, gridH_size/2, -grid_size*2)
    for(var i=0; i<grid_num; i++){
        mCreateWall(grid_size*(-i), gridH_size/2, grid_size*1+grid_size/2, "x")
    }
    for(var i=-grid_num; i<grid_num; i++){
        mCreateWall(grid_size*i+grid_size/2, gridH_size/2, -grid_size*grid_num)
    }
    
    //console.log("ArrayBuild:%o", ArrayBuild);

    world.timestep = 0.0
    world.step()

    function mTestRay(){
        let ray = new RAPIER.Ray({ x: 0, y: 2, z: 0}, 
                                { x: 0, y: 0, z: -1});
        let maxToi = grid_size*grid_num*2;
        let solid = false;
        let h = world.castRay(ray, maxToi, solid);
        console.log("h:", h)
    }
    mTestRay()

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

        /*let a = Math.acos(grid_size/L)
        if(type==="z+" || type==="x-"){
            a = -a;
        }
        let w = Math.cos(a/2)
        let x = 1.0*Math.sin(a/2)
        let y = 0.0
        let z = 0.0
        if(type==="x+" || type==="x-"){
            z = 1.0*Math.sin(a/2)
            x = 0.0
        }
        const slopeBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz).setRotation({ w: w, x: x, y: y, z: z }))
        const slopeShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(1).setRestitution(0.0).setFriction(0.0)
        const slopeCollider = world.createCollider(slopeShape, slopeBody)
        slopeCollider.build_id = build_id;*/

        let {slopeBody, col} = mCreateSlopeBodyCollider(world, px, py, pz, type);
        col.build_id = build_id;

        ArrayMesh.push(slopeMesh);
        ArrayBody.push(slopeBody);

        //console.log("slopeCollider.handle:", slopeCollider.handle)

        mAddBuild(col, slopeMesh, slopeBody, BUILD.mCreateSlopeEdgePoints(px, py, pz, type), player_id)
        //build_id += 1; 
    }

    function mCreateSlopeBodyCollider(world_, px, py, pz, type){
        let L = Math.sqrt(grid_size*grid_size+gridH_size*gridH_size)
            //console.log("L:"+L)
        let Lx = grid_size
        let Ly = buildThick
        let Lz = L
        if( type==="x+" || type==="x-" ){
            Lz = grid_size
            Lx = L
        }

        let a = Math.acos(grid_size/L)
        if(type==="z+" || type==="x-"){
            a = -a;
        }
        let w = Math.cos(a/2)
        let x = 1.0*Math.sin(a/2)
        let y = 0.0
        let z = 0.0
        if(type==="x+" || type==="x-"){
            z = 1.0*Math.sin(a/2)
            x = 0.0
        }

        const slopeBody = world_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz).setRotation({ w: w, x: x, y: y, z: z }))
        const slopeShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(1).setRestitution(0.0).setFriction(0.0)
        const col = world_.createCollider(slopeShape, slopeBody)        
        
        return {slopeBody: slopeBody, col: col};
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


    function mCreateFloor(px, py, pz, player_id = -1){    
        
        let floorMesh = BUILD.mCreateFloorMesh();
        scene.add(floorMesh)

        //const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))
        //const floorShape = RAPIER.ColliderDesc.cuboid(grid_size/2, buildThick/2, grid_size/2).setMass(1).setRestitution(0.0).setFriction(0.0)
        //const floorCollider = world.createCollider(floorShape, floorBody)
        //floorCollider.build_id = build_id;
        let {floorBody, col} = mCreateFloorBodyCollider(world, px, py, pz);
        col.build_id = build_id;

        ArrayMesh.push(floorMesh);
        ArrayBody.push(floorBody);

        mAddBuild(col, floorMesh, floorBody, BUILD.mCreateFloorEdgePoints(px, py, pz), player_id)
        //build_id += 1; 
    }

    function mCreateFloorBodyCollider(world_, px, py, pz){
        
        let floorBody = world_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))
        let floorShape = RAPIER.ColliderDesc.cuboid(grid_size/2, buildThick/2, grid_size/2).setMass(1).setRestitution(0.0).setFriction(0.0)
        let col = world_.createCollider(floorShape, floorBody)
        return {floorBody: floorBody, col: col};
    }

    mCreateFloor(-grid_size*4+grid_size/2, gridH_size*3, -grid_size*5+grid_size/2)
    mCreateFloor(-grid_size*3+grid_size/2, gridH_size, -grid_size*3+grid_size/2)

    
    function mCreateCone(px, py, pz, player_id = -1){    
        
        let geometry = BUILD.mCreateConeGeometry();
        //console.log("geometry:", geometry.attributes);
        let vertices = geometry.attributes.position.array;
        let indices = geometry.attributes.index.array;
        
        let coneMesh = BUILD.mCreateConeMesh(geometry);
        scene.add(coneMesh)

        /*const coneBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))
        const coneShape = RAPIER.ColliderDesc.trimesh(vertices, indices).setMass(1).setRestitution(0.0).setFriction(0.0)
        const coneCollider = world.createCollider(coneShape, coneBody)
        coneCollider.build_id = build_id;*/
        let {coneBody, col} = mCreateConeBodyCollider(world, px, py, pz);
        col.build_id = build_id;

        ArrayMesh.push(coneMesh);
        ArrayBody.push(coneBody);

        mAddBuild(col, coneMesh, coneBody, BUILD.mCreateConeEdgePoints(px, py, pz), player_id)
        //build_id += 1; 
    }

    function mCreateConeBodyCollider(world_, px, py, pz){
        
        //let floorBody = world_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))
        //let floorShape = RAPIER.ColliderDesc.cuboid(grid_size/2, buildThick/2, grid_size/2).setMass(1).setRestitution(0.0).setFriction(0.0)
        //let col = world_.createCollider(floorShape, floorBody)

        let geometry = BUILD.mCreateConeGeometry();
        let vertices = geometry.attributes.position.array;
        let indices = geometry.attributes.index.array;

        const coneBody = world_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))
        const coneShape = RAPIER.ColliderDesc.trimesh(vertices, indices).setMass(1).setRestitution(0.0).setFriction(0.0)
        const col = world_.createCollider(coneShape, coneBody)

        return {coneBody: coneBody, col: col};
    }

    mCreateCone(grid_size*1+grid_size/2, gridH_size/2, grid_size/2);
    mCreateCone(grid_size*2+grid_size/2, gridH_size/2, grid_size/2);
    mCreateCone(grid_size*3+grid_size/2, gridH_size/2, grid_size/2);
    mCreateCone(grid_size*4+grid_size/2, gridH_size/2, grid_size/2);
    mCreateCone(grid_size*5+grid_size/2, gridH_size/2, grid_size/2);


    //--- Player
    let ArrayPlayerCollider = [];
    let playerBodyMesh = new THREE.Group();
    let playerCapsuleH = playerRadius*3.3; //playerRadius*3;
    let playerCapsuleSquatH = playerRadius*2.0;
    let dy_squat = -(playerCapsuleH-playerCapsuleSquatH)/2
        const playerBodyStandMesh = new THREE.Mesh(new THREE.CapsuleGeometry(playerRadius, playerCapsuleH), new THREE.MeshBasicMaterial({color: "cyan", wireframe: true}))
        playerBodyStandMesh.castShadow = false
        playerBodyMesh.add(playerBodyStandMesh);
            const playerBodySquatMesh = new THREE.Mesh(new THREE.CapsuleGeometry(playerRadius, playerCapsuleSquatH), new THREE.MeshBasicMaterial({color: 'red', wireframe: true}))
            playerBodySquatMesh.position.set(0, dy_squat, 0); //-playerRadius*0.75
            playerBodySquatMesh.castShadow = false
            playerBodySquatMesh.visible = false
            playerBodyMesh.add(playerBodySquatMesh)
        playerBodyMesh.visible = false;
    scene.add(playerBodyMesh)
    ArrayMesh.push(playerBodyMesh);

        const playerBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, playerRadius*5, 0).lockRotations())
        const playerShape = RAPIER.ColliderDesc.capsule(playerCapsuleH/2, playerRadius).setMass(1).setRestitution(0.0).setFriction(2.0)
        playerShape.setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS)
        let playerCollider = world.createCollider(playerShape, playerBody);
        //playerCollider.setEnabled(false);
        ArrayPlayerCollider.push(playerCollider);
        //console.log("playerCollider.handle:%o", playerCollider.handle)
        console.log("playerCollider.handle:", playerCollider)

        const playerSquatShape = RAPIER.ColliderDesc.capsule(playerCapsuleSquatH/2, playerRadius).setMass(1.0).setTranslation(0.0, dy_squat, 0.0).setRestitution(0.0).setFriction(2.0)
        //const playerSquatShape = RAPIER.ColliderDesc.capsule(playerRadius*0.75, playerRadius).setMass(1.0).setTranslation(0.0, -playerRadius*0, 0.0).setRestitution(0.0).setFriction(2.0)
        playerSquatShape.setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS)
        let playerSquatCollider = world.createCollider(playerSquatShape, playerBody);
        playerSquatCollider.setEnabled(false);
        ArrayPlayerCollider.push(playerSquatCollider);

    ArrayBody.push(playerBody);
    //playerBody.setLinearDamping(1.0);

    let characterController = world.createCharacterController(0.0);
    characterController.enableSnapToGround(2);

    function mPlayerIsNotGrounded(){
        //console.log("mPlayerIsNotGrounded")
        if(playerBody && playerCollider){
            playerBody.setGravityScale(1/g_scale, true);
            playerCollider.setFriction(0.0)
        }
        
    }

    function mPlayerIsGrounded(){
        //console.log("mPlayerIsGrounded")
        
        if(playerBody && playerCollider){
            playerBody.setGravityScale(1.0, true);
            playerCollider.setFriction(2.0)
        }
        
        //arrayAction[5].stop();
        
    }

    //--- Key event ---//
    var keyEnabledArray = Array(222).fill(true);
    let movement = {'forward': false, 'back': false, 'left': false, 'right': false};
    let lastJumpTime = -1; //performance.now();

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

        if(event.key === 'Shift'  && event.type === 'keydown'){
            if(c_player.slidingPressedTime < 0){
                c_player.slidingPressedTime = new Date().getTime();
                c_player.isSliding = false;
            }
            //c_player.isSliding = false;
            //console.log('c_player.slidingPressedTime:'+c_player.slidingPressedTime);
        }
        if(event.key === 'Shift'  && event.type === 'keyup'){
            //console.log('Shift');
            c_player.slidingPressedTime = -1;
            //console.log('c_player.isSliding:'+c_player.isSliding);
            if( !c_player.isSliding ){
                if(c_player && c_player.isGrounded ){
                    if(c_player.isCrouch){
                        c_player.isCrouch = false;
                        mSetPlayerColliderCrouch(false)
                    }else{
                        c_player.isCrouch = true;
                        mSetPlayerColliderCrouch(true)
                    }
                    //console.log('c_player.isCrouch:', c_player.isCrouch);
                }
            }else{
                c_player.isSliding = false;
                mSetPlayerColliderCrouch(false)
            }
            //console.log('playerSquatCollider:', playerSquatCollider);
            
        }


        if(keyEnabledArray[event.keyCode])
        {
    
            if(event.key.toUpperCase() === 'F'  && event.type === 'keydown'){
                if(c_player){
                    /*if(c_player.mode == 3){
                        mFinishEditMode();
                    }
                    c_player.mode = 1;
                    c_player.weapon = 0;
                    if(c_player.buildTemp != null){
                        c_player.buildTemp.visible = false;
                    }
                    console.log('c_player.weapon:', c_player.weapon);*/
                    mWeaponMode(0)
                }
            }
        
            if(event.key === '1'  && event.type === 'keydown'){
                if(c_player){
                    mWeaponMode(1)
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

        }

        if(keyEnabledArray[event.keyCode] && event.type === 'keydown') {
            keyEnabledArray[event.keyCode] = false;
            //console.log('keydown:'+event.keyCode+","+keyEnabledArray[event.keyCode])
        }
    
        if( event.type === 'keyup') {
            keyEnabledArray[event.keyCode] = true;
            //console.log('keyup:'+event.keyCode+","+keyEnabledArray[event.keyCode])
        }
    
    });

    function mSetPlayerColliderCrouch(isCrouch){
        console.log("mSetPlayerColliderCrouch:",isCrouch)
        playerCollider.setEnabled(!isCrouch)
        playerSquatCollider.setEnabled(isCrouch)
        playerBodyStandMesh.visible = !isCrouch
        playerBodySquatMesh.visible = isCrouch
        //console.log("playerCollider.isEnabled:", playerCollider.isEnabled() )
        //console.log("playerSquatCollider.isEnabled:", playerSquatCollider.isEnabled() )
    }

    function mWeaponMode(weapon){
        if(c_player.mode == 3){
            mFinishEditMode();
        }
        c_player.mode = 1;
        if(c_player.weapon != weapon){ //weapon change
            c_player.weaponChange = true;
            if(weapon==0){
                mPlayAudioBuffer(mArrayAudio[5])
            }
        }
        c_player.weapon = weapon;
        if(c_player.buildTemp != null){
            c_player.buildTemp.visible = false;
        }
        console.log('c_player.weapon:', c_player.weapon, ", ", c_player.weaponChange);
    }

    function mBuildModeWall(){
        if(c_player){
            if(c_player.mode == 3){
                mFinishEditMode();
            }
            c_player.mode = 2;
            c_player.buildType = 0;
            c_player.weapon = 0;
            //weaponMesh.visible = false;
            //console.log('c_player.weapon:', c_player.weapon);
        }
    }

    function mBuildModeFloor(){
        if(c_player){
            if(c_player.mode == 3){
                mFinishEditMode();
            }
            c_player.mode = 2;
            c_player.buildType = 1;
            c_player.weapon = 0;
            //weaponMesh.visible = false;
            //console.log('c_player.weapon:', c_player.weapon);
        }
    }

    function mBuildModeSlope(){
        if(c_player){
            if(c_player.mode == 3){
                mFinishEditMode();
            }
            c_player.mode = 2;
            c_player.buildType = 2;
            c_player.weapon = 0;
            //weaponMesh.visible = false;
            //console.log('c_player.weapon:', c_player.weapon);
        }
    }
    
    function mBuildModeCone(){
        if(c_player){
            if(c_player.mode == 3){
                mFinishEditMode();
            }
            c_player.mode = 2;
            c_player.buildType = 3;
            c_player.weapon = 0;
            //weaponMesh.visible = false;
            //console.log('c_player.weapon:', c_player.weapon);
        }
    }

    function mEditMode(){
        
        if( mJudgeEdit(c_player) && c_player.mode != 3 ){
            c_player.lastMode = c_player.mode;
            c_player.mode = 3;
            mPlayAudioBuffer(mArrayAudio[7])
            if(c_player.edit_build_type == 0){
                mSetWallEditGrid(c_player);
            }else if(c_player.edit_build_type == 1){
                mSetFloorEditGrid(c_player);
            }else if(c_player.edit_build_type == 2){
                mSetSlopeEditGrid(c_player);
            }else if(c_player.edit_build_type == 3){
                mSetConeEditGrid(c_player);
            }
            
        }else if(c_player.mode == 3){
            mFinishEditMode();
        }
        console.log('c_player.mode:', c_player.mode);
    }

    function mFinishEditMode(){

        mApplyEditShape(c_player)
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

    mInitEditCollider(c_player);


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
                    }
                    
                }//    
                else if(e.button==2){
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

            if(c_player.mode == 3){
                if(e.button==0){
                    mSetEditSelectMode(c_player)
                    c_player.nowEdit = true;
                }
                else if(e.button==2){
                    mResetEdit(c_player)
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


    const gui = new GUI();
    props = {
        //showAxes: true,
        showCollision: false,
        showShadow: true,
        rayCast: false,
        hitSound: false,
        //pointerLock: false,
        frontView: false,
        //modelType: 0,
    };
    //gui.add( props, 'showAxes').name('Show axes')
    gui.add( props, 'showCollision').name('Show collision').onChange( value => {
        playerBodyMesh.visible = value;
      })
    gui.add( props, 'showShadow').name('Show shadow').onChange( value => {
        light.castShadow = value;
      })
    gui.add( props, 'rayCast').name('Ray cast').onChange( value => {
        
        })
    gui.add( props, 'hitSound').name('Hit sound').onChange( value => {
        
        })
    gui.add( props, 'frontView').name('Front View').onChange( value => {
        c_player.frontView = value;
        })
    /*gui.add( props, 'modelType', { FBX: 0, VRM: 1} ).onChange( value => {
            console.log("modelType:", value)
            if(value==0){
                c_player.model = modelFBX;
                c_player.angle_offset_init = 0;
                arrayAction = arrayActionFBX;
                modelFBX.visible = true;
                modelVRM.visible = false;
            }else if(value==1){
                c_player.model = modelVRM;
                c_player.angle_offset_init = -Math.PI;
                arrayAction = arrayActionVRM;
                modelVRM.visible = true;
                modelFBX.visible = false;
            } 
        })*/

    const clock = new THREE.Clock();
    let delta
    let player_speed = mScale * 5.5; // 5 [/ms]
    let last_game_time = new Date().getTime(); //[ms]
    let current_game_time = new Date().getTime(); //[ms]
    let playerLastPosition = new THREE.Vector3(0,0,0)
    let playerNewPosition = new THREE.Vector3(0,0,0)
    let playerMoveDirection = new THREE.Vector3(0,0,0)
    let playerPlaneMoveDistance = new THREE.Vector3(0,0,0)
    let t = 0;
    let lastGroundedTime = -1; //performance.now();
    let camera_dir = new THREE.Vector3();
    let eventQueue = new RAPIER.EventQueue(true);
    let ArrayHitMesh = new Array();
    let mHitMaterial = new THREE.MeshBasicMaterial({color: 'orange'})

  /*  //let line_geo = new THREE.LineSegmentsGeometry();
    let line_geo = new LineSegmentsGeometry();
    //let matLine = new THREE.LineMaterial( {
    let matLine = new LineMaterial( {
        color: "orange", //0xffffff, does not work
        linewidth: 5, // in world units with size attenuation, pixels otherwise
        vertexColors: true,
        resolution,  // to be set by renderer, eventually
        dashed: false,
        alphaToCoverage: true,
    } ); */
    let node_vertices = [];
    let colors = [];
    colors.push( 255, 255, 255 );
    colors.push( 255, 255, 255 );

    //mPlayAudioBuffer(mArrayAudio[1])

    tick();
    function tick() {
        
        stats.begin();

        if (world==null){
            return
        }
        //if ( mixer ){
        //}else{
        //    return
        //}

        //mTestRay();
        
        delta = clock.getDelta()
        //if (world) {

        playerLastPosition.copy(playerNewPosition)

        //delta_world = clock.getDelta()
        world.timestep = Math.min(delta, 0.01)
        //world_temp.timestep = Math.min(delta, 0.01)
        world.step(eventQueue)
        //world.step()
            //console.log("delta:%o", delta)
            //console.log("world:%o", world)
            //console.log("d_world:"+dt_world)

        playerNewPosition.copy(playerBody.translation())

        for(var i = 0; i < ArrayMesh.length; i++){
            ArrayMesh[i].position.copy(ArrayBody[i].translation())
            ArrayMesh[i].quaternion.copy(ArrayBody[i].rotation())
        }
        
        playerMesh.position.copy(playerBody.translation())
        //playerMesh.quaternion.copy(playerBody.rotation())
        //console.log("sphereBody.position:%o", sphereBody.position)
        //console.log("playerBody.translation:%o", playerBody.translation())
        //console.log("playerBody.translation:%o", playerBody.translation().x)

        //playerMesh.position.copy(playerBody.position)
        //if( t%10 == 0){
        //  console.log("playerBody.position:%o", playerBody.position)
        //}

        //if( t%100 == 0){
            c_player.isGrounded = false;
            //c_player.isOnSlope = false;
            
            eventQueue.drainContactForceEvents(event => {
                //console.log("event:")
                let handle1 = event.collider1(); // Handle of the first collider involved in the event.
                let handle2 = event.collider2(); // Handle of the second collider involved in the event.
                // Handle the contact force event. 
                //console.log("contact:%o, %o", handle1, handle2)
                //console.log("contact:%o", event.totalForce())
                let time_now = new Date().getTime(); //performance.now();
                for(var i = 0; i < ArrayPlayerCollider.length; i++){
                    let h = ArrayPlayerCollider[i].handle
                    //if(handle1==playerCollider.handle || handle2==playerCollider.handle){
                    if(handle1==h || handle2==h){
                        //console.log("contact:%o", event.totalForce())
                        if( Math.abs(event.totalForce().y) > 1 && time_now > lastJumpTime + 100  ){ // 
                            //lastGroundedTime = performance.now();
                            lastGroundedTime = time_now;
                            c_player.isGrounded = true;
                        
                            //if( Math.abs(event.totalForce().x) > 1.0 || Math.abs(event.totalForce().z) > 1.0){
                            //    c_player.isOnSlope = true;
                            //}else{
                            //    c_player.isOnSlope = false;
                            //}
                        }
                    }
                } //i
                    
            });
            
            //console.log("c_player.isGrounded:", c_player.isGrounded)
            //console.log("c_player.isOnSlope:", c_player.isOnSlope)
        //}

        if(props.rayCast){
            //console.log("camera pos:", camera.position)
            //let camera_dir = new THREE.Vector3();
            camera.getWorldDirection(camera_dir)
            //console.log("camera dir:", camera_dir)

            let cp = camera.position;
            let ray = new RAPIER.Ray({ x: cp.x, y: cp.y, z: cp.z }, { x: camera_dir.x, y: camera_dir.y, z: camera_dir.z });
            let maxToi = grid_size*grid_num;
            let solid = false;

            let hit = world.castRay(ray, maxToi, solid);
            if (hit != null) {
                let hitPoint = ray.pointAt(hit.timeOfImpact); // Same as: `ray.origin + ray.dir * toi`
                //console.log("Collider", hit.collider, "hit at point", hitPoint);
                //console.log("hit.timeOfImpact:", hit.timeOfImpact);
                if(hit.timeOfImpact >= mCameraOffset.dz){
                    const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(playerRadius*0.1), new THREE.MeshBasicMaterial({color: 'orange'}))
                    hitMesh.position.set(hitPoint.x, hitPoint.y, hitPoint.z);
                    ArrayHitMesh.push(hitMesh);
                    scene.add(hitMesh)
                    if(ArrayHitMesh.length>100){
                        let delMesh = ArrayHitMesh[0];
                        scene.remove(delMesh);
                        ArrayHitMesh.shift();
                    }
                    if(props.hitSound){
                        mPlayAudioBuffer(mArrayAudio[0]);
                    }

                }//
            }
        }//

        //}

        current_game_time = new Date().getTime();
        let dt = current_game_time - last_game_time;
        //console.log("dt:"+dt);
        last_game_time = current_game_time;

        t += 1;
          
        c_player.movement = movement;
        //mSetPlayerAnimation(c_player, delta)
        VROID.mSetPlayerAnimation(c_player, delta)


        if (playerMesh != null){

            if( playerBody.translation().y < -gridH_size ){ // init
                playerBody.setTranslation({ x: 0.0, y: gridH_size, z: 1.0 }, true)
            }
    
            if(current_game_time > lastGroundedTime + 10  ){ // Fall
                //console.log("Fall:")
                c_player.isGrounded = false;
                //c_player.isOnSlope = false;
                mPlayerIsNotGrounded()
            }    

            if( c_player.isGrounded ){
                mPlayerIsGrounded()
                lastGroundedTime = current_game_time //currentTime
            }

            if(c_player.isJump){
                //console.log('jump');
                c_player.isGrounded = false;
                //c_player.isOnSlope = false;
                c_player.isCrouch = false;
                mPlayerIsNotGrounded()
                let vx = playerBody.linvel().x;
                let vy = playerBody.linvel().y;
                let vz = playerBody.linvel().z;
                //playerBody.setLinvel({ x: vx, y: 0, z: vz}, true);
                //playerBody.applyImpulse({ x: vx, y: 6, z: vz }, true);
                playerBody.applyImpulse({ x: 0.0, y: 6, z: 0.0 }, true);
                lastJumpTime = new Date().getTime(); // performance.now();
                
                c_player.isJump = false;
            }

            if( current_game_time > c_player.slidingPressedTime + 300 && c_player.slidingPressedTime > 0 ){
                if( !c_player.isSliding ){
                    console.log('sliding play');
                    mPlayAudioBuffer(mArrayAudio[3], 1, false);
                }
                c_player.isSliding = true;
                mSetPlayerColliderCrouch(true)
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

            let m_time = current_game_time - c_player.moveStartTime;
            if( m_time >= 0 &&  
                m_time <= 500){
                spd = spd * m_time / 500;
            }

            
            let a1 = c_player.angle;
            let s = playerBody.linvel();
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
                playerBody.setLinvel({ x: s.x, y: -10, z: s.z}, true);
                s = playerBody.linvel();
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
                playerBody.setLinvel({ x: input_sx, y: s.y, z: input_sz}, true);
                //console.log('input_sz:', input_sz, ", s.z:", s.z);

                let ctr_collider = playerCollider;
                if(c_player.isCrouch || c_player.isSliding){
                    ctr_collider = playerSquatCollider;
                }
                //let desiredTranslation = new RAPIER.Vector3(input_sx*delta, s.y*delta, input_sz*delta);
                let desiredTranslation = new RAPIER.Vector3(input_sx*delta, 
                                                            Math.sqrt(input_sx*input_sx+input_sz*input_sz)*Math.tan(move_angle) *delta, 
                                                            input_sz*delta);
                let characterController = world.createCharacterController(0.0);
                characterController.setMaxSlopeClimbAngle(60 * Math.PI / 180);
                //characterController.enableSnapToGround(0.001); 
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
                    let vpmag = Math.sqrt(vx*vx+vz*vz);
                        //console.log("vpmag:", vpmag);
                    let desiremag = Math.sqrt(input_sx*input_sx+input_sz*input_sz);
                        //console.log("desiremag:", desiremag);
                    let a = 1.0;
                    if(desiremag > 4.9){
                        //a = desiremag / vpmag;
                        //console.log("vpmag:", vpmag);
                        //console.log("desiremag:", desiremag);
                        //console.log("a:", a);
                    }
                    playerBody.setLinvel({ x: vx*a, y: vy*a, z: vz*a}, true);
                }

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
                playerBody.setLinvel({ x: s2x, y: s.y, z: s2z}, true);
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
            playerMesh.rotation.y = c_player.angle

            /*if(c_player.model && c_player.weapon==1 && !c_player.isCrouch){
                let ang2 = c_player.angle2;
                c_player.model.traverse(function(obj) {
                    if(obj.name == "mixamorigSpine"){
                        //console.log("obj.name:" + obj.name)
                            obj.rotation.x = -ang2;
                            //obj.rotation.y = props[Array_v[i*3+1]]/180*3.1415;
                            //obj.rotation.z = props[Array_v[i*3+2]]/180*3.1415;
                    }
                })

            };*/

            //--- Axe ---//
            if( c_player.mode == 1 && c_player.weapon != 0 ){
                c_player.nowSwing = false;
            }
            if( c_player.mode == 1 && c_player.weapon == 0 && c_player.isFiring && current_game_time > c_player.lastFiringTime + 550){
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
                        const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(playerRadius*0.2), new THREE.MeshBasicMaterial({color: 'orange'}))
                        hitMesh.position.set(hitPoint.x, hitPoint.y, hitPoint.z);
                        ArrayHitMesh.push(hitMesh);
                        scene.add(hitMesh)
                        if(ArrayHitMesh.length>100){
                            let delMesh = ArrayHitMesh[0];
                            scene.remove(delMesh);
                            ArrayHitMesh.shift();
                        }
                        mPlayAudioBuffer(mArrayAudio[6]);
                        //node_vertices.push(hitPoint.x, hitPoint.y, hitPoint.z);
                        mBuildDamage(hit, c_player.weapon);
                    }else{

                    }

                }

            }

            //--- Scar ---//
            if( c_player.mode == 1 && c_player.weapon == 1 && c_player.isFiring && current_game_time > c_player.lastFiringTime + 150){
                mPlayAudioBuffer(mArrayAudio[1])
                c_player.lastFiringTime = new Date().getTime();

                camera.getWorldDirection(camera_dir)
                if(props.frontView){
                    camera_dir.multiplyScalar(-1);
                }
                //console.log("camera dir:", camera_dir)

                node_vertices = [];             
                let muzzlePos = c_player.playerMesh.getObjectByName("MuzzlePos")
                let wp = muzzlePos.getWorldPosition(new THREE.Vector3());
                node_vertices.push(wp.x, 
                    wp.y, 
                    wp.z);
                
                let {hit, ray} = mPlayerRayHit(world, playerPiv1);

                let hitPoint;
                if (hit != null) {
                    hitPoint = ray.pointAt(hit.timeOfImpact); // Same as: `ray.origin + ray.dir * toi`
                    //console.log("Collider", hit.collider, "hit at point", hitPoint);
                    console.log("hit.timeOfImpact:", hit.timeOfImpact);
                    if(hit.timeOfImpact >= 0 ){  //mCameraOffset.dz
                        const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(playerRadius*0.1), new THREE.MeshBasicMaterial({color: 'orange'}))
                        hitMesh.position.set(hitPoint.x, hitPoint.y, hitPoint.z);
                        ArrayHitMesh.push(hitMesh);
                        scene.add(hitMesh)
                        if(ArrayHitMesh.length>100){
                            let delMesh = ArrayHitMesh[0];
                            scene.remove(delMesh);
                            ArrayHitMesh.shift();
                        }
                        mPlayAudioBuffer(mArrayAudio[0]);
                        node_vertices.push(hitPoint.x, hitPoint.y, hitPoint.z);
                        mBuildDamage(hit, c_player.weapon);
                    }else{

                    }

                }else{
                    let p0 = camera.position;
                    let d = camera_dir; 
                    let L = grid_size * grid_num;
                    //console.log("L:", L);
                    node_vertices.push(p0.x + d.x * L, p0.y + d.y * L, p0.z + d.z * L);
                }
                
                if(node_vertices.length > 3){
                    mCreateFiringMesh(node_vertices)
                }
                let pMesh = c_player.playerMesh.getObjectByName("Player")
                pMesh.position.z = -0.01;     
                let weaponMesh = c_player.playerMesh.getObjectByName("Weapon")
                weaponMesh.position.x = -0.01;   
            }

            if( current_game_time > c_player.lastFiringTime + 50){
                if(c_player.firingMesh!=null){
                    scene.remove(c_player.firingMesh);
                    c_player.firingMesh = null;
                }
                let weaponMesh = c_player.playerMesh.getObjectByName("Weapon")
                weaponMesh.position.x = 0;   
                let pMesh = c_player.playerMesh.getObjectByName("Player")
                pMesh.position.z = 0;     
            }


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
                //if( c_player.edit_build_type == 0 ){
                //    mSelectWallEditGrid(c_player);
                //}
                mSelectEditGrid(c_player);

            }


            //console.log("playerCollider.isEnabled:", playerCollider.isEnabled() )
            //console.log("playerSquatCollider.isEnabled:", playerSquatCollider.isEnabled() )


            mSetCameraPosition(camera, mCameraOffset, c_player); //playerMesh
            light.position.set(light_pos0.x + playerNewPosition.x, 
                               light_pos0.y + playerNewPosition.y, 
                               light_pos0.z + playerNewPosition.z);
 
        } //if (playerMesh != null)

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

    /*function mCreateFiringMesh(vertices){  // line
        line_geo.setPositions( vertices );
        line_geo.setColors( colors );
        //let line = new THREE.LineSegments2( line_geo, matLine );
        //line.computeLineDistances();
        //scene.add( line );
        c_player.firingMesh = new THREE.LineSegments2( line_geo, matLine );
        c_player.firingMesh.computeLineDistances();
        scene.add( c_player.firingMesh );
    }*/

    function mCreateFiringMesh(vertices){
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
        if(c_player.firingMesh != null){
            scene.remove( c_player.firingMesh );
        }
        c_player.firingMesh = cylinder;
        scene.add( c_player.firingMesh );
        let t2 = new Date().getTime();
        //console.log("t:", t2-t1)
    }

    function mBuildDamage(hit, weapon){
        let d = 30;
        if(weapon==0){
            d = 75;
        }
        //console.log("Collider:", hit.collider)
        //let b = ArrayBuild[hit.collider.handle];
        let b = ArrayBuild[hit.collider.build_id];
        console.log("b:%o", b);
        if(b!=null){
            //console.log("ArrayBuild:%o", ArrayBuild);
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

    //function mCheckBuildIsAvailable(build){
    function mCheckBuildIsAvailable(player){
        let build = player.buildTemp;
        let judge = true;

        let L = grid_size * grid_num;
        let nearestType = -1;
        let n_px = -1;
        let n_py = -1;
        let n_pz = -1;
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
            let {wallBody, col} = mCreateWallBodyCollider(world_temp, px, py, pz, type);
            col.build_id = 1000;
            c = col;
            //console.log("c:", c);
            //console.log("world_temp:", world_temp);
            
        }else if(build.buildType == 1){
            tempType = 1;
            let {floorBody, col} = mCreateFloorBodyCollider(world_temp, px, py, pz);
            col.build_id = 1000;
            c = col;
        }else if(build.buildType == 2){
            tempType = 2;
            let {slopeBody, col} = mCreateSlopeBodyCollider(world_temp, px, py, pz, type);
            col.build_id = 1000;
            c = col;
        }else if(build.buildType == 3){
            tempType = 3;
            let {coneBody, col} = mCreateConeBodyCollider(world_temp, px, py, pz);
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
            
            //console.log("world_temp:", world_temp);
            //world.removeCollider(col);
            //console.log("world:", world);
        //}
        

        return judge;
    }


    //function mDrawBuildTemp(build){
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

    //function mDoBuild(build){
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

    function mJudgeEdit(player){
        console.log("mJudgeEdit:");
        let judge = false;

        let {hit, ray} = mPlayerRayHit(world, playerPiv1);
        if (hit != null) {
            //console.log("hit.timeOfImpact:", hit.timeOfImpact);
            let L = hit.timeOfImpact;
            let b = ArrayBuild[hit.collider.build_id];
            console.log("b:", b);  
            if(b==null){
                return;
            }  

            //let hitPoint = ray.pointAt(hit.timeOfImpact);
            if( b!=null && L < grid_size && b.player_id == player.player_id &&
                (b.buildType==0 || b.buildType==1 || b.buildType==2 || b.buildType==3) ){

                player.edit_build_id = b.build_id;
                player.edit_build_type = b.buildType;
                b.buildMesh.visible = false;
                judge = true;
                if(b.buildType==2){
                    b.slopeGridSelectOrder = [];
                }

                console.log("player:", player);
            }    
        }

        return judge;
    }
    
    function mInitEditCollider(player){

        //--- zWall
        let Lx = player.editCollider.zWall.w;
        let Ly = player.editCollider.zWall.h;
        let Lz = player.editCollider.zWall.t;

        let array_col = [];
        let array_body = [];
        for(var i=0; i<9; i++){
            let wallBody = world_edit.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0)) //.setTranslation(px, py, pz))
            let wallShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(0).setRestitution(0.0).setFriction(0.0)
            let col = world_edit.createCollider(wallShape, wallBody);
            col.grid_id = i;
            //col.setEnabled(false);
            wallBody.setEnabled(false);
            array_col.push(col);
            array_body.push(wallBody);
        }
        player.editCollider.zWall.colliders = array_col;
        player.editCollider.zWall.bodies = array_body;

        //--- xWall
        Lx = player.editCollider.xWall.t;
        Ly = player.editCollider.xWall.h;
        Lz = player.editCollider.xWall.w;

        let array_col_x = [];
        let array_body_x = [];
        for(var i=0; i<9; i++){
            let wallBody = world_edit.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0)) //.setTranslation(px, py, pz))
            let wallShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(0).setRestitution(0.0).setFriction(0.0)
            let col = world_edit.createCollider(wallShape, wallBody);
            col.grid_id = i;
            //col.setEnabled(false);
            wallBody.setEnabled(false);
            array_col_x.push(col);
            array_body_x.push(wallBody);
        }
        player.editCollider.xWall.colliders = array_col_x;
        player.editCollider.xWall.bodies = array_body_x;

        /*for(var i=0; i<9; i++){
            let body = player.editCollider.zWall.bodies[i];
            body.setTranslation({ x: 0.0, y: 5.0, z: 1.0 }, true);
            console.log("body:", body.translation())
        }*/

        //--- Floor
        Lz = player.editCollider.Floor.w;
        Lx = player.editCollider.Floor.h;
        Ly = player.editCollider.Floor.t;

        let array_col_f = [];
        let array_body_f = [];
        for(var i=0; i<4; i++){
            let floorBody = world_edit.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0)) //.setTranslation(px, py, pz))
            let floorShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(0).setRestitution(0.0).setFriction(0.0)
            let col = world_edit.createCollider(floorShape, floorBody);
            col.grid_id = i;
            //col.setEnabled(false);
            floorBody.setEnabled(false);
            array_col_f.push(col);
            array_body_f.push(floorBody);
        }
        player.editCollider.Floor.colliders = array_col_f;
        player.editCollider.Floor.bodies = array_body_f;

        //--- Slope
        let array_col_s = [];
        let array_body_s = [];
        let array_size = player.editCollider.Slope.size;
        for(var i=0; i<8; i++){
            let slopeBody = world_edit.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0)) //.setTranslation(px, py, pz))
            let slopeShape = RAPIER.ColliderDesc.cuboid(array_size[i*3+0]/2, array_size[i*3+1]/2, array_size[i*3+2]/2).setMass(0).setRestitution(0.0).setFriction(0.0)
            let col = world_edit.createCollider(slopeShape, slopeBody);
            col.grid_id = i;
            //col.setEnabled(false);
            slopeBody.setEnabled(false);
            array_col_s.push(col);
            array_body_s.push(slopeBody);
        }
        player.editCollider.Slope.colliders = array_col_s;
        player.editCollider.Slope.bodies = array_body_s;

        //--- Cone
        Lz = player.editCollider.Floor.w;
        Lx = player.editCollider.Floor.h;
        Ly = player.editCollider.Floor.t;

        let array_col_c = [];
        let array_body_c = [];
        for(var i=0; i<4; i++){
            let coneBody = world_edit.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0)) //.setTranslation(px, py, pz))
            let coneShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(0).setRestitution(0.0).setFriction(0.0)
            let col = world_edit.createCollider(coneShape, coneBody);
            col.grid_id = i;
            //col.setEnabled(false);
            coneBody.setEnabled(false);
            array_col_c.push(col);
            array_body_c.push(coneBody);
        }
        player.editCollider.Cone.colliders = array_col_c;
        player.editCollider.Cone.bodies = array_body_c;

        world_edit.timestep = 0.0
        world_edit.step()
    }


    function mSetWallEditGrid(player){

        let b = ArrayBuild[player.edit_build_id];
        if(b==null){
            return;
        }
        
        let px = b.position.x;
        let py = b.position.y;
        let pz = b.position.z;
        b.lastEditGridSelected = [];

        let pos = null;
        let bodies = null;
        let meshes = null;
        if(b.dirType=="z"){
            player.zWallGrid.visible = true;
            player.zWallGrid.position.x = px;
            player.zWallGrid.position.y = py;
            player.zWallGrid.position.z = pz;

            pos = player.editCollider.zWall.position; 
            console.log("pos:", pos)

            bodies = player.editCollider.zWall.bodies;
            meshes = player.zWallGrid.children;
        }else if(b.dirType=="x"){
            player.xWallGrid.visible = true;
            player.xWallGrid.position.x = px;
            player.xWallGrid.position.y = py;
            player.xWallGrid.position.z = pz;

            pos = player.editCollider.xWall.position; 
            bodies = player.editCollider.xWall.bodies;
            meshes = player.xWallGrid.children;
        }

        for(var i=0; i<9; i++){
            
            //let body = player.editCollider.zWall.bodies[i];
            let body = bodies[i];
            body.setTranslation({ x: px+pos[i*3+0], y: py+pos[i*3+1], z: pz+pos[i*3+2] }, true);
            body.setEnabled(true);
                //console.log("body:", body.translation())
                //console.log("col:", col.translation())
            //let mesh = player.zWallGrid.children[i];
            let mesh = meshes[i];
            BUILD.mEditGridSelected(mesh, b.wallEditGridSelected[i]);

            b.lastEditGridSelected.push(b.wallEditGridSelected[i]);
        }

        world_edit.timestep = 0.0
        world_edit.step()  // must call to update collider position

        //for(var i=0; i<9; i++){
        //    let col = player.editCollider.zWall.colliders[i];
        //    console.log("col:", col.translation())
        //}
        
        console.log("player:", player);
    }

    function mSetFloorEditGrid(player){

        let b = ArrayBuild[player.edit_build_id];
        if(b==null){
            return;
        }
        
        let px = b.position.x;
        let py = b.position.y;
        let pz = b.position.z;
        b.lastEditGridSelected = [];

        let pos = null;
        let bodies = null;
        let meshes = null;
        
        player.FloorGrid.visible = true;
        player.FloorGrid.position.x = px;
        player.FloorGrid.position.y = py;
        player.FloorGrid.position.z = pz;

        pos = player.editCollider.Floor.position; 
        console.log("pos:", pos)

        bodies = player.editCollider.Floor.bodies;
        meshes = player.FloorGrid.children;
        
        for(var i=0; i<4; i++){
            
            let body = bodies[i];
            body.setTranslation({ x: px+pos[i*3+0], y: py+pos[i*3+1], z: pz+pos[i*3+2] }, true);
            body.setEnabled(true);
                //console.log("body:", body.translation())
                //console.log("col:", col.translation())
            let mesh = meshes[i];
            BUILD.mEditGridSelected(mesh, b.floorEditGridSelected[i]);
            b.lastEditGridSelected.push(b.floorEditGridSelected[i]);
        }

        world_edit.timestep = 0.0
        world_edit.step()  // must call to update collider position
        
        console.log("player:", player);
    }

    function mSetSlopeEditGrid(player){

        let b = ArrayBuild[player.edit_build_id];
        if(b==null){
            return;
        }
        
        let px = b.position.x;
        let py = b.position.y;
        let pz = b.position.z;
        b.lastEditGridSelected = [];

        let pos = null;
        let bodies = null;
        let meshes = null;
        
        player.SlopeGrid.visible = true;
        player.SlopeGrid.position.x = px;
        player.SlopeGrid.position.y = py;
        player.SlopeGrid.position.z = pz;

        pos = player.editCollider.Slope.position; 
        console.log("pos:", pos)

        bodies = player.editCollider.Slope.bodies;
        meshes = player.SlopeGrid.children;
        
        for(var i=0; i<8; i++){
            
            let body = bodies[i];
            body.setTranslation({ x: px+pos[i*3+0], y: py+pos[i*3+1], z: pz+pos[i*3+2] }, true);
            body.setEnabled(true);
                //console.log("body:", body.translation())
                //console.log("col:", col.translation())
            let mesh = meshes[i];
            BUILD.mEditSlopeGridSelected(mesh, b.slopeEditGridSelected[i]);
            b.lastEditGridSelected.push(b.slopeEditGridSelected[i]);
        }

        world_edit.timestep = 0.0
        world_edit.step()  // must call to update collider position
        
        console.log("player:", player);
    }

    function mSetConeEditGrid(player){

        let b = ArrayBuild[player.edit_build_id];
        if(b==null){
            return;
        }
        
        let px = b.position.x;
        let py = b.position.y;
        let pz = b.position.z;
        b.lastEditGridSelected = [];

        let pos = null;
        let bodies = null;
        let meshes = null;
        
        player.ConeGrid.visible = true;
        player.ConeGrid.position.x = px;
        player.ConeGrid.position.y = py;
        player.ConeGrid.position.z = pz;

        pos = player.editCollider.Cone.position; 
        //console.log("pos:", pos)

        bodies = player.editCollider.Cone.bodies;
        meshes = player.ConeGrid.children;
        
        for(var i=0; i<4; i++){           
            let body = bodies[i];
            body.setTranslation({ x: px+pos[i*3+0], y: py+pos[i*3+1], z: pz+pos[i*3+2] }, true);
            body.setEnabled(true);
                //console.log("body:", body.translation())
                //console.log("col:", col.translation())
            let mesh = meshes[i];
            BUILD.mEditConeGridSelected(mesh, b.coneEditGridSelected[i]);
            b.lastEditGridSelected.push(b.coneEditGridSelected[i]);
        }

        world_edit.timestep = 0.0
        world_edit.step()  // must call to update collider position
        
        console.log("player:", player);
    }


    function mSetEditSelectMode(player){

        //if(player.edit_build_type == 2){
        //    player.editSelectMode = true;
        //    player.slopeGridSelectOrder = [];
        //    return;
        //}

        let {hit, ray} = mPlayerRayHit(world_edit, playerPiv1);
        if (hit != null) {
            let grid_id = hit.collider.grid_id;
            let b = ArrayBuild[player.edit_build_id];
            let selectMode = true;
            if(player.edit_build_type == 0){
                selectMode = !b.wallEditGridSelected[grid_id];
            }else if(player.edit_build_type == 1){
                selectMode = !b.floorEditGridSelected[grid_id];
            }else if(player.edit_build_type == 2){
                //player.editSelectMode = true;
                //player.slopeGridSelectOrder = [];
            }else if(player.edit_build_type == 3){
                selectMode = !b.coneEditGridSelected[grid_id];
            }
            player.editSelectMode = selectMode;

        }
    }

    //function mSelectWallEditGrid(player){
    function mSelectEditGrid(player){
        //console.log("mSelectWallEditGrid");

        if(!player.nowEdit){
            return;
        }

        let {hit, ray} = mPlayerRayHit(world_edit, playerPiv1);
        if (hit != null) {
            let grid_id = hit.collider.grid_id;
            console.log("grid_id:", grid_id);
            //console.log("hit.timeOfImpact:", hit.timeOfImpact);
            //let L = hit.timeOfImpact;
            let b = ArrayBuild[player.edit_build_id];
            //console.log("b:", b);  
            if(b==null){
                return;
            }  
            //let mesh = player.zWallGrid.children[grid_id];
            let mesh = null;
            if( b.buildType==0 && b.dirType == "z" ){
                mesh = player.zWallGrid.children[grid_id];
            }else if(b.buildType==0 && b.dirType == "x" ){
                mesh = player.xWallGrid.children[grid_id];
            }else if(b.buildType==1){
                mesh = player.FloorGrid.children[grid_id];
            }else if(b.buildType==2){
                mesh = player.SlopeGrid.children[grid_id];
            }else if(b.buildType==3){
                mesh = player.ConeGrid.children[grid_id];
            }
            
            
            if( b.buildType==0 ){
                BUILD.mEditGridSelected(mesh, player.editSelectMode);
                if(b.wallEditGridSelected[grid_id] != player.editSelectMode){
                    mPlayAudioBuffer(mArrayAudio[9])
                }
                b.wallEditGridSelected[grid_id] = player.editSelectMode;
            }else if( b.buildType==1 ){
                BUILD.mEditGridSelected(mesh, player.editSelectMode);
                if(b.floorEditGridSelected[grid_id] != player.editSelectMode){
                    mPlayAudioBuffer(mArrayAudio[9])
                }
                b.floorEditGridSelected[grid_id] = player.editSelectMode;
            }else if( b.buildType==2 ){
                //console.log("mSelectEditGrid, slope, grid_id:", grid_id);
                //let s = player.slopeGridSelectOrder;
                let s = b.slopeGridSelectOrder;
                if( s.length == 0 ){
                    s.push(grid_id);
                    for(var i=0; i<8; i++){
                        BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[i], false);
                        b.slopeEditGridSelected[i] = false;
                    }
                    b.slopeEditGridSelected[grid_id] = true;
                    BUILD.mEditSlopeGridSelected(mesh, true);
                    mPlayAudioBuffer(mArrayAudio[9])
                    if(s[0]<4){
                        if(s[0]==0){
                            BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[4], true);
                            BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[6], true);
                        }else if(s[0]==1){
                            BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[5], true);
                            BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[7], true);
                        }else if(s[0]==2){
                            BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[4], true);
                            BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[5], true);
                        }else if(s[0]==3){
                            BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[6], true);
                            BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[7], true);
                        }
                    }else{

                    }
                }else if( s.length == 1 ){
                    if(s[0]<4){
                        if(grid_id<4 && s[0]!=grid_id){
                            s.push(grid_id);
                            //b.slopeEditGridSelected[grid_id] = true;
                            for(var i=0; i<8; i++){ //all blue
                                BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[i], true);
                                b.slopeEditGridSelected[i] = true;
                            }
                            mPlayAudioBuffer(mArrayAudio[9])
                        }

                    }else{
                        if(grid_id>=4 && s[0]!=grid_id){
                            s.push(grid_id);
                            b.slopeEditGridSelected[grid_id] = true;
                            let g = b.slopeEditGridSelected;
                            console.log("g:", g);
                            BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[grid_id], true);
                            if(g[4] && g[5]){ //((s[0]==4 && s[1]==5) || (s[0]==5 && s[1]==4)){
                                BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[2], true);
                                g[2] = true;
                            }else if(g[6] && g[7]){ //((s[0]==6 && s[1]==7) || (s[0]==7 && s[1]==6)){
                                BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[3], true);
                                g[3] = true;
                            }else if(g[4] && g[6]) { //((s[0]==4 && s[1]==6) || (s[0]==6 && s[1]==4)){
                                BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[0], true);
                                g[0] = true;
                            }else if(g[5] && g[7]) { //((s[0]==5 && s[1]==7) || (s[0]==7 && s[1]==5)){
                                BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[1], true);
                                g[1] = true;
                            }               
                            mPlayAudioBuffer(mArrayAudio[9])
                        }

                    }
                }else if( s.length == 2 ){
                    if(s[0]<4){

                    }else{
                        if(grid_id>=4 && s[0]!=grid_id && s[1]!=grid_id){
                            s.push(grid_id);
                            b.slopeEditGridSelected[grid_id] = true;
                            BUILD.mEditSlopeGridSelected(player.SlopeGrid.children[grid_id], true);

                        }
                    }

                }
                


            }else if( b.buildType==3 ){
                BUILD.mEditConeGridSelected(mesh, player.editSelectMode);
                if(b.coneEditGridSelected[grid_id] != player.editSelectMode){
                    mPlayAudioBuffer(mArrayAudio[9])
                }
                b.coneEditGridSelected[grid_id] = player.editSelectMode;
            }
            
        }

    }

    function mResetEdit(player){
        let b = ArrayBuild[player.edit_build_id];
        //console.log("b:", b);  
        if(b==null){
            return;
        }  

        if(b.buildType == 0){
            //let s = b.wallEditGridSelected;
            for(var i=0; i<9; i++){
                b.wallEditGridSelected[i] = false;
            }
        }else if(b.buildType == 1){
            for(var i=0; i<4; i++){
                b.floorEditGridSelected[i] = false;
            }
        }else if(b.buildType == 2){
            for(var i=0; i<8; i++){
                b.slopeEditGridSelected[i] = true;
            }
        }else if(b.buildType == 3){
            for(var i=0; i<4; i++){
                b.coneEditGridSelected[i] = false;
            }
        }

    }

    function mApplyEditShape(player){
        let b = ArrayBuild[player.edit_build_id];
        //console.log("b:", b);  
        if(b==null){
            return;
        }  

        let px = b.position.x;
        let py = b.position.y;
        let pz = b.position.z;

        if(b.buildType == 0){

            let bodies = player.editCollider.zWall.bodies;  
            if(b.dirType == "x"){
                bodies = player.editCollider.xWall.bodies;  
            }
            for(var i=0; i<9; i++){
                let body = bodies[i];
                body.setEnabled(false);
            }//

            let s = b.wallEditGridSelected;

            // s[8] s[7] s[6]  y+
            // s[5] s[4] s[3] 
            // s[2] s[1] s[0]  y0
            //x+               x0
            //z+               z0

            if( !s[8] && !s[7] && !s[6] &&
                !s[5] && !s[4] && !s[3] &&
                !s[2] && !s[1] && !s[0]   ){
                //no edit
                b.editType = 0;
            }else if( !s[8] && !s[7] && !s[6] &&
                      !s[5] &&  s[4] && !s[3] &&
                      !s[2] && !s[1] && !s[0]   ){
                b.editType = 1;
            }else if( !s[8] && !s[7] && !s[6] &&
                       s[5] && !s[4] && !s[3] &&
                      !s[2] && !s[1] && !s[0]   ){
                b.editType = 2;
            }else if( !s[8] && !s[7] && !s[6] &&
                      !s[5] && !s[4] &&  s[3] &&
                      !s[2] && !s[1] && !s[0]   ){
                b.editType = 3;
            }else if( !s[8] && !s[7] && !s[6] &&
                       s[5] && !s[4] &&  s[3] &&
                      !s[2] && !s[1] && !s[0]   ){
                b.editType = 4;
            }else if( !s[8] && !s[7] && !s[6] &&
                      !s[5] &&  s[4] && !s[3] &&
                      !s[2] &&  s[1] && !s[0]   ){
                b.editType = 5;
            }else if( !s[8] && !s[7] && !s[6] &&
                       s[5] && !s[4] && !s[3] &&
                       s[2] && !s[1] && !s[0]   ){
                b.editType = 6;
            }else if( !s[8] && !s[7] && !s[6] &&
                      !s[5] && !s[4] &&  s[3] &&
                      !s[2] && !s[1] &&  s[0]   ){
                b.editType = 7;
            }else if( !s[8] && !s[7] && !s[6] &&
                      !s[5] && !s[4] &&  s[3] &&
                      !s[2] &&  s[1] &&  s[0]   ){
                b.editType = 8;
            }else if( !s[8] && !s[7] && !s[6] &&
                       s[5] && !s[4] && !s[3] &&
                       s[2] &&  s[1] && !s[0]   ){
                b.editType = 9;
            }else if(  s[8] &&  s[7] && !s[6] &&
                       s[5] && !s[4] && !s[3] &&
                      !s[2] && !s[1] && !s[0]   ){
                b.editType = 10;
            }else if( !s[8] &&  s[7] &&  s[6] &&
                      !s[5] && !s[4] &&  s[3] &&
                      !s[2] && !s[1] && !s[0]   ){
                b.editType = 11;
            }else if(  s[8] &&  s[7] &&  s[6] &&
                      !s[5] && !s[4] && !s[3] &&
                      !s[2] && !s[1] && !s[0]   ){
                b.editType = 12;
            }else if( !s[8] && !s[7] && !s[6] &&
                       s[5] && !s[4] &&  s[3] &&
                       s[2] && !s[1] && !s[0]   ){
                b.editType = 13;
            }else if( !s[8] && !s[7] && !s[6] &&
                       s[5] && !s[4] &&  s[3] &&
                      !s[2] && !s[1] &&  s[0]   ){
                b.editType = 14;
            }else if( !s[8] && !s[7] && !s[6] &&
                      !s[5] &&  s[4] &&  s[3] &&
                      !s[2] &&  s[1] &&  s[0]   ){
                b.editType = 15;
            }else if( !s[8] && !s[7] && !s[6] &&
                       s[5] &&  s[4] && !s[3] &&
                       s[2] &&  s[1] && !s[0]   ){
                b.editType = 16;
            }else if( !s[8] && !s[7] && !s[6] &&
                      !s[5] &&  s[4] && !s[3] &&
                       s[2] &&  s[1] &&  s[0]   ){
                b.editType = 17;
            }else if(  s[8] &&  s[7] &&  s[6] &&
                      !s[5] &&  s[4] && !s[3] &&
                      !s[2] &&  s[1] && !s[0]   ){
                b.editType = 18;
            }else if(  s[8] &&  s[7] &&  s[6] &&
                       s[5] &&  s[4] &&  s[3] &&
                      !s[2] && !s[1] && !s[0]   ){
                b.editType = 19;
            }else if(  s[8] &&  s[7] && !s[6] &&
                       s[5] &&  s[4] && !s[3] &&
                       s[2] &&  s[1] && !s[0]   ){
                b.editType = 20;
            }else if( !s[8] &&  s[7] &&  s[6] &&
                      !s[5] &&  s[4] &&  s[3] &&
                      !s[2] &&  s[1] &&  s[0]   ){
                b.editType = 21;
            }else if(  s[8] &&  s[7] &&  s[6] &&
                       s[5] &&  s[4] &&  s[3] &&
                       s[2] && !s[1] && !s[0]   ){
                b.editType = 22;
            }else if(  s[8] &&  s[7] &&  s[6] &&
                       s[5] &&  s[4] &&  s[3] &&
                      !s[2] && !s[1] &&  s[0]   ){
                b.editType = 23;
            }else if(  s[8] &&  s[7] &&  s[6] &&
                       s[5] &&  s[4] && !s[3] &&
                       s[2] &&  s[1] && !s[0]   ){
                b.editType = 24;
            }else if(  s[8] &&  s[7] &&  s[6] &&
                      !s[5] &&  s[4] &&  s[3] &&
                      !s[2] &&  s[1] &&  s[0]   ){
                b.editType = 25;
            }else{ 
                console.log("undefined edit shape")
                for(var i=0; i<9; i++){
                    b.wallEditGridSelected[i] = b.lastEditGridSelected[i];
                }
                return;
            }

            b.doorDir = 1;
            if( b.dirType == "z" && b.position.z < c_player.playerMesh.position.z ){
                b.doorDir = -1;
            }else if( b.dirType == "x" && b.position.x > c_player.playerMesh.position.x ){
                b.doorDir = -1;
            }


        }else if(b.buildType == 1){

            let bodies = player.editCollider.Floor.bodies;     
            for(var i=0; i<4; i++){
                let body = bodies[i];
                body.setEnabled(false);
            }//

            let s = b.floorEditGridSelected;
         
            //x+  s[2] s[3]  
            //    s[0] s[1]   
            //z0,x0        z+
            
            if( !s[2] && !s[3] &&
                !s[0] && !s[1]    ){
                //no edit
                b.editType = 0;
            }else if( !s[2] && !s[3] &&
                       s[0] && !s[1]    ){
                b.editType = 1;
            }else if( !s[2] && !s[3] &&
                      !s[0] &&  s[1]    ){
                b.editType = 2;
            }else if(  s[2] && !s[3] &&
                      !s[0] && !s[1]    ){
                b.editType = 3;
            }else if( !s[2] &&  s[3] &&
                      !s[0] && !s[1]    ){
                b.editType = 4;
            }else if( !s[2] && !s[3] &&
                       s[0] &&  s[1]    ){
                b.editType = 5;
            }else if(  s[2] &&  s[3] &&
                      !s[0] && !s[1]    ){
                b.editType = 6;
            }else if(  s[2] && !s[3] &&
                       s[0] && !s[1]    ){
                b.editType = 7;
            }else if( !s[2] &&  s[3] &&
                      !s[0] &&  s[1]    ){
                b.editType = 8;
            }else if( !s[2] &&  s[3] &&
                       s[0] && !s[1]    ){
                //b.editType = 9;
            }else if(  s[2] && !s[3] &&
                      !s[0] &&  s[1]    ){
                //b.editType = 10;
            }else if(  s[2] &&  s[3] &&
                      !s[0] &&  s[1]    ){
                b.editType = 11;
            }else if(  s[2] &&  s[3] &&
                       s[0] && !s[1]    ){
                b.editType = 12;
            }else if( !s[2] &&  s[3] &&
                       s[0] &&  s[1]    ){
                b.editType = 13;
            }else if(  s[2] && !s[3] &&
                       s[0] &&  s[1]    ){
                b.editType = 14;
            }else{ 
                console.log("undefined edit shape")
                for(var i=0; i<4; i++){
                    b.floorEditGridSelected[i] = b.lastEditGridSelected[i];
                }
                return;
            }
            console.log("b.editType:", b.editType);

        }else if(b.buildType == 2){

            let bodies = player.editCollider.Slope.bodies;     
            for(var i=0; i<8; i++){
                let body = bodies[i];
                body.setEnabled(false);
            }//

            //let g = b.slopeEditGridSelected;
            let s = b.slopeGridSelectOrder;

            //x+  g[6]  g[3]  g[7]
            //    g[0]        g[1]
            //    g[4]  g[2]  g[5]   
            //z0,x0        z+

            if(s.length == 2){
                if( s[0]==0 ){
                    // z+ slope                    
                    b.editType = 0;
                    b.dirType = "z+"
                }else if( s[0]==1 ){
                    // z- slope                    
                    b.editType = 1;
                    b.dirType = "z-"
                }else if( s[0]==2 ){
                    // x+ slope                    
                    b.editType = 2;
                    b.dirType = "x+"
                }else if( s[0]==3 ){
                    // x- slope                    
                    b.editType = 3;
                    b.dirType = "x-"
                }else if( s[0]==4 && s[1]==5 ){
                    // z+ slope                    
                    b.editType = 4;
                    b.dirType = "z+"
                }else if( s[0]==5 && s[1]==4 ){
                    b.editType = 5;
                    b.dirType = "z-"
                }else if( s[0]==5 && s[1]==7 ){
                    b.editType = 6;
                    b.dirType = "x+"
                }else if( s[0]==7 && s[1]==5 ){
                    b.editType = 7;
                    b.dirType = "x-"
                }else if( s[0]==7 && s[1]==6 ){
                    b.editType = 8;
                    b.dirType = "z-"
                }else if( s[0]==6 && s[1]==7 ){
                    b.editType = 9;
                    b.dirType = "z+"
                }else if( s[0]==6 && s[1]==4 ){
                    b.editType = 10;
                    b.dirType = "x-"
                }else if( s[0]==4 && s[1]==6 ){
                    b.editType = 11;
                    b.dirType = "x+"
                }

            }else if(s.length == 0){
                if(b.dirType == "z+"){
                    b.editType = 0;
                }else if(b.dirType == "z-"){
                    b.editType = 1;
                }else if(b.dirType == "x+"){
                    b.editType = 2;
                }else if(b.dirType == "x-"){
                    b.editType = 3;
                }

            }

            b.edgePoints = BUILD.mCreateSlopeEdgePoints(px, py, pz, b.dirType, b.editType)
            //console.log("b.edgePoints:", b.edgePoints);
            
        }else if(b.buildType == 3){

            let bodies = player.editCollider.Cone.bodies;     
            for(var i=0; i<4; i++){
                let body = bodies[i];
                body.setEnabled(false);
            }//

            let s = b.coneEditGridSelected;
         
            //x+  s[2] s[3]  
            //    s[0] s[1]   
            //z0,x0        z+
            
            if( !s[2] && !s[3] &&
                !s[0] && !s[1]    ){
                //no edit
                b.editType = 0;
            }else if( !s[2] && !s[3] &&
                       s[0] && !s[1]    ){
                b.editType = 1;
            }else if( !s[2] && !s[3] &&
                      !s[0] &&  s[1]    ){
                b.editType = 2;
            }else if(  s[2] && !s[3] &&
                      !s[0] && !s[1]    ){
                b.editType = 3;
            }else if( !s[2] &&  s[3] &&
                      !s[0] && !s[1]    ){
                b.editType = 4;
            }else if( !s[2] && !s[3] &&
                       s[0] &&  s[1]    ){
                b.editType = 5;
            }else if(  s[2] &&  s[3] &&
                      !s[0] && !s[1]    ){
                b.editType = 6;
            }else if(  s[2] && !s[3] &&
                       s[0] && !s[1]    ){
                b.editType = 7;
            }else if( !s[2] &&  s[3] &&
                      !s[0] &&  s[1]    ){
                b.editType = 8; 
            }else if( !s[2] &&  s[3] &&
                       s[0] && !s[1]    ){
                b.editType = 9;
            }else if(  s[2] && !s[3] &&
                      !s[0] &&  s[1]    ){
                b.editType = 10;
            }else if(  s[2] &&  s[3] &&
                      !s[0] &&  s[1]    ){
                b.editType = 11;
            }else if(  s[2] &&  s[3] &&
                       s[0] && !s[1]    ){
                b.editType = 12;
            }else if( !s[2] &&  s[3] &&
                       s[0] &&  s[1]    ){
                b.editType = 13;
            }else if(  s[2] && !s[3] &&
                       s[0] &&  s[1]    ){
                b.editType = 14;
            }else{ 
                console.log("undefined edit shape")
                for(var i=0; i<4; i++){
                    b.coneEditGridSelected[i] = b.lastEditGridSelected[i];
                }
                return;
            }
            console.log("b.editType:", b.editType);

            b.edgePoints = BUILD.mCreateConeEdgePoints(px, py, pz, b.editType)
        }

        mSetEditShape(b)
        mSetEditCollider(b)
        

    }

    function mSetEditShape(build){

        if(build.buildType==0){
            console.log("build.editType:", build.editType);
            scene.remove(build.buildMesh)
            let mesh = BUILD.mCreateWallEditShape(build.editType, build.doorDir);
            mesh.position.x = build.body.translation().x;
            mesh.position.y = build.body.translation().y;
            mesh.position.z = build.body.translation().z;
            if(build.dirType=="x"){
                mesh.rotation.y += -Math.PI/2;
            }
            ArrayBuild[build.build_id].buildMesh = mesh;
            build.buildMesh = mesh;
            scene.add(mesh)
        }else if(build.buildType==1){
            console.log("build.editType:", build.editType);
            scene.remove(build.buildMesh)
            let mesh = BUILD.mCreateFloorEditShape(build.editType);
            mesh.position.x = build.body.translation().x;
            mesh.position.y = build.body.translation().y;
            mesh.position.z = build.body.translation().z;
            ArrayBuild[build.build_id].buildMesh = mesh;
            build.buildMesh = mesh;
            scene.add(mesh)
        }else if(build.buildType==2){
            console.log("build.editType:", build.editType);
            scene.remove(build.buildMesh)
            let mesh = BUILD.mCreateSlopeEditShape(build.editType);
            mesh.position.x = build.body.translation().x;
            mesh.position.y = build.body.translation().y;
            mesh.position.z = build.body.translation().z;
            ArrayBuild[build.build_id].buildMesh = mesh;
            build.buildMesh = mesh;
            scene.add(mesh)
        }else if(build.buildType==3){
            console.log("build.editType:", build.editType);
            scene.remove(build.buildMesh)
            let mesh = BUILD.mCreateConeEditShape(build.editType);
            mesh.position.x = build.body.translation().x;
            mesh.position.y = build.body.translation().y;
            mesh.position.z = build.body.translation().z;
            ArrayBuild[build.build_id].buildMesh = mesh;
            build.buildMesh = mesh;
            scene.add(mesh)
        }

    }

    function mSetEditCollider(build){

        if(build.buildType==0){
            //world.removeCollider(build.collider);
            for(var i=0; i<build.collider.length; i++){
                world.removeCollider(build.collider[i]);
            }
            mCreateWallEditCollider(build)
        }else if(build.buildType==1){
            for(var i=0; i<build.collider.length; i++){
                world.removeCollider(build.collider[i]);
            }
            mCreateFloorEditCollider(build)
        }else if(build.buildType==2){
            for(var i=0; i<build.collider.length; i++){
                world.removeCollider(build.collider[i]);
            }
            mCreateSlopeEditCollider(build)
        }else if(build.buildType==3){
            for(var i=0; i<build.collider.length; i++){
                world.removeCollider(build.collider[i]);
            }
            mCreateConeEditCollider(build)
        }
    }

    function mCreateWallEditCollider(build){

        let px = build.position.x;
        let py = build.position.y;
        let pz = build.position.z;

        build.collider = [];
        let wallBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))

        let N = build.buildMesh.N;
        let Lmat = build.buildMesh.Lmat;
        let dmat = build.buildMesh.dmat;

        for(var i=0; i<N; i++){
            let lx = Lmat[i*3+0]/2;
            let ly = Lmat[i*3+1]/2;
            let lz = Lmat[i*3+2]/2;
            let dx = dmat[i*3+0];
            let dy = dmat[i*3+1];
            let dz = dmat[i*3+2];
            
            let wallShape = RAPIER.ColliderDesc.cuboid(lx, ly, lz)
                            .setTranslation(dx, dy, dz).setMass(1).setRestitution(0.0).setFriction(0.0)
            let col = world.createCollider(wallShape, wallBody);
            col.build_id = build.build_id;
            build.collider.push(col);
        }

        if(N==0){
            //console.log("build.buildMesh:", build.buildMesh);
            let vertices = build.buildMesh.children[0].geometry.attributes.position.array;
            let indices = build.buildMesh.children[0].geometry.attributes.index.array;
            const wallShape = RAPIER.ColliderDesc.trimesh(vertices, indices).setMass(1).setRestitution(0.0).setFriction(0.0)
            const col = world.createCollider(wallShape, wallBody);
            col.build_id = build.build_id;
            build.collider.push(col);
        }

        //if(dirType == "x"){
            /*let a = -Math.PI/2
            let w = Math.cos(a/2)
            let x = 0.0
            let y = 1.0*Math.sin(a/2)
            let z = 0.0
            console.log("quat:", [x,y,z,w]);*/

            let q = build.buildMesh.quaternion;
            console.log("q", q);
            //console.log("build.buildMesh", build.buildMesh);
            let x = q.x;
            let y = q.y;
            let z = q.z;
            let w = q.w;

            wallBody.setRotation({ w: w, x: x, y: y, z: z })
            // const quat = RAPIER.Quat.fromAxisAngle(RAPIER.Vec3.X(), Math.PI / 2); // 90 degrees around X-axis
            // rigidBody.setRotation(quat);
        //}

    }

    function mCreateFloorEditCollider(build){

        let px = build.position.x;
        let py = build.position.y;
        let pz = build.position.z;

        build.collider = [];
        let floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))

        let N = build.buildMesh.N;
        let Lmat = build.buildMesh.Lmat;
        let dmat = build.buildMesh.dmat;

        for(var i=0; i<N; i++){
            let lx = Lmat[i*3+0]/2;
            let ly = Lmat[i*3+1]/2;
            let lz = Lmat[i*3+2]/2;
            let dx = dmat[i*3+0];
            let dy = dmat[i*3+1];
            let dz = dmat[i*3+2];
            
            let floorShape = RAPIER.ColliderDesc.cuboid(lx, ly, lz)
                            .setTranslation(dx, dy, dz).setMass(1).setRestitution(0.0).setFriction(0.0)
            let col = world.createCollider(floorShape, floorBody);
            col.build_id = build.build_id;
            build.collider.push(col);
        }
        
        let q = build.buildMesh.quaternion;
        console.log("q", q);
        //console.log("build.buildMesh", build.buildMesh);
        let x = q.x;
        let y = q.y;
        let z = q.z;
        let w = q.w;

        floorBody.setRotation({ w: w, x: x, y: y, z: z })
        
    }

    function mCreateSlopeEditCollider(build){

        let px = build.position.x;
        let py = build.position.y;
        let pz = build.position.z;

        build.collider = [];
        let slopeBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))

        let N = build.buildMesh.N;
        let Lmat = build.buildMesh.Lmat;
        let dmat = build.buildMesh.dmat;

        for(var i=0; i<N; i++){
            let lx = Lmat[i*3+0]/2;
            let ly = Lmat[i*3+1]/2;
            let lz = Lmat[i*3+2]/2;
            let dx = dmat[i*3+0];
            let dy = dmat[i*3+1];
            let dz = dmat[i*3+2];
            
            let slopeShape = RAPIER.ColliderDesc.cuboid(lx, ly, lz)
                            .setTranslation(dx, dy, dz).setMass(1).setRestitution(0.0).setFriction(0.0)
            let col = world.createCollider(slopeShape, slopeBody);
            col.build_id = build.build_id;
            build.collider.push(col);
        }
        
        let q = build.buildMesh.quaternion;
        console.log("q", q);
        //console.log("build.buildMesh", build.buildMesh);
        let x = q.x;
        let y = q.y;
        let z = q.z;
        let w = q.w;

        slopeBody.setRotation({ w: w, x: x, y: y, z: z })   
    }

    function mCreateConeEditCollider(build){

        let px = build.position.x;
        let py = build.position.y;
        let pz = build.position.z;

        build.collider = [];
        let coneBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))

        let N = build.buildMesh.N;
        let Lmat = build.buildMesh.Lmat;
        let dmat = build.buildMesh.dmat;

        for(var i=0; i<N; i++){
            let lx = Lmat[i*3+0]/2;
            let ly = Lmat[i*3+1]/2;
            let lz = Lmat[i*3+2]/2;
            let dx = dmat[i*3+0];
            let dy = dmat[i*3+1];
            let dz = dmat[i*3+2];
            
            let coneShape = RAPIER.ColliderDesc.cuboid(lx, ly, lz)
                            .setTranslation(dx, dy, dz).setMass(1).setRestitution(0.0).setFriction(1.0)
            let col = world.createCollider(coneShape, coneBody);
            col.build_id = build.build_id;
            build.collider.push(col);
        }

        if(N==0){
            console.log("build.buildMesh:", build.buildMesh);
            let vertices = build.buildMesh.children[0].geometry.attributes.position.array;
            let indices = build.buildMesh.children[0].geometry.attributes.index.array;
            const coneShape = RAPIER.ColliderDesc.trimesh(vertices, indices).setMass(1).setRestitution(0.0).setFriction(1.0)
            const col = world.createCollider(coneShape, coneBody);
            col.build_id = build.build_id;
            build.collider.push(col);
        }
       
        let q = build.buildMesh.quaternion;
        console.log("q", q);
        //console.log("build.buildMesh", build.buildMesh);
        let x = q.x;
        let y = q.y;
        let z = q.z;
        let w = q.w;

        coneBody.setRotation({ w: w, x: x, y: y, z: z })
        
    }


    onResize();
    window.addEventListener('resize', onResize);
    function onResize() {
        width = document.getElementById('main_canvas').getBoundingClientRect().width;
        height = document.getElementById('main_canvas').getBoundingClientRect().height;

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);

        renderer.getSize(resolution);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        //console.log(width);

        mDraw2Dcontext()
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
        }, 1000);
    }
    
    //---Description
    function mDraw2Dcontext(){
        //const canvas2d = document.querySelector( '#canvas-2d' );
        var W_ = canvas2d.width;
        var H_ = canvas2d.height;
        console.log("canvas2d:"+W_+", "+H_)
        canvas2d.setAttribute("width", width);
        canvas2d.setAttribute("height", height);
        W_ = canvas2d.width;
        H_ = canvas2d.height;
        console.log("canvas2d:"+W_+", "+H_)

        const context2d = canvas2d.getContext('2d');
        let fontSize = W_/100;
        context2d.font = fontSize + 'px Bold Arial';
        context2d.fillStyle = "white"
        //context2d.textAlign = "center"
        let array_string = [
            "Click view: pointer lock",
            "WASD: move",
            "Space: jump",
            "Shift: crouch",
            "Shift(long): slide",
            "Mouse move: view direction", 
            "Left click: shoot", 
            "Right click: ADS",
            "F: weapon mode", 
            "Q: wall", 
            "Z or wheel down: floor", 
            "C or wheel up: slope",
            "TAB: cone",
            "E: edit",
            "Right click: reset edit",
            "* Edit release on *",
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
    mDraw2Dcontext()

}//init