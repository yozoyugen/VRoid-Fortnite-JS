import * as THREE from 'three';
//import * as THREE from 'three/webgpu';

import RAPIER from '@dimforge/rapier3d-compat';


let mScale = 1;
let grid_size = mScale*5;
let gridH_size = mScale*4;
let buildThick = grid_size*0.04;
let slope_ang = Math.acos(grid_size / Math.sqrt(grid_size*grid_size+gridH_size*gridH_size) )
let grid_num = 10;
let tol = 1E-5;

const textureLoader = new THREE.TextureLoader();
const buildTexture = textureLoader.load('/mTPS-game-sample/image/build.png');
const build1pTexture = textureLoader.load('/mTPS-game-sample/image/build1p.png');
const build2pTexture = textureLoader.load('/mTPS-game-sample/image/build2p.png');
const build4pTexture = textureLoader.load('/mTPS-game-sample/image/build4p.png');
const buildDoorTexture = textureLoader.load('/mTPS-game-sample/image/build-door.png');
const buildTempTexture = textureLoader.load('/mTPS-game-sample/image/build_temp.png');
let buildTempMaterial = new THREE.MeshBasicMaterial({map: buildTempTexture, side: THREE.DoubleSide});
buildTempMaterial.transparent = true;
buildTempMaterial.opacity = 0.7;
buildTempMaterial.depthWrite = false;

const editGridUnselectedTexture = textureLoader.load('/mTPS-game-sample/image/edit_grid_unselected.jpg');
//let editGridMaterial = new THREE.MeshBasicMaterial({color: "#1e90ff"}); //"deepskyblue"
let editGridMaterial = new THREE.MeshBasicMaterial({map: editGridUnselectedTexture}); //"deepskyblue"
const editGridSelectedTexture = textureLoader.load('/mTPS-game-sample/image/edit_grid_selected.jpg');
//let editGridSelectedMaterial = new THREE.MeshBasicMaterial({color: "lightgray"}); //"deepskyblue"
let editGridSelectedMaterial = new THREE.MeshBasicMaterial({map: editGridSelectedTexture}); //"deepskyblue"
const editSlopeGridUnselectedTexture = textureLoader.load('/mTPS-game-sample/image/edit_slope_grid_unselected.jpg');
let editSlopeGridUnSelectedMaterial = new THREE.MeshBasicMaterial({map: editSlopeGridUnselectedTexture}); 


function mInitBuildTemp(player){
    let Lx = grid_size
    let Ly = gridH_size
    let Lz = buildThick
    const zWallMesh = new THREE.Mesh(new THREE.BoxGeometry(Lx, Ly, Lz), buildTempMaterial)
    zWallMesh.position.set(Lx/2, Ly/2, Lz/2);
    zWallMesh.visible = false;
    player.zWallTemp = zWallMesh;
    //scene.add(player.zWallTemp);

    Lz = grid_size
    Lx = buildThick
    const xWallMesh = new THREE.Mesh(new THREE.BoxGeometry(Lx, Ly, Lz), buildTempMaterial)
    xWallMesh.position.set(Lx/2, Ly/2, Lz/2);
    xWallMesh.visible = false;
    player.xWallTemp = xWallMesh;
    //scene.add(player.xWallTemp);

    Lz = grid_size
    Lx = grid_size
    Ly = buildThick
    const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(Lx, Ly, Lz), buildTempMaterial)
    floorMesh.position.set(Lx/2, Ly/2, Lz/2);
    floorMesh.visible = false;
    player.FloorTemp = floorMesh;
    //scene.add(player.FloorTemp);

    let L = Math.sqrt(grid_size*grid_size+gridH_size*gridH_size)
    let a = Math.acos(grid_size/L)
    Lx = grid_size
    Ly = buildThick
    Lz = L
    const zSlopeMesh = new THREE.Mesh(new THREE.BoxGeometry(Lx, Ly, Lz), buildTempMaterial)
    zSlopeMesh.position.set(Lx/2, gridH_size/2, Lz/2);
    zSlopeMesh.rotation.x = -a;
    zSlopeMesh.visible = false;
    player.zSlopeTemp = zSlopeMesh;
    //scene.add(player.zSlopeTemp);
    
    Lz = grid_size
    Ly = buildThick
    Lx = L
    const xSlopeMesh = new THREE.Mesh(new THREE.BoxGeometry(Lx, Ly, Lz), buildTempMaterial)
    xSlopeMesh.position.set(Lx/2, gridH_size/2, Lz/2);
    xSlopeMesh.rotation.z = a;
    xSlopeMesh.visible = false;
    player.xSlopeTemp = xSlopeMesh;
    //scene.add(player.xSlopeTemp);

    let geometry = mCreateConeGeometry(); // BUILD.
    const coneMesh = new THREE.Mesh( geometry, buildTempMaterial );
    coneMesh.position.set(grid_size/2, gridH_size/2, grid_size/2);
    coneMesh.visible = false;
    player.ConeTemp = coneMesh;
    //scene.add(player.ConeTemp);

}

function mCreateWallMesh(Lx, Ly, Lz, type){
    //let mat = new THREE.MeshLambertMaterial({color: 0x6699FF, side: THREE.DoubleSide});
    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
    mat.transparent = true;
    mat.opacity = 1.0;

    const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(Lx, Ly, Lz), mat)
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    wallMesh.buildType = 0;
    wallMesh.dirType = type;
    return wallMesh;
}

function mCreateFloorMesh(){
    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
    mat.transparent = true;
    mat.opacity = 1.0;

    const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(grid_size, buildThick, grid_size), mat)
    floorMesh.castShadow = true
    floorMesh.receiveShadow = true;
    floorMesh.buildType = 1;
    floorMesh.dirType = "";
    return floorMesh;
}

function mCreateSlopeMesh(Lx, Ly, Lz, type){
    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
    mat.transparent = true;
    mat.opacity = 1.0;

    const slopeMesh = new THREE.Mesh(new THREE.BoxGeometry(Lx, Ly, Lz), mat)
    slopeMesh.castShadow = true
    slopeMesh.receiveShadow = true;
    slopeMesh.buildType = 2;
    slopeMesh.dirType = type;
    return slopeMesh;
}

function mCreateConeGeometry(){
    const geometry = new THREE.BufferGeometry();
    /*let vertices = new Float32Array(5*3);
    let uvs = new Float32Array(5*2);
    let indices = new Uint32Array(4*3);
    let cone_coord = [ 0, 0, 0,
                        -grid_size/2, -gridH_size/2, -grid_size/2,
                        -grid_size/2, -gridH_size/2,  grid_size/2,
                        grid_size/2, -gridH_size/2,  grid_size/2,
                        grid_size/2, -gridH_size/2, -grid_size/2];
    let uv_coord = [0.5, 1.0,
                    0.0, 0.0,
                    1.0, 0.0,
                    0.0, 0.0,
                    1.0, 0.0 ];*/
    let vertices = new Float32Array(12*3);
    let uvs = new Float32Array(12*2);
    let indices = new Uint32Array(4*3);
    let cone_coord = [ 
    -grid_size/2, -gridH_size/2, -grid_size/2,
    -grid_size/2, -gridH_size/2,  grid_size/2,
    0, 0, 0,
    -grid_size/2, -gridH_size/2,  grid_size/2,
        grid_size/2, -gridH_size/2,  grid_size/2,
    0, 0, 0,
        grid_size/2, -gridH_size/2,  grid_size/2,
        grid_size/2, -gridH_size/2, -grid_size/2,
    0, 0, 0,
        grid_size/2, -gridH_size/2, -grid_size/2,
    -grid_size/2, -gridH_size/2, -grid_size/2,
    0, 0, 0,];
    let uv_coord = [
    0.0, 0.0,
    1.0, 0.0,
    0.5, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    0.5, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    0.5, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    0.5, 1.0 ];
    for(var i=0; i<cone_coord.length; i++){
        vertices[i] = cone_coord[i];
    }
    for(var i=0; i<uvs.length; i++){
        uvs[i] = uv_coord[i];
    }
    for(var i=0; i<indices.length; i++){
        indices[i] = i;
    }

    /*indices[3*0+0] = 1;
    indices[3*0+1] = 2;
    indices[3*0+2] = 0;
    indices[3*1+0] = 2;
    indices[3*1+1] = 3;
    indices[3*1+2] = 0;
    indices[3*2+0] = 3;
    indices[3*2+1] = 4;
    indices[3*2+2] = 0;
    indices[3*3+0] = 4;
    indices[3*3+1] = 1;
    indices[3*3+2] = 0;*/

    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'uv',    new THREE.BufferAttribute( uvs,  2));
    geometry.setAttribute( 'index',    new THREE.BufferAttribute( indices,  1));
    geometry.computeVertexNormals();

    return geometry;
}

function mCreateConeMesh(geometry){
    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
    mat.transparent = true;
    mat.opacity = 1.0;

    let coneMesh = new THREE.Mesh( geometry, mat );
    coneMesh.castShadow = true
    coneMesh.receiveShadow = true;
    coneMesh.buildType = 3;
    coneMesh.dirType = "";
    return coneMesh;
}


function mCreateWallEdgePoints(px, py, pz, type="z"){
        
    let edgePoints = [];
    // origin -> build center
    let zEdgePoints = [
        grid_size/4, gridH_size/2, 0,
        -grid_size/4, gridH_size/2, 0,
        grid_size/4, -gridH_size/2, 0,
        -grid_size/4, -gridH_size/2, 0,
        grid_size/2, gridH_size/4, 0,
        grid_size/2, -gridH_size/4, 0,
        -grid_size/2, gridH_size/4, 0,
        -grid_size/2, -gridH_size/4, 0,
    ];
    let xEdgePoints = [
        0, gridH_size/2, grid_size/4, 
        0, gridH_size/2, -grid_size/4,
        0, -gridH_size/2, grid_size/4,
        0, -gridH_size/2, -grid_size/4,
        0, gridH_size/4, grid_size/2,
        0, -gridH_size/4, grid_size/2,
        0, gridH_size/4, -grid_size/2,
        0, -gridH_size/4, -grid_size/2,
    ];

    if(type == "z"){
        edgePoints = zEdgePoints;
    }else if(type == "x"){
        edgePoints = xEdgePoints;
    }

    for(var i=0; i<edgePoints.length/3; i++){
        edgePoints[i*3+0] += px;
        edgePoints[i*3+1] += py;
        edgePoints[i*3+2] += pz;
    }

    return edgePoints;
}

function mCreateFloorEdgePoints(px, py, pz){
        
    // origin -> build center
    let edgePoints = [
        grid_size/2, 0, -grid_size/4, 
        grid_size/2, 0, grid_size/4, 
        -grid_size/2, 0, -grid_size/4, 
        -grid_size/2, 0, grid_size/4, 
        grid_size/4, 0, -grid_size/2,
        -grid_size/4, 0, -grid_size/2,
         grid_size/4, 0, grid_size/2,
        -grid_size/4, 0, grid_size/2,
    ];
    
    for(var i=0; i<edgePoints.length/3; i++){
        edgePoints[i*3+0] += px;
        edgePoints[i*3+1] += py;
        edgePoints[i*3+2] += pz;
    }

    return edgePoints;
}

