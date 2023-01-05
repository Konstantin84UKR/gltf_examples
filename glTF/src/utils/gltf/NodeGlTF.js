import * as glMatrix from  "../../glm/index.js";

export class NodeGLTF {
  constructor(data) {
    this.name =  (data.name = undefined) ? "" : data.name;
    this.index = data.index;
    this.localMatrix = glMatrix.mat4.create();
    this.worldMatrix = glMatrix.mat4.create();
    this.sorceMatrix = glMatrix.mat4.create(); // Translate / rotation / scale
    this.parent = null;
    this.children = [];

    this.translation = (data.translation == null)
      ? glMatrix.vec3.create()
      : data.translation;

    this.rotation = (data.rotation == null)
      ? glMatrix.quat.create()
      : data.rotation;

    this.scale = (data.scale == null)
      ? glMatrix.vec3.fromValues(1, 1, 1)
      : data.scale;
    this.mesh = data.mesh;

    this.sorceMatrix = this.TRS(this.translation,this.rotation,this.scale);
  }

  getMatrix(){
    this.updateWorldMatrix(this.parent);
    return this.worldMatrix;
  }

  TRS(translation, rotation, scale) {
    let matrixTemp = glMatrix.mat4.create();
    //Формируем матрицу на основании translation, rotation, scale
    glMatrix.mat4.fromRotationTranslationScale(
      matrixTemp,
      rotation,
      translation,
      scale
    );

    return matrixTemp;
  }

  setParent(parent) {
    //Есди у насесть родитель то удаляем его
    if (this.parent) {
      this.parent._removeChild(this); // в текушем родителе удалим что мы его Child
      this.parent = null; // у насесть текущего родителя
    }
    if (parent) {
      parent._addChild(this); //Добавляем новому родителю нас как Child
      this.parent = parent; // Указываем нашего гового родителя
    }
  }
  updateWorldMatrix(parentWorldMatrix) {
    const sorceMatrix = this.sorceMatrix;
    glMatrix.mat4.copy(this.localMatrix, sorceMatrix); 
    
    if(parentWorldMatrix){
        //Есл иматрица родителя передана то умнодаем ее на локальную матрицу 
        //и записываем в нашу мировую матрицу
        glMatrix.mat4.multiply(this.worldMatrix, parentWorldMatrix,this.localMatrix); 
    }else{
       // иначе просто комируем локальную матрицу в нашу мировую 
        glMatrix.mat4.copy(this.worldMatrix,this.localMatrix); 
    }    
    
    //обрабатываем для всез потомков
    const worldMatrix = this.worldMatrix;
    for (const child of this.children) {
      child.updateWorldMatrix(worldMatrix);
    }

  }

  _removeChild(child) {
    const ndx = this.children.indexOf(child); // Ишем индекс текущего child
    this.children.splice(ndx, 1); // Вырезаем его из массива child
  }

  _addChild(child) {
    this.children.push(child);
  }
}