'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { lerp } from 'three/src/math/MathUtils.js';

const LandingScene = () => {
    const landing = useRef(null);
    const fbxLoader = new FBXLoader();
    let currentIndex = 0;
    const cameraPositions = [
        { position: { x: 3.5, y: 7.4, z: 15.5 }, lookAt: { x: 0, y: 3, z: 0 } },
        { position: { x: 3.7, y: 5.5, z: 8.5 }, lookAt: { x: -7, y: -0.6, z: -1 } },
        { position: { x: -11.5, y: 5.8, z: 8.71 }, lookAt: { x: 3, y: -0.3, z: 2 } },
        { position: { x: 8.2, y: 3, z: 13.9 }, lookAt: { x: -0.5, y: -1, z: -0.8 } },
        { position: { x: 11, y: 5.1, z: 5.8 }, lookAt: { x: -0.82, y: -0.3, z: -0.4 } },
    ]
    const baseCameraPosition = cameraPositions[0].position;
    const baseCameraLookAt = cameraPositions[0].lookAt;
    
    const team_info = [
        { name: 'NFTSocial', role: '- own your metaverse', exp: ''},
        { name: 'Shane Yeo', role: 'Project Manager', exp: '10+ years on the web'},
        { name: 'Irwyn', role: 'Backside Developer', exp: 'Artemis, Crypto Degen'},
        { name: 'Daniel', role: 'Backend Developer', exp: '20+ years of experience'},
        { name: 'Bingyuan', role: 'Visual enjoyer', exp: '5+ hours of enjoying'},
    ]

    useEffect(() => {
        // Scene and Camera
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('black');
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const listener = new THREE.AudioListener();
        camera.add(listener);
        // Renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true; // Enable shadows
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);
        // Lighting (optional)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
    
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true; // Enable shadow casting
        scene.add(directionalLight);

        // Axes Helper
        const axesHelper = new THREE.AxesHelper(15);
        // scene.add(axesHelper);
        // Display camera position and direction
        const cameraInfo = document.createElement('div');
        cameraInfo.style.position = 'absolute';
        cameraInfo.style.top = '10px';
        cameraInfo.style.left = '10px';
        cameraInfo.style.color = 'white';
        cameraInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        cameraInfo.style.padding = '10px';
        document.body.appendChild(cameraInfo);

        const updateCameraInfo = () => {
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            cameraInfo.innerHTML = `
            Position: x: ${camera.position.x.toFixed(2)}, y: ${camera.position.y.toFixed(2)}, z: ${camera.position.z.toFixed(2)}<br>
            Direction: x: ${direction.x.toFixed(2)}, y: ${direction.y.toFixed(2)}, z: ${direction.z.toFixed(2)}
            `;
        };

        // Update camera info on each frame
        const originalAnimate = animate;
        animate = () => {
            originalAnimate();
            updateCameraInfo();
            updateShootingStars();
        };

        class FBXModel {
            constructor(loader, modelPath, texturePath, modelPosition, modelRotation, modelScale) {
                this.loader = loader;
                this.modelPath = modelPath;
                this.texturePath = texturePath;
                this.modelPosition = modelPosition;
                this.modelRotation = modelRotation;
                this.modelScale = modelScale;
            }

            load(scene) {
                this.loader.load(
                    this.modelPath,
                    (object) => {
                        object.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                const texture = new THREE.TextureLoader().load(this.texturePath);
                                child.material = new THREE.MeshStandardMaterial({ map: texture });
                            }
                        });

                        object.scale.set(this.modelScale.x, this.modelScale.y, this.modelScale.z);
                        object.position.set(this.modelPosition.x, this.modelPosition.y, this.modelPosition.z);
                        object.rotation.set(this.modelRotation.x, this.modelRotation.y, this.modelRotation.z);
                        scene.add(object);
                    },
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
                    }
                );
            }
        }   
        
        // fbx objects
        const models = [
            {
            modelPath: 'models/birb.fbx',
            texturePath: 'textures/T_Sparrow.png',
            modelPosition: { x: -3, y: -3, z: -3.5 },
            modelRotation: { x: 0, y: Math.PI / 4, z: 0 },
            modelScale: { x: 0.06, y: 0.06, z: 0.06 }
            },
            {
            modelPath: 'models/feesh.fbx',
            texturePath: 'textures/T_Herring.png',
            modelPosition: { x: 3, y: -3, z: -3.5 },
            modelRotation: { x: 0, y: Math.PI / 4, z:-Math.PI/6 },
            modelScale: { x: 0.06, y: 0.06, z: 0.06 }
            },
            {
            modelPath: 'models/TeddyBearPT.fbx',
            texturePath: 'textures/TeddyPT.TGA.png',
            modelPosition: { x: -2, y: -1, z: 8 },
            modelRotation: { x: - 2 * Math.PI / 4, y: Math.PI / 3, z: 3 * Math.PI / 5 },
            modelScale: { x: 0.5, y: 0.5, z: 0.5 }
            },
            {
                modelPath: 'models/lpbns_br_slipper.fbx',
                texturePath: 'textures/T_Gecko.png',
                modelPosition: { x: 4, y: -2, z:8 },
                modelRotation: { x: Math.PI, y: 0, z: Math.PI },
                modelScale: { x: 0.05, y: 0.05, z: 0.05 }
            }
        ];

        const fbxModels = [];
        models.forEach((model) => {
            const fbxModel = new FBXModel(fbxLoader, model.modelPath, model.texturePath, model.modelPosition, model.modelRotation, model.modelScale);
            fbxModel.load(scene);
            fbxModels.push(fbxModel);
        });

        const door = {
            modelPath: 'models/lpbns_br_door.fbx',
            texturePath: 'textures/T_Taipan.png',
            modelPosition: { x: 0, y: 0, z: 0 },
            modelRotation: { x: 0, y: 0, z: 0 },
            modelScale: { x: 0.02, y: 0.02, z: 0.02}
        }
        fbxLoader.load(
            door.modelPath,
            (object) => {
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        const texture = new THREE.TextureLoader().load(door.texturePath);
                        child.material = new THREE.MeshStandardMaterial({ map: texture });
                    }
                });

                object.scale.set(door.modelScale.x, door.modelScale.y, door.modelScale.z);
                object.position.set(door.modelPosition.x, door.modelPosition.y, door.modelPosition.z);
                object.rotation.set(door.modelRotation.x, door.modelRotation.y, door.modelRotation.z);
                scene.add(object);
                const onMouseClick = (event) => {
                    const raycaster = new THREE.Raycaster();
                    const mouse = new THREE.Vector2();
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                    raycaster.setFromCamera(mouse, camera);
                    const intersects = raycaster.intersectObjects([object], true);
                    if (intersects.length > 0) {
                        console.log('Door clicked');
                        const doorPivot = new THREE.Object3D();
                        doorPivot.position.set(object.position.x, 0, object.position.z);
                        scene.add(doorPivot);
                        doorPivot.add(object);
                        const swingDuration = 300; // Duration of the swing in milliseconds
                        const swingAngle = Math.PI / 2; // 90 degrees
                        const swingDoor = (startTime) => {
                            const elapsed = performance.now() - startTime;
                            const t = Math.min(elapsed / swingDuration, 1);
                            const angle = swingAngle * t;
                            doorPivot.rotation.y = angle;
                            if (t < 1) {
                                requestAnimationFrame(() => swingDoor(startTime));
                            }
                        };
                        lerp_reset_camera(new THREE.Vector3(1, 2.2, 4.1), new THREE.Vector3(1, 1.5, -1));
                        setTimeout(() => {
                            requestAnimationFrame(() => swingDoor(performance.now()));
                            setTimeout(() => {
                                window.location.href = '/room';
                            }, 300); // Wait for the spin animation to finish
                        }, 800); // Wait for the camera lerp to finish
                    }
                };
                window.addEventListener('click', onMouseClick);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            }
        );

        // Shooting stars
        const shootingStars = [];
        const createShootingStar = () => {
            const starGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(
            Math.random() * 100 - 50,
            Math.random() * 100 - 50,
            Math.random() * 100 - 50
            );
            scene.add(star);
            return star;
        };

        for (let i = 0; i < 10; i++) {
            shootingStars.push(createShootingStar());
        }

        // create some static stars
        for (let i = 0; i < 100; i++) {
            createShootingStar();
        }

        const updateShootingStars = () => {
            shootingStars.forEach((star) => {
            star.position.x -= 0.5;
            star.position.y -= 0.5;
            if (star.position.x < -100 || star.position.y < -50) {
                star.position.set(
                Math.random() * 200 - 100,
                Math.random() * 100 - 50,
                Math.random() * 200 - 100
                );
            }
            });
        };

        // Camera position
        camera.position.set(baseCameraPosition.x, baseCameraPosition.y, baseCameraPosition.z);
        camera.lookAt(baseCameraLookAt.x, baseCameraLookAt.y, baseCameraLookAt.z);
        const moonGeometry = new THREE.SphereGeometry(20, 32, 32);
        const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xffffcc });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(0, -20, 0);
        moon.castShadow = true; // Enable shadow casting
        scene.add(moon);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Smooth rotation
        controls.enablePan = false; // Disable pan
        controls.enableZoom = false; // Disable zoom
        controls.dampingFactor = 0.2;
        controls.minDistance = 2;
        controls.maxDistance = 20;
        controls.maxPolarAngle = Math.PI; // Prevent camera from going below the floor

        // Arrow button event listeners

        const handleKeyDown = (event) => {
            switch (event.key) {
            case 'ArrowLeft':
            currentIndex = (currentIndex - 1 + cameraPositions.length) % cameraPositions.length;
            break;
            case 'ArrowRight':
            currentIndex = (currentIndex + 1) % cameraPositions.length;
            break;
            default:
            return;
            }
            const targetPosition = new THREE.Vector3(cameraPositions[currentIndex].position.x, cameraPositions[currentIndex].position.y, cameraPositions[currentIndex].position.z);
            const lookAtPosition = new THREE.Vector3(cameraPositions[currentIndex].lookAt.x, cameraPositions[currentIndex].lookAt.y, cameraPositions[currentIndex].lookAt.z);
            lerp_reset_camera(targetPosition, lookAtPosition);
            updateTeamInfo(currentIndex);
        };

        window.addEventListener('keydown', handleKeyDown);
        const handleScroll = (event) => {
            const scrollSpeed = 0.5; // Adjust scroll speed as needed
            let scrollDelta = 0;

            const animateScroll = () => {
                if (scrollDelta !== 0) {
                    const infoElement = document.getElementById('team-info');
                    const spherical = new THREE.Spherical();
                    spherical.setFromVector3(camera.position);
                    spherical.theta += scrollDelta * scrollSpeed * 0.05; // Change axis of rotation to theta
                    const maxOpacityAngle = Math.PI / 4;
                    const opacity = 1 - Math.abs(spherical.theta - maxOpacityAngle) / maxOpacityAngle;
                    infoElement.style.opacity = Math.max(0, Math.min(1, opacity));
                    spherical.theta = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.theta)); // Clamp theta to prevent flipping
                    camera.position.setFromSpherical(spherical);
                    camera.lookAt(controls.target);
                    controls.update();
                    scrollDelta *= 0.9; // Damping effect
                    if (Math.abs(scrollDelta) < 0.001) {
                        scrollDelta = 0;
                    }
                }
                requestAnimationFrame(animateScroll);
            };

            animateScroll();

            scrollDelta += event.deltaY > 0 ? 1 : -1;
        };

        window.addEventListener('wheel', handleScroll);
        const updateTeamInfo = (index) => {
            const infoElement = document.getElementById('team-info');
            infoElement.style.opacity = 0; // Start with opacity 0 for fade out
            setTimeout(() => {
            infoElement.innerHTML = team_info[index].name + ' ' + team_info[index].role + ' ' + team_info[index].exp;
            if (index === 0) {
                infoElement.style.fontSize = '5rem'; // Increase text size
            } else {
                infoElement.style.fontSize = '4rem'; // Default text size
            }
            infoElement.style.opacity = 1; // Fade in
            }, 750); // Adjust the timeout duration as needed
        }
        const lerp_reset_camera = (targetPosition, lookAtPosition) => {
            const duration = 0.8; // Duration of the lerp in seconds
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
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            // controls.update(); // Update controls
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
    }, []);
    return <div ref={landing}></div>
}

export default LandingScene;