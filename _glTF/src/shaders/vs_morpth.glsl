         #version 300 es
         uniform mat4 u_mMatrix;
         uniform mat4 u_vMatrix;
         uniform mat4 u_pMatrix;

         uniform vec2 u_morpth;
         uniform vec2 u_weights;
         //uniform float u_interpolationValue;

         layout (location = 0) in vec3 a_Position;
         layout (location = 1) in vec3 a_Position_1;
         layout (location = 2) in vec3 a_Position_2;
         //layout (location=1) in float a_PointSize;
        
         void main()
          {
           gl_PointSize = 10.0;
           
           vec3 Position = a_Position + (u_weights[0]*u_morpth[0]*a_Position_1) + (u_weights[1]*u_morpth[1] * a_Position_2);
           gl_Position = u_pMatrix * u_vMatrix * u_mMatrix * vec4(Position,1.0);

          }
