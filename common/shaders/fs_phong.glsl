#version 300 es
precision highp float;

layout(std140, column_major) uniform;

uniform SceneUniforms {
    vec4 eyePosition;
    vec4 lightPosition;
} uScene;

uniform sampler2D u_texture;

in vec3 v_vertPos;
in vec2 v_uv;
in vec3 v_normal;

out vec4 fragColor;
void main() {
     vec3 color = texture(u_texture, v_uv).rgb;
    // vec3 color =  vec3(1.0, 1.0, 1.0);

    vec3 normal = normalize(v_normal);
    vec3 eyeVec = normalize(uScene.eyePosition.xyz - v_vertPos);
    //vec3 incidentVec = normalize(v_vertPos - uScene.lightPosition.xyz);
    vec3 incidentVec = normalize(uScene.lightPosition.xyz- v_vertPos);
    vec3 lightVec = incidentVec;

    float diffuse = max(dot(normal, lightVec), 0.0);
    vec3  diffuseColor = diffuse * color;

    //vec3 H = normalize(lightVec * uScene.eyePosition.xyz);
   // float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);
    vec3 H = normalize(lightVec + eyeVec); 
    float NdotH = max(dot(normal, H), 0.0);
    float specular = pow(NdotH, 100.0);
   
    //float specular = pow(max(dot(eyeVec, reflect(incidentVec, normal)), 0.0), 100.0);
    vec3  specularColor = specular * vec3(0.9,0.9,0.9);
    vec3  ambientColor = 0.1 * color;
    fragColor = vec4(diffuseColor + ambientColor + specularColor, 1.0);
   //fragColor = vec4(color, 1.0);
}
//pow(max(dot(R, V), 0.)
//---------------------------------------------------
//   var shader_fragment_source = n precision mediump float;
// n uniform sampler2D sampler;
// n varying vec2 vUV;
// n varying vec3 vNormal;
// n varying vec3 vView;
// n const vec3 source_ambient_color = vec3(1., 1., 1.);
// n const vec3 source_diffuse_color = vec3(1., 2., 4.);
// n const vec3 source_specular_color = vec3(1., 1., 1.);
// n const vec3 source_direction = vec3(0., 0., 1.);
// n n const vec3 mat_ambient_color = vec3(0.3, 0.3, 0.3);
// n const vec3 mat_diffuse_color = vec3(1., 1., 1.);
// n const vec3 mat_specular_color = vec3(1., 1., 1.);
// n const float mat_shininess = 10.;
// n n n n void main(void) {
// n vec3 color = vec3(texture2D(sampler, vUV));
// n vec3 I_ambient = source_ambient_color * mat_ambient_color;
// n vec3 I_diffuse = source_diffuse_color * mat_diffuse_color * max(0., dot(vNormal, source_direction));
// n vec3 V = normalize(vView);
// n vec3 R = reflect(source_direction, vNormal);
// n n n vec3 I_specular = source_specular_color * mat_specular_color * pow(max(dot(R, V), 0.), mat_shininess);
// n vec3 I = I_ambient + I_diffuse + I_specular;
// n gl_FragColor = vec4(I * color, 1.);
// n };