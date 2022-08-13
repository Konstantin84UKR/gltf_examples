#version 300 es
layout(std140, column_major) uniform;

uniform uniformMatrix {
    mat4 u_Mmatrix;
    mat4 u_Vmatrix;
    mat4 u_Pmatrix;
    mat4 u_Nmatrix;
} uMatrix;

layout(location = 0) in vec3 a_Position;
layout(location = 1) in vec2 a_uv;
layout(location = 2) in vec3 a_normal;

out vec2 v_uv;
//out vec3 v_color;
out vec3 v_normal;
out vec3 v_vertPos;

void main() {

v_uv = a_uv;
//vec3 N = normalize(a_normal);
v_normal = (uMatrix.u_Nmatrix * vec4(a_normal, 1.0)).xyz;
v_vertPos = (uMatrix.u_Mmatrix * vec4(a_Position, 1.0)).xyz;
gl_Position = uMatrix.u_Pmatrix * uMatrix.u_Vmatrix * uMatrix.u_Mmatrix * vec4(a_Position, 1.0);

}

//   var shader_vertex_source = "\n\
// attribute vec3 position;\n\
// attribute vec2 uv;\n\
// attribute vec3 normal;\n\
// uniform mat4 Pmatrix, Vmatrix, Mmatrix;\n\
// varying vec2 vUV;\n\
// varying vec3 vNormal;\n\
// varying vec3 vView;\n\
// \n\
// void main(void) {\n\
// gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);\n\
// vNormal  =vec3(Mmatrix*vec4(normal, 0.));\n\
// vView = vec3(Vmatrix * Mmatrix * vec4(position, 1.));\n\
// vUV = uv;\n\
// }";