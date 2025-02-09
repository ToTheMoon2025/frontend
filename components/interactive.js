'use client';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { WallOverlayUI } from './WallOverlayUI.js'

class BaseWall {
    constructor(width, height, depth, position, rotation = { x: 0, y: 0, z: 0 }, cameraRef) {
        this.group = new THREE.Group();
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.position = position;
        this.rotation = rotation;
        this.cameraRef = cameraRef;
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
        
        this.group.add(this.wallMesh);
    }
}

const ThreeScene = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const clockRef = useRef(new THREE.Clock());
    const mixerRef = useRef(null);
    const characterRef = useRef(null);
    const controlsRef = useRef(null);
    const animationFrameRef = useRef(null);
    const [selectedWall, setSelectedWall] = useState(null);
    const [isWallView, setIsWallView] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const wallsRef = useRef({
        back: null,
        right: null
    });
    const wallSceneRef = useRef({
        back: null,
        right: null
    });


    // Simplified BackWall class
    class BackWall extends BaseWall {
        constructor(width, height, depth, position) {
            super(width, height, depth, position, { x: 0, y: 0, z: 0 });
            this.wallMesh.userData.wallId = 'back';
        }
    }

    // Simplified RightWall class
    class RightWall extends BaseWall {
        constructor(width, height, depth, position) {
            super(width, height, depth, position, { x: 0, y: -Math.PI / 2, z: 0 });
            this.wallMesh.userData.wallId = 'right';
        }
    }

    useEffect(() => {
        const handleClick = (event) => {
            console.log('Click detected at:', event.clientX, event.clientY);
        };
    
        window.addEventListener('click', handleClick);
        
        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, []);

    // New handlers for wall editing
    const handleStartEditing = () => {
        setIsEditing(true);
        if (controlsRef.current) {
            controlsRef.current.enabled = false;
        }
    };

    const handleStopEditing = () => {
        setIsEditing(false);
        if (controlsRef.current) {
            controlsRef.current.enabled = true;
        }
    };

    const viewState = useRef({
        isThirdPerson: true, // Track current view mode
    });
    
    const movementState = useRef({
        moveForward: false,
        rotateLeft: false,
        rotateRight: false,
        theta: Math.PI,
        movementSpeed: 2,
        rotationSpeed: 2
    });

    // Camera configuration
    const CAMERA_CONFIG = {
        thirdPerson: {
            fov: 70,
            near: 0.1,
            far: 100,
            followDistance: 4,
            heightOffset: 2,
            smoothness: 0.1 // Controls how smoothly the camera follows
        },
        fixed: {
            position: { x: -6, y: 10, z: 6 }, // Moved camera position to view corner
            target: { x: 0, y: 1, z:0 },   // Adjusted target to look at corner
            fov: 60,
        }
    };
//v
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
            // Enable full orbit controls for third-person view
            controlsRef.current.enableRotate = true;
            controlsRef.current.minDistance = 3;
            controlsRef.current.maxDistance = 10;
            controlsRef.current.minPolarAngle = Math.PI / 4;
            controlsRef.current.maxPolarAngle = Math.PI / 2.2;
            controlsRef.current.enablePan = false;
            controlsRef.current.enableZoom = true;
            
            // Remove azimuth angle restrictions
            controlsRef.current.minAzimuthAngle = -Infinity;
            controlsRef.current.maxAzimuthAngle = Infinity;
        } else {
            // Reset to fixed view settings
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        return renderer;
    }, []);

    const createWallScene = useCallback((wallType) => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('skyblue');

        const textureLoader = new THREE.TextureLoader();
        const wallTexture = textureLoader.load('textures/wall.jpg', (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(2, 2);
        });

        // Create appropriate wall based on type
        const wall = wallType === 'back' ? 
            new BackWall(
                ROOM_CONFIG.wall.width,
                ROOM_CONFIG.wall.height,
                ROOM_CONFIG.wall.depth,
                { x: 0, y: ROOM_CONFIG.wall.height / 2, z: 0 },
                cameraRef
            ) :
            new RightWall(
                ROOM_CONFIG.wall.width,
                ROOM_CONFIG.wall.height,
                ROOM_CONFIG.wall.depth,
                { x: 0, y: ROOM_CONFIG.wall.height / 2, z: 0 },
                cameraRef
            );

        if (wallType === 'right') {
            wall.group.rotation.y = Math.PI;
        }

        if (wall.wallMesh) {
            wall.wallMesh.material = new THREE.MeshStandardMaterial({
                map: wallTexture,
                roughness: 0.4,
                metalness: 0.0,
                color: 0xffffff,
                envMapIntensity: 1.0
            });
        }

        if (wall.wallMesh) {
            wall.wallMesh.material = new THREE.MeshStandardMaterial({
                map: wallTexture,
                roughness: 0.4,
                metalness: 0.0,
                color: 0xffffff,
                envMapIntensity: 1.0
            });
        }
    
        scene.add(wall.group);

        // Create and add floor
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
        floor.position.y = -0.433;
        floor.receiveShadow = true;

        // Position floor based on wall type
        if (wallType === 'back') {
            floor.position.z = ROOM_CONFIG.floor.depth / 2;
        } else {
            floor.position.x = -ROOM_CONFIG.floor.width / 2;
            
        }

        scene.add(floor);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Increased intensity
        directionalLight.position.set(-2, 8, 4); // Repositioned to better illuminate walls
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

        // Add two point lights for better wall illumination
        const pointLight1 = new THREE.PointLight(0xffffff, 1);
        pointLight1.position.set(-3, 4, -3); // Position for back wall
        pointLight1.castShadow = true;
        scene.add(pointLight1);

        const pointLight3 = new THREE.PointLight(0xffffff, 1);
        pointLight1.position.set(-3, 2, -3); // Position for back wall
        pointLight1.castShadow = true;
        scene.add(pointLight3);
    
        const pointLight2 = new THREE.PointLight(0xffffff, 1);
        pointLight2.position.set(3, 4, -3); // Position for right wall
        pointLight2.castShadow = true;
        scene.add(pointLight2);
    
        // Hemisphere light for natural ambient lighting
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        scene.add(hemisphereLight);
    
        // Set camera position for better view of wall and floor
        if (cameraRef.current) {
            if (wallType === 'back') {
                cameraRef.current.position.set(0, ROOM_CONFIG.wall.height / 2, 6);
                cameraRef.current.lookAt(0, ROOM_CONFIG.wall.height / 3, 0);
            } else {
                cameraRef.current.position.set(-6, ROOM_CONFIG.wall.height / 2 + 1, 0);
                cameraRef.current.lookAt(0, ROOM_CONFIG.wall.height / 3, 0);
            }
            cameraRef.current.rotation.z = 0;
        }

        return scene;
    }, [cameraRef]);

    const createRoom = useCallback(() => {
        const room = new THREE.Group();

        // Create floor
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

        // Create back wall
        const backWall = new BackWall(
            ROOM_CONFIG.wall.width,
            ROOM_CONFIG.wall.height,
            ROOM_CONFIG.wall.depth,
            {
                x: 0,
                y: ROOM_CONFIG.wall.height / 2 - 0.5,
                z: -ROOM_CONFIG.floor.depth / 2
            },
            cameraRef
        );

        // Create right wall
        const rightWall = new RightWall(
            ROOM_CONFIG.wall.width,
            ROOM_CONFIG.wall.height,
            ROOM_CONFIG.wall.depth,
            {
                x: ROOM_CONFIG.floor.width / 2,
                y: ROOM_CONFIG.wall.height / 2 - 0.5,
                z: 0
            },
            cameraRef
        );

        room.add(backWall.group);
        room.add(rightWall.group);

        return room;
    }, [cameraRef, createWallScene]);

    const WallUI = () => {
        if (!isWallView) return null;

        return (
            <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold mb-4">{selectedWall} Wall</h3>
                <div className="space-y-2">
                    <button
                        onClick={handleStartEditing}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Edit Wall
                    </button>
                    <button
                        onClick={() => {
                            setIsWallView(false);
                            setSelectedWall(null);
                            handleStopEditing();
                            // Reset camera and controls
                            if (cameraRef.current && controlsRef.current) {
                                const { position, target } = CAMERA_CONFIG.fixed;
                                cameraRef.current.position.set(position.x, position.y, position.z);
                                controlsRef.current.target.set(target.x, target.y, target.z);
                                controlsRef.current.update();
                            }
                        }}
                        className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        Back to Room
                    </button>
                </div>
            </div>
        );
    };

    const setupLights = useCallback((scene) => {
        // Ambient light - increased intensity slightly
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
    
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Increased intensity
        directionalLight.position.set(-2, 8, 4); // Repositioned to better illuminate walls
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
    
        // Add two point lights for better wall illumination
        const pointLight1 = new THREE.PointLight(0xffffff, 0.6);
        pointLight1.position.set(-3, 4, -3); // Position for back wall
        pointLight1.castShadow = true;
        scene.add(pointLight1);
    
        const pointLight2 = new THREE.PointLight(0xffffff, 0.6);
        pointLight2.position.set(3, 4, -1); // Position for right wall
        pointLight2.castShadow = true;
        scene.add(pointLight2);
    
        // Hemisphere light for natural ambient lighting
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
        scene.add(hemisphereLight);
    }, []);

    const loadCharacter = useCallback((scene) => {
        const loader = new FBXLoader();
        loader.load(
            'models/animation/Walking-2.fbx',
            (fbx) => {
                characterRef.current = fbx;
                fbx.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.material) {
                            child.material.roughness = 0.8;
                            child.material.metalness = 0.2;
                        }
                    }
                });

                mixerRef.current = new THREE.AnimationMixer(fbx);
                const action = mixerRef.current.clipAction(fbx.animations[0]);
                action.play();

                fbx.scale.set(0.01, 0.01, 0.01);
                // Position character closer to the center of the smaller room
                fbx.position.set(0, 0, 0);
                scene.add(fbx);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.error('An error occurred loading the character:', error);
            }
        );
    }, []);

    

    const handleKeyDown = useCallback((event) => {
        // Skip all key handling if in wall view
        if (isWallView) return;
    
        const state = movementState.current;
        switch (event.key) {
            case 'ArrowUp': case 'w': state.moveForward = true; break;
            case 'ArrowLeft': case 'a': state.rotateLeft = true; break;
            case 'ArrowRight': case 'd': state.rotateRight = true; break;
            case 'v': switchView(); break;
        }
    }, [switchView, isWallView]);

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

        // Store the potential new position
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

        // Room boundaries
        const halfWidth = ROOM_CONFIG.floor.width / 2 - 0.5; // Buffer space
        const halfDepth = ROOM_CONFIG.floor.depth / 2 - 0.5; // Buffer space

        // Constrain movement within room boundaries
        characterRef.current.position.x = Math.max(-halfWidth, Math.min(halfWidth, newX));
        characterRef.current.position.z = Math.max(-halfDepth, Math.min(halfDepth, newZ));
    }, []);

    const updateCamera = useCallback(() => {
        if (!characterRef.current || !cameraRef.current || !controlsRef.current) return;
        
        // Don't update camera if in wall view
        if (isWallView) return;
    
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
    }, [isWallView]);
    

    const animate = useCallback(() => {
        animationFrameRef.current = requestAnimationFrame(animate);
        const deltaTime = Math.min(0.05, clockRef.current.getDelta());
    
        // Only update character and regular camera if not in wall view
        if (!isWallView) {
            if (mixerRef.current) {
                mixerRef.current.update(deltaTime);
            }
            updateCharacterMovement(deltaTime);
            updateCamera();
        }
    
        if (rendererRef.current && cameraRef.current) {
            const currentScene = isWallView ? 
                wallSceneRef.current[selectedWall] : 
                sceneRef.current;
                
            if (currentScene) {
                rendererRef.current.render(currentScene, cameraRef.current);
            }
        }
    }, [updateCharacterMovement, updateCamera, isWallView, selectedWall]);

    const handleEditWall = useCallback((wallType) => {
        // Create the wall scene before setting the state
        if (!wallSceneRef.current[wallType]) {
            const scene = createWallScene(wallType);
            wallSceneRef.current[wallType] = scene;
        }
    
        // Now that we're sure the scene exists, update the state
        setSelectedWall(wallType);
        setIsWallView(true);
    
        // Set fixed camera position based on wall type
        if (cameraRef.current) {
            if (wallType === 'back') {
                cameraRef.current.position.set(0, ROOM_CONFIG.wall.height / 2, 4);
                cameraRef.current.lookAt(0, ROOM_CONFIG.wall.height / 2, 0);
            } else {
                cameraRef.current.position.set(-4, ROOM_CONFIG.wall.height / 2, 0);
                cameraRef.current.lookAt(0, ROOM_CONFIG.wall.height / 2, 0);
            }
        }
    
        // Disable controls in wall view
        if (controlsRef.current) {
            controlsRef.current.enabled = false;
        }
    }, [createWallScene]);

    const handleResize = useCallback(() => {
        if (!cameraRef.current || !rendererRef.current) return;

        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;
    
        // Initialize scene
        sceneRef.current = createScene();
        cameraRef.current = createCamera();
        rendererRef.current = createRenderer();
        mountRef.current.appendChild(rendererRef.current.domElement);
    
        // Initialize controls only for the main room view
        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        
        // Disable controls by default if in wall view
        if (isWallView) {
            controlsRef.current.enabled = false;
        } else {
            // Only apply these constraints when not in wall view
            controlsRef.current.enableDamping = true;
            controlsRef.current.dampingFactor = 0.05;
            controlsRef.current.minDistance = 3;
            controlsRef.current.maxDistance = 10;
            controlsRef.current.minPolarAngle = Math.PI / 4;
            controlsRef.current.maxPolarAngle = Math.PI / 2.5;
            controlsRef.current.minAzimuthAngle = -Math.PI / 4;
            controlsRef.current.maxAzimuthAngle = Math.PI / 4;
        }
    
        // Add room
        sceneRef.current.add(createRoom());
        setupLights(sceneRef.current);
        loadCharacter(sceneRef.current);
    
        // Set initial camera position only if not in wall view
        if (!isWallView) {
            cameraRef.current.position.set(0, 8, 4);
            cameraRef.current.lookAt(0, 2, -4);
            controlsRef.current.target.set(0, 2, -4);
            controlsRef.current.update();
        }
    
        // Rest of your setup...
        setupLights(sceneRef.current);
        loadCharacter(sceneRef.current);
        animate();
    
        // Event listeners...
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

            // Dispose of Three.js resources
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

    useEffect(() => {
        if (isWallView && cameraRef.current && selectedWall) {
            if (controlsRef.current) {
                controlsRef.current.enabled = false;
            }
    
            if (selectedWall === 'back') {
                cameraRef.current.position.set(0, ROOM_CONFIG.wall.height / 2, 8);
                cameraRef.current.lookAt(0, ROOM_CONFIG.wall.height / 2, 0);
            } else {
                cameraRef.current.position.set(-8, ROOM_CONFIG.wall.height / 2, 0);
                cameraRef.current.lookAt(0, ROOM_CONFIG.wall.height / 2, 0);
            }
            cameraRef.current.rotation.z = 0;
        }
    }, [isWallView, selectedWall]);


    return (
        <>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            {!isWallView && <WallOverlayUI onEditWall={handleEditWall} />}
            {isWallView && <WallUI />}
        </>
    );
};

export default ThreeScene;