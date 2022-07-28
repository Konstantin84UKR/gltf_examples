
import * as glMatrix from  "../../glm/index.js";

export class gltfScene{
    constructor(gltf){
      
        this.gltf = JSON.parse(gltf);;
        this.nodes = this.gltf.nodes;
        this.meshes = this.gltf.meshes;
        this.cameras = this.gltf.cameras;
        this.animations = this.gltf.animations;
        this.accessors =  this.gltf.accessors;
        this.bufferViews =  this.gltf.bufferViews;
        this.buffers = this.gltf.buffers;
        this.skins = this.gltf.skins;

        this.RAW_MeshesData = [];
        this.RAW_nodesData = [];

    }

    loadScene(){
        
       // let nodesData = [];
        this.nodes.forEach(node => {
        
          let nodeData = {
           
          };

          for (let key in node) {
            nodeData[key] = node[key]; 
          }

          this.RAW_nodesData.push(nodeData);

        });

        //MESH Перебираем весь меш в сцене
        let meshes = [];
        for (let index = 0; index <this.meshes.length; index++) { 
            let mesh = this.meshes[index];
            
            //Для каждого меша выбираем данные по примитивам Атрибутты и индексы.
            mesh.primitives.forEach(primitive => {
                              
               // ДАННЫЕ АКССЕСОРА По получиным данным смотрим в аксессор настойки вьюБуффера
                mesh.dataINDEX = this.dataFromAccessors(primitive.indices);
                let attributes = primitive.attributes;
                for (let attribut in primitive.attributes) {
                    switch (attribut) {
                      case "POSITION":
                        mesh.dataPOSITION = this.dataFromAccessors(
                          attributes.POSITION
                        );
                        break;
                      case "NORMAL":
                        mesh.dataNORMAL = this.dataFromAccessors(
                          attributes.NORMAL
                        );
                        break;
                      case "TEXCOORD_0":
                        mesh.dataTEXCOORD_0 = this.dataFromAccessors(
                          attributes.TEXCOORD_0
                        );
                        break;

                      default:
                        break;
                    }                                     
                }

                if(primitive.hasOwnProperty("targets")){
                
                primitive.targets.forEach(targets=>{
                for (let target in targets) {
                    switch (target) {
                        case "POSITION":
                              targets.dataPOSITION = this.dataFromAccessors(
                                targets.POSITION
                              );
                          break;
                        case "NORMAL":
                              targets.dataNORMAL = this.dataFromAccessors(
                                targets.NORMAL
                              );
                          break;
                        case "TEXCOORD_0":
                              targets.dataTEXCOORD_0 = this.dataFromAccessors(
                                targets.TEXCOORD_0
                              );
                          break;
                        default:
                          break;
                     }
                   }
                });

                }               
             }); 
            

             meshes.push(mesh);  
        }
        this.RAW_MeshesData =meshes;
        
        //AMINATION
        //  samplers данные анимации
        //  input - кадры  output - значение кадров // interpolation - метод перехода между кадрами
        
        //  channels - канал анимации 
        //  sampler - какой семл с данными анимации использовать
        //  target - цель анимации // node и path - действие (перемешение маштаб поворот)
        if (this.animations){


           // this.animations.channels           


            this.animations.forEach((animation) => {
            
            animation.channels.forEach((channel) => {

              

            });    

            animation.samplers.forEach((sampler) => {
              sampler.inputRAW = this.dataFromAccessors(sampler.input);
              sampler.outputRAW = this.dataFromAccessors(sampler.output);
            });



          });
        }
        

        // if(this.cameras){
        //    this.cameras.forEach((camera) => {
          
        //     camera.type = this.cameras[camera.camera];

        //    })
        // }


    }
  
