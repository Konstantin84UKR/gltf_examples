
//--------------------common--------------------------
import * as INIT from "../common/utils/utilsWebGL.js";
import * as UTILS_SHADER from "../common/utils/ShaderUtil.js";
import * as LOADERS from "../common/utils/Loaders.js";
import * as CAMERAS from "../common/utils/Camera.js";
import * as HELPERS_AXIS from"../common/utils/helpers/Axis.js";
import * as HELPERS_NORMAL  from "../common/utils/helpers/VertexNormalsHelper.js";
import * as glMatrix from "../common/glm/index.js";
import * as LOADERS_OBJ from "../common/utils/objLoader.js";
//------------------------------------------------------
import * as GUI from "./src/utils/gui/guiSetting.js";
import { gltfScene, _base64ToArrayBuffer } from "./src/utils/gltf/gltfScene.js";
import {
  LoadJSONUsingPromise,
  glTF_parse,
} from "./src/utils/gltf/glTFLoader.js";


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
    "../common/shaders/vs_phong.glsl",
    "../common/shaders/fs_phong.glsl"
  );

  gl.useProgram(shaderProgram);
  let vao = gl.createVertexArray();

  gl.bindVertexArray(vao);

  //ATTRIB
  let a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
  gl.enableVertexAttribArray(a_Position);
  let a_uv = gl.getAttribLocation(shaderProgram, "a_uv");
  gl.enableVertexAttribArray(a_uv);
  let a_normal = gl.getAttribLocation(shaderProgram, "a_normal");
  gl.enableVertexAttribArray(a_normal);

  //UNIFORM
  let uniformMatrixLocation = gl.getUniformBlockIndex(
    shaderProgram,
    "uniformMatrix"
  );
  gl.uniformBlockBinding(shaderProgram, uniformMatrixLocation, 0);

  let sceneUniformsLocation = gl.getUniformBlockIndex(
    shaderProgram,
    "SceneUniforms"
  );
  gl.uniformBlockBinding(shaderProgram, sceneUniformsLocation, 1);

  let u_texture = gl.getUniformLocation(shaderProgram, "u_texture");
  gl.bindVertexArray(null);

  //=============================================================
  /**
   * LOADERS
   */
  let texture = await LOADERS.get_texture(gl, "resource/img/uv.jpg");

  gl.useProgram(shaderProgram);
  gl.uniform1i(u_texture, 0);
  gl.useProgram(null);

  /**
   * GLTF
   */
  //let glTFinfo = await glTF_parse("./resource/gltf/monky.gltf");

  // let glTFinfo = await glTF_parse("./resource/gltf/minimal.gltf"); //sparse  //anim
  //console.log(glTFinfo)
  // let glTF = await LoadJSONUsingPromise("resource/gltf/minimal.gltf");
  // let glTF = await LoadJSONUsingPromise("resource/gltf/sparse.gltf");
  
  let glTF = await LoadJSONUsingPromise("resource/gltf/monky.gltf");
  //let glTF = await LoadJSONUsingPromise("resource/gltf/dog.gltf");
  let glTF_TREE = await new gltfScene(glTF);
  glTF_TREE.loadScene();
  //=============================================================
  /**
   * BUFFER
   */
  gl.useProgram(shaderProgram);
  gl.bindVertexArray(vao);

  let BUFFER_VERTEX = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, BUFFER_VERTEX);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    glTF_TREE.RAW_MeshesData[0].dataPOSITION.buffer_DATA,
    gl.STATIC_DRAW
  );

  let BUFFER_UV = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, BUFFER_UV);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    glTF_TREE.RAW_MeshesData[0].dataTEXCOORD_0.buffer_DATA,
    gl.STATIC_DRAW
  );

  let BUFFER_NORMAL = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, BUFFER_NORMAL);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    glTF_TREE.RAW_MeshesData[0].dataNORMAL.buffer_DATA,
    gl.STATIC_DRAW
  );

  let INDEX_FACES = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, INDEX_FACES);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    glTF_TREE.RAW_MeshesData[0].dataINDEX.buffer_DATA,
    gl.STATIC_DRAW
  );

  // gl.bindVertexArray(vao);
  // Заранее указываем настройки буферов потом вызываем только gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, BUFFER_VERTEX);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, BUFFER_UV);
  gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, BUFFER_NORMAL);
  gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0);

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

  // NORMAL_MATRIX_HELPER
  let NORMALMATRIX_HELPER = glMatrix.mat4.create();
  glMatrix.mat4.identity(NORMALMATRIX_HELPER);
  glMatrix.mat4.scale(
    NORMALMATRIX_HELPER,
    NORMALMATRIX_HELPER,
    [1.0, 1.0, 1.0]
  );
  glMatrix.mat4.invert(NORMALMATRIX_HELPER, NORMALMATRIX_HELPER);
  glMatrix.mat4.transpose(NORMALMATRIX_HELPER, NORMALMATRIX_HELPER);

  let NormalHelpersVertex = HELPERS_NORMAL.normalHelperArray(
    gl,
    glTF_TREE.RAW_MeshesData[0].dataPOSITION.buffer_DATA,
    glTF_TREE.RAW_MeshesData[0].dataNORMAL.buffer_DATA,
    NORMALMATRIX_HELPER,
    MODELMATRIX
  );

  const VAO_normal_helpers = HELPERS_NORMAL.VertexNormalHelper(
    gl,
    shaderProgram_normalHelpers,
    NormalHelpersVertex,
    camera.pMatrix,
    camera.vMatrix,
    MODELMATRIX,
    NORMALMATRIX_HELPER
  );
  /*========================= DRAWING ========================= */
  gl.clearColor(0.2, 0.8, 0.2, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearDepth(1.0);

  let old_time = 0.0;
  let input_time = 0;

  // Заранее создаем обекты для юниформов что бы в цикле только записывать измененые данные
  let MATRIXUniformData = new Float32Array(64);
  let MATRIXUniformBuffer = gl.createBuffer();
  let SceneUniformData = new Float32Array(8);
  let sceneUniformBuffer = gl.createBuffer();
  SceneUniformData.set([5.0, 5.0, 5.0, 1.0], 4);

  const animate = function (time) {
    // FRAMEBUFFER
    // gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
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

    // if (glTF_TREE.animations) {
    //   glTF_TREE.animations.forEach((animation) => {
    //     let quatRotation = glTF_TREE.animationFrame(
    //       animation.channels[0],
    //       0,
    //       time,
    //       gui.animationScale
    //     );

    //     glMatrix.mat4.identity(MODELMATRIX);
    //     glMatrix.mat4.fromQuat(MODELMATRIX, quatRotation);
    //   });
    // }



    //=============================================================

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao); // Биндим наши настройки Vertex Array

    //MATRIX

   // glMatrix.mat4.rotateX(MODELMATRIX, MODELMATRIX, 0.01);
    glMatrix.mat4.rotateY(MODELMATRIX, MODELMATRIX, 0.01);
   // glMatrix.mat4.rotateZ(MODELMATRIX, MODELMATRIX, 0.01);

    MATRIXUniformData.set(MODELMATRIX, 0);
    MATRIXUniformData.set(camera.vMatrix, 16);
    MATRIXUniformData.set(camera.pMatrix, 32);
    MATRIXUniformData.set(MODELMATRIX, 48);

    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, MATRIXUniformBuffer); // индекс бинлинга 0
    gl.bufferData(gl.UNIFORM_BUFFER, MATRIXUniformData, gl.STATIC_DRAW);

    SceneUniformData.set(camera.eye, 0);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, sceneUniformBuffer); // индекс бинлинга 1
    gl.bufferData(gl.UNIFORM_BUFFER, SceneUniformData, gl.STATIC_DRAW);

    //BUFFER

    /**
     * TEXTURE
     */
    if (texture.webGLtexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture.webGLtexture);
      gl.uniform1i(u_texture, 0);
    }

    //gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
    //gl.drawArrays(gl.TRIANGLES, 0, model.mesh.meshes[0].vertices.length);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, INDEX_FACES);
    gl.drawElements(
      gl.TRIANGLES,
      glTF_TREE.RAW_MeshesData[0].dataINDEX.accessors_DATA.count,
      gl.UNSIGNED_SHORT,
      0
    );
    gl.bindVertexArray(null);
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

    if (gui.normal) {
      HELPERS_NORMAL.VertexNormalHelperDraw(
        gl,
        shaderProgram_normalHelpers,
        VAO_normal_helpers,
        MATRIX,
        NormalHelpersVertex.flat().length / 3
      );
    }

    //=============================================================
    gl.flush();
    window.requestAnimationFrame(animate);
  };

  animate(0);
}

main();


