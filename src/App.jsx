import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls, Scroll, Environment, Float, PerspectiveCamera, useScroll } from '@react-three/drei'
import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useRef } from 'react'
import Sea from './components/Sea'
import Ship from './components/Ship'
import Island from './components/Island'
import Overlay from './components/Overlay'
import Sun from './components/Sun'
import Letter from './components/Letter'
import Birds from './components/Birds'

function CameraController() {
  const scroll = useScroll()
  const vec = new THREE.Vector3()

  useFrame((state) => {
    const t = scroll.offset // [0, 1] over 5 pages

    const lookAtTarget = new THREE.Vector3(0, 0, 0)
    let x, y, z

    if (t < 0.4) {
      // PHASE 1 & 2 (0.0 - 0.4): ISOMETRIC FIXED (2 pages)
      x = 20
      y = 20
      z = 20
    } else if (t < 0.6) {
      // PHASE 3 (0.4 - 0.6): TO FRONTAL VIEW (1 page)
      const p = (t - 0.4) * 5
      x = THREE.MathUtils.lerp(20, 0, p)
      y = THREE.MathUtils.lerp(20, 15, p)
      z = THREE.MathUtils.lerp(20, -35, p)
    } else if (t < 0.8) {
      // PHASE 4 (0.6 - 0.8): TO ISLAND SIDE (1 page)
      const p = (t - 0.6) * 5
      x = THREE.MathUtils.lerp(0, -25, p)
      y = THREE.MathUtils.lerp(15, 15, p)
      z = THREE.MathUtils.lerp(-35, 10, p)
    } else {
      // PHASE 5 (0.8 - 1.0): LETTER REVEAL ZOOM OUT (1 page)
      const p = (t - 0.8) * 5
      // EPIC ZOOM OUT to reveal the foundation
      x = THREE.MathUtils.lerp(-25, 80, p)
      y = THREE.MathUtils.lerp(15, 40, p)
      z = THREE.MathUtils.lerp(10, 80, p)
      // Shift lookAt to the center of the pillar
      lookAtTarget.y = THREE.MathUtils.lerp(0, -20, p)
    }

    state.camera.position.lerp(vec.set(x, y, z), 0.1)
    state.camera.lookAt(lookAtTarget)
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
    let x, y, z
    const targetIntensity = { val: 1.5 }
    let sunScale = 0
    const sunPos = new THREE.Vector3(0, -25, 70)

    if (t < 0.4) {
      // PHASE 1 & 2: Natural light, Sun Hidden
      x = 8
      y = 15
      z = 8
      sunScale = 0
      targetIntensity.val = 1.5
    } else if (t < 0.6) {
      // PHASE 3: DRAMATIC SUNRISE
      const p = (t - 0.4) * 5
      x = THREE.MathUtils.lerp(8, 0, p)
      y = THREE.MathUtils.lerp(15, -25, p)
      z = THREE.MathUtils.lerp(8, 70, p)
      sunScale = THREE.MathUtils.smoothstep(p, 0.1, 0.8)
      targetIntensity.val = THREE.MathUtils.lerp(1.5, 0.8, p)
    } else {
      // PHASE 4 & 5: Static Sunset
      x = 0
      y = -25
      z = 70
      sunScale = 1
      targetIntensity.val = 0.8
    }

    vec.set(x, y, z)

    if (light.current) {
      light.current.position.copy(vec)
      light.current.intensity = targetIntensity.val
    }
    if (sun.current) {
      sun.current.position.copy(sunPos)
      sun.current.scale.setScalar(sunScale)
    }
  })

  return (
    <>
      <directionalLight
        ref={light}
        position={[8, 15, 8]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <Sun ref={sun} position={[15, 10, 15]} />
    </>
  )
}

function IslandController() {
  const scroll = useScroll()
  const ref = useRef()

  useFrame(() => {
    if (!ref.current) return
    const t = scroll.offset
    // Appear during Scene 4 arrival (0.62 - 0.72)
    const visibility = t > 0.62 ? THREE.MathUtils.smoothstep(t, 0.62, 0.72) : 0
    ref.current.scale.setScalar(visibility * 0.2) // Much smaller scale
    ref.current.visible = visibility > 0
  })

  return <Island ref={ref} position={[0, 0.5, -2.2]} rotation={[0, 0, 0]} />
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

        <ScrollControls pages={5} damping={0.25}>
          <CameraController />
          <LightingController />

          <Float speed={2} rotationIntensity={0} floatIntensity={0}>
            <group position={[0, 0, 0]}>
              <Sea />
              <Ship />
              <IslandController />
              <Birds count={8} />
              <Letter />
            </group>
          </Float>

          <Scroll html>
            <Overlay />
          </Scroll>
        </ScrollControls>

        <EffectComposer disableNormalPass>
        </EffectComposer>
      </Canvas>
    </>
  )
}