function mCreateSlopeEdgePoints(px, py, pz, type="z-", editType=-1){
    
    let edgePoints = [];
    // origin -> build center
    // bottom x 2, top x 2, left x 2, right x 2
    let zmEdgePoints = [
        -grid_size/4, -gridH_size/2, grid_size/2,
        grid_size/4, -gridH_size/2, grid_size/2,
        -grid_size/4, gridH_size/2, -grid_size/2,
        grid_size/4, gridH_size/2, -grid_size/2,
        -grid_size/2, -gridH_size/4, grid_size/4,
        -grid_size/2, gridH_size/4, -grid_size/4,
        grid_size/2, -gridH_size/4, grid_size/4,
        grid_size/2, gridH_size/4, -grid_size/4,
    ];

    let T = [1, 0, 0,
             0, 1, 0,
             0, 0, 1];
    if(type == "z+"){
        T = [-1, 0, 0,
             0, 1, 0,
             0, 0, -1];
    }else if(type == "x-"){
        T = [0, 0, 1,
             0, 1, 0,
             -1, 0, 0];
    }else if(type == "x+"){
        T = [0, 0, -1,
             0, 1, 0,
             1, 0, 0];
    }

    let m = new Array(3*8).fill(0);
    for(var i=0; i<8; i++){
        m[i*3+0] = T[0]*zmEdgePoints[i*3+0]
                  +T[1]*zmEdgePoints[i*3+1]
                  +T[2]*zmEdgePoints[i*3+2];
        m[i*3+1] = T[3]*zmEdgePoints[i*3+0]
                  +T[4]*zmEdgePoints[i*3+1]
                  +T[5]*zmEdgePoints[i*3+2];
        m[i*3+2] = T[6]*zmEdgePoints[i*3+0]
                  +T[7]*zmEdgePoints[i*3+1]
                  +T[8]*zmEdgePoints[i*3+2];
    }

    let idx = [0, 1, 2, 3, 4, 5, 6, 7]; // no editType 
    if(editType>=0 && editType<=3){

    }else if(editType==4 || editType==6 || editType==8 || editType==10 ){
        // right half
        idx = [1, 3, 6, 7];
    }else if(editType==5 || editType==7 || editType==9 || editType==11 ){
        // left half
        idx = [0, 2, 4, 5];
    }

    for(var i=0; i<idx.length; i++){
        edgePoints.push(m[idx[i]*3+0]);
        edgePoints.push(m[idx[i]*3+1]);
        edgePoints.push(m[idx[i]*3+2]);
    }

    for(var i=0; i<edgePoints.length/3; i++){
        edgePoints[i*3+0] += px;
        edgePoints[i*3+1] += py;
        edgePoints[i*3+2] += pz;
    }

    return edgePoints;
}

function mCreateConeEdgePoints(px, py, pz, editType=0){
    // z-x plane    

    // origin -> build center
    let ep = [  //edgePoints     // x-, x+, z-, z+
        -grid_size/2, -gridH_size/2, -grid_size/4, // x-
        -grid_size/2, -gridH_size/2, grid_size/4,  // x-
        grid_size/2, -gridH_size/2, -grid_size/4,  // x+
        grid_size/2, -gridH_size/2, grid_size/4,   // x+
        grid_size/4, -gridH_size/2, -grid_size/2,  // z-
        -grid_size/4, -gridH_size/2, -grid_size/2, // z-
        -grid_size/4, -gridH_size/2, grid_size/2,  // z+
        -grid_size/4, -gridH_size/2, grid_size/2,  // z+
    ];

    let edgePoints = [];
    //let idx = [0, 1, 2, 3, 4, 5, 6, 7]; // no editType 
    let T = [1, 0, 0,
             0, 1, 0,
             0, 0, 1];

    if(editType==0){
        edgePoints = ep;
    }else if(editType>=1 && editType<=4){
        edgePoints = [
         grid_size/2, -gridH_size/2, -grid_size/4, // x+
         grid_size/2, -gridH_size/2, grid_size/4,  // x+
        -grid_size/4, -gridH_size/2, grid_size/2,  // z+
         grid_size/4, -gridH_size/2, grid_size/2,  // z+
         grid_size/4, -gridH_size/4, -grid_size/2,  // z-
        -grid_size/4,  gridH_size/4, -grid_size/2,  // z-
        -grid_size/2,  gridH_size/4, -grid_size/4,  // x-
        -grid_size/2, -gridH_size/4,  grid_size/4,  // x-
        ];
        if(editType==2){
            T = [0, 0, 1,
                 0, 1, 0,
                -1, 0, 0];
        }else if(editType==3){
            T = [0, 0, -1,
                 0, 1, 0,
                 1, 0, 0];
        }else if(editType==4){
            T = [-1, 0, 0,
                  0, 1, 0,
                  0, 0, -1];
        }

    }else if(editType>=5 && editType<=8){
        // x- slope
        edgePoints = [
        -grid_size/2,  gridH_size/2, -grid_size/4,  // x-
        -grid_size/2,  gridH_size/2,  grid_size/4,  // x-
         grid_size/2, -gridH_size/2, -grid_size/4, // x+
         grid_size/2, -gridH_size/2, grid_size/4,  // x+
         grid_size/4, -gridH_size/4, grid_size/2,  // z+
        -grid_size/4,  gridH_size/4, grid_size/2,  // z+
         grid_size/4, -gridH_size/4, -grid_size/2,  // z-
        -grid_size/4,  gridH_size/4, -grid_size/2,  // z-
        ];
        if(editType==8){ // +90
            T = [0, 0, 1,
                 0, 1, 0,
                -1, 0, 0];
        }else if(editType==7){
            T = [0, 0, -1,
                 0, 1, 0,
                 1, 0, 0];
        }else if(editType==6){
            T = [-1, 0, 0,
                  0, 1, 0,
                  0, 0, -1];
        }

    }else if(editType==9 || editType==10){
        edgePoints = [
        -grid_size/2,  gridH_size/4, -grid_size/4,  // x-
        -grid_size/2, -gridH_size/4,  grid_size/4,  // x-
         grid_size/2, -gridH_size/4, -grid_size/4, // x+
         grid_size/2,  gridH_size/4, grid_size/4,  // x+
         grid_size/4,  gridH_size/4, grid_size/2,  // z+
        -grid_size/4, -gridH_size/4, grid_size/2,  // z+
         grid_size/4, -gridH_size/4, -grid_size/2,  // z-
        -grid_size/4,  gridH_size/4, -grid_size/2,  // z-
        ];
        if(editType==10){
            T = [0, 0, 1,
                 0, 1, 0,
                -1, 0, 0];
        }

    }else if(editType>=11 && editType<=14){
        edgePoints = [
        -grid_size/2, -gridH_size/4, -grid_size/4,  // x-
        -grid_size/2,  gridH_size/4,  grid_size/4,  // x-
         grid_size/2,  gridH_size/2, -grid_size/4, // x+
         grid_size/2,  gridH_size/2, grid_size/4,  // x+
         grid_size/4,  gridH_size/2, grid_size/2,  // z+
        -grid_size/4,  gridH_size/2, grid_size/2,  // z+
         grid_size/4,  gridH_size/4, -grid_size/2,  // z-
        -grid_size/4, -gridH_size/4, -grid_size/2,  // z-
        ];
        if(editType==12){
            T = [0, 0, 1,
                 0, 1, 0,
                -1, 0, 0];
        }else if(editType==13){
            T = [0, 0, -1,
                 0, 1, 0,
                 1, 0, 0];
        }else if(editType==14){
            T = [-1, 0, 0,
                  0, 1, 0,
                  0, 0, -1];
        }
    }

    //for(var i=0; i<idx.length; i++){
    //    edgePoints.push(m[idx[i]*3+0]);
    //    edgePoints.push(m[idx[i]*3+1]);
    //    edgePoints.push(m[idx[i]*3+2]);
    //}

    for(var i=0; i<edgePoints.length/3; i++){
        let x = T[0]*edgePoints[i*3+0]
               +T[1]*edgePoints[i*3+1]
               +T[2]*edgePoints[i*3+2];
        let y = T[3]*edgePoints[i*3+0]
               +T[4]*edgePoints[i*3+1]
               +T[5]*edgePoints[i*3+2];
        let z = T[6]*edgePoints[i*3+0]
               +T[7]*edgePoints[i*3+1]
               +T[8]*edgePoints[i*3+2];
        edgePoints[i*3+0] = x;
        edgePoints[i*3+1] = y;
        edgePoints[i*3+2] = z;
    }
    
    for(var i=0; i<edgePoints.length/3; i++){
        edgePoints[i*3+0] += px;
        edgePoints[i*3+1] += py;
        edgePoints[i*3+2] += pz;
    }

    return edgePoints;
}


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

function mCreateFloorBodyCollider(world_, px, py, pz){
        
    let floorBody = world_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))
    let floorShape = RAPIER.ColliderDesc.cuboid(grid_size/2, buildThick/2, grid_size/2).setMass(1).setRestitution(0.0).setFriction(0.0)
    let col = world_.createCollider(floorShape, floorBody)
    return {floorBody: floorBody, col: col};
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

function mCreateConeBodyCollider(world_, px, py, pz){
        
    //let geometry = BUILD.mCreateConeGeometry();
    let geometry = mCreateConeGeometry();
    let vertices = geometry.attributes.position.array;
    let indices = geometry.attributes.index.array;

    const coneBody = world_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))
    const coneShape = RAPIER.ColliderDesc.trimesh(vertices, indices).setMass(1).setRestitution(0.0).setFriction(0.0)
    const col = world_.createCollider(coneShape, coneBody)

    return {coneBody: coneBody, col: col};
}



function mSetBuildTemp(player){

    player.zWallTemp.visible = false;
    player.xWallTemp.visible = false;
    player.FloorTemp.visible = false;
    player.zSlopeTemp.visible = false;
    player.xSlopeTemp.visible = false;
    player.ConeTemp.visible = false;

    if(player.buildType == 0){
        mWallTemp(player) 
    }else if(player.buildType == 1){
        mFloorTemp(player) 
    }else if(player.buildType == 2){
        mSlopeTemp(player) 
    }else if(player.buildType == 3){
        mConeTemp(player) 
    }

    player.buildTemp.buildType = player.buildType;
}

function mFloorGS(v_){ //floor to grid size
    return Math.floor(v_/grid_size) * grid_size;
}

function mFloorGSH(v_){ //floor to grid size
    return Math.floor(v_/gridH_size) * gridH_size;
}

