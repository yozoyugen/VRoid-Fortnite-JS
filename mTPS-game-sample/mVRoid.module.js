import * as THREE from 'three';
//import * as THREE from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { VRMLoaderPlugin, MToonMaterialLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { MToonNodeMaterial } from '@pixiv/three-vrm/nodes';
import { createVRMAnimationClip, VRMAnimationLoaderPlugin, VRMLookAtQuaternionProxy } from "@pixiv/three-vrm-animation";

console.log("mVRoid.module.js")

const textureLoader = new THREE.TextureLoader();

const loaderGLTF = new GLTFLoader(); //THREE.GLTFLoader();
loaderGLTF.crossOrigin = 'anonymous';

loaderGLTF.register( ( parser ) => {

    // mtoom material requires webGPUrenderer
    /*const mtoonMaterialPlugin = new MToonMaterialLoaderPlugin( parser, {
        materialType: MToonNodeMaterial,
    } );
    return new VRMLoaderPlugin( parser, {
        mtoonMaterialPlugin,
    } );*/

    return new VRMLoaderPlugin(parser);
} );

loaderGLTF.register( ( parser ) => {
    return new VRMAnimationLoaderPlugin( parser );
} );


//let array_gltfVrm = [];
let modelURL = ['./model/669239405689726719.vrm',
                './model/darkness000.vrm',
                './model/shibu000.vrm',
                './model/3658448283550216100.vrm',
                './model/lowPoly_15k_5M.vrm',
];
// './model/3658448283550216100mdf.vrm' -> transparency dose not work because it exported by Blender

//for(var i=0; i<modelURL.length; i++){
//    const gltfVrm = await loaderGLTF.loadAsync( modelURL[i] );
//    array_gltfVrm.push(gltfVrm);
//    console.log(array_gltfVrm[i]);
//}


let array_url = [ // 
        './model/vrma/Idle-m.vrma',  //0
        './model/vrma/RifleRun-m.vrma',
        './model/vrma/RifleRunBack-m.vrma',
        './model/vrma/RifleStrafeLeft-m.vrma',
        './model/vrma/RifleStrafeRight-m.vrma',
        './model/vrma/JumpingUp-m.vrma',
        './model/vrma/MaleCrouchPose-m.vrma',
        './model/vrma/CrouchWalkForward-m.vrma',
        './model/vrma/CrouchWalkBack-m.vrma',
        './model/vrma/CrouchWalkLeft-m.vrma',
        './model/vrma/CrouchWalkLeft-m.vrma', //10
        './model/vrma/RunningSlide-m.vrma',
        './model/vrma/AxeSwing-m.vrma',
        './model/vrma/AxeEquip-m.vrma',
        './model/vrma/Damage-m.vrma',
        './model/vrma/Dying-m.vrma', //15
        './model/vrma/Reloading-m.vrma',
        './model/vrma/GangnamStyle-m.vrma',
        './model/vrma/DancingRunningMan-m.vrma',
    ] 

//let arrayGltfVrma = [];
//for(var i = 0; i < array_url.length; i++){
//    const gltfVrma = await loaderGLTF.loadAsync( array_url[i] );
    //console.log( gltfVrma );
//    arrayGltfVrma.push( gltfVrma );
//}

//console.log("vrm model is ready");