    dataFromAccessors(index_of_accessor) {
   
    let accessors_DATA = this.accessors[index_of_accessor]; 
    let bufferViews_DATA= this.bufferViews[accessors_DATA.bufferView];

    let buffer_STRING = this.buffers[bufferViews_DATA.buffer];
    let bufferRAW = buffer_STRING.uri.split(",");

    let byteOffset = 0;
    if ("byteOffset" in bufferViews_DATA) {
      byteOffset = byteOffset + bufferViews_DATA.byteOffset;
    } 
    if("byteOffset" in accessors_DATA) {
       byteOffset = byteOffset + accessors_DATA.byteOffset;
    }    


    let buffer_DATA = decoder64forWebGl(
      bufferRAW[1],
      accessors_DATA.type, //"VEC3",
      byteOffset,
      bufferViews_DATA.byteLength,
      accessors_DATA.count,
      accessors_DATA.componentType
    );  

     //spare
     this.dataFromSpare(accessors_DATA,buffer_DATA);
    
     return {buffer_DATA,accessors_DATA};

} 

    dataFromSpare(accessors_DATA,buffer_DATA){
        
        if(accessors_DATA.hasOwnProperty('sparse')){
            let sparse = accessors_DATA.sparse;
            // sparse.count;
            // sparse.indices;
            // sparse.values;
            let bufferViews_indices = this.bufferViews[sparse.indices.bufferView];
            let bufferViews_values = this.bufferViews[sparse.values.bufferView];
            let bufferViews_DATA = this.bufferViews[accessors_DATA.bufferView];
            let buffer_STRING = this.buffers[bufferViews_DATA.buffer];
            let bufferRAW = buffer_STRING.uri.split(",");
    
            let sparse_indices_DATA = decoder64forWebGl(
                bufferRAW[1],
                "SCALAR", //"VEC3",
                bufferViews_indices.byteOffset,
                bufferViews_indices.byteLength,
                sparse.count,
                sparse.indices.componentType
              );  
    
            let sparse_values_DATA = decoder64forWebGl(
                bufferRAW[1],
                accessors_DATA.type, //"VEC3",
                bufferViews_values.byteOffset,
                bufferViews_values.byteLength,
                sparse.count,
                accessors_DATA.componentType
             );  
         
             let typeCount = 0;
             if(accessors_DATA.type =  "VEC3"){
                typeCount = 3;
             }
    
             for (let index = 0; index < sparse_indices_DATA.length; index++) {
                let indexVertex = sparse_indices_DATA[index];
                
                for (let indexTypeCount = 0; indexTypeCount < typeCount; indexTypeCount++) {
                    buffer_DATA[indexVertex*typeCount+indexTypeCount] = sparse_values_DATA[index*typeCount+indexTypeCount];  
                    buffer_DATA[indexVertex*typeCount+indexTypeCount] = sparse_values_DATA[index*typeCount+indexTypeCount]; 
                    buffer_DATA[indexVertex*typeCount+indexTypeCount] = sparse_values_DATA[index*typeCount+indexTypeCount];               
                }
            }


        }
    }

