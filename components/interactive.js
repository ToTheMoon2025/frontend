'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const baseCameraPosition = { x: 0, y: 6, z: 6 };
    useEffect(() => {
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
        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Smooth rotation
        controls.dampingFactor = 0.2;
        controls.minDistance = 2;
        controls.maxDistance = 20;
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

        function createFloor(scene) {
            const floorGeometry = new RoundedBoxGeometry(10, 1, 10, 2, 2);
            const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x8080ff });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.position.y = -0.2;
            floor.receiveShadow = true; // Enable shadow reception
            scene.add(floor);
        }

        createFloor(scene);
        const loader = new FBXLoader();
        let mixer = null;
        let actionIdle = null;
        let userEntered = false;

        loader.load('models/animation/Walking-2.fbx', function (object) {
            object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
            });
            mixer = new THREE.AnimationMixer(object);
            actionIdle = mixer.clipAction(object.animations[0]);
            actionIdle.play();
            object.scale.set(0.01, 0.01, 0.01);
            object.position.set(0, 0.25, 0);
            const floorSize = 4.5; // Half the size of the floor (10 / 2)

            const constrainPosition = () => {
                object.position.x = Math.max(-floorSize, Math.min(floorSize, object.position.x));
                object.position.z = Math.max(-floorSize, Math.min(floorSize, object.position.z));
                requestAnimationFrame(constrainPosition);
            };

            constrainPosition();

            let baseRotation = Math.PI;
            object.rotation.y = baseRotation;
            object.visible = userEntered;

            // object control module
            let theta = object.rotation.y;

            let moveForward = false;
            let rotateLeft = false;
            let rotateRight = false;

            const onKeyDown = (event) => {
                switch (event.key) {
                    case 'ArrowUp':
                        moveForward = true;
                        break;
                    case 'ArrowLeft':
                        rotateLeft = true;
                        break;
                    case 'ArrowRight':
                        rotateRight = true;
                        break;
                    default:
                        break;
                }
            };

            const onKeyUp = (event) => {
                switch (event.key) {
                    case 'ArrowUp':
                        moveForward = false;
                        break;
                    case 'ArrowLeft':
                        rotateLeft = false;
                        break;
                    case 'ArrowRight':
                        rotateRight = false;
                        break;
                    default:
                        break;
                }
            };

            const updateMovement = () => {
                if (moveForward) {
                    object.position.z += 0.1 * Math.cos(theta);
                    object.position.x += 0.1 * Math.sin(theta);
                }
                if (rotateLeft) {
                    object.rotation.y += 0.1;
                    theta = object.rotation.y;
                }
                if (rotateRight) {
                    object.rotation.y -= 0.1;
                    theta = object.rotation.y;
                }
                requestAnimationFrame(updateMovement);
            };
            const updateCameraPositionAndTarget = () => {
                const dynamicCameraPosition = get_dynamic_camera_position(object.position, theta);
                const dynamicCameraTarget = get_dynamic_camera_target(object.position, theta);
                camera.position.set(dynamicCameraPosition.x, dynamicCameraPosition.y, dynamicCameraPosition.z);
                controls.target.set(dynamicCameraTarget.x, dynamicCameraTarget.y, dynamicCameraTarget.z);
                controls.update();
                requestAnimationFrame(updateCameraPositionAndTarget);
            };

            updateCameraPositionAndTarget();
            updateMovement();
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
            scene.add(object);
            const updateVisibility = () => {
                object.visible = userEntered;
                requestAnimationFrame(updateVisibility);
            };
            updateVisibility();
            window.addEventListener('keydown', onKeyDown);

            // Cleanup event listener on component unmount
            return () => {
                window.removeEventListener('keydown', onKeyDown);
            };

            
        });

        // Lighting (optional)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
    
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true; // Enable shadow casting
        scene.add(directionalLight);
    
        // Camera position
        camera.position.set(baseCameraPosition.x, baseCameraPosition.y, baseCameraPosition.z);
    
        
        // Animation loop
        const clock = new THREE.Clock();
        function animate() {
            updateCameraInfo();
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            if (elapsedTime > 0.5 && mixer) {
                userEntered = true;
                mixer.update(0.01);
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

    return (
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    );
}

function get_dynamic_camera_position(dummy_position, dummy_theta) {
    return {
        x: dummy_position.x - Math.sin(dummy_theta) * 3,
        y: dummy_position.y + 2,
        z: dummy_position.z - Math.cos(dummy_theta) * 3
    };
}

function get_dynamic_camera_target(dummy_position, dummy_theta){
    return {
        x: dummy_position.x + Math.sin(dummy_theta) * 2,
        y: dummy_position.y + 1.5,
        z: dummy_position.z + Math.cos(dummy_theta) * 2
    };
}

export default ThreeScene;