async function mCreateVRM(characterType=0){

    console.log("mVRoid::mCreateVRM")

    //setTimeout(() => {}, 3000);

    //const loaderGLTF = new GLTFLoader(); //THREE.GLTFLoader();
    //loaderGLTF.crossOrigin = 'anonymous';
        /*
    loaderGLTF.register( ( parser ) => {
        const mtoonMaterialPlugin = new MToonMaterialLoaderPlugin( parser, {
            materialType: MToonNodeMaterial,
        } );
        return new VRMLoaderPlugin( parser, {
            mtoonMaterialPlugin,
        } );
    } );

    loaderGLTF.register( ( parser ) => {
        return new VRMAnimationLoaderPlugin( parser );
    } );
     */

    //const gltfVrm = await loaderGLTF.loadAsync( './model/669239405689726719.vrm' );
    //const gltfVrm = await loaderGLTF.loadAsync( './model/3658448283550216100.vrm' );
    const gltfVrm = await loaderGLTF.loadAsync( modelURL[characterType] );
    //const gltfVrm = array_gltfVrm[characterType]
    console.log("gltfVrm", gltfVrm);

    /*
    let array_url = [ // 
            './model/vrma/Idle-m.vrma',  //0
            './model/vrma/RifleRun-m.vrma',
            './model/vrma/RifleRunBack-m.vrma',
            './model/vrma/RifleStrafeLeft-m.vrma',
            './model/vrma/RifleStrafeRight-m.vrma',
            './model/vrma/JumpingUp-m.vrma',
            './model/vrma/MaleCrouchPose-m.vrma',
            './model/vrma/CrouchWalkForward-m.vrma',
            './model/vrma/CrouchWalkBack-m.vrma',
            './model/vrma/CrouchWalkLeft-m.vrma',
            './model/vrma/CrouchWalkLeft-m.vrma', //10
            './model/vrma/RunningSlide-m.vrma',
            './model/vrma/AxeSwing-m.vrma',
            './model/vrma/AxeEquip-m.vrma',
        ] */

    let arrayGltfVrma = [];
    for(var i = 0; i < array_url.length; i++){
        const gltfVrma = await loaderGLTF.loadAsync( array_url[i] );
        //console.log( gltfVrma );
        arrayGltfVrma.push( gltfVrma );
    }
    
    

    let mScale = 1;
    let model_scale_vrm = mScale / 1 * 1.0; //1.1;
    if(characterType==2){
        model_scale_vrm = mScale / 1 * 1.3;
    }
    const vrm = gltfVrm.userData.vrm;
    let modelVRM = vrm.scene;

    // calling these functions greatly improves the performance
    //VRMUtils.removeUnnecessaryVertices( vrm.scene );
    //VRMUtils.removeUnnecessaryJoints( vrm.scene );

    modelVRM.scale.set(model_scale_vrm, model_scale_vrm, model_scale_vrm)
    //modelVRM.position.set(0, -playerRadius*2.5, 0);
    modelVRM.rotation.y = Math.PI
    modelVRM.castShadow = true;
    modelVRM.name = "Player"


    // Disable frustum culling
    modelVRM.traverse( ( obj ) => {
        obj.frustumCulled = false;
        if ( obj.isMesh ) {
            obj.castShadow = true;
            //obj.receiveShadow = true;
        }
    } );

    let spjoint = vrm.springBoneManager._joints;
    //console.log( "spjoint", spjoint );
    //console.log( spjoint.size );

    spjoint.forEach((element) => {
        //console.log(element)
        //console.log(element.settings)
        //element.settings.dragForce = element.settings.dragForce * 100 //-> x
        element.settings.stiffness = element.settings.stiffness * model_scale_vrm;
        //element.settings.hitRadius *= 0.5;
        element.settings.gravityPower = 1.0;
        //console.log(element.settings)
    });

    // Add look at quaternion proxy to the VRM; which is needed to play the look at animation
    const lookAtQuatProxy = new VRMLookAtQuaternionProxy( vrm.lookAt );
    lookAtQuatProxy.name = 'lookAtQuaternionProxy';
    modelVRM.add( lookAtQuatProxy );
    console.log( vrm );


    // weapon
    const fbxloader = new FBXLoader();
    let weaponMesh = new THREE.Group();
    weaponMesh.name = "Weapon";

    // muzzle flash
    //const textureLoader = new THREE.TextureLoader();
    const flashTexture = textureLoader.load('/mTPS-game-sample/image/flash2.png');
    let flashMaterial = new THREE.MeshBasicMaterial({map: flashTexture, side:THREE.DoubleSide});
    flashMaterial.opacity = 0.99;
    flashMaterial.transparent = true;
    flashMaterial.depthWrite = false; // This solved problem of transparancy texture's drawing distance
    let flashMesh = new THREE.Mesh( new THREE.PlaneGeometry( 1300, 764 ), flashMaterial);
    //flashMesh.scale.set(10, 10, 10);
    flashMesh.scale.set(0.002, 0.002, 0.002);
    flashMesh.rotation.y = Math.PI/2;
    flashMesh.name = "Flash" 
    flashMesh.visible = false;

    fbxloader.load( 'model/Scar_resize1M.fbx', function ( object ) {  //Scar_11M, Scar_resize3M

        console.log("weapon:%o", object);

        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                //child.receiveShadow = true;
            }
        } );
        //let w_scale = 0.01 / mScale;
        let w_scale = 0.0001 / mScale;
        object.scale.set(w_scale, w_scale, w_scale);

        //object.rotation.y = Math.PI/2;
        //object.rotation.z = -Math.PI/2;
        object.rotation.set( Math.PI*0.04*0, Math.PI/2 *1, -Math.PI/2,"YZX")
        //object.rotation.set( -Math.PI/2*1.0, Math.PI/2*1, Math.PI*0.01,"ZXY")
        //object.rotation.set( -Math.PI/2*0, Math.PI/2*0, 0,"XYZ")
        //object.position.set(0.17, -0.01, -0.04);
        object.position.set(0.2, -0.0, 0.1);
        object.name = "Scar"

        /*let muzzlePos = new THREE.Group();
        muzzlePos.name = "MuzzlePos";
        muzzlePos.position.set(180*mScale, 1900*mScale, 3800*mScale);
            //let mesh = new THREE.Mesh(new THREE.SphereGeometry(100*mScale), new THREE.MeshBasicMaterial({color: 'orange'}))
            //muzzlePos.add(mesh);
        object.add(muzzlePos);
        //muzzlePos.visible = false;

        muzzlePos.add(flashMesh); */

        weaponMesh.add(object)
        //weaponMesh.visible = false;
        
    } );

    let muzzlePos = new THREE.Group();
    muzzlePos.name = "MuzzlePos";
    muzzlePos.position.set(0.6, 0, -0.1);
        //let mesh = new THREE.Mesh(new THREE.SphereGeometry(100*mScale), new THREE.MeshBasicMaterial({color: 'orange'}))
        //muzzlePos.add(mesh);
    weaponMesh.add(muzzlePos);
    //muzzlePos.visible = false;

    muzzlePos.add(flashMesh);


    fbxloader.load( 'model/shotgun.fbx', function ( object ) {  

        console.log("weapon:%o", object);

        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                //child.receiveShadow = true;
                child.material.side = THREE.DoubleSide;
            }
        } );
        let w_scale = 0.001 / mScale;
        //let w_scale = 0.0001 / mScale;
        object.scale.set(w_scale, w_scale, w_scale);

        //object.position.set(0.2, -0.2, -0.03);
        object.position.set(0.2, -0.03, 0.18);
        object.rotation.set( -Math.PI/2, 0, 0,"XYZ")
        object.name = "Shotgun"

        weaponMesh.add(object)
        //weaponMesh.visible = false;
        
    } );


    fbxloader.load( 'model/Axe.fbx', function ( object ) {  //
        //console.log("weapon:%o", object);

        object.traverse( function ( child ) {
            //console.log("child:", child.name);
            if ( child.isMesh ) {
                child.castShadow = true;
                //child.receiveShadow = true;
                //console.log("child:", child.name);
                //child.material[0].side = THREE.DoubleSide;
                if(child.material.name=="HANDLE"){
                    //console.log("child.material:", child.material);
                    child.material.side = THREE.DoubleSide;
                    //console.log("child.material.side:", child.material.side);
                }
                //console.log("child.material:", child.material);
            }
            
        } );
        //let w_scale = 0.03 / scale;
        let w_scale = 0.00033;
        object.scale.set(w_scale, w_scale, w_scale);

        object.rotation.x = -Math.PI/2;
        object.position.set(0.07, -0.02, 0.15);
        object.name = "Axe"
        
        weaponMesh.add(object)
        //weaponMesh.visible = false;
        //scene.add( object );
        
    } );

    fbxloader.load( 'model/pensil.fbx', function ( object ) {  //
        //console.log("weapon:%o", object);

        object.traverse( function ( child ) {
            //console.log("child:", child.name);
            if ( child.isMesh ) {
                child.castShadow = true;
                //child.receiveShadow = true;
            }
            
        } );
        //let w_scale = 0.03 / scale;
        let w_scale = 0.0003 / mScale;
        object.scale.set(w_scale, w_scale, w_scale);

        object.rotation.z = Math.PI/2;
        object.position.set(0.055, -0.05, -0.04);
        object.name = "Pensil"
        
        weaponMesh.add(object)
        //weaponMesh.visible = false;
        //scene.add( object );
        
    } );

    // Blueprint
    //const textureLoader = new THREE.TextureLoader();
    const bpTexture = textureLoader.load('/mTPS-game-sample/image/fn_blueprint.jpg');
    let bpTempMaterial = new THREE.MeshBasicMaterial({map: bpTexture, side:THREE.DoubleSide});
    let bpMesh = new THREE.Mesh( new THREE.PlaneGeometry( 249*0.0015, 148*0.0015 ), bpTempMaterial);
    bpMesh.position.set(0.03, -0.03, 0.0);
    bpMesh.rotation.set( Math.PI/2, 0, Math.PI/2, "XZY")
    bpMesh.receiveShadow = true;
    bpMesh.name = "BluePrint"

    //weaponMesh.add(bpMesh)
    //scene.add(bpMesh)
    vrm.scene.traverse( ( obj ) => {
        if ( obj.name == "Normalized_J_Bip_L_Hand" ) {
            obj.add(bpMesh)
        }
    } );

    vrm.scene.traverse( ( obj ) => {
        if ( obj.name == "Normalized_J_Bip_R_Hand" ) {
            obj.add(weaponMesh)
        }
    } );

    console.log("weaponMesh:", weaponMesh)



    // load VRMA
    let arrayActionVRM = [];
    let mixerVRM = new THREE.AnimationMixer( modelVRM );
    console.log("VRM object.animations.length:"+arrayGltfVrma.length)
    for(var i = 0; i < arrayGltfVrma.length; i++){  //array_url.length
        let gltfVrma = arrayGltfVrma[i];
        console.log( gltfVrma );
        const vrmAnimation = gltfVrma.userData.vrmAnimations[ 0 ];

        if(i==11){ // modify sliding as in place
            //console.log( vrmAnimation.humanoidTracks.translation.get("hips").values );
            let hips_move = vrmAnimation.humanoidTracks.translation.get("hips").values;
            for(var j=0; j<hips_move.length/3; j++){
                hips_move[j*3+2] = 0.0;
            }
            //console.log( vrmAnimation.humanoidTracks.translation.get("hips").values );
        }

        let clip = createVRMAnimationClip( vrmAnimation, vrm );
        if(i==11){ // change duration of sliding
            clip = THREE.AnimationUtils.subclip(clip, 'Slide', 1, 27);
        }else if(i==14){
            clip = THREE.AnimationUtils.subclip(clip, 'Slide', 1, 15);
        }
        arrayActionVRM.push( mixerVRM.clipAction( clip ) );
    }

   
    mBindAnimationBones(arrayActionVRM, targetBones, "exclude");

    let a = [arrayActionVRM[16]];
    mBindAnimationBones(a, targetBones, "include");

    arrayActionVRM[0].play();

    arrayActionVRM[5].setLoop(THREE.LoopOnce);
    arrayActionVRM[5].clampWhenFinished = true;

    let c_crouch = 1.5;
    arrayActionVRM[7].timeScale = c_crouch;
    arrayActionVRM[8].timeScale = c_crouch;
    arrayActionVRM[9].timeScale = c_crouch;
    arrayActionVRM[10].timeScale = -c_crouch;

    arrayActionVRM[11].setLoop(THREE.LoopOnce);
    arrayActionVRM[11].clampWhenFinished = true;

    arrayActionVRM[12].timeScale = 2.25 * 1.8;
    arrayActionVRM[12].setLoop(THREE.LoopOnce);
    arrayActionVRM[12].clampWhenFinished = true;

    arrayActionVRM[13].timeScale = 2.25 * 1.8;
    arrayActionVRM[13].setLoop(THREE.LoopOnce);
    arrayActionVRM[13].clampWhenFinished = true;

    arrayActionVRM[14].setLoop(THREE.LoopOnce);
    arrayActionVRM[14].clampWhenFinished = true;
    arrayActionVRM[14].weight = 0.3;

    arrayActionVRM[15].setLoop(THREE.LoopOnce);
    arrayActionVRM[15].clampWhenFinished = true;


    console.log("mVRoid::mCreateVRM END")

    return {vrm: vrm, arrayActionVRM: arrayActionVRM, mixerVRM:mixerVRM};
}


