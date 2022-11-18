/* eslint-disable no-unused-vars */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import EventEmitter from 'event-emitter-es6';
import { createEnvironment, updateEnvironment } from './environment';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
console.log(ARButton);


class Scene extends EventEmitter {
  constructor(domElement = document.getElementById('gl_context'),
    _width = window.innerWidth,
    _height = window.innerHeight,
    hasControls = true,
    clearColor = 'white') {

    //Since we extend EventEmitter we need to instance it from here
    super();

    // guard against multiple binds
    this.audioBinded = false;
    this.playing = false;

    //THREE scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.fog = new THREE.Fog(0x72645b, 1, 500);

    //Utility
    this.width = _width;
    this.height = _height;

    //THREE Camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / this.height,
      0.1,
      5000
    );
    // this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

    this.camera.position.set(0, 0, 300);
    this.scene.add(this.camera);
    // create an AudioListener and add it to the camera

    //THREE WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      antialiasing: true, alpha: true
    });
    this.renderer.setClearColor(new THREE.Color(clearColor));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.xr.enabled = true;

    //Push the canvas to the DOM
    domElement.append(this.renderer.domElement);
    //Add AR button to the body of the DOM
    const button = ARButton.createButton(this.renderer);
    console.log(button);
    document.body.appendChild(button);

    //Controls & controlToggle
    if (hasControls) {
      //OrbitControls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      // this.controls = renderer.xr.getController(0);
      this.controls.enableDamping = true;
      console.log('control', this.controls);
      this.controls.enabled = false;
    }
    const checkbox = document.getElementById('controlToggle');
    checkbox.addEventListener('change', (event) => {
      if (event.currentTarget.checked) {
        this.controls.enabled = true;
      } else {
        this.controls.enabled = false;
      }

      this.renderer.setAnimationLoop(this.render);
    });

    //Raycaster
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    window.addEventListener('pointermove', (event) => {
      this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    });

    // Speech Recognition & Transcription
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

    var recognition = new SpeechRecognition();
    let started = false;
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let transcriptElement = document.getElementById('transcript');

    window.onbeforeunload = function () {
      recognition.stop();
      console.log('stop recording');
      return undefined;
    };

    document.body.onclick = function () {
      if (started) return;
      started = true;
      recognition.start();
      console.log('start recording');
    };

    recognition.onresult = function (event) {
      var res = event.results[event.results.length - 1];
      console.log(res[0].confidence, res[0].transcript);
      //recognized contents
      transcriptElement.textContent = res[0].transcript; 
    };

    recognition.onnomatch = function (event) {
      transcriptElement.textContent = 'I did not recognise.';
    };

    recognition.onerror = function (event) {
      transcriptElement.textContent = 'Error occurred in recognition: ' + event.error;
    };


    //Setup event listeners for events and handle the states
    window.addEventListener('resize', e => this.onWindowResize(e), false);
    window.addEventListener('keydown', e => this.onKeyDown(e), false);
    domElement.addEventListener('mouseenter', e => this.onEnterCanvas(e), false);
    domElement.addEventListener('mouseleave', e => this.onLeaveCanvas(e), false);


    // Add external media to <audio> tag in HTML
    document.addEventListener('keydown', (event) => {

    });

    document.addEventListener('keyup', (event) => {

    });

    document.addEventListener('mousedown', (event) => {

    });

    document.addEventListener('mouseup', (event) => {

    });




    // Helpers
    // this.scene.add(new THREE.GridHelper(1000, 1000));
    // this.scene.add(new THREE.AxesHelper(10));

    this.clock = new THREE.Clock();

    createEnvironment(this.scene);

    this.addLights(this.scene);

    this.update();
  }


  drawUsers(positions, id) {
    for (let i = 0; i < Object.keys(positions).length; i++) {
      if (Object.keys(positions)[i] != id) {
        this.users[i].position.set(positions[Object.keys(positions)[i]].position[0],
          positions[Object.keys(positions)[i]].position[1],
          positions[Object.keys(positions)[i]].position[2]);
      }
    }
  }

  addLights() {
    // this.scene.add(new THREE.AmbientLight(0xffffe6, 0.9));

    // let dirLight1 = new THREE.DirectionalLight( 0xffffff,0.1 );
    // dirLight1.position.set( -3, 0, 3.5 ).normalize();
    // this.scene.add( dirLight1 );

    console.log('hey light is on');
  }




  //notice: update() includes render()!
  update() {
    updateEnvironment();
    requestAnimationFrame(() => this.update());
    this.controls.update(this.clock.getDelta());
    this.controls.target = new THREE.Vector3(0, 0, 0);
    this.render();
  }

  render() {
    // update the picking ray with the camera and pointer position
    this.raycaster.setFromCamera(this.pointer, this.camera);

    // calculate objects intersecting the picking ray
    const points = this.scene.children.filter((item) => item.type == 'Points'); // get all the points
    // console.log('points', points);
    const intersects = this.raycaster.intersectObjects(points);

    // if there is any point intersected, paint it. else paint all white
    if (intersects.length != 0) {
      console.log('intersects', intersects);
      for (const intersect of intersects) { intersect.object.material.color.set(0x2196f3); }
    }
    else {
      for (const point of points) { point.material.color.set(0xffffff); }
    }

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize(e) {
    console.log('resize');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  onLeaveCanvas(e) {

  }

  onEnterCanvas(e) {

  }

  onKeyDown(e) {
    this.emit('userMoved');
  }
}

export default Scene;
