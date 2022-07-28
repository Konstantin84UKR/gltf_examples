import * as dat from './dat.gui.module.js';

export function myGUI(gl) {
  const settingGUI = {
    rotateX: 0.0,
    model_X: 0.0,
    model_Y: 1.0,
    model_Z: 0.0,

    view_directionX: 0.0,
    view_directionY: 2.0,
    view_directionZ: -10.0,

    normal: false,
    axis: false,

    cameraReset: function () {
      this.camera.reset();
    },
    add: function () {
      console.log("clicked");
    },
    animationScale: 1.0,

    cameraindex : 0
  };

  let gui = new dat.GUI();
  gui.add(settingGUI, "normal");
  gui.add(settingGUI, "axis");

  gui.add(settingGUI, "animationScale").min(0.5).max(5.0).step(0.01);

  const camera = gui.addFolder("camera");
  camera.add(settingGUI, "cameraReset");
  camera.add(settingGUI, "cameraindex", {
    perspective: 0,
    orthographic: 1   
  });

  camera.open();

  gui.add(settingGUI, "add");

  return settingGUI;
}