function mWallTemp(player){

    /*let edgePoints = [];
    let zEdgePoints = [
        grid_size/2, gridH_size/2, 0,
        -grid_size/2, gridH_size/2, 0,
        grid_size/2, -gridH_size/2, 0,
        -grid_size/2, -gridH_size/2, 0,
        grid_size, gridH_size/2, 0,
        grid_size, -gridH_size/2, 0,
        0, gridH_size/2, 0,
        0, -gridH_size/2, 0,
    ];
    let xEdgePoints = [
        0, gridH_size/2, grid_size/2, 
        0, gridH_size/2, -grid_size/2,
        0, -gridH_size/2, grid_size/2,
        0, -gridH_size/2, -grid_size/2,
        0, gridH_size/2, grid_size,
        0, -gridH_size/2, grid_size,
        0, gridH_size/2, 0,
        0, -gridH_size/2, 0,
    ];*/

    //--- Z-X plane 
    let angleType_ = Math.floor( (player.angle+Math.PI/4.0) / (Math.PI/2.0) );
    angleType_ = angleType_ % 4;
    let angle_ = angleType_ * Math.PI/2;
    //console.log("angleType_:", angleType_);
    //console.log("player:", player.playerMesh.position);

    player.z = player.playerMesh.position.z;
    player.x = player.playerMesh.position.x;
    player.y = player.playerMesh.position.y;
    
    let z_ = mFloorGS(player.z);
    let x_ = mFloorGS(player.x);
    let y_ = mFloorGSH(player.y);
    let dy_ =  player.y - y_;
    //console.log("z_, x_, y_:", [z_, x_, y_]);

    let ty_ = Math.min(Math.tan(player.angle2),2.0);
    let ry_ = dy_ + grid_size/2.0*ty_;
    //console.log('ty_:'+ty_);
    
    if( ry_ >= gridH_size/2.0 ){
        y_ += gridH_size;
    }else if( ( ry_ <= -gridH_size/2.0 ) && ( ry_ >= -gridH_size) )  {
        y_ -= gridH_size;
    }
    y_ = Math.max(y_, 0)
    
    if( angleType_ == 0 ){
        z_ += grid_size;
        if( (player.z >= z_ - grid_size*0.15) && (player.angle2 >= -Math.PI/4.0) ){ //far
            z_ += grid_size;          
        }

        if( player.x + (z_-player.z)*Math.tan(player.angle-angle_) >= x_ + grid_size  ){ //far side
            x_ += grid_size;
        }else if( player.x - (z_-player.z)*Math.tan(angle_-player.angle) <= x_  ){ //far side
            x_ -= grid_size;
        }
        
    }else if( angleType_ == 2 ){
        if( (player.z <= z_ + grid_size*0.15) && (player.angle2 >= -Math.PI/4.0 ) ){ //far
            z_ -= grid_size;          
        }

        if( player.x + (player.z-z_)*Math.tan(angle_-player.angle) >= x_ + grid_size  ){ //far side
            x_ += grid_size;
        }else if( player.x - (player.z-z_)*Math.tan(player.angle-angle_) <= x_  ){ //far side
            x_ -= grid_size;
        }
        
    }else if( angleType_ == 1 ) {

        x_ += grid_size;
        if( (player.x >= x_ - grid_size*0.15) && (player.angle2 >= -Math.PI/4.0) ){ //far
            x_ += grid_size;          
        }

        if( player.z + (x_-player.x)*Math.tan(angle_-player.angle) >= z_ + grid_size  ){ //far side
            z_ += grid_size;
        }else if( player.z - (x_-player.x)*Math.tan(player.angle - angle_) <= z_  ){ //far side
            z_ -= grid_size;
        }
        
        /*z_ += grid_size/2;
        y_ += gridH_size/2;

        player.xWallTemp.position.set(x_, y_, z_);
        player.buildTemp = player.xWallTemp;*/

    } else if( angleType_ == 3 ) {
        if( (player.x<=x_ + grid_size*0.15) && (player.angle2 >= -Math.PI/4.0) ){
            x_ -= grid_size;          
        }

        if( player.z + (player.x-x_)*Math.tan(player.angle-angle_) >= z_ + grid_size  ){ //far side
            z_ += grid_size;
        }else if( player.z - (player.x-x_)*Math.tan(angle_-player.angle) <= z_  ){ //far side
            z_ -= grid_size;
        }
        
        /*z_ += grid_size/2;
        y_ += gridH_size/2;

        player.xWallTemp.position.set(x_, y_, z_);
        player.buildTemp = player.xWallTemp;*/
        
    }
    //console.log("z_, x_, y_:", [z_, x_, y_]);

    let type = "z"
    if( angleType_ == 0 || angleType_ == 2){
        x_ += grid_size/2;
        y_ += gridH_size/2;
        player.zWallTemp.position.set(x_, y_, z_);
        player.buildTemp = player.zWallTemp;

        /*for(var i=0; i<zEdgePoints.length/3; i++){
            edgePoints.push(zEdgePoints[i*3+0]+x_)
            edgePoints.push(zEdgePoints[i*3+1]+y_)
            edgePoints.push(zEdgePoints[i*3+2]+z_)
        }*/

    }else if( angleType_ == 1 || angleType_ == 3){
        type = "x"
        z_ += grid_size/2;
        y_ += gridH_size/2;
        player.xWallTemp.position.set(x_, y_, z_);
        player.buildTemp = player.xWallTemp;

        /*for(var i=0; i<xEdgePoints.length/3; i++){
            edgePoints.push(xEdgePoints[i*3+0]+x_)
            edgePoints.push(xEdgePoints[i*3+1]+y_)
            edgePoints.push(xEdgePoints[i*3+2]+z_)
        }*/

    }

    //player.buildTemp.edgePoints = edgePoints;
    player.buildTemp.edgePoints = mCreateWallEdgePoints(x_, y_, z_, type)
    player.buildTemp.angleType = angleType_;
    player.buildTemp.type = type;
    //console.log("player.buildTemp.edgePoints", player.buildTemp.edgePoints)
}

function mFloorTemp(player){ 
    //console.log("mFloorTemp:");

    let x_ = player.playerMesh.position.x;
    let y_ = player.playerMesh.position.y;
    let z_ = player.playerMesh.position.z;

    let angle_ = player.angle
    let angle2_ = player.angle2
    let gz_ = mFloorGS(z_);
    let gx_ = mFloorGS(x_);
    let gy_ = mFloorGSH(y_); //+ mWallSizeH*0.2
    
    let ax_ = 0.0;
    let ay_ = 0.0;
    let az_ = 0.0;

    let l_ = 0.0;
    if(angle2_ != 0.0){
        l_ = player.height / Math.tan( Math.abs(angle2_) )
    }
    
    let add_z = [1,1,0,-1,-1,-1,0,1];
    let add_x = [0,1,1,1,0,-1,-1,-1];
    let d_angle_ = angle_ + Math.PI/8.0
    if(d_angle_ > 2.0*Math.PI){
        d_angle_ -= 2.0*Math.PI
    }

    for(var i = 0; i < 8; i++ ){
        if( ( d_angle_ >= Math.PI/4.0*i ) &&
            ( d_angle_ <= Math.PI/4.0*( i+1 ) ) ){
            
            if( add_z[i] != 0 ){
                let qz_ = l_ * Math.cos(angle_)
                
                if( (add_z[i] > 0) && (z_ - gz_ >= grid_size*0.5) ){
                    if( qz_ >= grid_size*0.5 ){
                        az_ = grid_size;
                    }
                } else if ( (add_z[i] < 0) && (z_ - gz_ <= grid_size*0.5) ){
                    if( z_ + qz_ <=  gz_ ){
                        az_ = -grid_size;
                    }
                }
            }

            if( add_x[i] != 0 ){
                let qx_ = l_ * Math.sin(angle_)
                //fmt.Println("qx:", qx_)
                if( (add_x[i] > 0) && (x_ - gx_ >= grid_size*0.5) ){
                    if( qx_ >= grid_size*0.5 ){
                        ax_ =grid_size;
                    }
                } else if ( (add_x[i] < 0) && (x_ - gx_ <= grid_size*0.5) ){
                    if( x_ + qx_ <=  gx_ ){
                        ax_ = -grid_size;
                    }
                }
            }

            if(angle2_ > 0){
                ay_ = gridH_size;
            }

            break;
        }//
    }//

    gz_ += grid_size*0.5;
    gx_ += grid_size*0.5;
    //console.log("pos:", [gx_ + ax_, gy_ + ay_, gz_ + az_]);
    
    player.FloorTemp.position.set(gx_ + ax_, gy_ + ay_, gz_ + az_);
    player.buildTemp = player.FloorTemp;
    player.buildTemp.edgePoints = mCreateFloorEdgePoints(gx_ + ax_, gy_ + ay_, gz_ + az_)
}

function mSlopeTemp(player){

    //--- Z-X plane 
    let angleType_ = Math.floor( (player.angle+Math.PI/4.0) / (Math.PI/2.0) );
    angleType_ = angleType_ % 4;
    let angle_ = angleType_ * Math.PI/2;
    //console.log('angleType_:'+angleType_);

    player.z = player.playerMesh.position.z;
    player.x = player.playerMesh.position.x;
    player.y = player.playerMesh.position.y;
    
    let z_ = mFloorGS(player.z);
    let x_ = mFloorGS(player.x);
    let y_ = mFloorGSH(player.y);
    let dy_ =  player.y - y_;
    
    let ty_ = Math.min(Math.tan(player.angle2),2.0);
    let ry_ = dy_ + grid_size/2.0*ty_;
    //console.log('ty_:'+ty_);
    
    if( ry_ >= gridH_size/2.0 ){
        y_ += gridH_size;
    }else if( ( ry_ <= -gridH_size/2.0 ) && ( ry_ >= -gridH_size) )  {
        y_ -= gridH_size;
    }
    y_ = Math.max(y_, 0)
    //console.log('y_:'+y_);

    if( (player.angle2 > -Math.PI/12) ){  // far    // > 0
        z_ += grid_size * Math.cos(angleType_*Math.PI/2);
        x_ += grid_size * Math.sin(angleType_*Math.PI/2);
        z_ = Math.round(z_)
        x_ = Math.round(x_)
    }
    
    if( (player.angle2 < -Math.PI/4) ){
        z_ = mFloorGS(player.z);
        x_ = mFloorGS(player.x);
    }
    //console.log("z_, x_, y_:", [z_, x_, y_]);

    let type = "z+"
    if( angleType_ == 0 ){

        if( player.x + (z_-player.z)*Math.tan(player.angle-angle_) >= x_ + grid_size  ){ //far side
            x_ += grid_size;
        }else if( player.x - (z_-player.z)*Math.tan(angle_-player.angle) <= x_  ){ //far side
            x_ -= grid_size;
        }
        player.zSlopeTemp.rotation.x = -slope_ang;
        player.buildTemp = player.zSlopeTemp;
        
    }else if( angleType_ == 2 ){
        type = "z-"
        if( player.x + (player.z-z_)*Math.tan(angle_-player.angle) >= x_ + grid_size  ){ //far side
            x_ += grid_size;
        }else if( player.x - (player.z-z_)*Math.tan(player.angle-angle_) <= x_  ){ //far side
            x_ -= grid_size;
        }
        player.zSlopeTemp.rotation.x = slope_ang;
        player.buildTemp = player.zSlopeTemp;
        
    }else if( angleType_ == 1 ) {
        type = "x+"
        if( player.z + (x_-player.x)*Math.tan(angle_-player.angle) >= z_ + grid_size  ){ //far side
            z_ += grid_size;
        }else if( player.z - (x_-player.x)*Math.tan(player.angle - angle_) <= z_  ){ //far side
            z_ -= grid_size;
        }
        
        player.xSlopeTemp.rotation.z = slope_ang;
        player.buildTemp = player.xSlopeTemp;

    } else if( angleType_ == 3 ) {
        type = "x-"
        if( player.z + (player.x-x_)*Math.tan(player.angle-angle_) >= z_ + grid_size  ){ //far side
            z_ += grid_size;
        }else if( player.z - (player.x-x_)*Math.tan(angle_-player.angle) <= z_  ){ //far side
            z_ -= grid_size;
        }
        
        player.xSlopeTemp.rotation.z = -slope_ang;
        player.buildTemp = player.xSlopeTemp;

    }

    z_ += grid_size/2;
    x_ += grid_size/2;
    y_ += gridH_size/2;

    player.buildTemp.angleType = angleType_;
    player.buildTemp.position.set(x_, y_, z_);
    player.buildTemp.edgePoints = mCreateSlopeEdgePoints(x_, y_, z_, type)
    player.buildTemp.type = type;
}

