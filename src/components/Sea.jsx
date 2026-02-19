import { useRef, useMemo, useLayoutEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getWaveHeight } from '../utils/wave'

export default function Sea() {
  const mesh = useRef()
  const geometry = useRef()

  // Antique Paper Grid Texture
  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const context = canvas.getContext('2d')

    // Background: Muted Antique Beige
    context.fillStyle = '#eed9bd'
    context.fillRect(0, 0, 1024, 1024)

    /* // Grid Lines: Soft Charcoal
    context.strokeStyle = '#666666'
    context.lineWidth = 2

    const step = 64

    // Draw Grid
    for (let i = 0; i <= 1024; i += step) {
      context.beginPath()
      context.moveTo(i, 0)
      context.lineTo(i, 1024)
      context.stroke()

      context.beginPath()
      context.moveTo(0, i)
      context.lineTo(1024, i)
      context.stroke()
    } */

    /* // Canvas Border
    context.lineWidth = 10
    context.strokeRect(0, 0, 1024, 1024) */

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    texture.anisotropy = 16
    return texture
  }, [])

  const width = 10
  const depth = 10
  const thickness = 1.0
  const density = 128

  // Store initial vertex positions to avoid "drifting" or "stuck" vertices
  const [basePositions, setBasePositions] = useState(null)

  useLayoutEffect(() => {
    if (geometry.current) {
      // Capture the initial positions of the BoxGeometry
      setBasePositions(new Float32Array(geometry.current.attributes.position.array))
    }
  }, [geometry.current]) // Re-run if geometry changes

  useFrame((state) => {
    if (!geometry.current || !basePositions) return

    const time = state.clock.getElapsedTime()
    const pos = geometry.current.attributes.position
    const count = pos.count

    for (let i = 0; i < count; i++) {
      // Read from STABLE base positions
      const x = basePositions[i * 3]
      const y = basePositions[i * 3 + 1]
      const z = basePositions[i * 3 + 2]

      // Check if vertex is on the Top Face (Local Z > 0) based on INITIAL position
      if (z > 0.4) {
        // Match original wave math:
        // Box rotated -90deg X:
        // Local X -> World X
        // Local Y -> World -Z (Depth)

        const wave = getWaveHeight(x, -y, time)

        // Apply to the Z coordinate (Thickness/Up in Local space)
        pos.setZ(i, z + wave)
      }
    }

    pos.needsUpdate = true
    geometry.current.computeVertexNormals()
  })

  return (
    <group position={[0, -0.7, 0]}> {/* Top surface at -0.2 */}
      <mesh ref={mesh} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        {/* Width=10, Height=10 (Depth), Depth=1 (Thickness). Segments matching Original Plane */}
        <boxGeometry ref={geometry} args={[width, depth, thickness, density, density, 1]} />

        {/* Matte Paper Material */}
        <meshStandardMaterial
          color="#ffffff"
          map={gridTexture}
          roughness={0.6} // Fully matte
          metalness={0.4}
          flatShading={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
