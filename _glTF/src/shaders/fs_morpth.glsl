        #version 300 es
         precision mediump float;
         uniform vec3 u_Color;
        
         out vec4 fragColor;    
           
         void main() {         
             fragColor = vec4(u_Color,1.0);;
            // fragColor = vec4(1.0,0.5,0.0,1.0);
         }