function mConeTemp(player){ 

    let x_ = player.playerMesh.position.x;
    let y_ = player.playerMesh.position.y;
    let z_ = player.playerMesh.position.z;

    let angle_ = player.angle
    let angle2_ = player.angle2
    let gz_ = mFloorGS(z_);
    let gx_ = mFloorGS(x_);
    let gy_ = mFloorGSH(y_); //+ mWallSizeH*0.2
    
    let ax_ = 0.0;
    let ay_ = 0.0;
    let az_ = 0.0;

    let l_ = 0.0;
    let l2_ = 0.0; // for low position
    let flag_low = 0;
    if(angle2_ != 0.0){
        l_ = player.height / Math.tan( Math.abs(angle2_) )
        l2_ = (player.height+grid_size) / Math.tan( Math.abs(angle2_) )
    }

    let add_z = [1,1,0,-1,-1,-1,0,1];
    let add_x = [0,1,1,1,0,-1,-1,-1];
    let d_angle_ = angle_ + Math.PI/8.0
    if(d_angle_ > 2.0*Math.PI){
        d_angle_ -= 2.0*Math.PI
    }

    for(var i = 0; i < 8; i++ ){
        if( ( d_angle_ >= Math.PI/4.0*i ) &&
            ( d_angle_ <= Math.PI/4.0*( i+1 ) ) ){
            
            if( add_z[i] != 0 ){
                let qz_ = l_ * Math.cos(angle_)
                let qz2_ = l2_ * Math.cos(angle_)
                let dlow_ = z_-gz_+qz2_;
                
                if( (add_z[i] > 0) && (z_ - gz_ >= grid_size*0.5) ){
                    if( qz_ >= grid_size*0.5 ){
                        az_ = grid_size;
                    }                
                    if( (dlow_ > grid_size) && (dlow_<2.0*grid_size) ){
                        az_ = grid_size;
                        flag_low = 1
                    }else{
                        flag_low = 0
                    }
                } else if ( (add_z[i] < 0) && (z_ - gz_ <= grid_size*0.5) ){
                    if( z_ + qz_ <=  gz_ ){
                        az_ = -grid_size;
                    }
                    if( (dlow_ < 0) && (dlow_ > -1.0*grid_size) ){
                        az_ = -grid_size;
                        flag_low = 1
                    }else{
                        flag_low = 0
                    }
                }
            }

            if( add_x[i] != 0 ){
                let qx_ = l_ * Math.sin(angle_)
                let qx2_ = l2_ * Math.sin(angle_)
                let dlow_ = x_-gx_+qx2_;
                
                if( (add_x[i] > 0) && (x_ - gx_ >= grid_size*0.5) ){
                    if( qx_ >= grid_size*0.5 ){
                        ax_ = grid_size;
                    }

                    if( (dlow_ > grid_size) && (dlow_<2.0*grid_size) ){
                        ax_ = grid_size;
                        flag_low = 1
                    }else{
                        flag_low = 0
                    }
                } else if ( (add_x[i] < 0) && (x_ - gx_ <= grid_size*0.5) ){
                    if( x_ + qx_ <=  gx_ ){
                        ax_ = -grid_size;
                    }
                    if( (dlow_ < 0) && (dlow_ > -1.0*grid_size) ){
                        ax_ = -grid_size;
                        flag_low = 1
                    }else{
                        flag_low = 0
                    }
                }
            }

            if(angle2_ > 0){
                ay_ = gridH_size;
            } else {
                if(flag_low==1){
                    ay_ = -gridH_size;
                }
            }

            break;
        }//
    }//
    
    gz_ += grid_size*0.5;
    gx_ += grid_size*0.5;
    gy_ += gridH_size*0.5;
    //console.log("pos:", [gx_ + ax_, gy_ + ay_, gz_ + az_]);
    
    player.ConeTemp.position.set(gx_ + ax_, gy_ + ay_, gz_ + az_);
    player.buildTemp = player.ConeTemp;
    player.buildTemp.edgePoints = mCreateConeEdgePoints(gx_ + ax_, gy_ + ay_, gz_ + az_)
}

function mCheckBuildIsUnique(build, ArrayBuild_){
    let judge = true;

    /*for(var i = 0; i < ArrayBuild.length; i++){
        let b = ArrayBuild[i].buildMesh; 
        if(b==null){
            continue
        }
        if(b.buildType == build.buildType &&
            b.position.x == build.position.x && b.position.y == build.position.y &&  b.position.z == build.position.z ){
                judge = false;
                break
                //return judge;
        }
    }*/
    //let n = 0;
    Object.values(ArrayBuild_).forEach((v) => {
        //n += 1;
        if(v!=null && v.buildMesh!=null){
            let b = v.buildMesh;
            //console.log("b:", b.buildType);  
            if( b.position.x == build.position.x && b.position.y == build.position.y &&  b.position.z == build.position.z ){
                //b.buildType == build.buildType &&
                    judge = false;
                    //console.log("b:", b);  
                    //break
                    return judge;
            }
        }
        
    })
    //console.log("mCheckBuildIsUnique:", judge);
    //console.log("n:", n);
    //console.log("n:", Object.keys(ArrayBuild).length);
    return judge;
}

function mCheckBuildIsConnected(build, ArrayBuild_){
    let judge = false;
    if(build.position.y <= gridH_size/2){
        judge = true;
        return judge;
    }

    let e = build.edgePoints;
    if(e==null){
        return judge;
    }
    //console.log("e:", e);  

    Object.values(ArrayBuild_).forEach((v) => {
        if(v!=null && v.edgePoints!=null){
            let p = v.edgePoints;
            
            for(var i=0; i<e.length/3; i++){
                let ex = e[i*3+0];
                let ey = e[i*3+1];
                let ez = e[i*3+2];
                for(var j=0; j<p.length/3; j++){
                    let px = p[j*3+0];
                    let py = p[j*3+1];
                    let pz = p[j*3+2];
                    let v = Math.sqrt((ex-px)*(ex-px)+(ey-py)*(ey-py)+(ez-pz)*(ez-pz));
                    //console.log("v:", v);  
                    if( v < 0.001){
                        judge = true;
                        return judge;
                    }
                }
            }
        }
        
    })

    return judge;
}


function mInitEditGrid(player){
    let Lx = grid_size
    let Ly = gridH_size
    let Lz = buildThick
    
    //--- Wall
    let dw = Lx * 0.01;
    let dh = Ly * 0.01;
    let zWallGrid = new THREE.Group();
        zWallGrid.position.set(0, 0, 0);
    let xWallGrid = new THREE.Group();
        xWallGrid.position.set(0, 0, 0);        
    let w = Lx/3 - dw*2;
    let h = Ly/3 - dh*2;
    let t = Lz;
    let zPosition = [];
    let xPosition = [];
    for(var i=0; i<3; i++){
        for(var j=0; j<3; j++){
            let x = Lx/3/2 + Lx/3*j - Lx/2;
            let y = Ly/3/2 + Ly/3*i - Ly/2;
            let mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), editGridMaterial);
            mesh.position.set(x, y, 0);
            mesh.grid_id = j + i*3;
            zWallGrid.add(mesh);
            zPosition.push(x);
            zPosition.push(y);
            zPosition.push(0);

            let xmesh = new THREE.Mesh(new THREE.BoxGeometry(t, h, w), editGridMaterial);
            xmesh.position.set(0, y, x);
            xmesh.grid_id = j + i*3;
            xWallGrid.add(xmesh);
            xPosition.push(0);
            xPosition.push(y);
            xPosition.push(x);
        }
    }
    console.log("zWallGrid:", zWallGrid);
    zWallGrid.visible = false;
    player.zWallGrid = zWallGrid;

    xWallGrid.visible = false;
    player.xWallGrid = xWallGrid;

    let zWall = new Object();
    zWall.w = w;
    zWall.h = h;
    zWall.t = t;
    zWall.position = zPosition;
    player.editCollider.zWall = zWall;

    let xWall = new Object();
    xWall.w = w;
    xWall.h = h;
    xWall.t = t;
    xWall.position = xPosition;
    player.editCollider.xWall = xWall;
    //console.log("player.editCollider:", player.editCollider);
    
    //--- Floor z-x plane
    Lz = grid_size
    Lx = grid_size
    Ly = buildThick
    dw = Lz * 0.01;
    dh = Lx * 0.01;
    let FloorGrid = new THREE.Group();
        FloorGrid.position.set(0, 0, 0);
    w = Lz/2 - dw*2;
    h = Lx/2 - dh*2;
    t = Ly;
    let fPosition = [];
    for(var i=0; i<2; i++){
        for(var j=0; j<2; j++){
            let z = Lz/2/2 + Lz/2*j - Lz/2;
            let x = Lx/2/2 + Lx/2*i - Lx/2;
            let mesh = new THREE.Mesh(new THREE.BoxGeometry(h, t, w), editGridMaterial);
            mesh.position.set(x, 0, z);
            mesh.grid_id = j + i*2;
            FloorGrid.add(mesh);
            fPosition.push(x);
            fPosition.push(0);
            fPosition.push(z);
        }
    }
    console.log("FloorGrid:", FloorGrid);
    FloorGrid.visible = false;
    player.FloorGrid = FloorGrid;

    let Floor = new Object();
    Floor.w = w;
    Floor.h = h;
    Floor.t = t;
    Floor.position = fPosition;
    player.editCollider.Floor = Floor;

    //--- Slope z-x plane
    Lz = grid_size
    Lx = grid_size
    Ly = gridH_size
    dw = Lz * 0.01;
    dh = Lx * 0.01;
    let SlopeGrid = new THREE.Group();
        SlopeGrid.position.set(0, 0, 0);
    w = Lz/5 - dw*2;
    h = Lx/5 - dh*2;
    t = buildThick;
    let sPosition = [
        0, -Ly/2+t, -w/2-dw*2-w,
        0, -Ly/2+t, w/2+dw*2+w,
        -w/2-dw*2-w, -Ly/2+t, 0,
        w/2+dw*2+w, -Ly/2+t, 0,
        -w/2-dw*2-w, -Ly/2+t, -w/2-dw*2-w,
        -w/2-dw*2-w, -Ly/2+t, w/2+dw*2+w,
        w/2+dw*2+w, -Ly/2+t, -w/2-dw*2-w,
        w/2+dw*2+w, -Ly/2+t, w/2+dw*2+w,
    ];

    let array_size = [
        h, t, 2*w,
        h, t, 2*w,
        2*h, t, w,
        2*h, t, w,
        2*h, t, 2*w,
        2*h, t, 2*w,
        2*h, t, 2*w,
        2*h, t, 2*w,
    ];

    for(var i=0; i<8; i++){
        let mesh = new THREE.Mesh(new THREE.BoxGeometry(array_size[i*3+0], array_size[i*3+1], array_size[i*3+2]), editGridMaterial);
        mesh.position.set(sPosition[i*3+0], sPosition[i*3+1], sPosition[i*3+2]);
        mesh.grid_id = i;
        SlopeGrid.add(mesh);
    }
    
    console.log("SlopeGrid:", SlopeGrid);
    SlopeGrid.visible = false;
    player.SlopeGrid = SlopeGrid;

    let Slope = new Object();
    Slope.size = array_size;
    Slope.position = sPosition;
    player.editCollider.Slope = Slope;

    //--- Cone z-x plane
    Lz = grid_size
    Lx = grid_size
    Ly = gridH_size
    dw = Lz * 0.01;
    dh = Lx * 0.01;
    let ConeGrid = new THREE.Group();
        ConeGrid.position.set(0, 0, 0);
    w = Lz/2 - dw*2;
    h = Lx/2 - dh*2;
    t = buildThick;
    let cPosition = [];
    for(var i=0; i<2; i++){
        for(var j=0; j<2; j++){
            let z = Lz/2/2 + Lz/2*j - Lz/2;
            let x = Lx/2/2 + Lx/2*i - Lx/2;
            let mesh = new THREE.Mesh(new THREE.BoxGeometry(h, t, w), editGridMaterial);
            mesh.position.set(x, -Ly/2+t, z);
            mesh.grid_id = j + i*2;
            ConeGrid.add(mesh);
            cPosition.push(x);
            cPosition.push(-Ly/2+t);
            cPosition.push(z);
        }
    }
    console.log("ConeGrid:", ConeGrid);
    ConeGrid.visible = false;
    player.ConeGrid = ConeGrid;

    let Cone = new Object();
    Cone.w = w;
    Cone.h = h;
    Cone.t = t;
    Cone.position = cPosition;
    player.editCollider.Cone = Cone;


    console.log("player.editCollider:", player.editCollider);
}

function mEditGridSelected(mesh, judge=true){
    if(judge){
        mesh.material = editGridSelectedMaterial;
    }else{
        mesh.material = editGridMaterial;
    }
}

function mEditSlopeGridSelected(mesh, judge=true){
    if(judge){
        mesh.material = editGridMaterial; // blue
    }else{
        mesh.material = editSlopeGridUnSelectedMaterial; // gray
    }
}

function mEditConeGridSelected(mesh, judge=true){
    console.log("mEditConeGridSelected")
    //let geo = mesh.geometry;
    //console.log("geo", geo)
    if(judge){
        //geo.translate(0, buildThick, 0);
        mesh.position.y = -gridH_size/2 + buildThick * 2
    }else{
        //geo.translate(0, 0, 0);
        mesh.position.y = -gridH_size/2 + buildThick * 1
    }
}


