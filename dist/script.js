var container;
var camera, scene, renderer;
var controls;

var shaderUniforms, shaderAttributes;

var particles = [];
var particleSystem;

var imageWidth = 1080;
var imageHeight = 870;
var imageData = null;

var animationTime = 0;
var animationDelta = 0.03;

let lock = null;
let ampliWieght = 1;
const btn = document.getElementById("testBTN");
btn.addEventListener("click", () => {
  if (lock === null) {
    lock = true;
  } else if (lock === true) {
    lock = false;
  } else if (lock === false) {
    lock = null;
  }
});

init();
// tick();

function init() {
  createScene();
  createControls();
  createPixelData();

  window.addEventListener("resize", onWindowResize, false);
}

function createScene() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    20,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 3000;
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x00ffff, 1);

  container.appendChild(renderer.domElement);
}

function createControls() {
  controls = new THREE.TrackballControls(camera);

  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  controls.noZoom = false;
  controls.noPan = true;

  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
}

function createPixelData() {
  var image = document.createElement("img");
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");

  image.crossOrigin = "Anonymous";
  image.onload = function () {
    image.width = canvas.width = imageWidth;
    image.height = canvas.height = imageHeight;

    context.fillStyle = context.createPattern(image, "no-repeat");
    context.fillRect(0, 0, imageWidth, imageHeight);
    //context.drawImage(image, 0, 0, imageWidth, imageHeight);

    imageData = context.getImageData(0, 0, imageWidth, imageHeight).data;

    createPaticles();
    tick();
  };

  image.src = "./test3.jpg";
}

function createPaticles() {
  console.log("createPaticles");
  var colors = [];
  var weights = [0.2, 0.2, 0.2]; // хз зачем именно 3 значения, но эти значения уменьшают Z-расстояние между начальной точкой отсчета и кончной
  var c = 0;

  var geometry;
  var x, y;
  var zRange = 100; // тоже переменная устанавливающая расстояние меж конечной и начальными точками пульсации пкселей

  geometry = new THREE.Geometry();
  geometry.dynamic = false;

  x = imageWidth * -0.5;
  y = imageHeight * 0.5;

  shaderAttributes = {
    vertexColor: {
      type: "c",
      value: [],
    },

  };

  shaderUniforms = {
    amplitude: {
      type: "f",
      value: 1,
    },
    test: {
      type: "f",
      value: 0,
    },
  };

  var shaderMaterial = new THREE.ShaderMaterial({
    attributes: shaderAttributes,
    uniforms: shaderUniforms,
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });

  console.log(imageData);

  for (var i = 0; i < imageHeight; i++) {
    for (var j = 0; j < imageWidth; j++) {
      var color = new THREE.Color();

      color.setRGB(
        imageData[c] / 255,
        imageData[c + 1] / 255,
        imageData[c + 2] / 255
      );
      shaderAttributes.vertexColor.value.push(color);
      var vertex = new THREE.Vector3();

      vertex.x = x;
      vertex.y = y;
      vertex.z = 0.1;

      vertex.z = (vertex.z * zRange * Math.random()) / 5;


      geometry.vertices.push(vertex);

      c += 4;
      x++;
    }

    x = imageWidth * -0.5;
    y--;
  }
  particleSystem = new THREE.ParticleSystem(geometry, shaderMaterial);

  scene.add(particleSystem);
}

function tick() {
  requestAnimationFrame(tick);

  update();
  render();
}

let locker = 0;

function update() {
  // shaderUniforms.amplitude.value = Math.sin(animationTime)+1;
  // const sinusValue = Math.sin(animationTime) < 0 ? 0 : Math.sin(animationTime);
  if (lock === true) {
    ampliWieght += 0.005;
  } else if (lock === false) {
    ampliWieght -= 0.005;
  }
  shaderUniforms.amplitude.value = ampliWieght;
  shaderUniforms.test.value = lock === null ? 0. : lock === true ? 1. : -1.;

  animationTime += animationDelta * 0.1;

  controls.update();
}

function render() {
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
