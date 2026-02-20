import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import Bird from './Bird'

function FlyingBird({ index, total }) {
    const ref = useRef()
    const scroll = useScroll()

    // Random constants for each bird based on index
    const randomFactor = useMemo(() => ({
        speed: 0.5 + Math.random() * 0.5,
        radius: 0.5 + Math.random() * 1.5,
        height: 1.5 + Math.random() * 1.5,
        angleOffset: (index / total) * Math.PI * 2,
        verticalSpeed: 0.2 + Math.random() * 0.3
    }), [index, total])

    useFrame((state) => {
        if (!ref.current) return
        const t = state.clock.getElapsedTime()

        // Birds appear in Scene 2 (0.2-0.3) and disappear in Scene 4 (0.6-0.7)
        const fadeIn = THREE.MathUtils.smoothstep(scroll.offset, 0.2, 0.3)
        const fadeOut = 1 - THREE.MathUtils.smoothstep(scroll.offset, 0.6, 0.7)
        const visibility = Math.min(fadeIn, fadeOut)

        ref.current.scale.setScalar(visibility * 0.5) // Scale from 0 to 0.5
        ref.current.visible = visibility > 0

        // Fly away logic in Scene 4
        let flyAwayOffset = 0
        if (scroll.offset > 0.6) {
            flyAwayOffset = (scroll.offset - 0.6) * 50 // Fly far away
        }

        // Circular flight path + fly away offset
        const angle = t * randomFactor.speed + randomFactor.angleOffset
        const x = Math.cos(angle) * (randomFactor.radius + flyAwayOffset)
        const z = Math.sin(angle) * (randomFactor.radius + flyAwayOffset)
        const y = randomFactor.height + Math.sin(t * randomFactor.verticalSpeed) * 0.5 + flyAwayOffset * 0.5

        ref.current.position.set(x, y, z)

        // Look in direction of flight
        ref.current.rotation.y = -angle + Math.PI / 2
        // Slight tilt when banking
        ref.current.rotation.z = Math.sin(t * 0.5) * 0.1
    })

    return (
        <group ref={ref}>
            <Bird />
        </group>
    )
}

export default function Birds({ count = 5 }) {
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <FlyingBird key={i} index={i} total={count} />
            ))}
        </group>
    )
}
