import { useRef, useMemo, useLayoutEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { getWaveHeight } from '../utils/wave'

export default function Sea() {
  const mesh = useRef()
  const geometry = useRef()
  const scroll = useScroll()

  // Load Map Texture from public/map.svg
  const mapTexture = useTexture('/map.svg')

  // Configure Texture
  mapTexture.wrapS = THREE.RepeatWrapping
  mapTexture.wrapT = THREE.RepeatWrapping
  mapTexture.repeat.set(0.5, 0.5)
  mapTexture.colorSpace = THREE.SRGBColorSpace

  const width = 10
  const depth = 10
  const thickness = 1.0
  const density = 128

  const accumulatedTime = useRef(0)

  // Store initial vertex positions to avoid "drifting" or "stuck" vertices
  const [basePositions, setBasePositions] = useState(null)

  useLayoutEffect(() => {
    if (geometry.current) {
      // Capture the initial positions of the BoxGeometry
      setBasePositions(new Float32Array(geometry.current.attributes.position.array))
    }
  }, [geometry.current]) // Re-run if geometry changes

  useFrame((state, delta) => {
    if (!geometry.current || !basePositions) return

    const time = state.clock.getElapsedTime()
    const pos = geometry.current.attributes.position
    const count = pos.count

    // Scene-aware amplitude
    let amplitude = 1.0
    if (scroll.offset > 0.5 && scroll.offset <= 0.75) {
      // Scene 3 transition
      amplitude = THREE.MathUtils.lerp(1.0, 0.4, (scroll.offset - 0.5) * 4)
    } else if (scroll.offset > 0.75) {
      // Scene 4: Very calm
      amplitude = THREE.MathUtils.lerp(0.4, 0.1, (scroll.offset - 0.75) * 4)
    }

    // Accumulate time ONLY during voyage (Scene 2 & 3)
    if (scroll.offset > 0.25 && scroll.offset < 0.75) {
      accumulatedTime.current += delta
    }

    for (let i = 0; i < count; i++) {
      // Read from STABLE base positions
      const x = basePositions[i * 3]
      const y = basePositions[i * 3 + 1]
      const z = basePositions[i * 3 + 2]

      // Check if vertex is on the Top Face (Local Z > 0) based on INITIAL position
      if (z > 0.4) {
        const wave = getWaveHeight(x, -y, time) * amplitude

        // Apply to the Z coordinate (Thickness/Up in Local space)
        pos.setZ(i, z + wave)
      }
    }

    // Animate Map Texture Offset (Scrolling effect)
    // Only uses accumulated time (Scene 2 & 3)
    mapTexture.offset.y = accumulatedTime.current * 0.01

    pos.needsUpdate = true
    geometry.current.computeVertexNormals()
  })

  return (
    <group position={[0, -0.7, 0]}> {/* Top surface at -0.2 */}
      <mesh ref={mesh} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        {/* Width=10, Height=10 (Depth), Depth=1 (Thickness). Segments matching Original Plane */}
        <boxGeometry ref={geometry} args={[width, depth, thickness, density, density, 1]} />

        {/* 0: Right (+x) */}
        <meshStandardMaterial attach="material-0" color="#eed9bd" roughness={1} metalness={0} side={THREE.DoubleSide} />
        {/* 1: Left (-x) */}
        <meshStandardMaterial attach="material-1" color="#eed9bd" roughness={1} metalness={0} side={THREE.DoubleSide} />
        {/* 2: Top (+y) - Actually Side in rotated space */}
        <meshStandardMaterial attach="material-2" color="#eed9bd" roughness={1} metalness={0} side={THREE.DoubleSide} />
        {/* 3: Bottom (-y) - Actually Side in rotated space */}
        <meshStandardMaterial attach="material-3" color="#eed9bd" roughness={1} metalness={0} side={THREE.DoubleSide} />

        {/* 4: Front (+z) - THE WAVE SURFACE */}
        <meshStandardMaterial
          attach="material-4"
          color="#eed9bd"
          emissive="#eed9bd"
          emissiveIntensity={0.25}
          map={mapTexture}
          roughness={1}
          metalness={0}
          side={THREE.DoubleSide}
        />

        {/* 5: Back (-z) - Bottom of sea block */}
        <meshStandardMaterial attach="material-5" color="#eed9bd" roughness={1} metalness={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