    animationFrame(channel,startTime,curentTime,animationScale){
           
        let samplerIndex = channel.sampler;
        let samplerDATA = this.animations[0].samplers[samplerIndex];

        let animationLength =  samplerDATA.inputRAW.accessors_DATA.max - samplerDATA.inputRAW.accessors_DATA.min; 
              
        animationLength = animationLength * animationScale;

        let animationСurentTime = (curentTime%(animationLength * 1000))/1000;
       // console.log(animationСurentTime)
        //Ишем кадо смежные кадры анимации 
        let frameIN = 0;
        let frameOUT = samplerDATA.inputRAW.buffer_DATA[samplerDATA.inputRAW.buffer_DATA.length-1];
        let frameIN_index = 0;
        let frameOUT_index = samplerDATA.inputRAW.buffer_DATA.length-1;
       
        samplerDATA.inputRAW.buffer_DATA.forEach((element,index) => {

          if(element*animationScale <= animationСurentTime){
            if(element*animationScale > frameIN*animationScale){
               frameIN = element;
               frameIN_index = index;
            }           
          }
          
          if(element*animationScale >= animationСurentTime){
            if(element*animationScale<frameOUT*animationScale){
              frameOUT = element;
              frameOUT_index = index;
            }   
          }

        });

        // console.log(frameIN);
        // console.log(frameOUT);

        // console.log(frameIN_index);
        // console.log(frameOUT_index);

      
        let interpolationValue = 0;
        if(animationСurentTime != 0){
          interpolationValue = (animationСurentTime - frameIN*animationScale) / ((frameOUT - frameIN)*animationScale);
        }
             
      //  console.log(interpolationValue);
        
        let  outRotation = glMatrix.quat.create();
        let  a =  glMatrix.quat.create();
          glMatrix.quat.set(a,
          samplerDATA.outputRAW.buffer_DATA[frameIN_index * 4+0],
          samplerDATA.outputRAW.buffer_DATA[frameIN_index * 4+1],
          samplerDATA.outputRAW.buffer_DATA[frameIN_index * 4+2],
          samplerDATA.outputRAW.buffer_DATA[frameIN_index * 4+3]        
          );

        let  b = glMatrix.quat.create();
          glMatrix.quat.set(b,
          samplerDATA.outputRAW.buffer_DATA[frameOUT_index*4+0],
          samplerDATA.outputRAW.buffer_DATA[frameOUT_index*4+1],
          samplerDATA.outputRAW.buffer_DATA[frameOUT_index*4+2],
          samplerDATA.outputRAW.buffer_DATA[frameOUT_index*4+3]        
          );

        glMatrix.quat.slerp(outRotation, a, b, interpolationValue);

        return outRotation;

    }

    animationMorpth(channel,startTime,curentTime,animationScale){
           
        let samplerIndex = channel.sampler;
        let samplerDATA = this.animations[0].samplers[samplerIndex];

        let animationLength =  samplerDATA.inputRAW.accessors_DATA.max - samplerDATA.inputRAW.accessors_DATA.min; 
              
        animationLength = animationLength * animationScale;

        let animationСurentTime = (curentTime%(animationLength * 1000))/1000;
       // console.log(animationСurentTime)
        //Ишем кадо смежные кадры анимации 
        let frameIN = 0;
        let frameOUT = samplerDATA.inputRAW.buffer_DATA[samplerDATA.inputRAW.buffer_DATA.length-1];
        let frameIN_index = 0;
        let frameOUT_index = samplerDATA.inputRAW.buffer_DATA.length-1;
       
        samplerDATA.inputRAW.buffer_DATA.forEach((element,index) => {

          if(element*animationScale <= animationСurentTime){
            if(element*animationScale > frameIN*animationScale){
               frameIN = element;
               frameIN_index = index;
            }           
          }
          
          if(element*animationScale >= animationСurentTime){
            if(element*animationScale<frameOUT*animationScale){
              frameOUT = element;
              frameOUT_index = index;
            }   
          }

         });
      
        let interpolationValue = 0;
        if(animationСurentTime != 0){
          interpolationValue = (animationСurentTime - frameIN*animationScale) / ((frameOUT - frameIN)*animationScale);
        }

        // interpolationValue = (currentTime - previousTime) / (nextTime - previousTime)
        //            = (1.2 - 0.8) / (1.6 - 0.8)
        //            = 0.4 / 0.8         
        //            = 0.5
        
        let t1 =
          (samplerDATA.outputRAW.buffer_DATA[frameOUT_index * 2] -
            samplerDATA.outputRAW.buffer_DATA[frameIN_index * 2]) *
            interpolationValue +
          samplerDATA.outputRAW.buffer_DATA[frameIN_index * 2];

        let t2 =
          (samplerDATA.outputRAW.buffer_DATA[frameOUT_index * 2 + 1] -
            samplerDATA.outputRAW.buffer_DATA[frameIN_index * 2 + 1]) *
            interpolationValue +
          samplerDATA.outputRAW.buffer_DATA[frameIN_index * 2 + 1];  


     
       return [t1, t2];

    }

}


