import * as THREE from 'three';

export class Poster {
    constructor(width = 3, height = 2, position = { x: 0, y: 0, z: 0 }, wallType = 'back') {
        this.width = width;
        this.height = height;
        this.position = position;
        this.mesh = null;
        this.isDragging = false;
        this.wallType = wallType;
        // Store the initial rotation based on wall type
        this._rotation = new THREE.Euler(0, wallType === 'right' ? Math.PI / 2 : 0, 0);
    }

    createMesh() {
        // Create a larger, colorful plane geometry
        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        const material = new THREE.MeshStandardMaterial({
            color: 0x4287f5,  // Bright blue color
            side: THREE.DoubleSide,
            metalness: 0.1,
            roughness: 0.5,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        console.log(this.wallType)
        // Set initial position
        if (this.wallType === 'back') {
            this.mesh.position.set(
                this.position.x,
                this.position.y,
                this.position.z // Fixed small offset for back wall
            );
        } else if (this.wallType === 'right') {
            this.mesh.position.set(
                this.position.x + 1, // Fixed small offset for right wall
                this.position.y,
                this.position.z - 2
            );
            this.mesh.rotation.y = Math.PI / 2;
            // Add logging to verify rotation
            console.log('Initial rotation:', this.mesh.rotation.y);
            console.log('Wall type:', this.wallType);
            console.log('Full mesh:', this.mesh);
        }

        // Add a small offset from wall to prevent z-fighting
        if (this.mesh.position.z === 0) {
            this.mesh.position.z += 0.01;
        }
        
        // Store reference to poster instance on mesh
        this.mesh.userData.poster = this;
        return this.mesh;
    }

    setPosition(x, y, z) {
        if (!this.mesh) return;
        this.position = { x, y, z };
        if (this.wallType === 'back') {
            this.mesh.position.set(x, y, z);
            // Keep the small offset from the wall
            if (this.mesh.position.z === 0) {
                this.mesh.position.z += 0.01;
            }
            console.log('Updated poster position:', this.mesh.position);
        } else {
            this.mesh.position.set(1, y, z); // x is fixed offset, use z for depth
            this.mesh.rotation.copy(this._rotation);
            console.log('Updated right wall poster position:', this.mesh.position);
        }
    }
}