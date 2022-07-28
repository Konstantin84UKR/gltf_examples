export async function LoadJSONUsingPromise(URL) {
  let promise = new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", URL, true);
    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => resolve(console.log(xhr.statusText));
    xhr.send();
  });

  return promise;
}

// TODO: get from gl context
var ComponentType2ByteSize = {
  5120: 1, // BYTE
  5121: 1, // UNSIGNED_BYTE
  5122: 2, // SHORT
  5123: 2, // UNSIGNED_SHORT
  5126: 4, // FLOAT
};

var Type2NumOfComponent = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
};

//bufferView  34962, что означает ARRAY_BUFFER
//bufferView 34963, что означает ELEMENT_ARRAY_BUFFER

export async function glTF_parse(URL) {
  let gltf = await LoadJSONUsingPromise(URL);
  gltf = JSON.parse(gltf);

  console.log(gltf);

  // Нужно сформировать структуру

  // {
  //   //let scene //  пока всегда одна е не учитываем
  //   nodes = []; // нужна что бы составить иерархию трансформций  пофакту содержит масссив мешей
  //   meshes = []; // массив структур сданными аксксоров
  // }

  // STRUKTURA 

  let asset = gltf.asset;
  let sceneIndex = 0;
  let scenes = gltf.scenes;
  let nodes = gltf.nodes;
  let accessors = gltf.accessors;
  let bufferViews = gltf.bufferViews;
  let buffers = gltf.buffers;
  let meshes = gltf.meshes;  
  let skins = gltf.skins;
  let animations = gltf.animations;

  let bufferInfo_POSITION = ""; 
  let bufferInfo_INDEX = "";
  let bufferInfo_KEY_FRAME_DATA = "";
  let bufferInfo_KEY_FRAME = "";
  let bufferInfo_JOINTS = "";
  let bufferInfo_WEIGHTS = "";
  let bufferInfo_inverseBindMatrices_MAT4 = "";
  let  bufferInfo_NORMAL = "";
 
  let data_Uint8Array_POSITION;


  // MESH 
  let models = [];
  for (let index = 0; index <gltf.meshes.length; index++) {
      let mesh = gltf.meshes[index];
      
      console.log(mesh);

      let primitives = mesh.primitives;

      for (let index = 0; index < primitives.length; index++) {
         
          let attributes = primitives[index].attributes;
          let indices = primitives[index].indices;

          let accessors_indices = accessors[indices];
          let accessors_POSITION = accessors[attributes.POSITION];

          let bufferViews_indices = bufferViews[accessors_indices.bufferView];
          let bufferViews_POSITION = bufferViews[accessors_POSITION.bufferView];

          let buffer_STRING = buffers[bufferViews_POSITION.buffer];
          let bufferRAW = buffer_STRING.uri.split(",");

          const bufferView = bufferViews[accessors[attributes.POSITION].bufferView];

          const arrayBuffer = gltf.buffers[bufferView.buffer];
         
          // Пример как можно напрямую загрузить данные в буфер без преобразования в Float32Array
          // Но тогда мы не можем визуально отследить данные которые хотим загрузить
          // для дебага оставлю преоброзования в Float32Array
          const dataBin = _base64ToArrayBuffer(bufferRAW[1])
          data_Uint8Array_POSITION = new Uint8Array(dataBin, bufferView.byteOffset, bufferView.byteLength);    
          ///-------------------------------------------------------------------------  

          let buffer_POSITION_FLOAT32 = decoder64forWebGl(
            bufferRAW[1],
            accessors_POSITION.type, //"VEC3",
            bufferViews_POSITION.byteOffset,
            bufferViews_POSITION.byteLength,
            accessors_POSITION.count,
            accessors_POSITION.componentType
          );           

          let buffer_indices_SCALAR = decoder64forWebGl(
            bufferRAW[1],
            "SCALAR",
            bufferViews_indices.byteOffset,
            bufferViews_indices.byteLength,
            accessors_indices.count,
            accessors_indices.componentType
          );

          bufferInfo_POSITION = {
              target: "ARRAY_BUFFER", // "ARRAY_BUFFER"
              // data: buffer_POSITION_FLOAT32,
              data: data_Uint8Array_POSITION,
              usage: "STATIC_DRAW",
              srcOffset: null,
              length: null,
              count: 3, // VEC3
          };

          bufferInfo_INDEX = {
              target: "ELEMENT_ARRAY_BUFFER", // "ARRAY_BUFFER"
              //data: blob_indices,
              data: buffer_indices_SCALAR,
              usage: "STATIC_DRAW",
              srcOffset: null,
              length: null,
              count: accessors_indices.count,
          };
      }

      models.push({
         bufferInfo_POSITION,
         bufferInfo_INDEX,
         data_Uint8Array_POSITION
         
      })
       
      }   

      let anim = [];

      if(animations) {
         for (let index = 0; index < animations.length; index++) {
         
        const animation = animations[0];
        
        for (let index = 0; index < animation.channels.length; index++) {
          
        const channel = animation.channels[index];
        const sampler = channel.sampler;
        const target = channel.target;

        const accessors_input = animation.samplers[sampler].input;
        const accessors_output = animation.samplers[sampler].output;
        const accessors_interpolation = animation.samplers[sampler].interpolation;

        const buffer =  bufferViews[accessors[accessors_input].bufferView].buffer;

        const buffer_STRING = buffers[buffer];
        const bufferRAW = buffer_STRING.uri.split(",");
             


        const buffer_input = decoder64forWebGl(
          bufferRAW[1],
          accessors[accessors_input].type, //
          accessors[accessors_input].byteOffset,
          accessors[accessors_input].byteLength,
          accessors[accessors_input].count,
          accessors[accessors_input].componentType
        );  

        const buffer_output = decoder64forWebGl(
          bufferRAW[1],
          accessors[accessors_output].type, //
          accessors[accessors_output].byteOffset,
          accessors[accessors_output].byteLength,
          accessors[accessors_output].count,
          accessors[accessors_output].componentType
        ); 

        // console.log(buffer_input)
        // console.log(buffer_output)

        anim.push({
          input:buffer_input,
          output:buffer_output,
          interpolation:accessors_interpolation,
          count : accessors[accessors_output].count,
          minData : accessors[accessors_output].min,
          maxData : accessors[accessors_output].max,
          minTime : accessors[accessors_input].min,
          maxTime : accessors[accessors_input].max
       })
        }
      }

      }      
     
   let nodeResponse = {
    models,anim
   }

  return nodeResponse;
  
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

  elementOfType_decryption.set('VEC3', 3);
  elementOfType_decryption.set('FLOAT', 1);
  elementOfType_decryption.set('SCALAR', 1);
  elementOfType_decryption.set('VEC4', 4);
  elementOfType_decryption.set('MAT4', 16);  
  
  let elementOfType = elementOfType_decryption.get(type)
  
  let T = undefined;
  T = componentType_decryption.get(componentType);
  
  let blob = window.atob(str);// Base64 string converted to a char array
  console.log("Blob Length", blob.length );
	console.log( blob );
    // fLen = blob.length / T.BYTES_PER_ELEMENT, // How many floats can be made, but be even
    let dView = new DataView(new ArrayBuffer(T.BYTES_PER_ELEMENT)); // ArrayBuffer/DataView to convert 4 bytes into 1 float.
    let fAry = new T(count * elementOfType); // count * VEC3// Final Output at the correct size
        
    let lenBelement = T.BYTES_PER_ELEMENT;
   
    byteStride = (byteStride == 0 ? elementOfType * lenBelement: byteStride);  
    let ELEMENT = 0; // Счетчик элемента в массиве
    for(let item = 0; item < count;item++){ // Количество энцекпляров в обном массиве. Vec4 vec3 Float Mat4

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
  console.log("fAry  = " + fAry);
  return fAry;
}

var encodedData = window.btoa('Hello, world'); // кодирует строку
var decodedData = window.atob(encodedData); // декодирует строку


function _base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