function decoder64forWebGl(str, type, byteOffset, byteLength, count,componentType,byteStride=0) {
  
    // 5120 (BYTE)	1
    // 5121(UNSIGNED_BYTE)	1
    // 5122 (SHORT)	2
    // 5123 (UNSIGNED_SHORT)	2
    // 5126 (FLOAT)	4
      
    const componentType_decryption =  new Map(); 
    
    componentType_decryption.set(5120, Int8Array);
    componentType_decryption.set(5121, Uint8Array);
    componentType_decryption.set(5122, Int16Array);
    componentType_decryption.set(5123, Uint16Array);
    componentType_decryption.set(5124, Float32Array);
    componentType_decryption.set(5125, Float32Array);
    componentType_decryption.set(5126, Float32Array);  
  
    const elementOfType_decryption =  new Map(); 
  
    elementOfType_decryption.set('VEC3',   3);
    elementOfType_decryption.set('FLOAT',  1);
    elementOfType_decryption.set('SCALAR', 1);
    elementOfType_decryption.set('VEC4',   4);
    elementOfType_decryption.set('MAT4',  16);  
    elementOfType_decryption.set("VEC2",   2);
    
    let elementOfType = elementOfType_decryption.get(type)
    
    let T = undefined;
    T = componentType_decryption.get(componentType);
    
    let blob = window.atob(str);// Base64 string converted to a char array
      // console.log("Blob Length", blob.length );
      // console.log( blob );
      // fLen = blob.length / T.BYTES_PER_ELEMENT, // How many floats can be made, but be even
      let dView = new DataView(new ArrayBuffer(T.BYTES_PER_ELEMENT)); // ArrayBuffer/DataView to convert 4 bytes into 1 float.
      let fAry = new T(count * elementOfType); // count * VEC3// Final Output at the correct size
          
      let lenBelement = T.BYTES_PER_ELEMENT;
     
      byteStride = (byteStride == 0 ? elementOfType * lenBelement: byteStride);  
      let ELEMENT = 0; // Счетчик элемента в массиве
      for(let item = 0; item < count;item++){ // Количество элементов в обном массиве. Vec4 vec3 Float Mat4
  
         let byteStrideItem = byteStride * item;  // byteStride Сколько нужно байт отспупать между разными item 
          
          for (let elemen = 0; elemen < elementOfType; elemen++) {  // VEC4 4 злемента  VEC3  3 элемента Scalar 1 элемент  Считаем елемент типа данных  например в матрице Maт4 Это 16 элеентов 
         
            let elemenBaty = elemen * T.BYTES_PER_ELEMENT;  // Байт в конкртеном элементе // например в FLOAT 4 UINT 2
  
            for (let b = 0; b < lenBelement; b++) {  // Количество байт в числе  2 или 4 
                dView.setUint8(b, blob.charCodeAt(byteOffset + byteStrideItem + elemenBaty + b ));
            }        
            
            switch (componentType) {
              case 5120:
                fAry[ELEMENT] = dView.getInt8(0, true);
                break;
  
              case 5121:
                fAry[ELEMENT] = dView.getUint8(0, true);
                break;
  
              case 5122:
                fAry[ELEMENT] = dView.getInt16(0, true);
                break;
  
              case 5123:
                fAry[ELEMENT]= dView.getUint16(0, true);
                break;
  
              case 5124:
                fAry[ELEMENT]= dView.getInt32(0, true);
                break;
  
              case 5125:
                fAry[ELEMENT] = dView.getUint32(0, true); 
                break;
  
              case 5126:
                fAry[ELEMENT] = dView.getFloat32(0, true);
                break;
  
              default:
                break;
            }
            ELEMENT++; 
            //ELEMENT_2++; 
        }
        //fAry[ELEMENT] = fAry_element;
        //ELEMENT++; 
  
      }
   // console.log("fAry  = " + fAry);
    return fAry;
}
 
export function _base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
