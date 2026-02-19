import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, Outlines, useGLTF } from '@react-three/drei'
import { getWaveHeight } from '../utils/wave'
import * as THREE from 'three'

export default function Ship() {
    const ref = useRef()
    const scroll = useScroll()

    // Increased Scale for focal point
    const scale = 0.45

    // Physics Sampling Points (Adjusted for new scale)
    const length = 2.0 * scale
    const width = 0.8 * scale

    useFrame((state) => {
        if (!ref.current) return

        const t = state.clock.getElapsedTime()

        // --- MOVEMENT LOGIC (Stationary) ---
        // Ship stays at center, only rotates

        const x = ref.current.position.x
        const z = ref.current.position.z

        // Get wave height at center
        const h = getWaveHeight(x, z, t)

        // Physics Calculation: Pitch & Roll
        const hFront = getWaveHeight(x, z - length / 2, t)
        const hBack = getWaveHeight(x, z + length / 2, t)
        // Calculate pitch (nose up/down)
        const pitch = Math.atan2(hFront - hBack, length)

        const hLeft = getWaveHeight(x - width / 2, z, t)
        const hRight = getWaveHeight(x + width / 2, z, t)
        // Calculate roll (tilt left/right)
        const roll = Math.atan2(hLeft - hRight, width)

        // Smooth Physics Interpolation
        const positionDamping = 0.1
        const rotationDamping = 0.02

        // Target Y: Ride ON the wave (h) + Higher Offset (0.55) to prevent submersion
        const targetY = h + (-0.25)

        ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, positionDamping)
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, pitch, rotationDamping)
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, roll, rotationDamping)

        // --- HEADING LOGIC (Yaw) ---
        // 1. Chaos: Continuous Drift ('Giri su se stessa')
        // Rotates slowly over time to simulate drifting in currents
        const wander = Math.sin(t * 0.5) * 0.05 + Math.cos(t * 0.5) * 0.9

        // 2. Target: 0 (North) - Aligned with wave direction if needed, or just forward

        // 3. Mix: Slow lock-on ('Piano piano a Nord')
        // Slower transition: effectively locks after ~50% scroll (0.5 * 2 = 1) instead of 5%
        const lockFactor = Math.min(scroll.offset * 2, 1)

        // Lerp from Wander to 0 (North)
        const yaw = THREE.MathUtils.lerp(wander, 0, lockFactor)

        // --- POSITION LOGIC (Sailing) ---
        // Start at SE corner (x=4, z=4) to fit within 10x10 sea (extent +/- 5)
        // Slowly sail to center (0,0)
        const targetX = THREE.MathUtils.lerp(3, 0, lockFactor)
        const targetZ = THREE.MathUtils.lerp(3, 0, lockFactor)

        // Apply wave height and position sailing
        const currentX = THREE.MathUtils.lerp(ref.current.position.x, targetX, positionDamping)
        const currentZ = THREE.MathUtils.lerp(ref.current.position.z, targetZ, positionDamping)

        ref.current.position.x = currentX
        ref.current.position.z = currentZ

        ref.current.rotation.y = yaw
    })

    const { scene: shipScene } = useGLTF('/models/ship-pirate-large.glb')
    const { scene: flagScene } = useGLTF('/models/flag-high-pennant.glb')

    const paperColor = '#faefe6'
    const inkColor = '#4a3c31'

    // Apply sketch style to models
    useEffect(() => {
        const applyMaterial = (scene) => {
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true
                    child.receiveShadow = true

                    // Apply Paper Material
                    child.material = new THREE.MeshStandardMaterial({
                        color: paperColor,
                        roughness: 0.8,
                    })
                }
            })
        }

        applyMaterial(shipScene)
        applyMaterial(flagScene)
    }, [shipScene, flagScene])

    return (
        <group ref={ref} scale={[scale, scale, scale]}>
            {/* Scale down the imported models to fit the scene. 
                 Kenney models are usually large. 
                 Original ship was ~2 units long. Kenney ship might be ~10-20 units.
                 Let's try 0.15 scale initially. 
             */}
            <group rotation={[0, Math.PI, 0]} scale={0.35}>
                <primitive object={shipScene} />

                {/* Position flag on top of the main mast. 
                    These coordinates are unexpected estimates and might need tuning.
                    y=12, z=0 is a guess for the main mast top.
                */}


                {/* Re-add outlines component directly to the group or meshes? 
                   Outlines from drei works best on meshes. 
                   Since we can't easily wrap every mesh in Outlines without traversing and wrapping,
                   we can use the `Select` component or just add Outlines to the group if supported,
                   BUT Outlines usually needs to be a child of a Mesh.
                   
                   Alternative: Use a global Outline effect or traverse and add Outlines?
                   The previous code used <Outlines /> inside <mesh>.
                   We can try adding <Outlines /> to the primitive if it supports it, but likely not.
                   
                   Let's stick to the material change for now and maybe add Outlines if requested or if we can traverse-add.
                   Actually, <Outlines> only works as a child of a mesh.
                   Let's try to add it to the scene meshes during traverse if possible (complex in JSX).
                   
                   For now, let's just stick with the paper material which effectively "sketch-ifies" it.
                   To truly get the outlines back, we'd need to clone the geometry or use a post-process effect.
                   However, the user Liked the "sketch" look.
                   
                   Let's try to inject Outlines into the traversal? No, Outlines is a React component.
                   We can just rely on the material for now.
                */}
            </group>
        </group>
    )
}

// Preload models
useGLTF.preload('/models/ship-pirate-large.glb')
useGLTF.preload('/models/flag-high-pennant.glb')
