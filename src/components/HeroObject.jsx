import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import { useControls } from 'leva'

export default function HeroObject() {
    const mesh = useRef()

    // Controls for tweaking material in real-time
    const config = useControls({
        meshPhysicalMaterial: false,
        transmissionSampler: false,
        backside: false,
        samples: { value: 10, min: 1, max: 32, step: 1 },
        resolution: { value: 2048, min: 256, max: 2048, step: 256 },
        transmission: { value: 1, min: 0, max: 1 },
        roughness: { value: 0.0, min: 0, max: 1, step: 0.01 },
        thickness: { value: 3.5, min: 0, max: 10, step: 0.01 },
        ior: { value: 1.5, min: 1, max: 5, step: 0.01 },
        chromaticAberration: { value: 0.06, min: 0, max: 1 },
        anisotropy: { value: 0.1, min: 0, max: 1, step: 0.01 },
        distortion: { value: 0.0, min: 0, max: 1, step: 0.01 },
        distortionScale: { value: 0.3, min: 0.01, max: 1, step: 0.01 },
        temporalDistortion: { value: 0.5, min: 0, max: 1, step: 0.01 },
        clearcoat: { value: 1, min: 0, max: 1 },
        attenuationDistance: { value: 0.5, min: 0, max: 10, step: 0.01 },
        attenuationColor: '#ffffff',
        color: '#c9ffa1',
        bg: '#839681'
    })

    useFrame((state, delta) => {
        mesh.current.rotation.x += delta * 0.2
        mesh.current.rotation.y += delta * 0.2
    })

    return (
        <group dispose={null}>
            <mesh ref={mesh}>
                <torusKnotGeometry args={[1, 0.3, 128, 32]} />
                <MeshTransmissionMaterial {...config} background={new THREE.Color(config.bg)} />
            </mesh>
        </group>
    )
}

import * as THREE from 'three'
