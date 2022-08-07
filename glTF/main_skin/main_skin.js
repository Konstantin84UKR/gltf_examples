//--------------------common--------------------------
import * as INIT from "../../common/utils/utilsWebGL.js";
import * as UTILS_SHADER from "../../common/utils/ShaderUtil.js";
//import * as LOADERS from "../common/utils/Loaders.js";
import * as CAMERAS from "../../common/utils/Camera.js";
import * as HELPERS_AXIS from "../../common/utils/helpers/Axis.js";
import * as HELPERS_NORMAL from "../../common/utils/helpers/VertexNormalsHelper.js";
import * as glMatrix from "../../common/glm/index.js";
//import * as LOADERS_OBJ from "../common/utils/objLoader.js";
//------------------------------------------------------
import * as GUI from "../src/utils/gui/guiSetting.js";
import { gltfScene, _base64ToArrayBuffer } from "../src/utils/gltf/gltfScene.js";
import {
  LoadJSONUsingPromise,
  glTF_parse,
} from "../src/utils/gltf/glTFLoader.js";

async function main() {
  /**
   * INIT
   */

  /** @type {HTMLCanvasElement} */
  let canvas = await INIT.createCanvasGl(500, 500);
  /** @type {WebGLRenderingContext} */
  let gl = await INIT.initWebGL2(canvas);
  //=============================================================
  /**
   * GUI
   */
  const gui = GUI.myGUI(gl);
  //=============================================================
  /**
   * SHADER
   */
  const shaderProgram = await UTILS_SHADER.createPromiseShaderProgram(
    gl,
    "../src/shaders/vs_skin.glsl",
    "../src/shaders/fs_skin.glsl"
  );

    const shaderProgramEASY = await UTILS_SHADER.createPromiseShaderProgram(
      gl,
      "../src/shaders/vs_easy.glsl",
      "../src/shaders/fs_easy.glsl"
    );

  gl.useProgram(shaderProgram);
  let vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  // Attrib
  let a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
  gl.enableVertexAttribArray(a_Position);
  let a_joint = gl.getAttribLocation(shaderProgram, "a_joint");
  gl.enableVertexAttribArray(a_joint);
  let a_weight = gl.getAttribLocation(shaderProgram, "a_weight");
  gl.enableVertexAttribArray(a_weight);
  // let a_uv = gl.getAttribLocation(shaderProgram, "a_uv");
  // gl.enableVertexAttribArray(a_uv);
  // Uniform
  let u_Color = gl.getUniformLocation(shaderProgram, "u_Color");
  let u_mMatrix = gl.getUniformLocation(shaderProgram, "u_mMatrix");
  let u_vMatrix = gl.getUniformLocation(shaderProgram, "u_vMatrix");
  let u_pMatrix = gl.getUniformLocation(shaderProgram, "u_pMatrix");
  let u_morpth = gl.getUniformLocation(shaderProgram, "u_morpth");
  let u_weights = gl.getUniformLocation(shaderProgram, "u_weights");

  let u_jointMat = gl.getUniformLocation(shaderProgram, "u_jointMat");
  gl.bindVertexArray(null);

  gl.useProgram(null);


  gl.useProgram(shaderProgramEASY);
    let u_Color_easy = gl.getUniformLocation(shaderProgramEASY, "u_Color");
    let u_mMatrix_easy = gl.getUniformLocation(shaderProgramEASY, "u_mMatrix");
    let u_vMatrix_easy = gl.getUniformLocation(shaderProgramEASY, "u_vMatrix");
    let u_pMatrix_easy = gl.getUniformLocation(shaderProgramEASY, "u_pMatrix");

      let a_Position_easy = gl.getAttribLocation(
        shaderProgramEASY,
        "a_Position"
      );
      gl.enableVertexAttribArray(a_Position_easy);



  gl.useProgram(null);

  //gl.bindVertexArray(null);
  //=============================================================
  /**
   * LOADERS
   */
  gl.useProgram(shaderProgram);
  gl.useProgram(null);

  /**
   * GLTF
   */
  let glTF = await LoadJSONUsingPromise("../resource/gltf/skin.gltf");
  let glTF_TREE = await new gltfScene(glTF);
  glTF_TREE.loadScene();
  //=============================================================
  /**
   * BUFFER
   */

  gl.useProgram(shaderProgram);
  gl.bindVertexArray(vao);

  glTF_TREE.nodes.forEach((node) => {
    if (node.hasOwnProperty("mesh")) {
       let itemMesh = glTF_TREE.RAW_MeshesData[node.mesh];
       for (let meshData in itemMesh) {
         switch (meshData) {
           case "dataPOSITION":
             itemMesh.dataPOSITION.TRIANGLE_VERTEX = gl.createBuffer();
             gl.bindBuffer(
               gl.ARRAY_BUFFER,
               itemMesh.dataPOSITION.TRIANGLE_VERTEX
             );

             gl.bufferData(
               gl.ARRAY_BUFFER,
               itemMesh.dataPOSITION.buffer_DATA,
               gl.STATIC_DRAW
             );
             break;
           case "dataINDEX":
             itemMesh.dataINDEXTRIANGLE_FACES = gl.createBuffer();
             gl.bindBuffer(
               gl.ELEMENT_ARRAY_BUFFER,
               itemMesh.dataINDEXTRIANGLE_FACES
             );
             gl.bufferData(
               gl.ELEMENT_ARRAY_BUFFER,
               itemMesh.dataINDEX.buffer_DATA,
               gl.STATIC_DRAW
             );
             break;
           case "dataJOINTS_0":
             
           let test = new Uint16Array([
             0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1,
             0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0
           ]);
           
             itemMesh.dataJOINTS_0.Buffer = gl.createBuffer();
             gl.bindBuffer(gl.ARRAY_BUFFER, itemMesh.dataJOINTS_0.Buffer);
             gl.bufferData(
               gl.ARRAY_BUFFER,
              itemMesh.dataJOINTS_0.buffer_DATA,
              //test,
               gl.STATIC_DRAW
             );
             break;
           case "dataWEIGHTS_0":
             itemMesh.dataWEIGHTS_0.Buffer = gl.createBuffer();
             gl.bindBuffer(gl.ARRAY_BUFFER, itemMesh.dataWEIGHTS_0.Buffer);
             gl.bufferData(
               gl.ARRAY_BUFFER,
               itemMesh.dataWEIGHTS_0.buffer_DATA,
               gl.STATIC_DRAW
             );
             break;
         }
       };
  
    }

    if (node.hasOwnProperty("skin")) {
       
       glTF_TREE.joints = glTF_TREE.skins[node.skin].joints;
       glTF_TREE.bones = [];
       glTF_TREE.skins[node.skin].joints.forEach(element => {
          glTF_TREE.bones.push(glTF_TREE.nodes[element]);
       });
      
       glTF_TREE.bones.forEach((bone) => {        
        
        bone.matrixWorld = glMatrix.mat4.create();
        bone.matrixModel = glMatrix.mat4.create();
      
        if (bone.hasOwnProperty("translation")) {
          glMatrix.mat4.translate(
            bone.matrixWorld,
            bone.matrixWorld,
            bone.translation
          );
        }

         if (bone.hasOwnProperty("rotation")) {

          let qTemp = glMatrix.mat4.create();
          glMatrix.quat.set(
            qTemp,
            bone.rotation[0],
            bone.rotation[1],
            bone.rotation[2],
            bone.rotation[3]
          );
          let rTemp =  glMatrix.mat4.create();
          glMatrix.mat4.fromQuat(rTemp, qTemp);

           glMatrix.mat4.mul(bone.matrixWorld, bone.matrixWorld, rTemp);
         }



      });

       glTF_TREE.inverseBindMatrices = glTF_TREE.skins[node.skin].datainverseBindMatrices;
       
    }
    if (node.hasOwnProperty("children")) {
      let f = 5;
    }
    if (node.hasOwnProperty("translation")) {
       let f = 5;
    }
    if (node.hasOwnProperty("rotation")) {
       let f = 5;
    }
  });

  gl.bindVertexArray(null);


  let EASY_VERTEX = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, EASY_VERTEX);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,0,0,1,0]), gl.STATIC_DRAW);

  //=============================================================
  /**
   * MATRIX
   */
  let MODELMATRIX = glMatrix.mat4.create();
  let VIEWMATRIX = glMatrix.mat4.create();
  let PROJMATRIX = glMatrix.mat4.create();

  let MODELMATRIX_EASY = glMatrix.mat4.create();

  let JOINTMATRIX = new Float32Array(32);
  let temp = glMatrix.mat4.create();
  JOINTMATRIX.set(temp ,0);
  JOINTMATRIX.set(temp, 16);

  

  glMatrix.mat4.identity(PROJMATRIX);
  let fovy = (40 * Math.PI) / 180;
  glMatrix.mat4.perspective(
    PROJMATRIX,
    fovy,
    canvas.width / canvas.height,
    1,
    50
  );
  glMatrix.mat4.lookAt(
    VIEWMATRIX,
    [-7.0, 5.0, 10.0],
    [0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0]
  );
  //glMatrix.mat4.translate(MODELMATRIX, MODELMATRIX, [0.5, 1.0, 0.0]);
  let JOINTMATRIX_INV = []; 
  let tempMat4_1 = glMatrix.mat4.create();
  glMatrix.mat4.set(
    tempMat4_1,
    ...glTF_TREE.inverseBindMatrices.buffer_DATA.slice(16 * 0, 16 * 0 + 16)
  );
  JOINTMATRIX_INV.push(tempMat4_1);

  let tempMat4_2 = glMatrix.mat4.create();
  glMatrix.mat4.set(
    tempMat4_2,
    ...glTF_TREE.inverseBindMatrices.buffer_DATA.slice(16 * 1, 16 * 1 + 16)
  );
  JOINTMATRIX_INV.push(tempMat4_2);            
  //=============================================================
  /**
   * CAMERA
   */
  let camera = new CAMERAS.Camera(gl);
  gui.camera = camera;

  //=============================================================
  /**
   * HELPERS
   */
  let shaderProgram_axis = HELPERS_AXIS.loadAxisShaders(gl);
  let shaderProgram_normalHelpers = HELPERS_NORMAL.loadNormalShaders(gl);

  //Normal matrix Helper
  let NORMALMATRIX_HELPER = glMatrix.mat4.create();
  glMatrix.mat4.identity(NORMALMATRIX_HELPER);
  glMatrix.mat4.scale(
    NORMALMATRIX_HELPER,
    NORMALMATRIX_HELPER,
    [1.0, 1.0, 1.0]
  );
  glMatrix.mat4.invert(NORMALMATRIX_HELPER, NORMALMATRIX_HELPER);
  glMatrix.mat4.transpose(NORMALMATRIX_HELPER, NORMALMATRIX_HELPER);

  /*========================= DRAWING ========================= */
  gl.clearColor(0.2, 0.8, 0.2, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearDepth(1.0);

  let old_time = 0.0;
  let input_time = 0;
  const animate = function (time) {
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearDepth(1.0);

    //TIME
    let dT = time - old_time;
    old_time = time;

    //  /**
    //  * AMINATION
    //  */
    let morpth = [];

    if (glTF_TREE.animations) {
      glTF_TREE.animations.forEach((animation) => {
        //  animation.channels.forEach((channel) => {
        //   channel.
        //  });

        morpth = glTF_TREE.animationMorpth(
          animation.channels[0],
          0,
          time,
          gui.animationScale
        );

        let quatRotation = glTF_TREE.animationFrame(
          animation.channels[0],
          0,
          time,
          gui.animationScale
        );

        glMatrix.mat4.identity(MODELMATRIX_EASY);
        glMatrix.mat4.fromQuat(MODELMATRIX_EASY, quatRotation);
      });
    }

    //=============================================================

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //==================SKIN====================================
    gl.useProgram(shaderProgramEASY);
    let index = 0;
     let TempMatrix = glMatrix.mat4.create();
    glTF_TREE.bones.forEach((bone) => {
      if (index == 1) {
        glMatrix.mat4.identity(TempMatrix);
     
        glMatrix.mat4.mul(TempMatrix, bone.matrixWorld, MODELMATRIX_EASY);
        glMatrix.mat4.mul(TempMatrix, TempMatrix, JOINTMATRIX_INV[index]);
        glMatrix.mat4.mul(bone.matrixModel, TempMatrix, bone.matrixWorld); 

        JOINTMATRIX.set(TempMatrix, 16);
        // JOINTMATRIX.set(TempMatrix, 0);
      }else if (index == 0){
        glMatrix.mat4.identity(TempMatrix);
        JOINTMATRIX.set(TempMatrix, 0);
      } 
       

      gl.uniformMatrix4fv(u_mMatrix_easy, false, bone.matrixModel);
      gl.uniformMatrix4fv(u_vMatrix_easy, false, camera.vMatrix);
      gl.uniformMatrix4fv(u_pMatrix_easy, false, camera.pMatrix);
      gl.uniform3fv(u_Color_easy, [0.0, 0.0, 0.9]);
      gl.bindBuffer(gl.ARRAY_BUFFER, EASY_VERTEX);
      gl.vertexAttribPointer(a_Position_easy, 3, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, 1);
      gl.uniform3fv(u_Color_easy, [0.9, 0.0, 0.9]);
      gl.drawArrays(gl.LINES, 0, 2);
      index++;
    });

    gl.useProgram(null);

    //=============================================================

    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao);

    //MATRIX
    // glMatrix.mat4.rotateY(MODELMATRIX, MODELMATRIX, 0.0005 * time);
    gl.uniformMatrix4fv(u_mMatrix, false, MODELMATRIX);

    gl.uniformMatrix4fv(u_vMatrix, false, camera.vMatrix);
    gl.uniformMatrix4fv(u_pMatrix, false, camera.pMatrix);
    gl.uniform3fv(u_Color, [0.9, 0.5, 0.2]);

    gl.uniformMatrix4fv(u_jointMat, false, JOINTMATRIX);

    //BUFFER
    // gl.bindVertexArray(vao);
    // gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
    // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    glTF_TREE.nodes.forEach((node) => {
      if (node.hasOwnProperty("mesh")) {
        gl.bindBuffer(
          gl.ARRAY_BUFFER,
          glTF_TREE.RAW_MeshesData[node.mesh].dataPOSITION.TRIANGLE_VERTEX
        );
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

        //-------------------------------------------------------
        gl.bindBuffer(
          gl.ARRAY_BUFFER,
          glTF_TREE.RAW_MeshesData[node.mesh].dataJOINTS_0.Buffer
        );
        gl.vertexAttribIPointer(a_joint, 4, gl.UNSIGNED_SHORT, false, 0, 0);

        gl.bindBuffer(
          gl.ARRAY_BUFFER,
          glTF_TREE.RAW_MeshesData[node.mesh].dataWEIGHTS_0.Buffer
        );
        gl.vertexAttribPointer(a_weight, 4, gl.FLOAT, false, 0, 0);
        //-------------------------------------------------------

        gl.bindBuffer(
          gl.ELEMENT_ARRAY_BUFFER,
          glTF_TREE.RAW_MeshesData[node.mesh].dataINDEXTRIANGLE_FACES
        );
        gl.drawElements(
          gl.LINE_STRIP,
          glTF_TREE.RAW_MeshesData[node.mesh].dataINDEX.accessors_DATA.count,
          gl.UNSIGNED_SHORT,
          0
        );
        gl.uniform3fv(u_Color, [0.5, 0.9, 0.2]);
        gl.drawElements(
          gl.POINTS,
          glTF_TREE.RAW_MeshesData[node.mesh].dataINDEX.accessors_DATA.count,
          gl.UNSIGNED_SHORT,
          0
        );
      }
    });
    
    // //=============================================================
    /**
     * HELPERS
     */
    const MATRIX = {
      MODELMATRIX: MODELMATRIX,
      PROJMATRIX: camera.pMatrix,
      VIEWMATRIX: camera.vMatrix,
    };

    if (gui.axis) {
      HELPERS_AXIS.loadAxisHelper(gl, shaderProgram_axis, MATRIX);
    }
    //=============================================================
    gl.flush();
    window.requestAnimationFrame(animate);
  };

  animate(0);
}

main();