function mCreateWallEditShape(editType, doorDir=1){

    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
        mat.transparent = true;
    let mat1p = new THREE.MeshLambertMaterial({map: build1pTexture, side: THREE.DoubleSide});
        mat1p.transparent = true;
    let mat2p = new THREE.MeshLambertMaterial({map: build2pTexture, side: THREE.DoubleSide});
        mat2p.transparent = true;
    let mat4p = new THREE.MeshLambertMaterial({map: build4pTexture, side: THREE.DoubleSide});
        mat4p.transparent = true;
    let mat_d = new THREE.MeshLambertMaterial({map: buildDoorTexture, side: THREE.DoubleSide});
        mat_d.transparent = true;

    let g = new THREE.Group();
    g.rotation.order = "YXZ"; 
    let N = 0;
    let Lmat = [];
    let dmat = [];
    let mvec = [];

    /*if(editType==0){
        let geo = new THREE.BoxGeometry(grid_size, gridH_size, buildThick);
        let m = new THREE.Mesh(geo, mat);
        return m;
    }else if(editType==12){
        let geo = new THREE.BoxGeometry(grid_size, gridH_size/2, buildThick);
        geo.translate(0, -gridH_size/4, 0);
        let m = new THREE.Mesh(geo, mat);        
        return m;
    }else if(editType==15){
        let geo = new THREE.BoxGeometry(grid_size, gridH_size/3, buildThick);
        geo.translate(0, gridH_size/3, 0);
        let m = new THREE.Mesh(geo, mat);        
        g.add(m);
        geo = new THREE.BoxGeometry(grid_size/4, gridH_size, buildThick);
        geo.translate(grid_size/8*3, 0, 0);
        m = new THREE.Mesh(geo, mat2p);        
        g.add(m);
        return g;
    }*/
    
    let Lx = grid_size;
    let Ly = gridH_size;
    let Lz = buildThick;

    if(editType==0){
        //let geo = new THREE.BoxGeometry(grid_size, gridH_size, buildThick);
        N = 1;
        Lmat = [Lx, Ly, Lz];
        dmat = [0, 0, 0];
        mvec = [mat];
    }else if(editType==1){
        N = 4;
        Lmat = [Lx/3, Ly, Lz,
                Lx/3, Ly/4, Lz,
                Lx/3, Ly/3, Lz,
                Lx/3, Ly, Lz];
        dmat = [-Lx/3, 0.0, 0.0,
                0.0, -Ly*3/8, 0.0,
                0.0,  Ly/3, 0.0,
                Lx/3, 0.0, 0.0,];   
        mvec = [mat2p, mat2p, mat2p, mat2p];
    }else if(editType==2){
        N = 4;
        /*Lmat = [Lx*5/9, Ly, Lz,
                Lx*1/3, Ly/4, Lz,
                Lx*1/3, Ly/3, Lz,
                Lx/9, Ly, Lz];
        dmat = [-Lx*4/18, 0.0, 0.0,
                Lx*4/18, -Ly*3/8, 0.0,
                Lx*4/18,  Ly/3, 0.0,
                Lx*8/18, 0.0, 0.0,];   */
        Lmat = [Lx*2/3, Ly, Lz,
                Lx*2/9, Ly/4, Lz,
                Lx*2/9, Ly/3, Lz,
                Lx/9, Ly, Lz];
        dmat = [-Lx/6, 0.0, 0.0,
                Lx*5/18, -Ly*3/8, 0.0,
                Lx*5/18,  Ly/3, 0.0,
                Lx*8/18, 0.0, 0.0,];   
        mvec = [mat4p, mat2p, mat2p, mat1p];
    }else if(editType==3){
        N = 4;
        Lmat = [Lx/9, Ly, Lz, 
                Lx*2/9, Ly/4, Lz,
                Lx*2/9, Ly/3, Lz,
                Lx*2/3, Ly, Lz];
        dmat = [-Lx*8/18, 0.0, 0.0,
                -Lx*5/18, -Ly*3/8, 0.0,
                -Lx*5/18,  Ly/3, 0.0,
                Lx/6, 0.0, 0.0,
                ];   
        mvec = [mat1p, mat2p, mat2p, mat4p,];
    }else if(editType==4){
        N = 7;
        Lmat = [Lx/9, Ly, Lz, 
                Lx*2/9, Ly/4, Lz,
                Lx*2/9, Ly/3, Lz,
                Lx/3, Ly, Lz,
                Lx*2/9, Ly/4, Lz,
                Lx*2/9, Ly/3, Lz,
                Lx/9, Ly, Lz];
        dmat = [-Lx*8/18, 0.0, 0.0,
                -Lx*5/18, -Ly*3/8, 0.0,
                -Lx*5/18,  Ly/3, 0.0,
                0.0, 0.0, 0.0,
                Lx*5/18, -Ly*3/8, 0.0,
                Lx*5/18,  Ly/3, 0.0,
                Lx*8/18, 0.0, 0.0,
                ];   
        mvec = [mat1p, mat2p, mat2p, mat2p, mat2p, mat2p, mat1p,];
    }else if(editType==5){
        N = 4;
        Lmat = [Lx/3, Ly, Lz,
                Lx/3, Ly*5/12, Lz,
                Lx/3, Ly, Lz,
                Lz, Ly*7/12, Lx/3, ];
        dmat = [-Lx/3, 0.0, 0.0,
                0.0,  Ly*7/24, 0.0,
                Lx/3, 0.0, 0.0,
                -Lx/6,  -Ly*5/24, doorDir*Lx/6,];   
        mvec = [mat2p, mat2p, mat2p, mat_d,];
    }else if(editType==6){
        N = 4;
        Lmat = [Lx*5/9, Ly, Lz,
                Lx/3, Ly*5/12, Lz,
                Lx/9, Ly, Lz,
                Lz, Ly*7/12, Lx/3, ];
        dmat = [-Lx*4/18, 0.0, 0.0,
                Lx*4/18,  Ly*7/24, 0.0,
                Lx*8/18, 0.0, 0.0,
                Lx*7/18,  -Ly*5/24, doorDir*Lx/6,];   
        mvec = [mat4p, mat2p, mat1p, mat_d,];
    }else if(editType==7){
        N = 4;
        Lmat = [Lx/9, Ly, Lz,
                Lx/3, Ly*5/12, Lz,
                Lx*5/9, Ly, Lz,
                Lz, Ly*7/12, Lx/3, ];
        dmat = [-Lx*8/18, 0.0, 0.0,
                -Lx*4/18,  Ly*7/24, 0.0,
                Lx*4/18, 0.0, 0.0,
                -Lx*7/18,  -Ly*5/24, doorDir*Lx/6,];   
        mvec = [mat1p, mat2p, mat4p, mat_d,];
    }else if(editType==8){
        let m = mCreateTriangleWallMesh();
        g.add(m);
        g.rotation.z = Math.PI;
    }else if(editType==9){
        let m = mCreateTriangleWallMesh();
        g.add(m);
        g.rotation.x = Math.PI;
    }else if(editType==10){
        let m = mCreateTriangleWallMesh();
        g.add(m);
    }else if(editType==11){
        let m = mCreateTriangleWallMesh();
        g.add(m);
        g.rotation.y = Math.PI;
    }else if(editType==12){
        //let geo = new THREE.BoxGeometry(grid_size, gridH_size/2, buildThick);
        //geo.translate(0, -gridH_size/4, 0);
        N = 1;
        Lmat = [Lx, Ly/2, Lz];
        dmat = [0, -Ly/4, 0];
        mvec = [mat];
    }else if(editType==13){
        N = 7;
        Lmat = [Lx/9, Ly, Lz, 
                Lx*2/9, Ly/4, Lz,
                Lx*2/9, Ly/3, Lz,
                Lx*2/9, Ly, Lz,
                Lx/3, Ly*5/12, Lz,
                Lx/9, Ly, Lz,
                Lz, Ly*7/12, Lx/3, ];
        dmat = [-Lx*8/18, 0.0, 0.0,
                -Lx*5/18, -Ly*3/8, 0.0,
                -Lx*5/18,  Ly/3, 0.0,
                -Lx*1/18, 0.0, 0.0,
                Lx*4/18,  Ly*7/24, 0.0,
                Lx*8/18, 0.0, 0.0,
                Lx*7/18,  -Ly*5/24, doorDir*Lx/6,];   
        mvec = [mat1p, mat2p, mat2p, mat2p, mat2p, mat1p, mat_d,];
    }else if(editType==14){
        N = 7;
        Lmat = [Lx/9, Ly, Lz,
                Lx/3, Ly*5/12, Lz,
                Lx*2/9, Ly, Lz,
                Lx*2/9, Ly/4, Lz,
                Lx*2/9, Ly/3, Lz,
                Lx/9, Ly, Lz,
                Lz, Ly*7/12, Lx/3, ];
        dmat = [-Lx*8/18, 0.0, 0.0,
                -Lx*4/18,  Ly*7/24, 0.0,
                Lx*1/18, 0.0, 0.0,
                Lx*5/18, -Ly*3/8, 0.0,
                Lx*5/18,  Ly/3, 0.0,
                Lx*8/18, 0.0, 0.0,
                -Lx*7/18,  -Ly*5/24, doorDir*Lx/6,];   
        mvec = [mat1p, mat2p, mat2p, mat2p, mat2p, mat1p, mat_d,];
    }else if(editType==15){
        //let geo = new THREE.BoxGeometry(grid_size, gridH_size/3, buildThick);
        //geo.translate(0, gridH_size/3, 0);
        //geo = new THREE.BoxGeometry(grid_size/4, gridH_size, buildThick);
        //geo.translate(grid_size/8*3, 0, 0);
        N = 2;
        Lmat = [Lx*3/4, Ly/3, Lz,
                Lx/4, Ly, Lz];
        dmat = [-Lx/8, Ly/3, 0.0,
                Lx/8*3, 0.0, 0.0];   
        mvec = [mat, mat2p];
    }else if(editType==16){
        N = 2;
        Lmat = [Lx*3/4, Ly/3, Lz,
                Lx/4, Ly, Lz];
        dmat = [Lx/8, Ly/3, 0.0,
                -Lx/8*3, 0.0, 0.0];
        mvec = [mat, mat2p];
    }else if(editType==17){
        N = 3;
        Lmat = [Lx/8, Ly, Lz,
                Lx*3/4, Ly/3, Lz,
                Lx/8, Ly, Lz];
        dmat = [-Lx*7/16, 0.0, 0.0,
                0.0, Ly/3, 0.0,
                Lx*7/16, 0.0, 0.0,];
        mvec = [mat1p, mat, mat1p];
    }else if(editType==18){
        N = 3;
        Lmat = [Lx/3, Ly/2, Lz,
                Lx/3, Ly/2, Lz,
                Lz, Ly*7/12, Lx/3, ];
        dmat = [-Lx/3, -Ly/4, 0.0,
                Lx/3, -Ly/4, 0.0,
                -Lx/6,  -Ly*5/24, Lx/6,];   
        mvec = [mat2p, mat2p, mat2p, mat2p,];
    }else if(editType==19){
        N = 1;
        Lmat = [Lx, Ly/4, Lz];
        dmat = [0, -Ly/8*3, 0];
        mvec = [mat];
    }else if(editType==20){
        N = 1;
        Lmat = [Lx/4, Ly, Lz];
        dmat = [-Lx*3/8, 0, 0];
        mvec = [mat2p];
    }else if(editType==21){
        N = 1;
        Lmat = [Lx/4, Ly, Lz];
        dmat = [Lx*3/8, 0, 0];
        mvec = [mat2p];
    }else if(editType==22){
        N = 1;
        Lmat = [Lx/2, Ly/4, Lz];
        dmat = [-Lx/4, -Ly*3/8, 0];
        mvec = [mat4p];
    }else if(editType==23){
        N = 1;
        Lmat = [Lx/2, Ly/4, Lz];
        dmat = [Lx/4, -Ly*3/8, 0];
        mvec = [mat4p];
    }else if(editType==24){
        N = 1;
        Lmat = [Lx/2, Ly/2, Lz];
        dmat = [-Lx/4, -Ly/4, 0];
        mvec = [mat4p];
    }else if(editType==25){
        N = 1;
        Lmat = [Lx/2, Ly/2, Lz];
        dmat = [Lx/4, -Ly/4, 0];
        mvec = [mat4p];
    }

    for(var i=0; i<N; i++){
        let lx = Lmat[i*3+0];
        let ly = Lmat[i*3+1];
        let lz = Lmat[i*3+2];
        let dx = dmat[i*3+0];
        let dy = dmat[i*3+1];
        let dz = dmat[i*3+2];
        
        let geo = new THREE.BoxGeometry(lx, ly, lz);
        geo.translate(dx, dy, dz);
        let m = new THREE.Mesh(geo, mvec[i]);        
        g.add(m);
    }

    g.N = N;
    g.Lmat = Lmat;
    g.dmat = dmat;

    return g;
    //return mesh;
}

