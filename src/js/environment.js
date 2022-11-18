import * as THREE from 'three';
// import { Water } from 'three/examples/jsm/objects/Water.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';


// let tree;
// let skybox;


export function createEnvironment(scene) {
  console.log('Adding environment');

  //Ground
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1500, 1500),
    new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })
  );
  plane.rotation.x = - Math.PI / 2;
  plane.position.set(0, -50, -100);
  scene.add(plane);
  plane.receiveShadow = true;
  plane.visible = false;

  //Bunny
  const bunnyModel = new STLLoader();
  bunnyModel.load(
    'assets/bunny.stl',
    function (geometry) {
      const bunnyMaterial = new THREE.MeshBasicMaterial({
        color: 'rgb(0,0,0)',
        side: THREE.DoubleSide,
        // transparent: true,
        // opacity: 0.2
      });

      const bunny = new THREE.Mesh(geometry, bunnyMaterial);
      bunny.rotateX(- Math.PI / 2);
      bunny.position.set(-20, -50, 0);
      bunny.castShadow = true;
      bunny.receiveShadow = true;
      scene.add(bunny);

      // const box = new THREE.Box3();
      // bunny.geometry.computeBoundingBox();
      // console.log(bunny.geometry.boundingBox);
      // bunny.updateMatrixWorld( true );
      // box.copy(bunny.geometry.boundingBox).applyMatrix4(bunny.matrixWorld);

      // box.setFromCenterAndSize(bunny.geometry.boundingBox.min, bunny.geometry.boundingBox.max);
      // const helper = new THREE.Box3Helper(box, 0xffff00);
      // helper.rotateX(- Math.PI / 2);
      // // helper.position.set(-20, -50, 0);
      // scene.add(helper);

      const wireframe = new THREE.WireframeGeometry(geometry);
      const line = new THREE.LineSegments(wireframe);
      line.material.depthTest = true;
      line.material.opacity = 0.8;
      line.material = new THREE.MeshBasicMaterial({ color: 'white' });
      line.material.transparent = true;
      line.rotateX(- Math.PI / 2);
      line.position.set(-20, -50, 0);
      scene.add(line);


      const vertices = [];
      const positionAttribute = geometry.getAttribute('position');

      for (let i = 0; i < positionAttribute.count; i++) {
        const vertex = new THREE.Vector3();
        // console.log(vertex);
        vertex.fromBufferAttribute(positionAttribute, i);
        vertices.push(vertex);
      }
      //Draw model's box
      console.log(vertices);
      console.log(vertices.map(p => p.x));
      const verticesXMax = Math.max(...vertices.map(p => p.x));
      const verticesXMin = Math.min(...vertices.map(p => p.x));
      const verticesYMax = Math.max(...vertices.map(p => p.y));
      const verticesYMin = Math.min(...vertices.map(p => p.y));
      const verticesZMax = Math.max(...vertices.map(p => p.z));
      const verticesZMin = Math.min(...vertices.map(p => p.z));
      const X = Math.abs(verticesXMax) + Math.abs(verticesXMin);
      const Y = Math.abs(verticesYMax) + Math.abs(verticesYMin);
      const Z = Math.abs(verticesZMax) + Math.abs(verticesZMin);
      const geometryBox = new THREE.BoxGeometry(X, Y, Z);
      const materialBox = new THREE.MeshBasicMaterial({ color: 0x2196f3, transparent: true, opacity: 0.2 });
      const cube = new THREE.Mesh(geometryBox, materialBox);
      cube.rotateX(- Math.PI / 2);
      cube.position.set(10, 10, -2);
      scene.add(cube);



      const loader = new THREE.TextureLoader();
      const textureP = loader.load('assets/disc.png');

      for (const vertex of vertices) {
        const pointGeometry = new THREE.BufferGeometry().setFromPoints([vertex]);
        const pointsMaterial = new THREE.PointsMaterial({
          color: 'white',
          map: textureP,
          size: 5,
          alphaTest: 0.5,
          // depthWrite: false,
          // depthTest: false
        });
        const point = new THREE.Points(pointGeometry, pointsMaterial);
        point.rotateX(- Math.PI / 2);
        point.position.set(-20, -50, 0);
        scene.add(point);
        // console.log("我是point:",point);
      }
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.log(error);
    }
  );

  //Change Bunny Material: get speech content
  let transcriptElementGet = document.getElementById('transcript');
  console.log(transcriptElementGet.textContent.toLowerCase());
  console.log('sakjehgihuadhfia',bunnyModel);
  // let colorExpression = ['blue'];


}



// eslint-disable-next-line
export function updateEnvironment(scene) {

}
