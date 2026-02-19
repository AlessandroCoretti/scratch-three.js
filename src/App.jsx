import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls, Scroll, Environment, Float, PerspectiveCamera, useScroll } from '@react-three/drei'
import { EffectComposer, Noise, Vignette, Outline, Selection, Select } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useRef } from 'react'
import Sea from './components/Sea'
import Ship from './components/Ship'
import Overlay from './components/Overlay'
import Sun from './components/Sun'
import Letter from './components/Letter'

function CameraController() {
  const scroll = useScroll()
  const vec = new THREE.Vector3()

  useFrame((state) => {
    const t = scroll.offset

    // Phase 1 (0 to 0.5): Stay Close (Isometric) - Ship aligns to North
    // Phase 2 (0.5 to 1.0): Zoom Out to show Letter

    let x, y, z

    if (t < 0.5) {
      // PHASE 1: STAY FIXED [20, 20, 20]
      // The user wants it to look "as before" until the ship aligns.
      x = 20
      y = 20
      z = 20
    } else {
      // PHASE 2 (0.5 to 1.0): Zoom Out to Frontal View
      // Range: [0.5, 1.0] -> Normalized [0, 1]
      const phase2 = (t - 0.5) * 2
      // Zoom out from [20, 20, 20] to [0, 5, 120]
      x = THREE.MathUtils.lerp(20, 0, phase2)
      y = THREE.MathUtils.lerp(20, 5, phase2)
      z = THREE.MathUtils.lerp(20, 120, phase2)
    }

    state.camera.position.lerp(vec.set(x, y, z), 0.1)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function LightingController() {
  const scroll = useScroll()
  const light = useRef()
  const sun = useRef()
  const vec = new THREE.Vector3()

  useFrame((state) => {
    const t = scroll.offset
    // Adjust lighting to follow camera roughly or stay fixed?
    // Let's keep the sun somewhat consistent but maybe pull back too
    const x = THREE.MathUtils.lerp(8, 0, t)
    const y = THREE.MathUtils.lerp(15, 50, t) // Higher sun for far view
    const z = THREE.MathUtils.lerp(8, 50, t)

    vec.set(x, y, z)

    if (light.current) light.current.position.copy(vec)
    if (sun.current) sun.current.position.copy(vec)
  })

  return (
    <>
      <directionalLight
        ref={light}
        position={[8, 15, 8]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]} // Increased shadow map for larger scene
      />
      <Sun ref={sun} position={[15, 10, 15]} />
    </>
  )
}

export default function App() {
  return (
    <>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={25} onUpdate={c => c.lookAt(0, 0, 0)} />

        <color attach="background" args={['#eed9bd']} />
        <fog attach="fog" args={['#eed9bd', 10, 200]} />

        <ambientLight intensity={0.8} />
        <Environment preset="city" environmentIntensity={0.5} />

        <Selection>
          <EffectComposer autoClear={false} multisampling={8}>
            <Outline visibleEdgeColor="#000000" hiddenEdgeColor="transparent" blur edgeStrength={100} width={1000} />
            {/* Noise removed as requested */}
          </EffectComposer>

          <ScrollControls pages={3} damping={0.25}>
            <CameraController />
            <LightingController />

            <Float speed={2} rotationIntensity={0} floatIntensity={0}>
              <group position={[0, 0, 0]}>
                <Sea />
                <Select enabled>
                  <Ship />
                </Select>
                <Letter />
              </group>
            </Float>

            <Scroll html>
              <Overlay />
            </Scroll>
          </ScrollControls>
        </Selection>
      </Canvas>
    </>
  )
}
