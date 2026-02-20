import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { getWaveHeight } from '../utils/wave'
import * as THREE from 'three'
import ShipPart from './ShipPart'
import FlagPart from './FlagPart'

export default function Ship() {
    const ref = useRef()
    const scroll = useScroll()

    // Shared material to match birds and sun
    const paperMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#e8d1b5',
        roughness: 0.8,
    }), [])

    // Increased Scale for focal point
    const scale = 0.45

    // Physics Sampling Points (Adjusted for new scale)
    const length = 2.0 * scale
    const width = 0.8 * scale

    useFrame((state) => {
        if (!ref.current) return

        const t = state.clock.getElapsedTime()

        // Scene-aware amplitude: CONTIGUOUS transitions
        let amplitude = 1.0
        // S3 transition to calm (0.65 - 0.75)
        if (scroll.offset > 0.65 && scroll.offset <= 0.75) {
            const p = (scroll.offset - 0.65) / 0.1
            amplitude = THREE.MathUtils.lerp(1.0, 0.4, p)
        }
        // S4 arrival (0.75 - 0.9)
        else if (scroll.offset > 0.75) {
            const p = THREE.MathUtils.clamp((scroll.offset - 0.75) / 0.15, 0, 1)
            amplitude = THREE.MathUtils.lerp(0.4, 0.1, p)
        }

        const x = ref.current.position.x
        const z = ref.current.position.z

        // Get wave height at center
        const h = getWaveHeight(x, z, t) * amplitude

        // Physics Calculation: Pitch & Roll
        const hFront = getWaveHeight(x, z - length / 2, t) * amplitude
        const hBack = getWaveHeight(x, z + length / 2, t) * amplitude
        // Calculate pitch (nose up/down)
        const pitch = Math.atan2(hFront - hBack, length)

        const hLeft = getWaveHeight(x - width / 2, z, t) * amplitude
        const hRight = getWaveHeight(x + width / 2, z, t) * amplitude
        // Calculate roll (tilt left/right)
        const roll = Math.atan2(hLeft - hRight, width)

        // Smooth Physics Interpolation
        const positionDamping = 0.1
        const rotationDamping = 0.02

        // Target Y: Ride ON the wave (h) with offset
        // In Scene 4, raise the offset to match the higher island bridge
        // Scena 1 ends at 0.2. Locked movement finishes by start of S3 (0.35)
        const lockFactor = scroll.offset < 0.35
            ? THREE.MathUtils.smoothstep(scroll.offset, 0.0, 0.35)
            : 1

        const turnFactor = scroll.offset > 0.75
            ? THREE.MathUtils.smoothstep(scroll.offset, 0.75, 0.88)
            : 0

        const dockingFactor = scroll.offset > 0.75
            ? THREE.MathUtils.clamp((scroll.offset - 0.75) / 0.12, 0, 1)
            : 0

        // Target Y: Ride ON the wave (h) with offset
        // In Scene 4, raise the offset to match the higher island bridge
        const targetY = h + THREE.MathUtils.lerp(-0.25, 0.2, dockingFactor)

        ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, positionDamping)
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, pitch, rotationDamping)
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, roll, rotationDamping)

        // --- HEADING & POSITION LOGIC ---
        // Scene Factors handled above


        // Yaw
        const wander = Math.sin(t * 0.5) * 0.05 + Math.cos(t * 0.5) * 0.9
        const targetYaw = 0 // North
        let yaw = THREE.MathUtils.lerp(wander, targetYaw, lockFactor)

        if (scroll.offset > 0.75) {
            // Stop wandering and dock facing East (Math.PI / 2)
            // TURN FIRST during S4
            yaw = THREE.MathUtils.lerp(yaw, Math.PI / 2, turnFactor)
        }

        // Position
        // S1-S3: (3,3) -> (0,0)
        let targetX = THREE.MathUtils.lerp(3, 0, lockFactor)
        let targetZ = THREE.MathUtils.lerp(3, 0, lockFactor)

        if (scroll.offset > 0.75) {
            // S4 Arrival: (0,0) -> (-1.0, 1.2) [Dock at North bridge]
            targetX = THREE.MathUtils.lerp(0, -1.0, dockingFactor)
            targetZ = THREE.MathUtils.lerp(0, 1.2, dockingFactor)
        }

        ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, positionDamping)
        ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, positionDamping)
        ref.current.rotation.y = yaw
    })

    // Lighter Yellow palette for a "clean paper" look
    const hullMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#fefae0', // Lighter yellowish off-white
        roughness: 0.8,
    }), [])

    const sailMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#fefae0', // Matching lighter yellow
        roughness: 0.8,
    }), [])

    return (
        <group ref={ref} scale={[scale, scale, scale]}>
            <group rotation={[0, Math.PI, 0]} scale={0.35}>
                <ShipPart material={hullMaterial} />
                <FlagPart material={sailMaterial} position={[0, 8.8, -0.35]} />
            </group>
        </group>
    )
}
