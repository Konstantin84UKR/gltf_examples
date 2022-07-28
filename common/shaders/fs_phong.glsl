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

    vec3 H = normalize(lightVec * uScene.eyePosition.xyz);
    float NdotH = dot(normal, H);
    float specular = pow(NdotH, 100.0);
   
    //float specular = pow(max(dot(eyeVec, reflect(incidentVec, normal)), 0.0), 100.0);
    vec3  specularColor = specular * vec3(0.9,0.9,0.9);
    vec3  ambientColor = 0.1 * color;
    fragColor = vec4(diffuseColor + ambientColor + specularColor, 1.0);
   //fragColor = vec4(color, 1.0);
}

//---------------------------------------------------
//  vec3 viewDir = normalize(-vertPos);

//     // this is blinn phong
// vec3 halfDir = normalize(lightDir + viewDir);
// float specAngle = max(dot(halfDir, normal), 0.0);
// specular = pow(specAngle, shininess);

//     // this is phong (for comparison)
// if(mode == 2) {
// vec3 reflectDir = reflect(- lightDir, normal);
// specAngle = max(dot(reflectDir, viewDir), 0.0);
//       // note that the exponent is different here
// specular = pow(specAngle, shininess / 4.0);