let targetBones = [
    //"Normalized_J_Bip_C_Hips",
    //"Normalized_J_Bip_C_Spine",
    //"Normalized_J_Bip_C_Chest",
    //"Normalized_J_Bip_C_UpperChest",
    //"Normalized_J_Bip_C_Neck",
    //"Normalized_J_Bip_C_Head",
    "Normalized_J_Bip_L_Shoulder",
    "Normalized_J_Bip_L_UpperArm",
    "Normalized_J_Bip_L_LowerArm",
    "Normalized_J_Bip_L_Hand",
    "Normalized_J_Bip_L_Thumb1",
    "Normalized_J_Bip_L_Thumb2",
    "Normalized_J_Bip_L_Index1",
    "Normalized_J_Bip_L_Index2",
    "Normalized_J_Bip_L_Middle1",
    "Normalized_J_Bip_L_Middle2",
    "Normalized_J_Bip_L_Ring1",
    "Normalized_J_Bip_L_Ring2",
    "Normalized_J_Bip_L_Little1",
    "Normalized_J_Bip_L_Little2",
    "Normalized_J_Bip_R_Shoulder",
    "Normalized_J_Bip_R_UpperArm",
    "Normalized_J_Bip_R_LowerArm",
    "Normalized_J_Bip_R_Hand",
    "Normalized_J_Bip_R_Thumb1",
    "Normalized_J_Bip_R_Thumb2",
    "Normalized_J_Bip_R_Index1",
    "Normalized_J_Bip_R_Index2",
    "Normalized_J_Bip_R_Middle1",
    "Normalized_J_Bip_R_Middle2",
    "Normalized_J_Bip_R_Ring1",
    "Normalized_J_Bip_R_Ring2",
    "Normalized_J_Bip_R_Little1",
    "Normalized_J_Bip_R_Little2",
];


