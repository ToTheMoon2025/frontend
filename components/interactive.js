'use client';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import WebcamCapture from './webcam';

const ThreeScene = ({ bagSkins }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const clockRef = useRef(new THREE.Clock());
    const mixerRef = useRef(null);
    const characterRef = useRef(null);
    const controlsRef = useRef(null);
    const animationFrameRef = useRef(null);
    const [creatingPoster, setCreatingPoster] = useState(false);
    const roomWallRef = useRef(null);
    const viewState = useRef({
        isThirdPerson: true,
    });
    
    const movementState = useRef({
        moveForward: false,
        rotateLeft: false,
        rotateRight: false,
        theta: characterRef.current ? characterRef.current.rotation.y : 0,
        movementSpeed: 3,
        rotationSpeed: 3
    });

    const CAMERA_CONFIG = {
        thirdPerson: {
            fov: 70,
            near: 0.1,
            far: 100,
            followDistance: 4,
            heightOffset: 2,
            smoothness: 0.1
        },
        fixed: {
            position: { x: -6, y: 10, z: 6 },
            target: { x: 0, y: 1, z: 0 },
            fov: 60,
        }
    };

    const ROOM_CONFIG = {
        floor: {
            width: 8,
            height: 1,
            depth: 8,
        },
        wall: {
            width: 8,
            height: 6,
            depth: 0.2,
        }
    };

    class BaseWall {
        constructor(width, height, depth, position, rotation = { x: 0, y: 0, z: 0 }, camera) {
            this.group = new THREE.Group();
            this.width = width;
            this.height = height;
            this.depth = depth;
            this.position = position;
            this.rotation = rotation;
            this.camera = camera;
            this.posters = [];
            this.createWall();
        }
    
        createWall() {
            const textureLoader = new THREE.TextureLoader();
            const wallTexture = textureLoader.load('textures/wall.jpg', (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(2, 2);
            });
    
            const wallGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
            const wallMaterial = new THREE.MeshStandardMaterial({
                map: wallTexture,
                roughness: 0.4,
                metalness: 0.0,
                color: 0xffffff
            });
    
            this.wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
            this.wallMesh.position.set(this.position.x, this.position.y, this.position.z);
            this.wallMesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
            this.wallMesh.userData.isWall = true;
            
            const onMouseClick = (event) => {
                const raycaster = new THREE.Raycaster();
                const mouse = new THREE.Vector2();
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
                raycaster.setFromCamera(mouse, this.camera);
    
                const intersects = raycaster.intersectObject(this.wallMesh);
    
                if (intersects.length > 0) {
                    console.log('Wall clicked at:', intersects[0].point);
                    
                    const posterPosition = intersects[0].point;
                    console.log('Poster position:', posterPosition);
                    // Pass the posterPosition to a function that creates a poster
                    setCreatingPoster(true);

                }
            };
            window.addEventListener('click', onMouseClick);
            this.group.add(this.wallMesh);
        }
    }

    class BackWall extends BaseWall {
        constructor(width, height, depth, position, camera) {
            super(width, height, depth, position, { x: 0, y: 0, z: 0 }, camera);
            this.wallMesh.userData.wallId = 'back';
            console.log('BackWall created');
        }
    }
    const createScene = useCallback(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('skyblue');
        scene.fog = new THREE.Fog('skyblue', 20, 60);
        return scene;
    }, []);

    const createCamera = useCallback(() => {
        const config = viewState.current.isThirdPerson ? CAMERA_CONFIG.thirdPerson : CAMERA_CONFIG.fixed;
        const camera = new THREE.PerspectiveCamera(
            config.fov,
            window.innerWidth / window.innerHeight,
            config.near || 0.1,
            config.far || 100
        );
        
        if (viewState.current.isThirdPerson) {
            camera.position.set(5, 10, 12);
        } else {
            const { position } = CAMERA_CONFIG.fixed;
            camera.position.set(position.x, position.y, position.z);
        }
        
        return camera;
    }, []);

    const switchView = useCallback(() => {
        if (!cameraRef.current || !controlsRef.current) return;
    
        viewState.current.isThirdPerson = !viewState.current.isThirdPerson;
    
        if (viewState.current.isThirdPerson) {
            controlsRef.current.enableRotate = true;
            controlsRef.current.minDistance = 3;
            controlsRef.current.maxDistance = 10;
            controlsRef.current.minPolarAngle = Math.PI / 4;
            controlsRef.current.maxPolarAngle = Math.PI / 2.2;
            controlsRef.current.enablePan = false;
            controlsRef.current.enableZoom = true;
            controlsRef.current.minAzimuthAngle = -Infinity;
            controlsRef.current.maxAzimuthAngle = Infinity;
        } else {
            controlsRef.current.enableRotate = false;
            const { position, target } = CAMERA_CONFIG.fixed;
            cameraRef.current.position.set(position.x, position.y, position.z);
            controlsRef.current.target.set(target.x, target.y, target.z);
        }
    
        controlsRef.current.update();
    }, []);

    const createRenderer = useCallback(() => {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        return renderer;
    }, []);

    const createRoom = useCallback(() => {
        const room = new THREE.Group();

        const textureLoader = new THREE.TextureLoader();
        const floorTexture = textureLoader.load('textures/ground.png', (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(2, 2);
        });

        const floor = new THREE.Mesh(
            new RoundedBoxGeometry(
                ROOM_CONFIG.floor.width,
                ROOM_CONFIG.floor.height,
                ROOM_CONFIG.floor.depth,
                2,
                0.2
            ),
            new THREE.MeshStandardMaterial({
                map: floorTexture,
                roughness: 0.8,
                metalness: 0.2
            })
        );
        floor.position.y = -0.5;
        floor.receiveShadow = true;
        room.add(floor);

        const backWall = new BackWall(
            ROOM_CONFIG.wall.width,
            ROOM_CONFIG.wall.height,
            ROOM_CONFIG.wall.depth,
            {
                x: 0,
                y: ROOM_CONFIG.wall.height / 2 - 0.5,
                z: -ROOM_CONFIG.floor.depth / 2
            },
            cameraRef.current
        );

        room.add(backWall.group);
        roomWallRef.current = backWall.group;

        return room;
    }, [cameraRef]);

    const setupLights = useCallback((scene) => {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
    
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(-2, 8, 4);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.bias = -0.0001;
        
        const d = 8;
        directionalLight.shadow.camera.left = -d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = -d;
        scene.add(directionalLight);
    
        const pointLight1 = new THREE.PointLight(0xffffff, 0.6);
        pointLight1.position.set(-3, 4, -3);
        pointLight1.castShadow = true;
        scene.add(pointLight1);
    
        const pointLight2 = new THREE.PointLight(0xffffff, 0.6);
        pointLight2.position.set(3, 4, -1);
        pointLight2.castShadow = true;
        scene.add(pointLight2);
    
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
        scene.add(hemisphereLight);
    }, []);

    const loadCharacter = useCallback((scene) => {
        const loader = new FBXLoader();
        loader.load(
            'models/birb.fbx',
            (fbx) => {
                characterRef.current = fbx;
                fbx.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.material) {
                            const textureLoader = new THREE.TextureLoader();
                            const texture = textureLoader.load('textures/T_Herring.png');
                            child.material = new THREE.MeshStandardMaterial({
                                map: texture,
                                roughness: 0.8,
                                metalness: 0.2
                            });
                        }
                    }
                });

                // mixerRef.current = new THREE.AnimationMixer(fbx);
                // const action = mixerRef.current.clipAction(fbx.animations[0]);
                // action.play();

                fbx.scale.set(0.03, 0.03, 0.03);
                fbx.position.set(0, 0, 0);
                fbx.rotation.y = Math.PI / 3;
                scene.add(fbx);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.error('An error occurred loading the character:', error);
            }
        );
        let skinChoice = 0;
        let skinObject = null;

        const loadSkin = (choice) => {
            if (skinObject) {
            scene.remove(skinObject);
            }
            loader.load(bagSkins[choice].model, function (object) {
            object.traverse(function (child) {
                if (child.isMesh) {
                child.castShadow = true;
                const texture = new THREE.TextureLoader().load(bagSkins[choice].texture);
                child.material.map = texture;
                child.material.side = THREE.DoubleSide; // Render both sides of the skin
                }
            });
            object.scale.set(2, 2, 2);
            object.position.set(-3, -1, -3);
            scene.add(object);
            skinObject = object;
            });
        };

        if (bagSkins.length > 0) {
            loadSkin(skinChoice);

            const onMouseClick = (event) => {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, cameraRef.current);
            const intersects = raycaster.intersectObjects(scene.children, true);
            const skinElement = document.getElementById('bag-skin-section');
            const skin = document.getElementById('bag-skin');
            const skinName = document.getElementById('skin-name');
            const skinCost = document.getElementById('skin-cost');
            const captureElement = document.getElementById('webcam-capture');
            captureElement.style.display = 'block';
            if (intersects.length > 0) {
                // change skin choice and reload the model
                skinChoice = (skinChoice + 1) % bagSkins.length;
                loadSkin(skinChoice);
                if (skinElement) {
                    skinElement.style.opacity = 1;
                    skin.src = bagSkins[skinChoice].texture;
                    skinName.innerHTML = bagSkins[skinChoice].name;
                    skinCost.innerHTML = bagSkins[skinChoice].cost + " SOL";
                }
            }
            else{
                if (skinElement) {
                    skinElement.style.opacity = 0;
                }
                if (captureElement) {
                    captureElement.style.display = 'none';
                }
            }
            };

            window.addEventListener('click', onMouseClick);

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
                }
            }
        }
    
        // Add room to the scene
        const poster = new Poster('images/IMG_0988.jpg', 0.5, 3, -6);
        const penguin_poster = new Poster('images/penguin.jpg', -10, 6, 0, 10);
        const nyan_poster = new Poster('images/nyan.jpg', 8, 4, 0, 3);
        const monkey_poster = new Poster('images/monke.jpg', 7, 4, -7, 10);
        scene.add(poster.group);
        scene.add(penguin_poster.group);
        scene.add(nyan_poster.group);
        scene.add(monkey_poster.group);
    }, []);

    const handleKeyDown = useCallback((event) => {
        const state = movementState.current;
        switch (event.key) {
            case 'ArrowUp': case 'w': state.moveForward = true; break;
            case 'ArrowLeft': case 'a': state.rotateLeft = true; break;
            case 'ArrowRight': case 'd': state.rotateRight = true; break;
            case 'v': switchView(); break;
        }
    }, [switchView]);

    const handleKeyUp = useCallback((event) => {
        const state = movementState.current;
        switch (event.key) {
            case 'ArrowUp': case 'w': state.moveForward = false; break;
            case 'ArrowLeft': case 'a': state.rotateLeft = false; break;
            case 'ArrowRight': case 'd': state.rotateRight = false; break;
        }
    }, []);

    const updateCharacterMovement = useCallback((deltaTime) => {
        if (!characterRef.current) return;

        const state = movementState.current;
        const speed = deltaTime * state.movementSpeed;
        const rotationSpeed = deltaTime * state.rotationSpeed;

        let newX = characterRef.current.position.x;
        let newZ = characterRef.current.position.z;

        if (state.moveForward) {
            newZ += speed * Math.cos(state.theta);
            newX += speed * Math.sin(state.theta);
        }
        if (state.rotateLeft) {
            state.theta += rotationSpeed;
            characterRef.current.rotation.y = state.theta;
        }
        if (state.rotateRight) {
            state.theta -= rotationSpeed;
            characterRef.current.rotation.y = state.theta;
        }

        const halfWidth = ROOM_CONFIG.floor.width / 2 - 0.5;
        const halfDepth = ROOM_CONFIG.floor.depth / 2 - 0.5;

        characterRef.current.position.x = Math.max(-halfWidth, Math.min(halfWidth, newX));
        characterRef.current.position.z = Math.max(-halfDepth, Math.min(halfDepth, newZ));
    }, []);

    const updateCamera = useCallback(() => {
        if (!characterRef.current || !cameraRef.current || !controlsRef.current) return;
        
        if (viewState.current.isThirdPerson) {
            const targetPosition = characterRef.current.position.clone();
            targetPosition.y += CAMERA_CONFIG.thirdPerson.heightOffset * 0.5;
            controlsRef.current.target.lerp(targetPosition, CAMERA_CONFIG.thirdPerson.smoothness);
            controlsRef.current.update();
        } else {
            const { position, target } = CAMERA_CONFIG.fixed;
            cameraRef.current.position.set(position.x, position.y, position.z);
            controlsRef.current.target.set(target.x, target.y, target.z);
            controlsRef.current.update();
        }
    });

    const animate = useCallback(() => {
        animationFrameRef.current = requestAnimationFrame(animate);
        const deltaTime = Math.min(0.05, clockRef.current.getDelta());
    
        if (mixerRef.current) {
            mixerRef.current.update(deltaTime);
        }
        updateCharacterMovement(deltaTime);
        updateCamera();
    
        if (rendererRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
    }, [updateCharacterMovement, updateCamera]);

    const handleResize = useCallback(() => {
        if (!cameraRef.current || !rendererRef.current) return;

        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;
    
        sceneRef.current = createScene();
        cameraRef.current = createCamera();
        rendererRef.current = createRenderer();
        mountRef.current.appendChild(rendererRef.current.domElement);
    
        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05;
        controlsRef.current.minDistance = 3;
        controlsRef.current.maxDistance = 10;
        controlsRef.current.minPolarAngle = Math.PI / 4;
        controlsRef.current.maxPolarAngle = Math.PI / 2.5;
        controlsRef.current.minAzimuthAngle = -Math.PI / 4;
        controlsRef.current.maxAzimuthAngle = Math.PI / 4;
        
        sceneRef.current.add(createRoom());
        setupLights(sceneRef.current);
        loadCharacter(sceneRef.current);
    
        cameraRef.current.position.set(0, 8, 4);
        cameraRef.current.lookAt(0, 2, -4);
        controlsRef.current.target.set(0, 2, -4);
        controlsRef.current.update();
    
        setupLights(sceneRef.current);
        animate();
    
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            
            if (mountRef.current && rendererRef.current) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }

            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
            if (sceneRef.current) {
                sceneRef.current.traverse((object) => {
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            }
        };
    }, [animate, createCamera, createRoom, createRenderer, createScene, handleKeyDown, handleKeyUp, handleResize, loadCharacter, setupLights]);

 

    return (
        <>
            {creatingPoster && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                    }}
                >
                    <h2>Create a Poster</h2>
                    <button
                        onClick={() => {
                            setCreatingPoster(false);
                        }}
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            color: 'white',
                            padding: '8px 16px',
                            border: '1px solid white',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '16px',
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        </>
    );
};

export default ThreeScene;