function mCreateTriangleWallMesh(){
    // x-y plane 90 deg. at (0,0)

    let Lx = grid_size;
    let Ly = gridH_size;
    let Lz = buildThick;

    const geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array(3*8*3); // z+, z-, x-1, x-2, y-1,y-2, xy1, xy2
    let uvs = new Float32Array(3*8*2);
    let indices = new Uint32Array(8*3);
    let tri_coord = [ 
        0, 0, Lz/2,
        Lx, 0, Lz/2,
        0, Ly, Lz/2,

        0, 0, -Lz/2,
        0, Ly, -Lz/2,
        Lx, 0, -Lz/2,

        0, 0, Lz/2,
        0, Ly, Lz/2,
        0, 0, -Lz/2,
        0, Ly, -Lz/2,
        0, 0, -Lz/2,
        0, Ly, Lz/2,

        0, 0, -Lz/2,
        Lx, 0, -Lz/2,
        0, 0, Lz/2,
        Lx, 0, Lz/2,
        0, 0, Lz/2,
        Lx, 0, -Lz/2,

        Lx, 0, -Lz/2,
        0, Ly, -Lz/2,
        Lx, 0, Lz/2,
        0 , Ly, Lz/2,
        Lx, 0, Lz/2,
        0 , Ly, -Lz/2,
        ];
    let uv_coord = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,

    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,

    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    ];
    for(var i=0; i<tri_coord.length; i++){
        vertices[i] = tri_coord[i];
    }
    for(var i=0; i<uvs.length; i++){
        uvs[i] = uv_coord[i];
    }
    for(var i=0; i<indices.length; i++){
        indices[i] = i;
    }

    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'uv',    new THREE.BufferAttribute( uvs,  2));
    geometry.setAttribute( 'index',    new THREE.BufferAttribute( indices,  1));
    geometry.computeVertexNormals();   
    geometry.translate(-Lx/2, -Ly/2, 0); 

    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
    mat.transparent = true;
    mat.opacity = 1.0;

    let triangleMesh = new THREE.Mesh( geometry, mat );
    triangleMesh.castShadow = true
    triangleMesh.receiveShadow = true;

    return triangleMesh;
}


function mCreateFloorEditShape(editType){

    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
        mat.transparent = true;
    let mat1p = new THREE.MeshLambertMaterial({map: build1pTexture, side: THREE.DoubleSide});
        mat1p.transparent = true;
    let mat2p = new THREE.MeshLambertMaterial({map: build2pTexture, side: THREE.DoubleSide});
        mat2p.transparent = true;
    let mat4p = new THREE.MeshLambertMaterial({map: build4pTexture, side: THREE.DoubleSide});
        mat4p.transparent = true;
    let mat_d = new THREE.MeshLambertMaterial({map: buildDoorTexture, side: THREE.DoubleSide});
        mat_d.transparent = true;

    let g = new THREE.Group();
    g.rotation.order = "YXZ"; 
    let N = 0;
    let Lmat = [];
    let dmat = [];
    let mvec = [];

    let Lx = grid_size;
    let Ly = gridH_size;
    let Lz = grid_size;
    let Lt = buildThick;

    if(editType==0){
        N = 1;
        Lmat = [Lx, Lt, Lz];
        dmat = [0, 0, 0];
        mvec = [mat];
    }else if(editType==1 || editType==2 || editType==3 || editType==4){
        N = 4;
        Lmat = [Lx/2, Lt, Lz/2,
                Lx/2, Lt, Lz,
                Lx/2, Ly/4, Lt,
                Lt, Ly/4, Lz/2,];
        dmat = [-Lx/4, 0, Lz/4,
                 Lx/4, 0, 0,
                -Lx/4, Ly/8, 0,
                 0, Ly/8, -Lz/4,];
        mvec = [mat, mat, mat, mat];

        if(editType==2){
            g.rotation.y = Math.PI/2
        }else if(editType==3){
            g.rotation.y = -Math.PI/2
        }else if(editType==4){
            g.rotation.y = Math.PI
        }
    }else if(editType==5 || editType==6 || editType==7 || editType==8){
        N = 2;
        Lmat = [Lx/2, Lt, Lz,
                Lt, Ly/4, Lz,];
        dmat = [ Lx/4, 0, 0,
                 0, Ly/8, 0,];
        mvec = [mat, mat, ];

        if(editType==6){
            g.rotation.y = Math.PI
        }else if(editType==7){
            g.rotation.y = -Math.PI/2
        }else if(editType==8){
            g.rotation.y = Math.PI/2
        }
    }else if(editType==11 || editType==12 || editType==13 || editType==14){
        N = 3;
        Lmat = [Lx/2, Lt, Lz/2,
                Lx/2, Ly/4, Lt,
                Lt, Ly/4, Lz/2,];
        dmat = [-Lx/4, 0, -Lz/4,
                -Lx/4, Ly/8, 0,
                 0, Ly/8, -Lz/4,];
        mvec = [mat, mat, mat, ];

        if(editType==12){
            g.rotation.y = Math.PI/2
        }else if(editType==13){
            g.rotation.y = -Math.PI/2
        }else if(editType==14){
            g.rotation.y = Math.PI
        }
    }

    for(var i=0; i<N; i++){
        let lx = Lmat[i*3+0];
        let ly = Lmat[i*3+1];
        let lz = Lmat[i*3+2];
        let dx = dmat[i*3+0];
        let dy = dmat[i*3+1];
        let dz = dmat[i*3+2];
        
        let geo = new THREE.BoxGeometry(lx, ly, lz);
        geo.translate(dx, dy, dz);
        let m = new THREE.Mesh(geo, mvec[i]);        
        g.add(m);
    }

    g.N = N;
    g.Lmat = Lmat;
    g.dmat = dmat;

    return g;
}

function mCreateSlopeEditShape(editType){

    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
        mat.transparent = true;
    let mat1p = new THREE.MeshLambertMaterial({map: build1pTexture, side: THREE.DoubleSide});
        mat1p.transparent = true;
    let mat2p = new THREE.MeshLambertMaterial({map: build2pTexture, side: THREE.DoubleSide});
        mat2p.transparent = true;
    let mat4p = new THREE.MeshLambertMaterial({map: build4pTexture, side: THREE.DoubleSide});
        mat4p.transparent = true;
    let mat_d = new THREE.MeshLambertMaterial({map: buildDoorTexture, side: THREE.DoubleSide});
        mat_d.transparent = true;

    let g = new THREE.Group();
    g.rotation.order = "YXZ"; 
    let N = 0;
    let Lmat = [];
    let dmat = [];
    let mvec = [];

    let Lx = grid_size;
    let Ly = gridH_size;
    let Lz = grid_size;
    let Lt = buildThick;
    let L = Math.sqrt(grid_size*grid_size+gridH_size*gridH_size); 

    if(editType==0 || editType==1 || editType==2 || editType==3){
        N = 1;
        Lmat = [Lx, Lt, L];
        dmat = [0, 0, 0];
        mvec = [mat];

        if(editType==1){
            g.rotation.y = Math.PI
        }else if(editType==2){
            g.rotation.y = Math.PI/2
        }else if(editType==3){
            g.rotation.y = -Math.PI/2
        }
        g.rotation.x = -slope_ang;
    }else if(editType>=4  && editType<=11){
        N = 2;
        Lmat = [Lx/2, Lt, L,
                Lt, Ly/4, L,];
        dmat = [-Lx/4, 0, 0,
                0, Ly/8, 0,];
        mvec = [mat, mat];

        if(editType==4){
            g.rotation.y = 0;
            g.rotation.x = -slope_ang;
        }else if(editType==5){
            g.rotation.y = 0;
            g.rotation.x =  slope_ang;
        }else if(editType==6){
            g.rotation.y = Math.PI/2;
            g.rotation.x = -slope_ang;
        }else if(editType==7){
            g.rotation.y = Math.PI/2;
            g.rotation.x =  slope_ang;
        }else if(editType==8){
            g.rotation.y = Math.PI;
            g.rotation.x = -slope_ang;
        }else if(editType==9){
            g.rotation.y = Math.PI;
            g.rotation.x =  slope_ang;
        }else if(editType==10){
            g.rotation.y = -Math.PI/2;
            g.rotation.x = -slope_ang;
        }else if(editType==11){
            g.rotation.y = -Math.PI/2;
            g.rotation.x =  slope_ang;
        }
        
    }

    for(var i=0; i<N; i++){
        let lx = Lmat[i*3+0];
        let ly = Lmat[i*3+1];
        let lz = Lmat[i*3+2];
        let dx = dmat[i*3+0];
        let dy = dmat[i*3+1];
        let dz = dmat[i*3+2];
        
        let geo = new THREE.BoxGeometry(lx, ly, lz);
        geo.translate(dx, dy, dz);
        let m = new THREE.Mesh(geo, mvec[i]);        
        g.add(m);
    }

    g.N = N;
    g.Lmat = Lmat;
    g.dmat = dmat;

    return g;
}

function mCreateConeEditShape(editType){

    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
        mat.transparent = true;
    let mat1p = new THREE.MeshLambertMaterial({map: build1pTexture, side: THREE.DoubleSide});
        mat1p.transparent = true;
    let mat2p = new THREE.MeshLambertMaterial({map: build2pTexture, side: THREE.DoubleSide});
        mat2p.transparent = true;
    let mat4p = new THREE.MeshLambertMaterial({map: build4pTexture, side: THREE.DoubleSide});
        mat4p.transparent = true;
    let mat_d = new THREE.MeshLambertMaterial({map: buildDoorTexture, side: THREE.DoubleSide});
        mat_d.transparent = true;

    let g = new THREE.Group();
    g.rotation.order = "YXZ"; 
    let N = 0;
    let Lmat = [];
    let dmat = [];
    let mvec = [];

    let Lx = grid_size;
    let Ly = gridH_size;
    let Lz = grid_size;
    let Lt = buildThick;
    let L = Math.sqrt(grid_size*grid_size+gridH_size*gridH_size); 

    if(editType==0){
        let geo = mCreateConeGeometry();
        let m = new THREE.Mesh(geo, mat);        
        g.add(m);
    }else if(editType==1 || editType==2 || editType==3 || editType==4){
        let m = mCreateEditConeMesh1();
        g.add(m);
        if(editType==2){
            g.rotation.y = Math.PI/2
        }else if(editType==3){
            g.rotation.y = -Math.PI/2
        }else if(editType==4){
            g.rotation.y = Math.PI
        }
    }else if(editType==5 || editType==6 || editType==7 || editType==8){
        N = 1;
        Lmat = [L, Lt, Lz];
        dmat = [0, 0, 0];
        mvec = [mat];

        if(editType==6){
            g.rotation.y = Math.PI
        }else if(editType==7){
            g.rotation.y = -Math.PI/2
        }else if(editType==8){
            g.rotation.y = Math.PI/2
        }
        g.rotation.z = -slope_ang;
    }else if(editType==9 || editType==10){
        let m = mCreateEditConeMesh2();
        g.add(m);
        if(editType==10){
            g.rotation.y = Math.PI/2
        }
    }else if(editType==11 || editType==12 || editType==13 || editType==14){
        let m = mCreateEditConeMesh3();
        g.add(m);
        if(editType==12){
            g.rotation.y = Math.PI/2
        }else if(editType==13){
            g.rotation.y = -Math.PI/2
        }else if(editType==14){
            g.rotation.y = Math.PI
        }
    }

    for(var i=0; i<N; i++){
        let lx = Lmat[i*3+0];
        let ly = Lmat[i*3+1];
        let lz = Lmat[i*3+2];
        let dx = dmat[i*3+0];
        let dy = dmat[i*3+1];
        let dz = dmat[i*3+2];
        
        let geo = new THREE.BoxGeometry(lx, ly, lz);
        geo.translate(dx, dy, dz);
        let m = new THREE.Mesh(geo, mvec[i]);        
        g.add(m);
    }

    g.N = N;
    g.Lmat = Lmat;
    g.dmat = dmat;

    return g;
}