let LfingerBones = [
    "Normalized_J_Bip_L_Thumb1",
    "Normalized_J_Bip_L_Thumb2",
    "Normalized_J_Bip_L_Thumb3",
    "Normalized_J_Bip_L_Index1",
    "Normalized_J_Bip_L_Index2",
    "Normalized_J_Bip_L_Index3",
    "Normalized_J_Bip_L_Middle1",
    "Normalized_J_Bip_L_Middle2",
    "Normalized_J_Bip_L_Middle3",
    "Normalized_J_Bip_L_Ring1",
    "Normalized_J_Bip_L_Ring2",
    "Normalized_J_Bip_L_Ring3",
    "Normalized_J_Bip_L_Little1",
    "Normalized_J_Bip_L_Little2",
    "Normalized_J_Bip_L_Little3",
]

let RfingerBones = [
    "Normalized_J_Bip_R_Thumb1",
    "Normalized_J_Bip_R_Thumb2",
    "Normalized_J_Bip_R_Thumb3",
    "Normalized_J_Bip_R_Index1",
    "Normalized_J_Bip_R_Index2",
    "Normalized_J_Bip_R_Index3",
    "Normalized_J_Bip_R_Middle1",
    "Normalized_J_Bip_R_Middle2",
    "Normalized_J_Bip_R_Middle3",
    "Normalized_J_Bip_R_Ring1",
    "Normalized_J_Bip_R_Ring2",
    "Normalized_J_Bip_R_Ring3",
    "Normalized_J_Bip_R_Little1",
    "Normalized_J_Bip_R_Little2",
    "Normalized_J_Bip_R_Little3",
];


