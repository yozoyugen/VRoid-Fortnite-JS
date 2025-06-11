import * as THREE from 'three/webgpu';


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

const editGridUnselectedTexture = textureLoader.load('/mTPS-game-sample/image/edit_grid_unselected.jpg');
//let editGridMaterial = new THREE.MeshBasicMaterial({color: "#1e90ff"}); //"deepskyblue"
let editGridMaterial = new THREE.MeshBasicMaterial({map: editGridUnselectedTexture}); //"deepskyblue"
const editGridSelectedTexture = textureLoader.load('/mTPS-game-sample/image/edit_grid_selected.jpg');
//let editGridSelectedMaterial = new THREE.MeshBasicMaterial({color: "lightgray"}); //"deepskyblue"
let editGridSelectedMaterial = new THREE.MeshBasicMaterial({map: editGridSelectedTexture}); //"deepskyblue"

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
        -grid_size/4, 0, grid_size/2,
        -grid_size/4, 0, grid_size/2,
    ];
    
    for(var i=0; i<edgePoints.length/3; i++){
        edgePoints[i*3+0] += px;
        edgePoints[i*3+1] += py;
        edgePoints[i*3+2] += pz;
    }

    return edgePoints;
}

function mCreateSlopeEdgePoints(px, py, pz, type="z-"){
    
    let edgePoints = [];
    // origin -> build center
    let zmEdgePoints = [
        grid_size/4, -gridH_size/2, grid_size/2,
        -grid_size/4, -gridH_size/2, grid_size/2,
        grid_size/4, gridH_size/2, -grid_size/2,
        -grid_size/4, gridH_size/2, -grid_size/2,
        grid_size/2, -gridH_size/4, grid_size/4,
        grid_size/2, gridH_size/4, -grid_size/4,
        -grid_size/2, -gridH_size/4, grid_size/4,
        -grid_size/2, gridH_size/4, -grid_size/4,
    ];
    let zpEdgePoints = [
        grid_size/4, gridH_size/2, grid_size/2,
        -grid_size/4, gridH_size/2, grid_size/2,
        grid_size/4, -gridH_size/2, -grid_size/2,
        -grid_size/4, -gridH_size/2, -grid_size/2,
        grid_size/2, gridH_size/4, grid_size/4,
        grid_size/2, -gridH_size/4, -grid_size/4,
        -grid_size/2, gridH_size/4, grid_size/4,
        -grid_size/2, -gridH_size/4, -grid_size/4,
    ];

    let xmEdgePoints = [
        grid_size/2, -gridH_size/2, grid_size/4, 
        grid_size/2, -gridH_size/2, -grid_size/4, 
        -grid_size/2, gridH_size/2, grid_size/4, 
        -grid_size/2,  gridH_size/2, -grid_size/4,
        grid_size/4, -gridH_size/4, grid_size/2, 
        -grid_size/4, gridH_size/4, grid_size/2, 
        grid_size/4, -gridH_size/4, -grid_size/2, 
        -grid_size/4, gridH_size/4, -grid_size/2,
    ];
    let xpEdgePoints = [
        grid_size/2, gridH_size/2, grid_size/4, 
        grid_size/2, gridH_size/2, -grid_size/4, 
        -grid_size/2, -gridH_size/2, grid_size/4, 
        -grid_size/2, -gridH_size/2, -grid_size/4,
        grid_size/4, gridH_size/4, grid_size/2, 
        -grid_size/4, -gridH_size/4, grid_size/2, 
        grid_size/4, gridH_size/4, -grid_size/2, 
        -grid_size/4, -gridH_size/4, -grid_size/2,
    ];

    if(type == "z-"){
        edgePoints = zmEdgePoints;
    }else if(type == "z+"){
        edgePoints = zpEdgePoints;
    }else if(type == "x-"){
        edgePoints = xmEdgePoints;
    }else if(type == "x+"){
        edgePoints = xpEdgePoints;
    }

    for(var i=0; i<edgePoints.length/3; i++){
        edgePoints[i*3+0] += px;
        edgePoints[i*3+1] += py;
        edgePoints[i*3+2] += pz;
    }

    return edgePoints;
}

function mCreateConeEdgePoints(px, py, pz){
        
    // origin -> build center
    let edgePoints = [
        grid_size/2, -gridH_size/2, -grid_size/4, 
        grid_size/2, -gridH_size/2, grid_size/4, 
        -grid_size/2, -gridH_size/2, -grid_size/4, 
        -grid_size/2, -gridH_size/2, grid_size/4, 
        grid_size/4, -gridH_size/2, -grid_size/2,
        -grid_size/4, -gridH_size/2, -grid_size/2,
        -grid_size/4, -gridH_size/2, grid_size/2,
        -grid_size/4, -gridH_size/2, grid_size/2,
    ];
    
    for(var i=0; i<edgePoints.length/3; i++){
        edgePoints[i*3+0] += px;
        edgePoints[i*3+1] += py;
        edgePoints[i*3+2] += pz;
    }

    return edgePoints;
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
    console.log("player.editCollider:", player.editCollider);
    
}

function mEditGridSelected(mesh, judge=true){
    if(judge){
        mesh.material = editGridSelectedMaterial;
    }else{
        mesh.material = editGridMaterial;
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
    }else if(editType==16){
        let geo = new THREE.BoxGeometry(grid_size, gridH_size/3, buildThick);
        geo.translate(0, gridH_size/3, 0);
        let m = new THREE.Mesh(geo, mat);        
        g.add(m);
        geo = new THREE.BoxGeometry(grid_size/4, gridH_size, buildThick);
        geo.translate(-grid_size/8*3, 0, 0);
        m = new THREE.Mesh(geo, mat2p);        
        g.add(m);
        return g;
    }else if(editType==18){
        let geo = new THREE.BoxGeometry(grid_size, gridH_size/4, buildThick);
        geo.translate(0, -gridH_size/8*3, 0);
        let m = new THREE.Mesh(geo, mat);        
        return m;
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
    mSetBuildTemp,
    mWallTemp,
    mFloorTemp,
    mSlopeTemp,
    mConeTemp,
    mCheckBuildIsUnique,
    mCheckBuildIsConnected,
    mInitEditGrid,
    mEditGridSelected,
    mCreateWallEditShape,
 };