function mCreateEditConeMesh1(){
    // z-x plane

    let Lx = grid_size;
    let Ly = gridH_size;
    let Lz = grid_size;

    const geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array(3*2*3); // 
    let uvs = new Float32Array(3*2*2);
    let indices = new Uint32Array(2*3);
    let tri_coord = [ 
        -Lx/2,  Ly/2, -Lz/2,
        -Lx/2, -Ly/2,  Lz/2,
         Lx/2, -Ly/2,  Lz/2,

        -Lx/2,  Ly/2, -Lz/2,
         Lx/2, -Ly/2,  Lz/2,
         Lx/2, -Ly/2, -Lz/2,
        ];
    let uv_coord = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,

    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    ];
    for(var i=0; i<tri_coord.length; i++){
        vertices[i] = tri_coord[i];
    }
    for(var i=0; i<uvs.length; i++){
        uvs[i] = uv_coord[i];
    }
    for(var i=0; i<indices.length; i++){
        indices[i] = i;
    }

    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'uv',    new THREE.BufferAttribute( uvs,  2));
    geometry.setAttribute( 'index',    new THREE.BufferAttribute( indices,  1));
    geometry.computeVertexNormals();   
    //geometry.translate( 0, 0, 0); 

    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
    mat.transparent = true;
    mat.opacity = 1.0;

    let triangleMesh = new THREE.Mesh( geometry, mat );
    triangleMesh.castShadow = true
    triangleMesh.receiveShadow = true;

    return triangleMesh;
}

function mCreateEditConeMesh2(){
    // z-x plane

    let Lx = grid_size;
    let Ly = gridH_size;
    let Lz = grid_size;

    const geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array(3*2*3); // 
    let uvs = new Float32Array(3*2*2);
    let indices = new Uint32Array(2*3);
    let tri_coord = [ 
        -Lx/2,  Ly/2, -Lz/2,
        -Lx/2, -Ly/2,  Lz/2,
         Lx/2,  Ly/2,  Lz/2,

        -Lx/2,  Ly/2, -Lz/2,
         Lx/2,  Ly/2,  Lz/2,
         Lx/2, -Ly/2, -Lz/2,
        ];
    let uv_coord = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,

    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    ];
    for(var i=0; i<tri_coord.length; i++){
        vertices[i] = tri_coord[i];
    }
    for(var i=0; i<uvs.length; i++){
        uvs[i] = uv_coord[i];
    }
    for(var i=0; i<indices.length; i++){
        indices[i] = i;
    }

    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'uv',    new THREE.BufferAttribute( uvs,  2));
    geometry.setAttribute( 'index',    new THREE.BufferAttribute( indices,  1));
    geometry.computeVertexNormals();   
    //geometry.translate( 0, 0, 0); 

    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
    mat.transparent = true;
    mat.opacity = 1.0;

    let triangleMesh = new THREE.Mesh( geometry, mat );
    triangleMesh.castShadow = true
    triangleMesh.receiveShadow = true;

    return triangleMesh;
}

function mCreateEditConeMesh3(){
    // z-x plane

    let Lx = grid_size;
    let Ly = gridH_size;
    let Lz = grid_size;

    const geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array(3*2*3); // 
    let uvs = new Float32Array(3*2*2);
    let indices = new Uint32Array(2*3);
    let tri_coord = [ 
        -Lx/2, -Ly/2, -Lz/2,
         Lx/2,  Ly/2,  Lz/2,
         Lx/2,  Ly/2, -Lz/2,

        -Lx/2, -Ly/2, -Lz/2,
        -Lx/2,  Ly/2,  Lz/2,
         Lx/2,  Ly/2,  Lz/2,
        ];
    let uv_coord = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,

    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    ];
    for(var i=0; i<tri_coord.length; i++){
        vertices[i] = tri_coord[i];
    }
    for(var i=0; i<uvs.length; i++){
        uvs[i] = uv_coord[i];
    }
    for(var i=0; i<indices.length; i++){
        indices[i] = i;
    }

    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'uv',    new THREE.BufferAttribute( uvs,  2));
    geometry.setAttribute( 'index',    new THREE.BufferAttribute( indices,  1));
    geometry.computeVertexNormals();   
    //geometry.translate( 0, 0, 0); 

    let mat = new THREE.MeshLambertMaterial({map: buildTexture, side: THREE.DoubleSide});
    mat.transparent = true;
    mat.opacity = 1.0;

    let triangleMesh = new THREE.Mesh( geometry, mat );
    triangleMesh.castShadow = true
    triangleMesh.receiveShadow = true;

    return triangleMesh;
}


function mJudgeEdit(player, ArrayBuild_, world_){
    console.log("mJudgeEdit:");
    let judge = false;
    let playerPiv1 = player.playerMesh.getObjectByName("Piv1"); 

    let {hit, ray} = mPlayerRayHit(world_, playerPiv1);
    if (hit != null) {
        //console.log("hit.timeOfImpact:", hit.timeOfImpact);
        let L = hit.timeOfImpact;
        let b = ArrayBuild_[hit.collider.build_id];
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

            //console.log("player:", player);
        }    
    }

    return judge;
}


function mInitEditCollider(player, world_edit_){

    //--- zWall
    let Lx = player.editCollider.zWall.w;
    let Ly = player.editCollider.zWall.h;
    let Lz = player.editCollider.zWall.t;

    let array_col = [];
    let array_body = [];
    for(var i=0; i<9; i++){
        let wallBody = world_edit_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0)) //.setTranslation(px, py, pz))
        let wallShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(0).setRestitution(0.0).setFriction(0.0)
        let col = world_edit_.createCollider(wallShape, wallBody);
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
        let wallBody = world_edit_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0)) //.setTranslation(px, py, pz))
        let wallShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(0).setRestitution(0.0).setFriction(0.0)
        let col = world_edit_.createCollider(wallShape, wallBody);
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
        let floorBody = world_edit_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0)) //.setTranslation(px, py, pz))
        let floorShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(0).setRestitution(0.0).setFriction(0.0)
        let col = world_edit_.createCollider(floorShape, floorBody);
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
        let slopeBody = world_edit_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0)) //.setTranslation(px, py, pz))
        let slopeShape = RAPIER.ColliderDesc.cuboid(array_size[i*3+0]/2, array_size[i*3+1]/2, array_size[i*3+2]/2).setMass(0).setRestitution(0.0).setFriction(0.0)
        let col = world_edit_.createCollider(slopeShape, slopeBody);
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
        let coneBody = world_edit_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,0,0)) //.setTranslation(px, py, pz))
        let coneShape = RAPIER.ColliderDesc.cuboid(Lx/2, Ly/2, Lz/2).setMass(0).setRestitution(0.0).setFriction(0.0)
        let col = world_edit_.createCollider(coneShape, coneBody);
        col.grid_id = i;
        //col.setEnabled(false);
        coneBody.setEnabled(false);
        array_col_c.push(col);
        array_body_c.push(coneBody);
    }
    player.editCollider.Cone.colliders = array_col_c;
    player.editCollider.Cone.bodies = array_body_c;

    world_edit_.timestep = 0.0
    world_edit_.step()
}

function mSetWallEditGrid(player, ArrayBuild_, world_edit_){

    let b = ArrayBuild_[player.edit_build_id];
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
        //console.log("pos:", pos)

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
        //BUILD.mEditGridSelected(mesh, b.wallEditGridSelected[i]);
        mEditGridSelected(mesh, b.wallEditGridSelected[i]);

        b.lastEditGridSelected.push(b.wallEditGridSelected[i]);
    }

    world_edit_.timestep = 0.0
    world_edit_.step()  // must call to update collider position

    //for(var i=0; i<9; i++){
    //    let col = player.editCollider.zWall.colliders[i];
    //    console.log("col:", col.translation())
    //}
    
    //console.log("player:", player);
}

function mSetFloorEditGrid(player, ArrayBuild_, world_edit_){

    let b = ArrayBuild_[player.edit_build_id];
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
    //console.log("pos:", pos)

    bodies = player.editCollider.Floor.bodies;
    meshes = player.FloorGrid.children;
    
    for(var i=0; i<4; i++){
        
        let body = bodies[i];
        body.setTranslation({ x: px+pos[i*3+0], y: py+pos[i*3+1], z: pz+pos[i*3+2] }, true);
        body.setEnabled(true);
            //console.log("body:", body.translation())
            //console.log("col:", col.translation())
        let mesh = meshes[i];
        //BUILD.mEditGridSelected(mesh, b.floorEditGridSelected[i]);
        mEditGridSelected(mesh, b.floorEditGridSelected[i]);
        b.lastEditGridSelected.push(b.floorEditGridSelected[i]);
    }

    world_edit_.timestep = 0.0
    world_edit_.step()  // must call to update collider position
    
    //console.log("player:", player);
}

function mSetSlopeEditGrid(player, ArrayBuild_, world_edit_){

    let b = ArrayBuild_[player.edit_build_id];
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
    //console.log("pos:", pos)

    bodies = player.editCollider.Slope.bodies;
    meshes = player.SlopeGrid.children;
    
    for(var i=0; i<8; i++){
        
        let body = bodies[i];
        body.setTranslation({ x: px+pos[i*3+0], y: py+pos[i*3+1], z: pz+pos[i*3+2] }, true);
        body.setEnabled(true);
            //console.log("body:", body.translation())
            //console.log("col:", col.translation())
        let mesh = meshes[i];
        //BUILD.mEditSlopeGridSelected(mesh, b.slopeEditGridSelected[i]);
        mEditSlopeGridSelected(mesh, b.slopeEditGridSelected[i]);
        b.lastEditGridSelected.push(b.slopeEditGridSelected[i]);
    }

    world_edit_.timestep = 0.0
    world_edit_.step()  // must call to update collider position
    
    //console.log("player:", player);
}

function mSetConeEditGrid(player, ArrayBuild_, world_edit_){

    let b = ArrayBuild_[player.edit_build_id];
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
        //BUILD.mEditConeGridSelected(mesh, b.coneEditGridSelected[i]);
        mEditConeGridSelected(mesh, b.coneEditGridSelected[i]);
        b.lastEditGridSelected.push(b.coneEditGridSelected[i]);
    }

    world_edit_.timestep = 0.0
    world_edit_.step()  // must call to update collider position
    
    //console.log("player:", player);
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