function mBindAnimationBones(actions, bones, type="include"){
    for(var i = 0; i < actions.length; i++){

        if( i>=12 ){
            //return;
            continue;
        }

        const filteredBindings = [];
        const filteredInterpolants = [];
        const bindings = actions[i]._propertyBindings || [];
        const interpolants = actions[i]._interpolants || [];

        bindings.forEach((propertyMixer, index) => {
            const { binding } = propertyMixer;

            if (binding && binding.node && bones.includes(binding.node.name)) {
                if(type==="include"){
                    filteredBindings.push(propertyMixer);
                    filteredInterpolants.push(interpolants[index]);
                    //console.log("inculde:", binding.node.name);
                }
            }else{
                if(type==="exclude"){
                    filteredBindings.push(propertyMixer);
                    filteredInterpolants.push(interpolants[index]);
                    //console.log("exculde:", binding.node.name);
                }
            }
        });

        //console.log("filteredBindings.length:", filteredBindings.length);
        //console.log("filteredInterpolants.length:", filteredInterpolants.length);
        actions[i]._propertyBindings = filteredBindings;
        actions[i]._interpolants = filteredInterpolants;

    }//

}


function mSetPlayerAnimation(player, d){

    if(player.vrm == null){
        return
    }

    if( player.model.getObjectByName("Shotgun") == null ||
        player.model.getObjectByName("Scar") == null ||
        player.model.getObjectByName("Axe") == null ||
        player.model.getObjectByName("Pensil") == null ||
        player.model.getObjectByName("BluePrint") == null ){
        //console.log("Scar is null")

        return
    }

    player.model.getObjectByName("Shotgun").visible = false;
    player.model.getObjectByName("Scar").visible = false;
    player.model.getObjectByName("Axe").visible = false;
    player.model.getObjectByName("Pensil").visible = false;
    player.model.getObjectByName("BluePrint").visible = false;

    if(player.mode==1){
        if(player.weapon==0){
            player.model.getObjectByName("Axe").visible = true;
        }else if(player.weapon==1){
            player.model.getObjectByName("Shotgun").visible = true;
        }else if(player.weapon==2){
            player.model.getObjectByName("Scar").visible = true;
        }
    }else if(player.mode==2 || player.mode==3){
        player.model.getObjectByName("Pensil").visible = true;
        player.model.getObjectByName("BluePrint").visible = true;
    }



    if (player.mixerVRM) {
           
        if( player.isGrounded ){
            //if(arrayAction[5].isRunning()){ // x -> clampWhenFinished
                player.arrayAction[5].stop();
            //}
        }else{
            if(player.arrayAction[0].isRunning()){
                player.arrayAction[0].stop();
            }
            if(!player.arrayAction[5].isRunning()){
                player.arrayAction[5].play();
            }
        }

        

        //console.log("c_player.isGrounded:"+c_player.isGrounded)
        //console.log("currentTime:" + currentTime +" lastGroundedTime:"+lastGroundedTime) 
        
        if( (!player.movement.forward) && (!player.movement.back) && (!player.movement.left) && (!player.movement.right) ){
            if(!player.isCrouch){
                if(player.arrayAction[6].isRunning()){
                    player.arrayAction[6].stop();
                }
                if(!player.arrayAction[0].isRunning()){
                    player.arrayAction[0].play();
                }
            }else{
                //console.log("crouch")
                if(player.arrayAction[0].isRunning()){
                    player.arrayAction[0].stop();
                }
                if(!player.arrayAction[6].isRunning()){
                    player.arrayAction[6].play();
                }
            }
        }else{
            player.arrayAction[0].stop();
            player.arrayAction[6].stop();
        }

        if(player.movement.forward){
            if(!player.isCrouch){
                player.arrayAction[7].stop();
                player.arrayAction[1].play();
            }else{
                player.arrayAction[1].stop();
                player.arrayAction[7].play();
            }
        }else{
            player.arrayAction[1].stop();
            player.arrayAction[7].stop();
        }

        if(player.movement.back){
            //arrayAction[2].play();
            if(!player.isCrouch){
                player.arrayAction[8].stop();
                player.arrayAction[2].play();
            }else{
                player.arrayAction[2].stop();
                player.arrayAction[8].play();
            }
        }else{
            player.arrayAction[2].stop();
            player.arrayAction[8].stop();
        }

        if( player.movement.left && !player.movement.forward && !player.movement.back){
            //arrayAction[3].play();
            if(!player.isCrouch){
                player.arrayAction[9].stop();
                player.arrayAction[3].play();
            }else{
                player.arrayAction[3].stop();
                player.arrayAction[9].play();
            }
        }else{
            player.arrayAction[3].stop();
            player.arrayAction[9].stop();
        }

        if( player.movement.right && !player.movement.forward && !player.movement.back){
            //arrayAction[4].play();
            if(!player.isCrouch){
                player.arrayAction[10].stop();
                player.arrayAction[4].play();
            }else{
                player.arrayAction[4].stop();
                player.arrayAction[10].play();
            }
        }else{
            player.arrayAction[4].stop();
            player.arrayAction[10].stop();
        }   

        //console.log('c_player.isSliding:'+c_player.isSliding);
        /*if( current_game_time > c_player.slidingPressedTime + 300 && c_player.slidingPressedTime > 0 ){
            if( !c_player.isSliding ){
                console.log('sliding play');
                mPlayAudioBuffer(mArrayAudio[3], 1, false);
            }
            c_player.isSliding = true;
            mSetPlayerColliderCrouch(true)
            //c_player.slidingPressedTime = -1;
        }*/


        if(player.isSliding){
            //console.log('c_player.isSliding:'+c_player.isSliding);
            player.arrayAction[1].stop();
            if(!player.arrayAction[11].isRunning()){
                player.arrayAction[11].play();
            }
            //mSetPlayerColliderCrouch(true)
        }else{
            //console.log('c_player.isSliding:'+c_player.isSliding);
            player.arrayAction[11].stop();
            //if(!c_player.isCrouch){
                //mSetPlayerColliderCrouch(false)
            //}
            
        }

        if( player.mode == 1 && player.weapon == 0 && player.isFiring && player.weaponIsReady){
            //console.log("swing");
            player.arrayAction[12].play();
            //player.vrm.update( d );
            //return;
        }
        if( player.arrayAction[12].isRunning() && ( player.mode != 1 || player.weapon != 0 ) ){
            player.arrayAction[12].stop();
        }

        if( player.weaponChange && (player.weapon == 0 || player.weapon == 1 || player.weapon == 2) ){
            //console.log("axe equip");
            player.weaponChange = false;
            //if( player.arrayAction[13].isRunning() ){

            //}
            player.arrayAction[13].stop();
            player.arrayAction[13].play();
        }

        if( player.receivedDamage  ){
            console.log("receivedDamage");
            player.receivedDamage = false;
            if(!player.isFiring){
                player.arrayAction[14].stop();
                player.arrayAction[14].play();
            }
        }

        if( player.nowReloading ){
            player.arrayAction[16].play();
        }else{
            player.arrayAction[16].stop();
        }

        if( player.isEmote && player.emoteIndex == 0 ){
            player.arrayAction[0].stop();
            player.arrayAction[17].play();
        }else{
            player.arrayAction[17].stop();
        }

        if( player.isEmote && player.emoteIndex == 1 ){
            player.arrayAction[0].stop();
            player.arrayAction[18].play();
        }else{
            player.arrayAction[18].stop();
        }

        if( player.health <= 0  ){
            //console.log("dead");
            for(var i=0; i<player.arrayAction.length; i++){
                if(i!=15){
                    player.arrayAction[i].stop();
                }
            }            
            player.arrayAction[15].play();
        }



        /*for(var i=0; i<player.arrayAction.length; i++){
            if(player.arrayAction[i]){
                if(player.arrayAction[i].isRunning()){
                    console.log("arrayAction["+i+"]:"+player.arrayAction[i].isRunning() );
                }
            }  
        }*/

        player.mixerVRM.update( d );

        if( player.arrayAction[12].isRunning() ){
            player.vrm.update( d );
            return;
        }else{
            player.arrayAction[12].stop();
        }

        if( player.arrayAction[13].isRunning() ){
            player.vrm.update( d );
            return;
        }else{
            player.arrayAction[13].stop();
        }

        if( player.arrayAction[14].isRunning() ){
            player.vrm.update( d );
            return;
        }else{
            player.arrayAction[14].stop();
        }

        if( player.arrayAction[15].isRunning() ){
            player.vrm.update( d );
            return;
        }else{
            //player.arrayAction[15].stop();
        }

        if( player.arrayAction[16].isRunning() ){
            player.vrm.update( d );
            return;
        }else{
            player.arrayAction[16].stop();
        }

        if( player.arrayAction[17].isRunning() ){
            player.vrm.update( d );
            return;
        }else{
            player.arrayAction[17].stop();
        }

        if( player.arrayAction[18].isRunning() ){
            player.vrm.update( d );
            return;
        }else{
            player.arrayAction[18].stop();
        }


        let vrm = player.vrm;
        let weaponMesh = vrm.scene.getObjectByName("Weapon")

        //--- Manually modify
        for(var i = 0; i < targetBones.length; i++){
            let bone = vrm.scene.getObjectByName(targetBones[i])
            bone.rotation.set( 0, 0, 0,"XYZ")
        }//

        for(var i = 3; i < LfingerBones.length; i++){
            let bone = vrm.scene.getObjectByName(LfingerBones[i])
            //console.log("bone:", bone.name)
            bone.rotation.set( 0, 0, Math.PI/4,"ZYX")
        }
        for(var i = 3; i < RfingerBones.length; i++){
            let bone = vrm.scene.getObjectByName(RfingerBones[i])
            bone.rotation.set( 0, 0, -Math.PI/4,"ZYX")
        }

        if(!player.isCrouch){
            if(player.movement.forward){
                let bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                bone.rotation.set( 0, Math.PI/2*0.2, 0,"XYZ")
            }else if(player.movement.back){//back
                let bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                bone.rotation.set( 0, Math.PI/2/2, 0,"XYZ")
            }else if(player.movement.left && !player.movement.forward && !player.movement.back){
                let bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                bone.rotation.set( 0, Math.PI/2/2, 0,"XYZ")
            }else if(player.movement.right && !player.movement.forward && !player.movement.back){
                let bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                bone.rotation.set( 0, Math.PI/2/2, 0,"XYZ")
            }
        }

        if(player.mode==1 && player.weapon==0){
            player.model.getObjectByName("Axe").visible = true;
            
            let bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_UpperArm")
            bone.rotation.set( 0, 0, -Math.PI/2*0.8,"ZYX")
            
            bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_LowerArm")
            bone.rotation.set( 0, Math.PI/2*0.3, 0,"YXZ")
            
            bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Hand")
            bone.rotation.set( 0, 0, 0,"ZYX")

            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_UpperArm")
            bone.rotation.set( 0, 0, Math.PI/2*0.8,"ZYX")
            
            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_LowerArm")
            bone.rotation.set( 0, -Math.PI/2*0.3, 0,"YXZ")
            
            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Hand")
            bone.rotation.set( 0, 0, 0,"ZYX")

        }else if(player.mode==1 && (player.weapon==1 || player.weapon==2 ) && !player.isFiring && !player.isAiming){
            if(player.weapon==1){
                weaponMesh.getObjectByName("Shotgun").visible = true;
            }else if(player.weapon==2){
                weaponMesh.getObjectByName("Scar").visible = true;
            }
            
            let bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_UpperArm")
            bone.rotation.set( 0, Math.PI/2*0.5, -Math.PI/2*0.7,"YZX")

            bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_LowerArm")
            bone.rotation.set( Math.PI/2*0.5, Math.PI/2*1.0, 0,"YXZ")

            bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Hand")
            bone.rotation.set( 0, Math.PI/2*0.0, -Math.PI/2*0.2,"ZYX")
            

            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_UpperArm")
            bone.rotation.set( 0, -Math.PI/2*0.3, Math.PI/2*0.8,"ZYX")
            
            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_LowerArm")
            bone.rotation.set( Math.PI/2*0.2, -Math.PI/2*0.8, 0,"XYZ")

            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Hand")
            bone.rotation.set( Math.PI/2*0.5, 0, 0,"XYZ")

            //bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
            //bone.rotation.set( Math.PI/2*0.2, Math.PI/2*0.2, 0,"XYZ")	
					
		}else if(player.mode==1 && (player.weapon==1 || player.weapon==2 ) && (player.isFiring || player.isAiming ) ){
            if(player.weapon==1){
                weaponMesh.getObjectByName("Shotgun").visible = true;
            }else if(player.weapon==2){
                weaponMesh.getObjectByName("Scar").visible = true;
            }

            let bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_UpperArm")
            bone.rotation.set( 0, Math.PI/2*0.7, -Math.PI/2*0.0,"YZX")

            bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_LowerArm")
            bone.rotation.set( Math.PI/2*0.7, Math.PI/2*1.0, Math.PI/2*0.3,"YZX")

            bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Hand")
            bone.rotation.set( Math.PI/2*0.1, -Math.PI/2*0.2, Math.PI/2*0.4,"YZX")
            

            //bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Shoulder")
            //bone.rotation.set( Math.PI/2*0, -Math.PI/2*0, Math.PI/2*1.0,"XZY")
            
            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_UpperArm")
            bone.rotation.set( Math.PI/2*0.3, -Math.PI/2*1, Math.PI/2*0,"XYZ")
            
            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_LowerArm")
            bone.rotation.set( Math.PI/2*1.0, -Math.PI/2*0.0, Math.PI/2*0.1,"XZY")

            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Hand")
            bone.rotation.set( Math.PI/2*0.5, 0, 0,"XYZ")

            if(!player.isCrouch){
                if(player.movement.back){//back
                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Shoulder")
                    bone.rotation.set( -Math.PI/2*0.2, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Shoulder")
                    bone.rotation.set( -Math.PI/2*0.2, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_UpperChest")
                    bone.rotation.set( -Math.PI/2*0.25*0, Math.PI/2*0.3, 0,"YXZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                    bone.rotation.set( 0, 0, 0,"XYZ")
                }else if(player.movement.left && !player.movement.forward && !player.movement.back){ //left
                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Shoulder")
                    bone.rotation.set( -Math.PI/2*0.2, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Shoulder")
                    bone.rotation.set( -Math.PI/2*0.2, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_UpperChest")
                    bone.rotation.set( Math.PI/2*0.0, Math.PI/2*0.4, 0,"YXZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                    bone.rotation.set( 0, 0, 0,"XYZ")
                }else if(player.movement.right && !player.movement.forward && !player.movement.back){
                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Shoulder")
                    bone.rotation.set( -Math.PI/2*0.2, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Shoulder")
                    bone.rotation.set( -Math.PI/2*0.2, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_UpperChest")
                    bone.rotation.set( Math.PI/2*0.0, Math.PI/2*0.4, 0,"YXZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                    bone.rotation.set( 0, 0, 0,"XYZ")
                }
            }
            
            if(!player.isGrounded){
                bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Shoulder")
                bone.rotation.set( -Math.PI/2*0.0, Math.PI/2*0.0, 0,"XYZ")

                bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Shoulder")
                bone.rotation.set( -Math.PI/2*0.0, Math.PI/2*0.0, 0,"XYZ")

                bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_UpperChest")
                bone.rotation.set( Math.PI/2*0.0, Math.PI/2*0.2, 0,"YXZ")

                bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                bone.rotation.set( 0, 0, 0,"XYZ")
            }
            
            if(player.isCrouch){
                if(!player.movement.forward && !player.movement.back && !player.movement.left && !player.movement.right ){
                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Shoulder")
                    bone.rotation.set( Math.PI/2*0.2, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Shoulder")
                    bone.rotation.set( Math.PI/2*0.2, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_UpperChest")
                    bone.rotation.set( Math.PI/2*0.0, Math.PI/2*0.15, 0,"YXZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                    bone.rotation.set( 0, 0, 0,"XYZ")
                }else if(player.movement.forward){
                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Shoulder")
                    bone.rotation.set( Math.PI/2*0.3, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Shoulder")
                    bone.rotation.set( Math.PI/2*0.3, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_UpperChest")
                    bone.rotation.set( Math.PI/2*0.0, Math.PI/2*0.3, Math.PI/2*0.2,"YZX")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                    bone.rotation.set( 0, 0, 0,"XYZ")
                }else if(player.movement.back){
                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Shoulder")
                    bone.rotation.set( Math.PI/2*0.2, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Shoulder")
                    bone.rotation.set( Math.PI/2*0.2, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_UpperChest")
                    bone.rotation.set( Math.PI/2*0.0, Math.PI/2*0.45, Math.PI/2*0.2,"YZX")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                    bone.rotation.set( 0, 0, 0,"XYZ")
                }else if( (player.movement.left || player.movement.right) && !player.movement.forward && !player.movement.back){
                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Shoulder")
                    bone.rotation.set( Math.PI/2*0.3, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Shoulder")
                    bone.rotation.set( Math.PI/2*0.3, Math.PI/2*0.0, 0,"XYZ")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_UpperChest")
                    bone.rotation.set( Math.PI/2*0.0, Math.PI/2*0.3, Math.PI/2*0.2,"YZX")

                    bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                    bone.rotation.set( 0, 0, 0,"XYZ")
                }
            }
            
            
            if(player.isSliding){
                bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Shoulder")
                bone.rotation.set( Math.PI/2*0.0, Math.PI/2*0.0, 0,"XYZ")

                bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Shoulder")
                bone.rotation.set( Math.PI/2*0.0, Math.PI/2*0.0, 0,"XYZ")

                bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_UpperChest")
                bone.rotation.set( Math.PI/2*0.0, Math.PI/2*0.4, Math.PI/2*0.2,"YZX")

                bone = vrm.scene.getObjectByName("Normalized_J_Bip_C_Head")
                bone.rotation.set( 0, 0, 0,"XYZ")
            }

            if(true){
                let a = player.angle2;
                if(player.frontView){
                    a = -a;
                }
                bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Shoulder")
                bone.rotation.x += a;

                bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Shoulder")
                bone.rotation.x += a;
            }
            
        }else if(player.mode==2 || player.mode==3){
            weaponMesh.getObjectByName("Pensil").visible = true;
            vrm.scene.getObjectByName("BluePrint").visible = true;

            let bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_UpperArm")
            bone.rotation.set( 0, Math.PI/2*0.5, -Math.PI/2*0.8,"ZYX")
            
            bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_LowerArm")
            bone.rotation.set( 0, Math.PI/2*1, 0,"YXZ")
            
            bone = vrm.scene.getObjectByName("Normalized_J_Bip_R_Hand")
            bone.rotation.set( -Math.PI/2*0.5, 0, 0,"XYZ")

            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_UpperArm")
            bone.rotation.set( 0, -Math.PI/2*0.5, Math.PI/2*0.8,"ZYX")
            
            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_LowerArm")
            bone.rotation.set( 0, -Math.PI/2*1, -Math.PI/2*0.5,"YZX")
            
            bone = vrm.scene.getObjectByName("Normalized_J_Bip_L_Hand")
            bone.rotation.set( Math.PI/2*0.7, 0, 0,"XYZ")

        }
        

        player.vrm.update( d );
            
    }// mixer

}

console.log("mVRoid.module.js END")

export { 
    //loaderGLTF,
    //gltfVrm,
    //vrm,
    //arrayGltfVrma,
    //modelVRM,
    //arrayActionVRM,
    //mixerVRM,
    //weaponMesh,
    mCreateVRM,
    mSetPlayerAnimation,
};