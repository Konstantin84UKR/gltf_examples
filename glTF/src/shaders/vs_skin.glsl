         #version 300 es
         //uniform mat4 u_mMatrix;
         uniform mat4 u_vMatrix;
         uniform mat4 u_pMatrix;
         uniform mat4 u_jointMat[2];

         layout (location = 0) in vec3 a_Position;
         layout (location = 1) in uvec4 a_joint;
         layout (location = 2) in vec4 a_weight;


         void main()
          {
           gl_PointSize = 8.0;
           
      //   //   vec3 Position = a_Position + (u_weights[0]*u_morpth[0]*a_Position_1) + (u_weights[1]*u_morpth[1] * a_Position_2);
           // gl_Position = u_pMatrix * u_vMatrix * u_mMatrix * vec4(a_Position,1.0);


            // mat4 skinMat = a_weight.x * u_jointMat[int(a_joint.x)] +
            //                a_weight.y * u_jointMat[int(a_joint.y)] +
            //                a_weight.z * u_jointMat[int(a_joint.z)] +
            //                a_weight.w * u_jointMat[int(a_joint.w)];

            mat4 skinMat = a_weight.x * u_jointMat[a_joint.x] +
                           a_weight.y * u_jointMat[a_joint.y] +
                           a_weight.z * u_jointMat[a_joint.z] +
                           a_weight.w * u_jointMat[a_joint.w];

            vec4 worldPosition = skinMat * vec4(a_Position, 1.0);
            vec4 cameraPosition = u_vMatrix * worldPosition;

            gl_Position = u_pMatrix * cameraPosition; 

          }