function mSetEditSelectMode(player, ArrayBuild_, world_edit_){

    let playerPiv1 = player.playerMesh.getObjectByName("Piv1"); 

    let {hit, ray} = mPlayerRayHit(world_edit_, playerPiv1);
    if (hit != null) {
        let grid_id = hit.collider.grid_id;
        let b = ArrayBuild_[player.edit_build_id];
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

function mSelectEditGrid(player, ArrayBuild_, world_edit_){
    //console.log("mSelectWallEditGrid");
    let select_ = false;

    if(!player.nowEdit){
        return select_;
    }
    let playerPiv1 = player.playerMesh.getObjectByName("Piv1"); 

    let {hit, ray} = mPlayerRayHit(world_edit_, playerPiv1);
    if (hit != null) {
        let grid_id = hit.collider.grid_id;
        //console.log("grid_id:", grid_id);
        //console.log("hit.timeOfImpact:", hit.timeOfImpact);
        //let L = hit.timeOfImpact;
        let b = ArrayBuild_[player.edit_build_id];
        //console.log("b:", b);  
        if(b==null){
            return select_;
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
            mEditGridSelected(mesh, player.editSelectMode);
            if(b.wallEditGridSelected[grid_id] != player.editSelectMode){
                //mPlayAudioBuffer(mArrayAudio[9])
                select_ = true;
            }
            b.wallEditGridSelected[grid_id] = player.editSelectMode;
        }else if( b.buildType==1 ){
            mEditGridSelected(mesh, player.editSelectMode);
            if(b.floorEditGridSelected[grid_id] != player.editSelectMode){
                //mPlayAudioBuffer(mArrayAudio[9])
                select_ = true;
            }
            b.floorEditGridSelected[grid_id] = player.editSelectMode;
        }else if( b.buildType==2 ){
            //console.log("mSelectEditGrid, slope, grid_id:", grid_id);
            //let s = player.slopeGridSelectOrder;
            let s = b.slopeGridSelectOrder;
            if( s.length == 0 ){
                s.push(grid_id);
                for(var i=0; i<8; i++){
                    mEditSlopeGridSelected(player.SlopeGrid.children[i], false);
                    b.slopeEditGridSelected[i] = false;
                }
                b.slopeEditGridSelected[grid_id] = true;
                mEditSlopeGridSelected(mesh, true);
                //mPlayAudioBuffer(mArrayAudio[9])
                select_ = true;
                if(s[0]<4){
                    if(s[0]==0){
                        mEditSlopeGridSelected(player.SlopeGrid.children[4], true);
                        mEditSlopeGridSelected(player.SlopeGrid.children[6], true);
                    }else if(s[0]==1){
                        mEditSlopeGridSelected(player.SlopeGrid.children[5], true);
                        mEditSlopeGridSelected(player.SlopeGrid.children[7], true);
                    }else if(s[0]==2){
                        mEditSlopeGridSelected(player.SlopeGrid.children[4], true);
                        mEditSlopeGridSelected(player.SlopeGrid.children[5], true);
                    }else if(s[0]==3){
                        mEditSlopeGridSelected(player.SlopeGrid.children[6], true);
                        mEditSlopeGridSelected(player.SlopeGrid.children[7], true);
                    }
                }else{

                }
            }else if( s.length == 1 ){
                if(s[0]<4){
                    if(grid_id<4 && s[0]!=grid_id){
                        s.push(grid_id);
                        //b.slopeEditGridSelected[grid_id] = true;
                        for(var i=0; i<8; i++){ //all blue
                            mEditSlopeGridSelected(player.SlopeGrid.children[i], true);
                            b.slopeEditGridSelected[i] = true;
                        }
                        //mPlayAudioBuffer(mArrayAudio[9])
                        select_ = true;
                    }

                }else{
                    if(grid_id>=4 && s[0]!=grid_id){
                        s.push(grid_id);
                        b.slopeEditGridSelected[grid_id] = true;
                        let g = b.slopeEditGridSelected;
                        //console.log("g:", g);
                        mEditSlopeGridSelected(player.SlopeGrid.children[grid_id], true);
                        if(g[4] && g[5]){ //((s[0]==4 && s[1]==5) || (s[0]==5 && s[1]==4)){
                            mEditSlopeGridSelected(player.SlopeGrid.children[2], true);
                            g[2] = true;
                        }else if(g[6] && g[7]){ //((s[0]==6 && s[1]==7) || (s[0]==7 && s[1]==6)){
                            mEditSlopeGridSelected(player.SlopeGrid.children[3], true);
                            g[3] = true;
                        }else if(g[4] && g[6]) { //((s[0]==4 && s[1]==6) || (s[0]==6 && s[1]==4)){
                            mEditSlopeGridSelected(player.SlopeGrid.children[0], true);
                            g[0] = true;
                        }else if(g[5] && g[7]) { //((s[0]==5 && s[1]==7) || (s[0]==7 && s[1]==5)){
                            mEditSlopeGridSelected(player.SlopeGrid.children[1], true);
                            g[1] = true;
                        }               
                        //mPlayAudioBuffer(mArrayAudio[9])
                        select_ = true;
                    }

                }
            }else if( s.length == 2 ){
                if(s[0]<4){

                }else{
                    if(grid_id>=4 && s[0]!=grid_id && s[1]!=grid_id){
                        s.push(grid_id);
                        b.slopeEditGridSelected[grid_id] = true;
                        mEditSlopeGridSelected(player.SlopeGrid.children[grid_id], true);

                    }
                }

            }

        }else if( b.buildType==3 ){
            mEditConeGridSelected(mesh, player.editSelectMode);
            if(b.coneEditGridSelected[grid_id] != player.editSelectMode){
                //mPlayAudioBuffer(mArrayAudio[9])
                select_ = true;
            }
            b.coneEditGridSelected[grid_id] = player.editSelectMode;
        }
        
    }

    return select_;

}

function mResetEdit(player, ArrayBuild_){
    let b = ArrayBuild_[player.edit_build_id];
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

function mApplyEditShape(player, ArrayBuild_, scene_, world_){

    let b = ArrayBuild_[player.edit_build_id];
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
        if( b.dirType == "z" && b.position.z < player.playerMesh.position.z ){
            b.doorDir = -1;
        }else if( b.dirType == "x" && b.position.x > player.playerMesh.position.x ){
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

        b.edgePoints = mCreateSlopeEdgePoints(px, py, pz, b.dirType, b.editType)
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

        b.edgePoints = mCreateConeEdgePoints(px, py, pz, b.editType)
    }

    mSetEditShape(b, ArrayBuild_, scene_)
    mSetEditCollider(b, world_)
    
}



function mSetEditShape(build, ArrayBuild_, scene_){

    if(build.buildType==0){
        console.log("build.editType:", build.editType);
        scene_.remove(build.buildMesh)
        let mesh = mCreateWallEditShape(build.editType, build.doorDir);
        mesh.position.x = build.body.translation().x;
        mesh.position.y = build.body.translation().y;
        mesh.position.z = build.body.translation().z;
        if(build.dirType=="x"){
            mesh.rotation.y += -Math.PI/2;
        }
        ArrayBuild_[build.build_id].buildMesh = mesh;
        build.buildMesh = mesh;
        scene_.add(mesh)
    }else if(build.buildType==1){
        console.log("build.editType:", build.editType);
        scene_.remove(build.buildMesh)
        let mesh = mCreateFloorEditShape(build.editType);
        mesh.position.x = build.body.translation().x;
        mesh.position.y = build.body.translation().y;
        mesh.position.z = build.body.translation().z;
        ArrayBuild_[build.build_id].buildMesh = mesh;
        build.buildMesh = mesh;
        scene_.add(mesh)
    }else if(build.buildType==2){
        console.log("build.editType:", build.editType);
        scene_.remove(build.buildMesh)
        let mesh = mCreateSlopeEditShape(build.editType);
        mesh.position.x = build.body.translation().x;
        mesh.position.y = build.body.translation().y;
        mesh.position.z = build.body.translation().z;
        ArrayBuild_[build.build_id].buildMesh = mesh;
        build.buildMesh = mesh;
        scene_.add(mesh)
    }else if(build.buildType==3){
        console.log("build.editType:", build.editType);
        scene_.remove(build.buildMesh)
        let mesh = mCreateConeEditShape(build.editType);
        mesh.position.x = build.body.translation().x;
        mesh.position.y = build.body.translation().y;
        mesh.position.z = build.body.translation().z;
        ArrayBuild_[build.build_id].buildMesh = mesh;
        build.buildMesh = mesh;
        scene_.add(mesh)
    }

}


function mSetEditCollider(build, world_){

    if(build.buildType==0){
        //world.removeCollider(build.collider);
        for(var i=0; i<build.collider.length; i++){
            world_.removeCollider(build.collider[i]);
        }
        mCreateWallEditCollider(build, world_)
    }else if(build.buildType==1){
        for(var i=0; i<build.collider.length; i++){
            world_.removeCollider(build.collider[i]);
        }
        mCreateFloorEditCollider(build, world_)
    }else if(build.buildType==2){
        for(var i=0; i<build.collider.length; i++){
            world_.removeCollider(build.collider[i]);
        }
        mCreateSlopeEditCollider(build, world_)
    }else if(build.buildType==3){
        for(var i=0; i<build.collider.length; i++){
            world_.removeCollider(build.collider[i]);
        }
        mCreateConeEditCollider(build, world_)
    }
}

function mCreateWallEditCollider(build, world_){

    let px = build.position.x;
    let py = build.position.y;
    let pz = build.position.z;

    build.collider = [];
    let wallBody = world_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))

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
        let col = world_.createCollider(wallShape, wallBody);
        col.build_id = build.build_id;
        build.collider.push(col);
    }

    if(N==0){
        //console.log("build.buildMesh:", build.buildMesh);
        let vertices = build.buildMesh.children[0].geometry.attributes.position.array;
        let indices = build.buildMesh.children[0].geometry.attributes.index.array;
        const wallShape = RAPIER.ColliderDesc.trimesh(vertices, indices).setMass(1).setRestitution(0.0).setFriction(0.0)
        const col = world_.createCollider(wallShape, wallBody);
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

    wallBody.setRotation({ w: w, x: x, y: y, z: z })

}

function mCreateFloorEditCollider(build, world_){

    let px = build.position.x;
    let py = build.position.y;
    let pz = build.position.z;

    build.collider = [];
    let floorBody = world_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))

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
        let col = world_.createCollider(floorShape, floorBody);
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

function mCreateSlopeEditCollider(build, world_){

    let px = build.position.x;
    let py = build.position.y;
    let pz = build.position.z;

    build.collider = [];
    let slopeBody = world_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))

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
        let col = world_.createCollider(slopeShape, slopeBody);
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

function mCreateConeEditCollider(build, world_){

    let px = build.position.x;
    let py = build.position.y;
    let pz = build.position.z;

    build.collider = [];
    let coneBody = world_.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(px, py, pz))

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
        let col = world_.createCollider(coneShape, coneBody);
        col.build_id = build.build_id;
        build.collider.push(col);
    }

    if(N==0){
        console.log("build.buildMesh:", build.buildMesh);
        let vertices = build.buildMesh.children[0].geometry.attributes.position.array;
        let indices = build.buildMesh.children[0].geometry.attributes.index.array;
        const coneShape = RAPIER.ColliderDesc.trimesh(vertices, indices).setMass(1).setRestitution(0.0).setFriction(1.0)
        const col = world_.createCollider(coneShape, coneBody);
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



export { 
    mScale, 
    grid_size,
    gridH_size,
    buildThick,
    slope_ang,
    grid_num,
    tol,
    mInitBuildTemp,
    mCreateWallMesh,
    mCreateFloorMesh,
    mCreateSlopeMesh,
    mCreateConeGeometry,
    mCreateConeMesh,
    mCreateWallEdgePoints,
    mCreateFloorEdgePoints,
    mCreateSlopeEdgePoints,
    mCreateConeEdgePoints,
    mCreateWallBodyCollider,
    mCreateFloorBodyCollider,
    mCreateSlopeBodyCollider,
    mCreateConeBodyCollider,
    mSetBuildTemp,
    mWallTemp,
    mFloorTemp,
    mSlopeTemp,
    mConeTemp,
    mCheckBuildIsUnique,
    mCheckBuildIsConnected,
    mInitEditGrid,
    mEditGridSelected,
    mEditSlopeGridSelected,
    mEditConeGridSelected,
    mCreateWallEditShape,
    mCreateFloorEditShape,
    mCreateSlopeEditShape,
    mCreateConeEditShape,
    mJudgeEdit,
    mInitEditCollider,
    mSetWallEditGrid,
    mSetFloorEditGrid,
    mSetSlopeEditGrid,
    mSetConeEditGrid,
    mSetEditSelectMode,
    mSelectEditGrid,
    mResetEdit,
    mApplyEditShape,
    mSetEditShape,
    mSetEditCollider,
    mCreateWallEditCollider,
    mCreateFloorEditCollider,
    mCreateSlopeEditCollider,
    mCreateConeEditCollider,
 };