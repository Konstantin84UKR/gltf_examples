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

  gl.useProgram(shaderProgram);
  let vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  // Attrib
  let a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
  gl.enableVertexAttribArray(a_Position);
  let a_Position_1 = gl.getAttribLocation(shaderProgram, "a_Position_1");
  gl.enableVertexAttribArray(a_Position_1);
  let a_Position_2 = gl.getAttribLocation(shaderProgram, "a_Position_2");
  gl.enableVertexAttribArray(a_Position_2);
  // let a_uv = gl.getAttribLocation(shaderProgram, "a_uv");
  // gl.enableVertexAttribArray(a_uv);
  // Uniform
  let u_Color = gl.getUniformLocation(shaderProgram, "u_Color");
  let u_mMatrix = gl.getUniformLocation(shaderProgram, "u_mMatrix");
  let u_vMatrix = gl.getUniformLocation(shaderProgram, "u_vMatrix");
  let u_pMatrix = gl.getUniformLocation(shaderProgram, "u_pMatrix");
  let u_morpth = gl.getUniformLocation(shaderProgram, "u_morpth");
  let u_weights = gl.getUniformLocation(shaderProgram, "u_weights");
  gl.bindVertexArray(null);

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
        glTF_TREE.RAW_MeshesData[node.mesh].dataPOSITION.TRIANGLE_VERTEX =
        gl.createBuffer();
        gl.bindBuffer(
        gl.ARRAY_BUFFER,
        glTF_TREE.RAW_MeshesData[node.mesh].dataPOSITION.TRIANGLE_VERTEX
      );

      gl.bufferData(
        gl.ARRAY_BUFFER,
        glTF_TREE.RAW_MeshesData[node.mesh].dataPOSITION.buffer_DATA,
        gl.STATIC_DRAW
      );

      glTF_TREE.RAW_MeshesData[node.mesh].dataINDEXTRIANGLE_FACES =
        gl.createBuffer();
      gl.bindBuffer(
        gl.ELEMENT_ARRAY_BUFFER,
        glTF_TREE.RAW_MeshesData[node.mesh].dataINDEXTRIANGLE_FACES
      );
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        glTF_TREE.RAW_MeshesData[node.mesh].dataINDEX.buffer_DATA,
        gl.STATIC_DRAW
      );
    }
    if (node.hasOwnProperty("skin")) {
       glTF_TREE.joints = glTF_TREE.skins[node.skin].joints;
       glTF_TREE.inverseBindMatrices =
       glTF_TREE.skins[node.skin].inverseBindMatrices;
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

  // let TRIANGLE_VERTEX = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);

  // gl.bufferData(
  //   gl.ARRAY_BUFFER,
  //   //glTFinfo.models[0].bufferInfo_POSITION.data,
  //   glTF_TREE.RAW_MeshesData[0].dataPOSITION.buffer_DATA,
  //   gl.STATIC_DRAW
  // );

  // let TRIANGLE_VERTEX_1 = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX_1);

  // gl.bufferData(
  //   gl.ARRAY_BUFFER,
  //   //glTFinfo.models[0].bufferInfo_POSITION.data,
  //   glTF_TREE.meshes[0].primitives[0].targets[0].dataPOSITION.buffer_DATA,
  //   gl.STATIC_DRAW
  // );

  // let TRIANGLE_VERTEX_2 = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX_2);

  // gl.bufferData(
  //   gl.ARRAY_BUFFER,
  //   //glTFinfo.models[0].bufferInfo_POSITION.data,
  //   glTF_TREE.meshes[0].primitives[0].targets[1].dataPOSITION.buffer_DATA,
  //   gl.STATIC_DRAW
  // );

  // let TRIANGLE_FACES = gl.createBuffer();
  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
  // gl.bufferData(
  //   gl.ELEMENT_ARRAY_BUFFER,
  //   //glTFinfo.models[0].bufferInfo_INDEX.data,
  //   glTF_TREE.RAW_MeshesData[0].dataINDEX.buffer_DATA,
  //   gl.STATIC_DRAW
  // );

  gl.bindVertexArray(null);

  //=============================================================
  /**
   * MATRIX
   */
  let MODELMATRIX = glMatrix.mat4.create();
  let VIEWMATRIX = glMatrix.mat4.create();
  let PROJMATRIX = glMatrix.mat4.create();

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
      });
    }

    let weights = glTF_TREE.meshes[0].weights;
    //=============================================================

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao);

    //MATRIX
    // glMatrix.mat4.rotateY(MODELMATRIX, MODELMATRIX, 0.0005 * time);
    gl.uniformMatrix4fv(u_mMatrix, false, MODELMATRIX);

    gl.uniformMatrix4fv(u_vMatrix, false, camera.vMatrix);
    gl.uniformMatrix4fv(u_pMatrix, false, camera.pMatrix);
    gl.uniform3fv(u_Color, [0.9, 0.5, 0.2]);
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

      gl.bindBuffer(
        gl.ELEMENT_ARRAY_BUFFER,
        glTF_TREE.RAW_MeshesData[node.mesh].dataINDEXTRIANGLE_FACES
      );
      gl.drawElements(
        gl.LINE_LOOP,
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
    }})
  
   
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
    // gl.drawElements(
    //   gl.LINE_LOOP,
    //   glTF_TREE.RAW_MeshesData[0].dataINDEX.accessors_DATA.count,
    //   gl.UNSIGNED_SHORT,
    //   0
    // );

    // gl.uniform3fv(u_Color, [0.2, 0.9, 0.2]);

    // gl.drawElements(
    //   gl.POINTS,
    //   glTF_TREE.RAW_MeshesData[0].dataINDEX.accessors_DATA.count,
    //   gl.UNSIGNED_SHORT,
    //   0
    // );
    //gl.TRIANGLES,
    //=============================================================
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
