'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const baseLookAtPosition = { x: 0, y: 1, z: 0 };
  const baseCameraPosition = { x: 5, y: 10, z: 10 };
  const [posterClicked, setPosterClicked] = React.useState(null);
  useEffect(() => {
    // Scene and Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('white');
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const listener = new THREE.AudioListener();
    camera.add(listener);
    // Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    let song_playing = false;

    // Room Class
    class Room {
        constructor() {
            this.group = new THREE.Group();
            this.createFloor();
            // this.createWalls();
        }

        createFloor() {
            const floorGeometry = new RoundedBoxGeometry(10, 0.5, 10, 2, 2);
            const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x8080ff });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.position.y = -0.2;
            floor.receiveShadow = true; // Enable shadow reception
            this.group.add(floor);
        }

        // createWalls() {
        //     const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xff4444 });

        //     // Wall 1
        //     const wall1Geometry = new THREE.BoxGeometry(10, 5, 0.5);
        //     const wall1 = new THREE.Mesh(wall1Geometry, wallMaterial);
        //     wall1.position.set(0, 2.75, -4.75);
        //     wall1.receiveShadow = true; 
        //     this.group.add(wall1);

        //     // Wall 2
        //     const wall2Geometry = new THREE.BoxGeometry(10, 5, 0.5);
        //     const wall2 = new THREE.Mesh(wall2Geometry, wallMaterial);
        //     wall2.rotation.y = Math.PI / 2;
        //     wall2.position.set(-4.75, 2.75, 0);
        //     wall2.receiveShadow = true;
        //     this.group.add(wall2);
        // }
    }

    class Poster {
        constructor(imagePath, baseX = 0, baseY = 0, baseZ = 0, scale = 1) {
            this.group = new THREE.Group();
            this.imagePath = imagePath;
            this.position = { x: baseX, y: baseY, z: baseZ };
            this.scale = scale;
            this.createPoster();
        }

        createPoster() {
            const img = new Image();
            img.src = this.imagePath;
            img.onload = () => {
                const posterGeometry = new THREE.PlaneGeometry(img.width / 1000 * this.scale, img.height / 1000 * this.scale);
                const textureLoader = new THREE.TextureLoader();
                const posterMaterial = new THREE.MeshBasicMaterial({
                    map: textureLoader.load(this.imagePath),
                    side: THREE.DoubleSide
                });
                const poster = new THREE.Mesh(posterGeometry, posterMaterial);
                poster.position.set(this.position.x, this.position.y, this.position.z);
                poster.castShadow = true;

                const direction = new THREE.Vector3(0, this.position.y, 0); // Look towards Y axis
                poster.lookAt(direction);

                this.group.add(poster);

                const frameGeometry = new THREE.BoxGeometry((img.width / 1000 * 1.05) * this.scale, (img.height / 1000 * 1.05) * this.scale, 0.05);
                const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ee });
                const frame = new THREE.Mesh(frameGeometry, frameMaterial);
                frame.position.set(this.position.x * 1.01, this.position.y, this.position.z * 1.01);
                frame.lookAt(direction);
                this.group.add(frame);

                const onMouseClick = (event) => {
                    const raycaster = new THREE.Raycaster();
                    const mouse = new THREE.Vector2();
                  
                    // Convert the mouse position to normalized device coordinates (-1 to +1)
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                  
                    raycaster.setFromCamera(mouse, camera);
                    const intersects = raycaster.intersectObjects([poster]);
                    if (intersects.length > 0) {
                      // 'this' context should refer to your poster, or use intersects[0].object
                  
                      // For example, calculate a target position that’s offset from the poster.
                      const targetPosition = new THREE.Vector3(
                        this.position.x * 0.5,
                        this.position.y - 1,
                        this.position.z * 0.5
                      );
                  
                      // Animate the camera: move it to the target position and make it look at the poster.
                      lerp_reset_camera(targetPosition, poster.position);
                      console.log(posterClicked);
                      const captionElement = document.getElementById('poster_caption');
                      captionElement.innerText = 'This is from ' + img.src.split('/').pop();
                    }
                };
                const onKeyDown = (event) => {
                    if (event.code === 'Escape') {
                        lerp_reset_camera(new THREE.Vector3(baseCameraPosition.x, baseCameraPosition.y, baseCameraPosition.z), new THREE.Vector3(baseLookAtPosition.x, baseLookAtPosition.y, baseLookAtPosition.z));
                    }
                    const captionElement = document.getElementById('poster_caption');
                    captionElement.innerText = '';
                };
                window.addEventListener('click', onMouseClick.bind(this), false);
                window.addEventListener('keydown', onKeyDown.bind(this), false);
            }
        }
    }

    class Vinyl {
        constructor(imagePath, musicPath) {
            this.group = new THREE.Group();
            this.imagePath = imagePath;
            this.musicPath = musicPath;
            this.sound = null;
            this.isPlaying = false;
            this.createVinyl();
        }

        createVinyl() {
            const img = new Image();
            img.src = this.imagePath;
            img.onload = () => {
                this.sound = new THREE.Audio(listener);
                const audioLoader = new THREE.AudioLoader();
                audioLoader.load(this.musicPath, (buffer) => {
                    this.sound.setBuffer(buffer);
                    this.sound.setLoop(true);
                    this.sound.setVolume(0.5);
                });

                const vinylGeometry = new THREE.CylinderGeometry(4, 4, 0.1, 64);
                const vinylBaseGeometry = new THREE.CylinderGeometry(8, 8, 0.3, 64);
                const textureLoader = new THREE.TextureLoader();
                const vinylMaterial = new THREE.MeshStandardMaterial({
                    map: textureLoader.load(this.imagePath),
                    side: THREE.DoubleSide
                });
                const vinylBaseMaterial = new THREE.MeshStandardMaterial({
                    map: textureLoader.load('images/vinyl_base.jpg'),
                    side: THREE.DoubleSide
                });

                const vinyl = new THREE.Mesh(vinylGeometry, vinylMaterial);
                const vinylBase = new THREE.Mesh(vinylBaseGeometry, vinylBaseMaterial);

                vinyl.position.set(0, 0.3, 0);
                vinylBase.position.set(0, 0, 0);

                const vinylGroup = new THREE.Group();
                vinylGroup.add(vinylBase);
                vinylGroup.add(vinyl);

                vinylGroup.position.set(0, -5, 0);
                vinylGroup.rotation.y = 0;

                const rotateVinyl = () => {
                    if (this.isPlaying) {
                        vinylGroup.rotation.y += 0.01;
                    }
                    requestAnimationFrame(rotateVinyl);
                };
                rotateVinyl();

                vinylGroup.add(this.sound);
                vinylGroup.castShadow = true;

                this.group.add(vinylGroup);

                // Add space bar event listener
                const onKeyDown = (event) => {
                    if (event.code === 'Space') {
                        this.isPlaying = !this.isPlaying;
                        if (this.isPlaying) {
                            this.sound.play();
                            song_playing = true;
                        } else {
                            this.sound.pause();
                            song_playing = false;
                        }
                    }
                };
                window.addEventListener('keydown', onKeyDown, false);
            };
        }
    }

    // Add room to the scene
    const poster = new Poster('images/IMG_0988.jpg', 0.5, 3, -6);
    const penguin_poster = new Poster('images/penguin.jpg', -10, 6, 0, 10);
    const nyan_poster = new Poster('images/nyan.jpg', 8, 4, 0, 3);
    const monkey_poster = new Poster('images/monke.jpg', 7, 4, -7, 10);
    const vinyl = new Vinyl('images/perfect_night.jpg', 'perfect_night.mp3');
    const room = new Room();
    scene.add(poster.group);
    scene.add(penguin_poster.group);
    scene.add(nyan_poster.group);
    scene.add(monkey_poster.group);
    scene.add(vinyl.group);
    scene.add(room.group);

    let mixer = null;
    const fbxLoader = new FBXLoader()
    fbxLoader.load(
        'models/Dancing_Twerk.fbx',
        (object) => {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });
            mixer = new THREE.AnimationMixer(object);
            const action = mixer.clipAction(object.animations[0]);
            action.play();
            object.scale.set(0.02, 0.02, 0.02);
            object.position.set(2, 0, 0);
            object.rotation.y = Math.PI / 4;
            scene.add(object);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }
    )
    fbxLoader.load(
        'models/lpbns_br_bed.fbx',
        (object) => {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.material = new THREE.MeshStandardMaterial({ color: 0xffa500 }); // Add color to bed
                }
            });
            object.scale.set(0.02, 0.02, 0.02);
            object.position.set(-2, 0, 4);
            object.rotation.y = Math.PI / 2;
            scene.add(object);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        }
    )
    fbxLoader.load(
        'models/textured_chibi.fbx',
        (object) => {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });
            object.scale.set(0.02, 0.02, 0.02);
            object.position.set(4, 1, 2);
            object.rotation.y = Math.PI / 2;
            scene.add(object);

            const onMouseClick = (event) => {
                const raycaster = new THREE.Raycaster();
                const mouse = new THREE.Vector2();
              
                // Convert the mouse position to normalized device coordinates (-1 to +1)
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
              
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects([object]);
                if (intersects.length > 0) {
                  const targetPosition = new THREE.Vector3(object.position.x * 1.1, object.position.y * 1.1 , object.position.z * 1.1);
                  lerp_reset_camera(targetPosition, object.position);
                  const captionElement = document.getElementById('poster_caption');
                  captionElement.innerText = 'This is from ' + 'Chibi';
                }
            };
            const onKeyDown = (event) => {
                if (event.code === 'Escape') {
                    lerp_reset_camera(new THREE.Vector3(baseCameraPosition.x, baseCameraPosition.y, baseCameraPosition.z), new THREE.Vector3(baseLookAtPosition.x, baseLookAtPosition.y, baseLookAtPosition.z));
                }
                const captionElement = document.getElementById('poster_caption');
                captionElement.innerText = '';
            };
            window.addEventListener('click', onMouseClick.bind(this), false);
            window.addEventListener('keydown', onKeyDown.bind(this), false);
            }
    )
    fbxLoader.load(
        'models/lpbns_br_table.fbx',
        (object) => {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Add color to table
                }
            });
            object.scale.set(0.02, 0.02, 0.02);
            object.position.set(-2, 0, 2);
            object.rotation.y = Math.PI / 2;
            scene.add(object);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        }
    )
    fbxLoader.load(
        'models/lpbns_br_cabinet_01.fbx',
        (object) => {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Add color to cabinet
                }
            });
            object.scale.set(0.03, 0.03, 0.03);
            object.position.set(-3, 0, -3.5);
            scene.add(object);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        }
    )

    const lerp_reset_camera = (targetPosition, lookAtPosition) => {
        const duration = 0.5; // Duration of the lerp in seconds
        const startTime = performance.now();
        const initialPosition = camera.position.clone();
        const initialLookAt = camera.getWorldDirection(new THREE.Vector3()).add(camera.position);

        const animateCamera = () => {
            const elapsed = (performance.now() - startTime) / 1000;
            if (elapsed < duration) {
                camera.position.lerpVectors(initialPosition, targetPosition, elapsed / duration);
                const currentLookAt = initialLookAt.clone().lerp(lookAtPosition, elapsed / duration);
                camera.lookAt(currentLookAt.x, currentLookAt.y, currentLookAt.z);
                controls.target.copy(currentLookAt); // Update controls target
                controls.update(); // Update controls
                requestAnimationFrame(animateCamera);
            } else {
                camera.position.copy(targetPosition);
                camera.lookAt(lookAtPosition);
                controls.target.copy(lookAtPosition); // Update controls target
                controls.update(); // Update controls
            }
        };
        animateCamera();
    }
    // Lighting (optional)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true; // Enable shadow casting
    scene.add(directionalLight);

    // Camera position
    camera.position.set(baseCameraPosition.x, baseCameraPosition.y, baseCameraPosition.z);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth rotation
    controls.dampingFactor = 0.2;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2; // Prevent camera from going below the floor

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        if (mixer && song_playing) {
            mixer.update(0.02);
        }
        controls.update(); // Update controls
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current){
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef}/>;
};


export default ThreeScene;
